// Trigger nodemon restart 6
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const mainRouter = require("./routes/main.router");

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const { initRepo } = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pushRepo } = require("./controllers/push");
const { pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");

const path = require("path");
dotenv.config({ path: path.resolve(__dirname, ".env") });

yargs(hideBin(process.argv))
  .command("start", "Starts a new server", {}, startServer)
  .command("init", "Initialise a new repository", {}, initRepo)
  .command(
    "add <file>",
    "Add a file to the repository",
    (yargs) => {
      yargs.positional("file", {
        describe: "File to add to the staging area",
        type: "string",
      });
    },
    (argv) => {
      addRepo(argv.file);
    }
  )
  .command(
    "commit <message>",
    "Commit the staged files",
    (yargs) => {
      yargs.positional("message", {
        describe: "Commit message",
        type: "string",
      });
    },
    (argv) => {
      commitRepo(argv.message);
    }
  )
  .command("push", "Push commits to S3", {}, pushRepo)
  .command("pull", "Pull commits from S3", {}, pullRepo)
  .command(
    "revert <commitID>",
    "Revert to a specific commit",
    (yargs) => {
      yargs.positional("commitID", {
        describe: "Comit ID to revert to",
        type: "string",
      });
    },
    (argv) => {
      revertRepo(argv.commitID);
    }
  )
  .demandCommand(1, "You need at least one command")
  .help().argv;

function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/githubclone";

  mongoose
    .connect(mongoURI)
    .then(() => console.log("MongoDB connected!"))
    .catch((err) => console.error("Unable to connect : ", err));

  app.use(cors({ origin: "*" }));

  app.use("/", mainRouter);

  // --- Monolithic Deployment Logic ---
  // Serve the static frontend files from the Vite build output
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // Catch-all route to serve the React app for any unrecognized paths (Client-Side Routing)
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
  // -----------------------------------

  let user = "test";
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  app.set("io", io);

  // Track users in rooms: { room: [ { socketId, username } ] }
  const roomUsers = {};

  io.on("connection", (socket) => {
    socket.on("joinRoom", (userID) => {
      user = userID;
      console.log("=====");
      console.log(user);
      console.log("=====");
      socket.join(userID);
    });

    // Chat System: Users join a room with their own User ID to receive personal DMs
    socket.on("joinPersonalRoom", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their personal DM room`);
    });

    // Live Collaboration Events
    socket.on("joinFileRoom", (data) => {
      const room = `${data.repoId}_${data.filePath}`;
      socket.join(room);
      
      if (!roomUsers[room]) roomUsers[room] = [];
      const existingUser = roomUsers[room].find(u => u.socketId === socket.id);
      if (!existingUser) {
        roomUsers[room].push({ socketId: socket.id, username: data.username || "Anonymous Developer" });
      }

      // Broadcast updated user list to the room
      io.to(room).emit("roomUsersUpdate", roomUsers[room]);
      console.log(`User ${data.username} joined live edit room: ${room}`);
    });

    socket.on("leaveFileRoom", (data) => {
      const room = `${data.repoId}_${data.filePath}`;
      socket.leave(room);
      
      if (roomUsers[room]) {
        roomUsers[room] = roomUsers[room].filter(u => u.socketId !== socket.id);
        io.to(room).emit("roomUsersUpdate", roomUsers[room]);
        if (roomUsers[room].length === 0) delete roomUsers[room];
      }
    });

    socket.on("codeChange", (data) => {
      const room = `${data.repoId}_${data.filePath}`;
      // Broadcast to everyone else in the room
      socket.to(room).emit("receiveCodeChange", data);
    });

    socket.on("updateUsername", (data) => {
      const room = `${data.repoId}_${data.filePath}`;
      if (roomUsers[room]) {
        const user = roomUsers[room].find(u => u.socketId === socket.id);
        if (user) {
          user.username = data.username;
          // Broadcast the updated username to everyone in the room
          io.to(room).emit("roomUsersUpdate", roomUsers[room]);
        }
      }
    });

    socket.on("disconnect", () => {
      // Remove user from any rooms they were in
      for (const room in roomUsers) {
        const userInRoom = roomUsers[room].find(u => u.socketId === socket.id);
        if (userInRoom) {
          roomUsers[room] = roomUsers[room].filter(u => u.socketId !== socket.id);
          io.to(room).emit("roomUsersUpdate", roomUsers[room]);
          if (roomUsers[room].length === 0) delete roomUsers[room];
        }
      }
    });
  });

  const db = mongoose.connection;

  db.once("open", async () => {
    console.log("CRUD operations called");
    // CRUD operations
  });

  httpServer.listen(port, () => {
    console.log(`Server is running on PORT ${port}`);
  });
}