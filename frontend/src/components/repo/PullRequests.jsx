import React, { useState, useEffect } from "react";
import axios from "axios";
import { GitPullRequestIcon, GitMergeIcon, GitPullRequestClosedIcon, SparkleFillIcon, XIcon } from "@primer/octicons-react";
import ReactMarkdown from "react-markdown";
import "./pullRequests.css";

const PullRequests = ({ repoId }) => {
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userRepos, setUserRepos] = useState([]);
  const [newPR, setNewPR] = useState({ title: "", description: "", sourceRepoId: "" });
  
  const [aiReviewLoading, setAiReviewLoading] = useState(false);
  const [aiReviewData, setAiReviewData] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);

  const userId = localStorage.getItem("userId");

  const fetchPRs = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/pr/target/${repoId}`);
      setPrs(response.data);
    } catch (err) {
      console.error("Error fetching PRs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRepos = async () => {
    if (!userId) return;
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/repo/user/${userId}`);
      const repos = response.data.repositories || [];
      // Filter repos that are forked from the current repo
      const forkedRepos = repos.filter(repo => repo.forkedFrom === repoId);
      setUserRepos(forkedRepos);
    } catch (err) {
      console.error("Error fetching user repos:", err);
    }
  };

  useEffect(() => {
    fetchPRs();
    fetchUserRepos();
  }, [repoId]);

  const handleCreatePR = async (e) => {
    e.preventDefault();
    if (!newPR.title || !newPR.sourceRepoId) return alert("Title and Source Branch are required");

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/pr/create`, {
        ...newPR,
        targetRepoId: repoId,
        authorId: userId
      });
      setShowCreateForm(false);
      setNewPR({ title: "", description: "", sourceRepoId: "" });
      fetchPRs();
    } catch (err) {
      console.error("Error creating PR:", err);
      alert("Failed to create Pull Request");
    }
  };

  const handleStatusChange = async (prId, status) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/pr/status/${prId}`, { status });
      fetchPRs();
    } catch (err) {
      console.error("Error updating PR status:", err);
    }
  };

  const handleAiReview = async (prId) => {
    setAiReviewLoading(true);
    setShowAiModal(true);
    setAiReviewData(null);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/ai/review-pr/${prId}`);
      setAiReviewData(response.data.review);
    } catch (err) {
      console.error(err);
      setAiReviewData("Failed to generate AI review. Ensure backend is running and API key is valid.");
    } finally {
      setAiReviewLoading(false);
    }
  };

  if (loading) return <div className="loading-state">Loading pull requests...</div>;

  return (
    <div className="pr-container">
      <div className="pr-header">
        <h3>Pull Requests</h3>
        {userId && (
          <button className="new-pr-btn" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? "Cancel" : "New Pull Request"}
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="pr-create-form-container">
          {userRepos.length === 0 ? (
            <div className="no-forks-msg">
              You don't have any forks of this repository. Fork it first to propose changes!
            </div>
          ) : (
            <form className="pr-create-form" onSubmit={handleCreatePR}>
              <select 
                value={newPR.sourceRepoId} 
                onChange={(e) => setNewPR({...newPR, sourceRepoId: e.target.value})}
                required
              >
                <option value="">Select your fork to merge from...</option>
                {userRepos.map(repo => (
                  <option key={repo._id} value={repo._id}>{repo.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Pull Request title"
                value={newPR.title}
                onChange={(e) => setNewPR({ ...newPR, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Describe your changes..."
                value={newPR.description}
                onChange={(e) => setNewPR({ ...newPR, description: e.target.value })}
              />
              <button type="submit" className="submit-pr-btn">Create Pull Request</button>
            </form>
          )}
        </div>
      )}

      <div className="pr-list">
        {prs.length === 0 ? (
          <div className="empty-prs">No pull requests found.</div>
        ) : (
          prs.map(pr => (
            <div key={pr._id} className="pr-row">
              <div className="pr-info">
                {pr.status === "open" && <GitPullRequestIcon size={16} className="pr-icon open" />}
                {pr.status === "merged" && <GitMergeIcon size={16} className="pr-icon merged" />}
                {pr.status === "closed" && <GitPullRequestClosedIcon size={16} className="pr-icon closed" />}
                <div className="pr-details">
                  <h4>{pr.title}</h4>
                  <p>#{pr._id.substring(0, 6)} opened by {pr.author?.username || 'Unknown'} • {pr.status}</p>
                </div>
              </div>
              
              {userId && (
                <div className="pr-actions">
                  {pr.status === "open" && (
                    <>
                      <button className="merge-btn" onClick={() => handleStatusChange(pr._id, "merged")}>Merge</button>
                      <button className="close-pr-btn" onClick={() => handleStatusChange(pr._id, "closed")}>Close</button>
                    </>
                  )}
                  <button className="bento-tag" style={{ background: "rgba(163,113,247,0.1)", color: "#a371f7", border: "1px solid rgba(163,113,247,0.2)", cursor: "pointer", marginLeft: "8px" }} onClick={() => handleAiReview(pr._id)}>
                    <SparkleFillIcon size={14} /> AI Review
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showAiModal && (
        <div className="guide-modal-overlay">
          <div className="guide-modal" style={{ maxWidth: "800px", minHeight: "400px" }}>
            <div className="guide-header">
              <h2>✨ AI Pull Request Review</h2>
              <button className="close-btn" onClick={() => setShowAiModal(false)}>
                <XIcon size={24} />
              </button>
            </div>
            <div className="guide-content" style={{ padding: "20px", color: "var(--text-primary)", overflowY: "auto", maxHeight: "60vh" }}>
              {aiReviewLoading ? (
                <div className="loading-spinner-container">
                  <div className="spinner"></div>
                  <p>Analyzing Pull Request Changes...</p>
                </div>
              ) : (
                <div className="markdown-body" style={{ color: "white" }}>
                  <ReactMarkdown>
                    {aiReviewData}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PullRequests;
