import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactGA from "react-ga4";
import Navbar from "./Navbar";
import { RepoIcon, PersonIcon } from "@primer/octicons-react";
import "./search.css";

const Search = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q");
  
  const [results, setResults] = useState({ repositories: [], users: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      
      ReactGA.event({
        category: "Search",
        action: "Performed Search",
        label: query
      });

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/search?q=${encodeURIComponent(query)}`);
        if (response.data && Array.isArray(response.data.repositories)) {
          setResults(response.data);
        } else {
          setResults({ repositories: [], users: [] });
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <>
      <Navbar />
      <div className="search-page-container">
        <h2>Search Results for "{query}"</h2>
        
        {loading ? (
          <p>Searching...</p>
        ) : (
          <div className="search-results-grid">
            <div className="search-section">
              <h3><RepoIcon size={20} /> Repositories ({results.repositories.length})</h3>
              {results.repositories.length === 0 ? <p>No repositories found.</p> : (
                results.repositories.map(repo => (
                  <div onClick={() => navigate(`/repo/${repo._id}`)} key={repo._id} className="search-card" style={{ cursor: 'pointer' }}>
                    <h4>{repo.name}</h4>
                    <p>{repo.description || "No description"}</p>
                    <span className="owner-badge">by {repo.owner?.username}</span>
                  </div>
                ))
              )}
            </div>

            <div className="search-section">
              <h3><PersonIcon size={20} /> Users ({results.users.length})</h3>
              {results.users.length === 0 ? <p>No users found.</p> : (
                results.users.map(user => (
                  <div onClick={() => navigate(`/user/${user._id}`)} key={user._id} className="search-card" style={{ cursor: 'pointer' }}>
                    <h4>{user.username}</h4>
                    <p>{user.email}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Search;
