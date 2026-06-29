import React, { useEffect, useState } from "react";
import axios from "axios";
import { GitCommitIcon } from "@primer/octicons-react";
import "./commits.css";

const Commits = ({ repoId }) => {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/commit/repo/${repoId}`);
        setCommits(response.data);
      } catch (err) {
        console.error("Error fetching commits:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommits();
  }, [repoId]);

  if (loading) return <div className="loading-state">Loading commits...</div>;

  return (
    <div className="commits-container">
      <div className="commits-header">
        <h3>Commit History</h3>
      </div>
      <div className="commits-list">
        {commits.length === 0 ? (
          <div className="empty-commits">No commits found for this repository.</div>
        ) : (
          commits.map(commit => (
            <div key={commit._id} className="commit-row">
              <div className="commit-info">
                <GitCommitIcon size={16} className="commit-icon" />
                <div className="commit-details">
                  <h4>{commit.message}</h4>
                  <p>
                    <span className="commit-author">{commit.userId?.username || 'Unknown'}</span> committed on {new Date(commit.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="commit-sha">
                {commit._id.substring(0, 7)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Commits;
