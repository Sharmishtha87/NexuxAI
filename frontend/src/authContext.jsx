import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = ()=>{
    return useContext(AuthContext);
}

export const AuthProvider = ({children})=>{
    const [currentUser, setCurrentUser] = useState(null);
    useEffect(()=>{
        const userId = localStorage.getItem('userId');
        if(userId){
            setCurrentUser(userId);
            // Fetch global theme on initial load
            axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/userProfile/${userId}`)
              .then(res => {
                if (res.data && res.data.theme) {
                  document.body.className = `theme-${res.data.theme}`;
                } else {
                  document.body.className = "theme-default";
                }
              })
              .catch(err => console.error("Could not fetch global theme", err));

            // Request Firebase Cloud Messaging Token
            import('./firebase.js').then(({ requestForToken }) => {
                requestForToken().then((token) => {
                    if (token) {
                        axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/userProfile/${userId}/fcmToken`, { fcmToken: token })
                            .then(() => console.log("FCM Token saved to backend successfully!"))
                            .catch(err => console.error("Failed to save FCM token", err));
                    }
                });
            }).catch(err => console.error("Firebase module could not be loaded", err));
        }
    }, []);

    const value = {
        currentUser, setCurrentUser
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}