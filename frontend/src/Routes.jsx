import React, { useEffect } from "react";
import ReactGA from 'react-ga4';
import { useLocation, useNavigate, useRoutes } from 'react-router-dom';

// Pages List
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import NewRepo from "./components/repo/NewRepo";
import RepoView from "./components/repo/RepoView";
import Search from "./components/Search";
import Explore from "./components/Explore";
import AuthCallback from "./components/auth/AuthCallback";
import FloatingChat from "./components/chat/FloatingChat";

// Auth Context
import { useAuth } from "./authContext";

const ProjectRoutes = ()=>{
    const {currentUser, setCurrentUser} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
    }, [location]);

    useEffect(()=>{
        const userIdFromStorage = localStorage.getItem("userId");

        if(userIdFromStorage && !currentUser){
            setCurrentUser(userIdFromStorage);
        }

        if(!userIdFromStorage && !["/auth", "/signup", "/auth/callback"].includes(window.location.pathname))
        {
            navigate("/auth");
        }

        if(userIdFromStorage && window.location.pathname=='/auth'){
            navigate("/");
        }
    }, [currentUser, navigate, setCurrentUser]);

    let element = useRoutes([
        {
            path:"/",
            element:<Dashboard/>
        },
        {
            path:"/auth",
            element:<Login/>
        },
        {
            path:"/signup",
            element:<Signup/>
        },
        {
            path: "/auth/callback",
            element: <AuthCallback />
        },
        {
            path:"/profile",
            element:<Profile/>
        },
        {
            path: "/user/:id",
            element: <Profile />
        },
        {
            path:"/create",
            element:<NewRepo/>
        },
        {
            path:"/repo",
            element:<Profile/>
        },
        {
            path:"/repo/:id",
            element:<RepoView/>
        },
        {
            path: "/search",
            element: <Search />,
        },
        {
            path: "/explore",
            element: <Explore />,
        }
    ]);

    return (
        <>
            {element}
            <FloatingChat />
        </>
    );
}

export default ProjectRoutes;