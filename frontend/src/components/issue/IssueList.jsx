import React, { useState, useEffect } from "react";
import axios from "axios";
import "./issue.css";

const IssueList = ({ repoId }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: "", description: "", bounty: 0 });

  const userId = localStorage.getItem("userId");

  const fetchIssues = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/issue/all/${repoId}`);
      setIssues(response.data);
    } catch (err) {
      console.error("Error fetching issues:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [repoId]);

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!newIssue.title) return alert("Title is required");

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/issue/create/${repoId}`, newIssue);
      setShowCreateForm(false);
      setNewIssue({ title: "", description: "", bounty: 0 });
      fetchIssues();
    } catch (err) {
      console.error("Error creating issue:", err);
      alert("Failed to create issue");
    }
  };

  const handleStatusChange = async (issueId, currentStatus) => {
    const newStatus = currentStatus === "open" ? "closed" : "open";
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/issue/update/${issueId}`, { status: newStatus });
      fetchIssues();
    } catch (err) {
      console.error("Error updating issue:", err);
    }
  };

  const handleClaimBounty = async (issueId) => {
    if (!userId) return alert("Please log in to claim bounties!");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/issue/claim/${issueId}`, { userId });
      alert("Bounty claimed successfully! You earned XP!");
      fetchIssues();
    } catch (err) {
      console.error("Error claiming bounty:", err);
      alert(err.response?.data?.error || "Failed to claim bounty.");
    }
  };

  if (loading) return <div className="loading-state">Loading issues...</div>;

  return (
    <div className="issue-list-container">
      <div className="issue-list-header">
        <h3>Issues</h3>
        <button className="new-issue-btn" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? "Cancel" : "New Issue"}
        </button>
      </div>

      {showCreateForm && (
        <form className="issue-create-form" onSubmit={handleCreateIssue}>
          <input
            type="text"
            placeholder="Issue title"
            value={newIssue.title}
            onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Leave a comment..."
            value={newIssue.description}
            onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
            required
          />
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px", marginBottom: "10px" }}>
            <label style={{ fontWeight: "bold", color: "var(--accent-primary)" }}>⭐ Set XP Bounty:</label>
            <input 
              type="number" 
              min="0"
              value={newIssue.bounty}
              onChange={(e) => setNewIssue({ ...newIssue, bounty: Number(e.target.value) })}
              style={{ width: "80px", padding: "6px", background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)", color: "white", borderRadius: "4px" }}
            />
          </div>
          <button type="submit" className="submit-issue-btn">Submit new issue</button>
        </form>
      )}

      <div className="issues-list">
        {issues.length === 0 ? (
          <div className="empty-issues">No issues found. Create one to get started!</div>
        ) : (
          issues.map(issue => (
            <div key={issue._id} className="issue-row">
              <div className="issue-info">
                <span className={`issue-status ${issue.status}`}>{issue.status}</span>
                <div className="issue-details">
                  <h4>
                    {issue.title}
                    {issue.bounty > 0 && (
                      <span style={{ marginLeft: "10px", background: "linear-gradient(90deg, #ffd700, #ffa500)", color: "black", padding: "2px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", textShadow: "0 1px 2px rgba(255,255,255,0.3)" }}>
                        ⭐ {issue.bounty} XP
                      </span>
                    )}
                  </h4>
                  <p>{issue.description}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                {issue.status === "open" && issue.bounty > 0 && (
                  <button 
                    onClick={() => handleClaimBounty(issue._id)}
                    style={{ background: "#3fb950", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                  >
                    Claim Bounty!
                  </button>
                )}
                <button 
                  className="issue-toggle-btn"
                  onClick={() => handleStatusChange(issue._id, issue.status)}
                >
                  {issue.status === "open" ? "Close Issue" : "Reopen Issue"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IssueList;
