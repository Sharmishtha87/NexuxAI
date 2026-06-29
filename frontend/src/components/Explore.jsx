import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import { RepoIcon, StarIcon } from "@primer/octicons-react";
import "./search.css"; // Reuse search CSS

const Explore = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starredRepos, setStarredRepos] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchExplore = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/explore`);
        if (Array.isArray(response.data)) {
          setRepos(response.data);
        } else {
          console.error("Invalid response format:", response.data);
          setRepos([]);
        }

        if (userId) {
          const userResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/userProfile/${userId}`);
          if (userResponse.data && userResponse.data.starRepos) {
            setStarredRepos(userResponse.data.starRepos);
          }
        }
      } catch (err) {
        console.error("Explore error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExplore();
  }, [userId]);

  return (
    <>
      <Navbar />
      <div className="search-page-container">
        <h2>Explore Repositories</h2>
        <p className="explore-subtitle">Discover interesting projects across the platform.</p>
        
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="explore-grid">
            {repos.map(repo => (
              <Link to={`/repo/${repo._id}`} key={repo._id} className="search-card explore-card">
                <div className="explore-card-header">
                  <h4><RepoIcon size={16} /> {repo.name}</h4>
                  {starredRepos.includes(repo._id) ? (
                    <span className="star-badge" style={{ color: "#e3b341", background: "rgba(227, 179, 65, 0.1)", border: "1px solid #e3b341" }}>
                      <StarIcon size={14} /> Starred <span style={{ marginLeft: "4px", paddingLeft: "4px", borderLeft: "1px solid rgba(227, 179, 65, 0.5)" }}>{repo.starCount || 0}</span>
                    </span>
                  ) : (
                    <span className="star-badge">
                      <StarIcon size={14} /> Star <span style={{ marginLeft: "4px", paddingLeft: "4px", borderLeft: "1px solid var(--border-subtle)" }}>{repo.starCount || 0}</span>
                    </span>
                  )}
                </div>
                <p>{repo.description || "No description provided."}</p>
                <div className="explore-card-footer">
                  <span className="owner-badge">{repo.owner?.username}</span>
                  <span className="date-badge">{new Date(repo.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Explore;
