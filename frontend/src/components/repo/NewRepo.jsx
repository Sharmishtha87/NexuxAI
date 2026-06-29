import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "./newRepo.css";

const NewRepo = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [files, setFiles] = useState([]);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  
  // GitHub Import States
  const [githubRepos, setGithubRepos] = useState([]);
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);
  const [showImport, setShowImport] = useState(false);
  
  const navigate = useNavigate();
  
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;
    
    const filteredFiles = selectedFiles.filter(file => {
      const path = file.webkitRelativePath || file.name;
      return !path.includes("node_modules/") && !path.includes(".git/") && !path.includes(".env");
    });

    const filePromises = filteredFiles.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            path: file.webkitRelativePath || file.name,
            content: reader.result
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    try {
      const processedFiles = await Promise.all(filePromises);
      setFiles(prev => [...prev, ...processedFiles]);
    } catch (err) {
      console.error("Error reading files", err);
      alert("Failed to read some files.");
    }
  };

  const handleGenerateDescription = async () => {
    if (!name.trim()) {
      alert("Please enter a repository name first!");
      return;
    }
    
    setIsGeneratingDesc(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/ai/generate-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoName: name }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setDescription(data.description);
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

  const handleFetchGithubRepos = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in first.");
      return;
    }
    
    setIsFetchingRepos(true);
    setShowImport(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/repo/github-repos/${userId}`);
      const data = await response.json();
      if (response.ok) {
        setGithubRepos(data.repos || []);
      } else {
        alert("Failed to fetch repositories. Have you logged in with GitHub?");
        setShowImport(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching from GitHub.");
      setShowImport(false);
    } finally {
      setIsFetchingRepos(false);
    }
  };

  const handleSelectGithubRepo = async (repo) => {
    setName(repo.name);
    setDescription(repo.description || "");
    setVisibility(repo.private ? "private" : "public");
    
    const confirmImport = window.confirm(`Do you want to instantly import all files from ${repo.full_name}?`);
    if (!confirmImport) {
      setShowImport(false);
      return;
    }

    const userId = localStorage.getItem("userId");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/repo/github-import/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubRepoFullName: repo.full_name,
          repoName: repo.name,
          description: repo.description,
          visibility: !repo.private,
        }),
      });

      if (response.ok) {
        alert("Repository imported successfully!");
        navigate("/");
      } else {
        const errorData = await response.json();
        alert("Import failed: " + errorData.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error importing repository.");
    } finally {
      setShowImport(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const owner = localStorage.getItem("userId");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/repo/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          visibility: visibility === "public",
          owner,
          issues: [],
          content: files.map(f => JSON.stringify(f)),
        }),
      });

      if (response.ok) {
        navigate("/");
      } else {
        const errorData = await response.json();
        alert("Failed to create repository: " + errorData.error);
      }
    } catch (err) {
      console.error("Error creating repo:", err);
      alert("Error creating repository!");
    }
  };

  return (
    <>
      <Navbar />
      <div className="new-repo-wrapper">
        <div className="new-repo-form">
          <h2>Create a new repository</h2>
          <p>A repository contains all project files, including the revision history.</p>

          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Repository name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="awesome-project"
              />
            </div>
            
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ margin: 0 }}>Description (optional)</label>
                <button 
                  type="button" 
                  onClick={handleGenerateDescription}
                  disabled={isGeneratingDesc}
                  className="bento-tag"
                  style={{ background: "rgba(88,166,255,0.1)", color: "#58a6ff", border: "1px solid rgba(88,166,255,0.2)", cursor: "pointer", padding: "4px 10px", fontSize: "0.8rem", transition: "all 0.2s ease", borderRadius: "100px" }}
                  onMouseOver={(e) => e.target.style.background = "rgba(88,166,255,0.2)"}
                  onMouseOut={(e) => e.target.style.background = "rgba(88,166,255,0.1)"}
                >
                  {isGeneratingDesc ? "⏳ Generating..." : "✨ Auto Generate"}
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A short description of your project."
                style={{ minHeight: "150px", lineHeight: "1.5" }}
              />
            </div>

            <div className="form-group upload-zone">
              <label>Initialize Repository with Files</label>
              <p>Upload your project files. We automatically ignore <code>node_modules</code> and <code>.git</code>.</p>
              
              <div className="upload-buttons">
                <button type="button" className="upload-btn" onClick={() => fileInputRef.current.click()}>
                  Upload Files
                </button>
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                  ref={fileInputRef}
                />
                
                {files.length > 0 && (
                  <button type="button" className="clear-files-btn" onClick={() => setFiles([])}>Clear</button>
                )}
              </div>

              {files.length > 0 && (
                <div className="file-preview">
                  <p className="file-count"><strong>{files.length}</strong> files ready to upload.</p>
                  <div className="file-list">
                    {files.slice(0, 5).map((f, i) => <div key={i} className="file-item">{f.path}</div>)}
                    {files.length > 5 && <div className="file-item more">...and {files.length - 5} more</div>}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Visibility</label>
              <div className="visibility-options">
                <label className="radio-option">
                  <input 
                    type="radio" 
                    name="visibility" 
                    value="public" 
                    checked={visibility === "public"} 
                    onChange={(e) => setVisibility(e.target.value)} 
                  />
                  <div className="radio-text">
                    <span>🌍 Public</span>
                    <p>Anyone on the internet can see this repository.</p>
                  </div>
                </label>
                <label className="radio-option">
                  <input 
                    type="radio" 
                    name="visibility" 
                    value="private" 
                    checked={visibility === "private"} 
                    onChange={(e) => setVisibility(e.target.value)} 
                  />
                  <div className="radio-text">
                    <span>🔒 Private</span>
                    <p>You choose who can see and commit to this repository.</p>
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" className="submit-btn">
              Create repository
            </button>
          </form>
        </div>

        {/* Sidebar for GitHub Import */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "28px", backdropFilter: "blur(10px)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ background: "linear-gradient(135deg, rgba(88,166,255,0.2) 0%, rgba(88,166,255,0) 100%)", border: "1px solid rgba(88,166,255,0.3)", color: "#58a6ff", width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>⚡</div>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "1.2rem" }}>Import Project</h3>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.5", marginBottom: "24px" }}>
              Already have a project on GitHub? Instantly migrate your code, history, and settings into NexuxAI with a single click.
            </p>
            <button 
              type="button" 
              onClick={handleFetchGithubRepos}
              disabled={isFetchingRepos}
              style={{ background: "linear-gradient(135deg, #238636, #2ea043)", color: "white", padding: "12px 16px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: isFetchingRepos ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", boxShadow: "0 4px 12px rgba(46, 160, 67, 0.3)", transition: "transform 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              {isFetchingRepos ? "Fetching Repositories..." : "Import from GitHub"}
            </button>
          </div>

          {showImport && (
            <div style={{ background: "rgba(13, 17, 23, 0.8)", border: "1px solid rgba(88, 166, 255, 0.3)", borderRadius: "16px", padding: "24px", backdropFilter: "blur(10px)", animation: "slideDown 0.3s ease-out" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#58a6ff" }}>Select a Repository</h3>
                <button onClick={() => setShowImport(false)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "16px" }}>✕</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto", paddingRight: "8px" }}>
                {githubRepos.length === 0 && !isFetchingRepos && <p style={{ color: "var(--text-secondary)" }}>No repositories found.</p>}
                {githubRepos.map((repo, idx) => (
                  <div key={idx} onClick={() => handleSelectGithubRepo(repo)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "16px", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#58a6ff"; e.currentTarget.style.background = "rgba(88,166,255,0.05)"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}>
                    <h4 style={{ margin: "0 0 8px 0", color: "#fff" }}>{repo.name}</h4>
                    <p style={{ margin: "0 0 8px 0", fontSize: "0.85rem", color: "var(--text-secondary)", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>{repo.description || "No description"}</p>
                    <div style={{ display: "flex", gap: "12px", fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                      <span>{repo.private ? "🔒 Private" : "🌍 Public"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NewRepo;
