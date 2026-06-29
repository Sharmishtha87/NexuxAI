import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import "./repoView.css";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FileIcon, RepoIcon, ArrowLeftIcon, BookIcon, TrashIcon, StarIcon, RepoForkedIcon, GitPullRequestIcon, GitCommitIcon, LinkIcon, PencilIcon, FileDirectoryIcon, ChevronRightIcon, ChevronDownIcon } from "@primer/octicons-react";
import IssueList from "../issue/IssueList";
import PullRequests from "./PullRequests";
import Commits from "./Commits";
import ArchitectureGraph from "./ArchitectureGraph";
import { SparkleFillIcon, BroadcastIcon } from "@primer/octicons-react";
import { io } from "socket.io-client";
import ReactGA from "react-ga4";

const buildFileTree = (files) => {
  const root = { name: "root", isDir: true, children: {}, path: "" };
  files.forEach(file => {
    const parts = file.path.split('/');
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current.children[part] = { name: part, isDir: false, file, path: file.path };
      } else {
        if (!current.children[part]) {
          current.children[part] = { name: part, isDir: true, children: {}, path: parts.slice(0, i+1).join('/') };
        }
        current = current.children[part];
      }
    }
  });
  return root;
};

const FileTreeNode = ({ node, onFileClick, activeFile, level = 0, isSidebar = false }) => {
  const [expanded, setExpanded] = useState(false);
  
  const paddingLeft = isSidebar ? `${level * 12 + 4}px` : `${level * 20 + 12}px`;
  
  if (!node.isDir) {
    return (
      <div 
        className="file-row" 
        onClick={() => onFileClick(node.file)}
        style={{ 
          padding: `8px 12px`,
          paddingLeft,
          cursor: "pointer",
          background: activeFile?.path === node.path ? "rgba(88, 166, 255, 0.1)" : "transparent",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderBottom: isSidebar ? "none" : "1px solid var(--border-subtle)",
          color: activeFile?.path === node.path ? "var(--accent-primary)" : "var(--text-secondary)",
          transition: "background 0.2s"
        }}
        onMouseEnter={(e) => { if (activeFile?.path !== node.path) e.currentTarget.style.background = "var(--bg-card-hover)" }}
        onMouseLeave={(e) => { if (activeFile?.path !== node.path) e.currentTarget.style.background = "transparent" }}
      >
        <FileIcon size={16} /> 
        <span className="file-path">{node.name}</span>
      </div>
    );
  }

  // Sort children: directories first, then files alphabetically
  const children = Object.values(node.children).sort((a, b) => {
    if (a.isDir === b.isDir) return a.name.localeCompare(b.name);
    return a.isDir ? -1 : 1;
  });

  return (
    <div>
      <div 
        className="file-row dir-row" 
        onClick={() => setExpanded(!expanded)}
        style={{ 
          padding: `8px 12px`,
          paddingLeft,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderBottom: isSidebar ? "none" : "1px solid var(--border-subtle)",
          background: "transparent",
          transition: "background 0.2s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card-hover)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
      >
        <div style={{ display: "flex", alignItems: "center", color: "var(--text-secondary)", width: "16px", justifyContent: "center" }}>
          {expanded ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
        </div>
        <FileDirectoryIcon size={16} color="#79c0ff" />
        <span className="file-path" style={{ fontWeight: "bold", color: "var(--text-primary)" }}>{node.name}</span>
      </div>
      {expanded && (
        <div className="dir-children">
          {children.map(child => (
            <FileTreeNode 
              key={child.path} 
              node={child} 
              onFileClick={onFileClick} 
              activeFile={activeFile} 
              level={level + 1} 
              isSidebar={isSidebar}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const RepoView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repo, setRepo] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readmeContent, setReadmeContent] = useState("");
  const [activeTab, setActiveTab] = useState("code");
  const [isStarred, setIsStarred] = useState(false);
  const [starCount, setStarCount] = useState(0);

  const [isEditingRepo, setIsEditingRepo] = useState(false);
  const [editFormData, setEditFormData] = useState({ description: "", websiteUrl: "" });
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  const [aiReviewLoading, setAiReviewLoading] = useState(false);
  const [aiReviewData, setAiReviewData] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);

  // Live Collaboration State
  const [socket, setSocket] = useState(null);
  const [isLiveEdit, setIsLiveEdit] = useState(false);
  const [liveContent, setLiveContent] = useState("");
  const [liveCollaborators, setLiveCollaborators] = useState([]);

  const userId = localStorage.getItem("userId");
  const [customUsername, setCustomUsername] = useState(localStorage.getItem("username") || `Dev-${Math.floor(Math.random()*1000)}`);

  const handleUsernameChange = (e) => {
    const newName = e.target.value;
    setCustomUsername(newName);
    localStorage.setItem("username", newName);
    if (socket && activeFile && isLiveEdit) {
      socket.emit("updateUsername", { repoId: id, filePath: activeFile.path, username: newName });
    }
  };

  useEffect(() => {
    // Initialize Socket
    const newSocket = io(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}`);
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);
  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/repo/${id}`);
        const repoData = response.data[0];
        setRepo(repoData);
        setStarCount(repoData.starCount || 0);
        setEditFormData({ description: repoData.description || "", websiteUrl: repoData.websiteUrl || "" });

        if (repoData && repoData.content) {
          const parsedFiles = repoData.content.map(c => JSON.parse(c));
          parsedFiles.sort((a, b) => a.path.localeCompare(b.path));
          setFiles(parsedFiles);

          const readmeFile = parsedFiles.find(f => f.path.toLowerCase() === "readme.md" || f.path.toLowerCase().endsWith("/readme.md"));
          if (readmeFile) {
            const base64Content = readmeFile.content.split(",")[1];
            if (base64Content) {
              setReadmeContent(decodeURIComponent(escape(window.atob(base64Content))));
            }
          }
        }

        // Fetch user to check star status
        if (userId) {
          const userResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/userProfile/${userId}`);
          if (userResponse.data && userResponse.data.starRepos) {
            setIsStarred(userResponse.data.starRepos.includes(id));
          }
        }
      } catch (err) {
        console.error("Failed to fetch repo", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRepo();
  }, [id, userId]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this repository? This action cannot be undone.")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/repo/delete/${id}`);
        alert("Repository deleted successfully!");
        navigate("/");
      } catch (err) {
        console.error("Failed to delete repository", err);
        alert("Failed to delete repository.");
      }
    }
  };

  const handleStar = async () => {
    if (!userId) return alert("Please log in to star repositories");
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/repo/toggle-star/${id}`, { userId });
      setIsStarred(!isStarred);
      if (res.data.starCount !== undefined) {
        setStarCount(res.data.starCount);
      } else {
        setStarCount(isStarred ? starCount - 1 : starCount + 1);
      }
      if (!isStarred) {
        ReactGA.event({
          category: "Repository",
          action: "Starred Repo",
          label: repo.name
        });
      }
    } catch (err) {
      console.error("Failed to toggle star", err);
    }
  };

  const handleFork = async () => {
    if (!userId) return alert("Please log in to fork repositories");
    if (window.confirm("Do you want to fork this repository into your account?")) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/repo/fork/${id}`, { userId });
        ReactGA.event({
          category: "Repository",
          action: "Forked Repo",
          label: repo.name
        });
        alert("Repository forked successfully!");
        navigate(`/repo/${response.data.repositoryID}`);
      } catch (err) {
        console.error("Failed to fork repository", err);
        alert("Failed to fork repository.");
      }
    }
  };

  const handleEditRepoSubmit = async () => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/repo/update/${id}`, editFormData);
      setRepo(response.data.repository);
      setIsEditingRepo(false);
    } catch (err) {
      console.error("Failed to update repository details", err);
      alert("Failed to update repository.");
    }
  };

  const handleGenerateDescription = async () => {
    setIsGeneratingDesc(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/ai/generate-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoName: repo.name }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setEditFormData({ ...editFormData, description: data.description });
      } else {
        alert("Failed to generate description.");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating description.");
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleActiveFile = (file) => {
    setActiveFile(file);
    setIsLiveEdit(false);
  };

  const handleFileClick = (file) => {
    setActiveFile(file);
    setIsLiveEdit(false);
  };

  useEffect(() => {
    if (socket && activeFile) {
      socket.emit("joinFileRoom", { repoId: id, filePath: activeFile.path, username: customUsername });
      setLiveContent(decodeBase64(activeFile.content));

      const handleCodeChange = (data) => {
        setLiveContent(data.content);
      };
      
      const handleUsersUpdate = (users) => {
        setLiveCollaborators(users);
      };

      socket.on("receiveCodeChange", handleCodeChange);
      socket.on("roomUsersUpdate", handleUsersUpdate);

      return () => {
        socket.emit("leaveFileRoom", { repoId: id, filePath: activeFile.path });
        socket.off("receiveCodeChange", handleCodeChange);
        socket.off("roomUsersUpdate", handleUsersUpdate);
      };
    }
  }, [socket, activeFile, id]); // Intentionally omitting customUsername to avoid re-joining on every keystroke

  const handleLiveContentChange = (e) => {
    const newContent = e.target.value;
    setLiveContent(newContent);
    if (socket && activeFile) {
      socket.emit("codeChange", { repoId: id, filePath: activeFile.path, content: newContent });
    }
  };

  const handleSaveLiveEdit = async () => {
    try {
      const prefix = activeFile.content.includes(',') ? activeFile.content.split(',')[0] : "data:text/plain;base64";
      const base64Content = window.btoa(unescape(encodeURIComponent(liveContent)));
      const fullBase64 = `${prefix},${base64Content}`;

      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/repo/update-file/${id}`, {
        filePath: activeFile.path,
        fileContent: fullBase64,
        commitMessage: `Live edit: Updated ${activeFile.path}`,
        userId: userId
      });
      
      alert("Changes saved and committed successfully!");
      
      // Update local state to reflect the new saved content
      setActiveFile({...activeFile, content: fullBase64});
      setFiles(files.map(f => f.path === activeFile.path ? {...f, content: fullBase64} : f));
      
    } catch (err) {
      console.error("Failed to save live edit", err);
      alert("Failed to save changes.");
    }
  };
  const handleCreateReadme = async () => {
    const defaultContent = `# ${repo.name}\n\n${repo.description || "Welcome to your new repository!"}`;
    const base64Content = "data:text/markdown;base64," + window.btoa(unescape(encodeURIComponent(defaultContent)));
    const newFile = { path: "README.md", content: base64Content };
    
    // Check if it already exists to be safe
    const existingIdx = files.findIndex(f => f.path.toLowerCase() === "readme.md");
    if (existingIdx !== -1) {
      handleFileClick(files[existingIdx]);
      return;
    }
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/repo/upload-files/${id}`, {
        files: [newFile],
        userId: userId
      });
      
      const updatedFiles = [...files, newFile].sort((a, b) => a.path.localeCompare(b.path));
      setFiles(updatedFiles);
      setActiveFile(newFile);
      setLiveContent(defaultContent);
      setIsLiveEdit(true);
    } catch (err) {
      console.error("Failed to create README", err);
      alert("Failed to create README.");
    }
  };


  const handleAiReview = async () => {
    setShowAiModal(true);
    setAiReviewLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/ai/review-repo/${id}`);
      setAiReviewData(response.data.review);
    } catch (err) {
      console.error("AI Review Failed:", err);
      setAiReviewData("Failed to generate AI review. Ensure backend is running and API key is valid.");
    } finally {
      setAiReviewLoading(false);
    }
  };

  const scanFiles = async (item, path = '') => {
    return new Promise((resolve) => {
      if (item.isFile) {
        item.file((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve([{ path: path + file.name, content: e.target.result }]);
          };
          reader.onerror = () => resolve([]);
          reader.readAsDataURL(file);
        });
      } else if (item.isDirectory) {
        const dirReader = item.createReader();
        dirReader.readEntries(async (entries) => {
          let results = [];
          for (let entry of entries) {
            const nestedFiles = await scanFiles(entry, path + item.name + '/');
            results = results.concat(nestedFiles);
          }
          resolve(results);
        });
      } else {
        resolve([]);
      }
    });
  };

  const processFileList = async (fileList) => {
    const filesArray = Array.from(fileList);
    const parsedFiles = [];
    for (const file of filesArray) {
      const reader = new FileReader();
      const filePromise = new Promise((resolve, reject) => {
        reader.onload = (e) => {
          resolve({
            path: file.webkitRelativePath || file.name,
            content: e.target.result
          });
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const parsedFile = await filePromise;
      parsedFiles.push(parsedFile);
    }
    return parsedFiles;
  };

  const uploadParsedFiles = async (parsedFiles) => {
    if (parsedFiles.length === 0) return;
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/repo/upload-files/${id}`, {
        files: parsedFiles,
        userId: userId
      });
      alert(`Successfully uploaded ${parsedFiles.length} file(s)!`);
      
      const updatedFiles = [...files];
      parsedFiles.forEach(pf => {
        const existingIdx = updatedFiles.findIndex(f => f.path === pf.path);
        if (existingIdx !== -1) {
          updatedFiles[existingIdx] = pf;
        } else {
          updatedFiles.push(pf);
        }
      });
      updatedFiles.sort((a, b) => a.path.localeCompare(b.path));
      setFiles(updatedFiles);
    } catch (err) {
      console.error("Failed to upload files", err);
      alert("Failed to upload files.");
    }
  };

  const handleFileUpload = async (event) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    const parsedFiles = await processFileList(uploadedFiles);
    uploadParsedFiles(parsedFiles);
    event.target.value = null;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.currentTarget.style.border = "2px dashed transparent";
    
    let parsedFiles = [];
    const items = e.dataTransfer.items;
    
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry();
        if (item) {
          const files = await scanFiles(item);
          parsedFiles = parsedFiles.concat(files);
        }
      }
    } else {
      parsedFiles = await processFileList(e.dataTransfer.files);
    }
    
    uploadParsedFiles(parsedFiles);
  };

  const decodeBase64 = (base64String) => {
    try {
      const base64Data = base64String.split(',')[1];
      if (!base64Data) return base64String;
      return decodeURIComponent(escape(window.atob(base64Data)));
    } catch (e) {
      return "Failed to decode content.";
    }
  };

  const getLanguageFromExtension = (path) => {
    const ext = path.split('.').pop();
    const map = {
      js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
      html: 'html', css: 'css', json: 'json', md: 'markdown',
      py: 'python', java: 'java', cpp: 'cpp', c: 'c',
    };
    return map[ext] || 'javascript';
  };

  if (loading) return <div className="loading-state">Loading Repository...</div>;
  if (!repo) return <div className="error-state">Repository not found.</div>;

  return (
    <>
      <Navbar />
      <div className="repo-view-wrapper">
        <div className="repo-header">
          <div className="repo-header-top">
            <h2>
              <RepoIcon size={24} /> {repo.name}
              <span className="repo-visibility">{repo.visibility ? "Public" : "Private"}</span>
            </h2>
            <div className="repo-header-actions">
              <button className="repo-action-btn ai-review-btn" onClick={handleAiReview} style={{ background: "linear-gradient(90deg, #58a6ff, #a371f7)", color: "white", border: "none", boxShadow: "0 0 10px rgba(163, 113, 247, 0.4)" }}>
                <SparkleFillIcon size={16} /> AI Review
              </button>
              <button className={`repo-action-btn ${isStarred ? 'starred' : ''}`} onClick={handleStar}>
                <StarIcon size={16} /> {isStarred ? 'Starred' : 'Star'} <span style={{ marginLeft: "4px", paddingLeft: "6px", borderLeft: "1px solid rgba(255,255,255,0.2)" }}>{starCount}</span>
              </button>
              <button className="repo-action-btn" onClick={handleFork}>
                <RepoForkedIcon size={16} /> Fork
              </button>
              {userId === repo.owner?._id && (
                <>
                  <button className="repo-action-btn" onClick={() => setIsEditingRepo(true)}>
                    <PencilIcon size={16} /> Edit Details
                  </button>
                  <button className="delete-repo-btn" onClick={handleDelete}>
                    <TrashIcon size={16} /> Delete
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="repo-details-display">
            <p className="repo-desc">{repo.description || "No description provided."}</p>
            {repo.websiteUrl && (
              <a href={repo.websiteUrl} target="_blank" rel="noreferrer" className="repo-website-link" style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-primary)", textDecoration: "none", marginTop: "8px", fontSize: "0.9rem", fontWeight: "500" }}>
                <LinkIcon size={16} /> {repo.websiteUrl}
              </a>
            )}
          </div>

          <div className="repo-tabs">
            <button className={`repo-tab ${activeTab === 'code' ? 'active' : ''}`} onClick={() => setActiveTab('code')}>
              <RepoIcon size={16} /> Code
            </button>
            <button className={`repo-tab ${activeTab === 'architecture' ? 'active' : ''}`} onClick={() => setActiveTab('architecture')}>
              <StarIcon size={16} /> Architecture
            </button>
            <button className={`repo-tab ${activeTab === 'issues' ? 'active' : ''}`} onClick={() => setActiveTab('issues')}>
              <BookIcon size={16} /> Issues
            </button>
            <button className={`repo-tab ${activeTab === 'prs' ? 'active' : ''}`} onClick={() => setActiveTab('prs')}>
              <GitPullRequestIcon size={16} /> Pull Requests
            </button>
            <button className={`repo-tab ${activeTab === 'commits' ? 'active' : ''}`} onClick={() => setActiveTab('commits')}>
              <GitCommitIcon size={16} /> Commits
            </button>
          </div>
        </div>

        <div className="repo-content-area">
          {activeTab === 'code' && (
            <>
              {activeFile ? (
                <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", width: "100%" }}>
                  <div className="file-sidebar" style={{ width: "260px", flexShrink: 0, background: "var(--bg-surface)", borderRadius: "8px", border: "1px solid var(--border-subtle)", padding: "10px" }}>
                    <div style={{ padding: "0 8px 8px 8px", borderBottom: "1px solid var(--border-subtle)", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
                      <span>Files</span>
                      <button onClick={() => setActiveFile(null)} style={{ background: "transparent", color: "var(--text-secondary)", fontSize: "12px", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
                        Close
                      </button>
                    </div>
                    <div style={{ maxHeight: "600px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
                      {Object.values(buildFileTree(files).children).sort((a,b) => (b.isDir === a.isDir ? a.name.localeCompare(b.name) : (a.isDir ? -1 : 1))).map((child) => (
                        <FileTreeNode 
                          key={child.path} 
                          node={child} 
                          onFileClick={handleFileClick} 
                          activeFile={activeFile} 
                          level={0} 
                          isSidebar={true}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="code-viewer" style={{ flexGrow: 1, minWidth: 0, border: "1px solid var(--border-subtle)", borderRadius: "8px" }}>
                  <div className="code-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)", borderRadius: "8px 8px 0 0" }}>
                    <h3 style={{ margin: 0, fontSize: "14px", color: "var(--text-primary)" }}>{activeFile.path}</h3>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {isLiveEdit && (
                        <button 
                          onClick={handleSaveLiveEdit}
                          style={{
                            padding: "6px 12px", 
                            background: "var(--accent-primary, #58a6ff)",
                            color: "black",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            transition: "all 0.2s"
                          }}
                        >
                          Save Changes
                        </button>
                      )}
                      <button 
                        onClick={() => setIsLiveEdit(!isLiveEdit)}
                        style={{
                          padding: "6px 12px", 
                          background: isLiveEdit ? "rgba(46, 160, 67, 0.2)" : "transparent",
                          color: isLiveEdit ? "#3fb950" : "var(--text-secondary)",
                          border: `1px solid ${isLiveEdit ? "#3fb950" : "var(--border-subtle)"}`,
                          borderRadius: "4px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontWeight: "bold",
                          transition: "all 0.2s"
                        }}
                      >
                        <BroadcastIcon size={14} className={isLiveEdit ? "live-pulse" : ""} />
                        {isLiveEdit ? "Live Session Active" : "Start Live Session"}
                      </button>
                    </div>
                    <style>{`
                      @keyframes pulse-green { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
                      .live-pulse { animation: pulse-green 1.5s infinite; color: #3fb950; }
                    `}</style>
                  </div>
                  
                  {isLiveEdit && liveCollaborators.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-subtle)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>Live Collaborators:</span>
                        <div style={{ display: "flex", gap: "4px" }}>
                          {liveCollaborators.map((user, idx) => {
                            const colors = ["#ff7b72", "#79c0ff", "#d2a8ff", "#a371f7", "#3fb950"];
                            const color = colors[idx % colors.length];
                            return (
                              <div 
                                key={user.socketId}
                                title={user.username}
                                style={{
                                  width: "28px", 
                                  height: "28px", 
                                  borderRadius: "50%", 
                                  background: color,
                                  color: "white",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  border: "2px solid var(--bg-main)",
                                  boxShadow: "0 0 0 2px rgba(255,255,255,0.1)",
                                  cursor: "pointer"
                                }}
                              >
                                {user.username.substring(0,2).toUpperCase()}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Customizable Username Input */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Your Display Name:</span>
                        <input 
                          type="text" 
                          value={customUsername} 
                          onChange={handleUsernameChange}
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            color: "var(--text-primary)",
                            fontSize: "0.85rem",
                            outline: "none",
                            width: "120px"
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {isLiveEdit ? (
                    <textarea 
                      value={liveContent}
                      onChange={handleLiveContentChange}
                      spellCheck={false}
                      style={{
                        width: "100%",
                        height: "500px",
                        background: "var(--bg-main)",
                        color: "#c9d1d9",
                        fontFamily: "monospace",
                        fontSize: "14px",
                        padding: "16px",
                        border: "none",
                        resize: "vertical",
                        outline: "none",
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word"
                      }}
                    />
                  ) : (
                    <SyntaxHighlighter
                      language={getLanguageFromExtension(activeFile.path)}
                      style={vscDarkPlus}
                      wrapLines={true}
                      wrapLongLines={true}
                      customStyle={{ margin: 0, borderRadius: "0 0 8px 8px", background: "var(--bg-main)" }}
                    >
                      {liveContent || decodeBase64(activeFile.content)}
                    </SyntaxHighlighter>
                  )}
                  </div>
                </div>
              ) : (
                <div 
                  className="file-explorer-container"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  style={{ border: "2px dashed transparent", transition: "border 0.2s" }}
                  onDragEnter={(e) => e.currentTarget.style.border = "2px dashed var(--accent-primary)"}
                  onDragLeave={(e) => e.currentTarget.style.border = "2px dashed transparent"}
                >
                  <div className="file-list-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="commit-info">Latest commit to main</span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <label htmlFor="file-upload" style={{ cursor: "pointer", color: "var(--accent-primary)", fontWeight: "bold", padding: "4px 8px", background: "rgba(88, 166, 255, 0.1)", borderRadius: "4px" }}>
                        Upload Files
                        <input id="file-upload" type="file" multiple onChange={handleFileUpload} style={{ display: "none" }} />
                      </label>
                    </div>
                  </div>
                  <div className="file-list" style={{ border: "1px solid var(--border-subtle)", borderRadius: "6px", overflow: "hidden", background: "var(--bg-surface)" }}>
                    {files.length === 0 ? (
                      <div className="empty-repo" style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)" }}>This repository is empty.</div>
                    ) : (
                      Object.values(buildFileTree(files).children).sort((a,b) => (b.isDir === a.isDir ? a.name.localeCompare(b.name) : (a.isDir ? -1 : 1))).map((child) => (
                        <FileTreeNode 
                          key={child.path} 
                          node={child} 
                          onFileClick={handleFileClick} 
                          activeFile={activeFile} 
                          level={0} 
                        />
                      ))
                    )}
                  </div>

                  {readmeContent ? (
                    <div className="readme-container">
                      <div className="readme-header">
                        <BookIcon size={16} /> README.md
                      </div>
                      <div className="readme-body">
                        <ReactMarkdown>{readmeContent}</ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="readme-prompt" style={{ marginTop: "20px", padding: "20px", border: "1px dashed var(--border-subtle)", borderRadius: "8px", textAlign: "center", background: "var(--bg-card)" }}>
                      <h4 style={{ color: "var(--text-primary)", marginBottom: "8px" }}>Help people understand your project</h4>
                      <p style={{ color: "var(--text-secondary)", marginBottom: "16px", fontSize: "14px" }}>Add a README to explain what this project does and how to use it.</p>
                      <button onClick={handleCreateReadme} style={{ padding: "8px 16px", background: "var(--accent-primary)", color: "var(--bg-main)", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }}>
                        <BookIcon size={16} /> Add a README
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          {activeTab === 'architecture' && (
            <div className="architecture-container" style={{ padding: "20px" }}>
              <h3 style={{ marginBottom: "16px", color: "var(--text-primary)" }}>Repository Architecture Graph</h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
                Interactive node graph visualizing the structure of this repository. Folders are grey, JavaScript files are yellow, HTML/CSS are orange, and Config files are grey.
              </p>
              <ArchitectureGraph files={files} />
            </div>
          )}
          {activeTab === 'issues' && <IssueList repoId={id} />}
          {activeTab === 'prs' && <PullRequests repoId={id} />}
          {activeTab === 'commits' && <Commits repoId={id} />}
        </div>
      </div>

      {isEditingRepo && (
        <div className="guide-modal-overlay">
          <div className="guide-modal" style={{ maxWidth: "500px" }}>
            <div className="guide-header">
              <h2>Edit Repository Details</h2>
              <button className="close-btn" onClick={() => setIsEditingRepo(false)}>✕</button>
            </div>
            <div className="profile-edit-form" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ margin: 0 }}>Description</label>
                <button 
                  type="button" 
                  onClick={handleGenerateDescription}
                  disabled={isGeneratingDesc}
                  className="bento-tag"
                  style={{ background: "rgba(88,166,255,0.1)", color: "#58a6ff", border: "1px solid rgba(88,166,255,0.2)", cursor: "pointer", padding: "4px 10px", fontSize: "0.8rem", transition: "all 0.2s ease" }}
                  onMouseOver={(e) => e.target.style.background = "rgba(88,166,255,0.2)"}
                  onMouseOut={(e) => e.target.style.background = "rgba(88,166,255,0.1)"}
                >
                  {isGeneratingDesc ? "⏳ Generating..." : "✨ Auto Generate"}
                </button>
              </div>
              <textarea 
                value={editFormData.description} 
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} 
                placeholder="What is this repository about?" 
                style={{ width: "100%", padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "white", marginBottom: "16px", minHeight: "150px" }}
              />

              <label>Deployed Website URL</label>
              <input 
                type="text" 
                value={editFormData.websiteUrl} 
                onChange={(e) => setEditFormData({...editFormData, websiteUrl: e.target.value})} 
                placeholder="https://my-deployed-project.com" 
                style={{ width: "100%", padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "white", marginBottom: "24px" }}
              />

              <div className="edit-actions" style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button className="cancel-btn" onClick={() => setIsEditingRepo(false)} style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--border-subtle)", color: "white", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
                <button className="save-btn" onClick={handleEditRepoSubmit} style={{ padding: "8px 16px", background: "var(--accent-primary)", border: "none", color: "black", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAiModal && (
        <div className="guide-modal-overlay">
          <div className="guide-modal" style={{ maxWidth: "800px", minHeight: "500px" }}>
            <div className="guide-header" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <h2><SparkleFillIcon size={24} style={{ color: "#a371f7", marginRight: "8px" }}/> AI Code Review</h2>
              <button className="close-btn" onClick={() => setShowAiModal(false)}>✕</button>
            </div>
            <div style={{ padding: "24px", color: "white", maxHeight: "60vh", overflowY: "auto" }}>
              {aiReviewLoading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "300px", gap: "16px" }}>
                  <div className="scanning-spinner" style={{ width: "40px", height: "40px", border: "4px solid rgba(255,255,255,0.1)", borderTop: "4px solid #a371f7", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                  <p style={{ color: "var(--text-secondary)", animation: "pulse 1.5s infinite" }}>AI is analyzing repository architecture...</p>
                  <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
                </div>
              ) : (
                <div className="ai-markdown-content" style={{ lineHeight: "1.6" }}>
                  <ReactMarkdown>{aiReviewData}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RepoView;
