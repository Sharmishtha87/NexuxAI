import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PersonIcon } from "@primer/octicons-react";
import "./user.css";

const FollowList = ({ userId, type }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/userProfile/${userId}/${type}`
        );
        setUsers(response.data);
      } catch (err) {
        console.error(`Failed to fetch ${type}:`, err);
        setError(`Could not load ${type}.`);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUsers();
    }
  }, [userId, type]);

  if (loading) {
    return <div className="loading-state">Loading {type}...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  if (users.length === 0) {
    return (
      <div className="empty-state">
        <PersonIcon size={48} className="empty-icon" />
        <h2>No {type} yet</h2>
        <p>This user hasn't {type === 'followers' ? 'gotten any followers' : 'followed anyone'} yet.</p>
      </div>
    );
  }

  return (
    <div className="follow-list-container">
      {users.map((user) => (
        <div 
          key={user._id} 
          className="follow-user-card" 
          onClick={() => navigate(`/user/${user._id}`)}
          style={{ cursor: 'pointer' }}
        >
          <div className="follow-user-avatar" style={{ 
            backgroundImage: user.profilePicture ? `url(${user.profilePicture})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            {!user.profilePicture && <PersonIcon size={24} />}
          </div>
          <div className="follow-user-info">
            <h4 className="follow-user-name">{user.username}</h4>
            {user.email && <p className="follow-user-email">{user.email}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FollowList;
