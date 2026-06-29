import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import Navbar from "../Navbar";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchRepositories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/repo/user/${userId}`
        );
        const data = await response.json();
        setRepositories(data.repositories);
      } catch (err) {
        console.error("Error while fecthing repositories: ", err);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/repo/all`);
        const data = await response.json();
        setSuggestedRepositories(data);
        console.log(suggestedRepositories);
      } catch (err) {
        console.error("Error while fecthing repositories: ", err);
      }
    };

    const fetchUpcomingEvents = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/events/all`);
        const data = await response.json();
        // Get the next 3 events that haven't ended yet
        const upcoming = data.filter(e => new Date(e.endDate) > new Date()).slice(0, 3);
        setUpcomingEvents(upcoming);
      } catch (err) {
        console.error("Error fetching events for dashboard:", err);
      }
    };

    fetchRepositories();
    fetchSuggestedRepositories();
    fetchUpcomingEvents();
  }, []);

  useEffect(() => {
    if (searchQuery == "") {
      setSearchResults(repositories || []);
    } else {
      const filteredRepo = (repositories || []).filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

  return (
    <>
      <Navbar />
      <section id="dashboard">
        <aside>
          <h3>Suggested Repositories</h3>
          {suggestedRepositories?.map((repo) => {
            return (
              <div 
                key={repo._id} 
                onClick={() => navigate(`/repo/${repo._id}`)}
                style={{ cursor: 'pointer', padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--border-subtle)' }}
              >
                <h4 style={{ color: 'var(--accent-primary)', marginBottom: '4px' }}>{repo.name}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{repo.description || 'No description'}</p>
              </div>
            );
          })}
        </aside>
        <main>
          <h2>Your Repositories</h2>
          <div id="search">
            <input
              type="text"
              value={searchQuery}
              placeholder="Search..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchResults?.map((repo) => {
            return (
              <div 
                key={repo._id}
                onClick={() => navigate(`/repo/${repo._id}`)}
                style={{ cursor: 'pointer', padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', marginBottom: '16px', border: '1px solid var(--border-subtle)' }}
              >
                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '8px' }}>{repo.name}</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{repo.description || 'No description provided.'}</p>
              </div>
            );
          })}
        </main>
        <aside>
          <h3>Upcoming Hackathons</h3>
          <ul style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            {upcomingEvents.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Loading events...</p>
            ) : (
              upcomingEvents.map(ev => (
                <li key={ev.id} style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", borderRadius: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {ev.logo && <img src={ev.logo} alt="" style={{ width: "16px", height: "16px", borderRadius: "50%", background: "white" }} />}
                    <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: "600", textTransform: "uppercase" }}>{ev.platform}</span>
                  </div>
                  <a href={ev.url} target="_blank" rel="noreferrer" style={{ fontSize: "0.95rem", color: "var(--accent-primary)", textDecoration: "none", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}</a>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
                    Starts: {new Date(ev.startDate).toLocaleDateString()}
                  </p>
                </li>
              ))
            )}
          </ul>
        </aside>
      </section>
    </>
  );
};

export default Dashboard;