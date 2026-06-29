import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReactGA from "react-ga4";
import { useAuth } from "../authContext";
import "./navbar.css";

const Navbar = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const trackFeatureClick = (featureName) => {
    ReactGA.event({
      category: "Marketing",
      action: "Clicked Feature Card",
      label: featureName
    });
  };

  return (
    <>
      <nav>
      <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/logo_dark_blue.png"
            alt="NexuxAI Logo"
            style={{ width: "56px", height: "56px", borderRadius: "50%" }}
          />
          <h3 style={{ margin: 0 }}>NexuxAI</h3>
        </div>
      </Link>
      <div className="navbar-center">
        <form onSubmit={handleSearch} className="search-form">
          <input 
            type="text" 
            placeholder="Search NexuxAI..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </form>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => setShowFeaturesModal(true)}
          style={{ background: "linear-gradient(135deg, #58a6ff 0%, #a371f7 100%)", color: "white", padding: "6px 12px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 12px rgba(163, 113, 247, 0.3)", transition: "transform 0.2s", fontSize: "0.9rem" }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          ✨ Standout Features
        </button>
        <Link to="/explore">
          <p>Explore</p>
        </Link>
        <Link to="/create">
          <p>Create a Repository</p>
        </Link>
        <Link to="/profile">
          <p>Profile</p>
        </Link>
        {currentUser && (
          <button 
            onClick={() => {
              ReactGA.event({
                category: "User",
                action: "User logged out",
                label: "Navbar Logout button"
              });
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              setCurrentUser(null);
              window.location.href = "/auth";
            }}
            style={{ 
              background: "rgba(239, 68, 68, 0.1)", 
              color: "#ef4444", 
              padding: "6px 12px", 
              borderRadius: "8px", 
              border: "1px solid rgba(239, 68, 68, 0.3)", 
              fontWeight: "bold", 
              cursor: "pointer", 
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.1)", 
              transition: "all 0.2s", 
              fontSize: "0.9rem",
              marginLeft: "8px"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(239, 68, 68, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.1)";
            }}
          >
            Log Out
          </button>
        )}
      </div>
      </nav>

      {showFeaturesModal && (
        <div className="features-modal-overlay" onClick={() => setShowFeaturesModal(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div className="features-modal" onClick={(e) => e.stopPropagation()} style={{ background: "rgba(13, 17, 23, 0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", padding: "40px", maxWidth: "1200px", width: "100%", maxHeight: "90vh", overflowY: "auto", overflowX: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,0.8), 0 0 40px rgba(88, 166, 255, 0.1)", animation: "zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)", textAlign: "left", position: "relative" }}>
            
            {/* Background Glows */}
            <div style={{ position: "absolute", top: "-100px", left: "-100px", width: "300px", height: "300px", background: "rgba(88, 166, 255, 0.2)", filter: "blur(100px)", zIndex: 0, borderRadius: "50%", pointerEvents: "none" }}></div>
            <div style={{ position: "absolute", bottom: "-100px", right: "-100px", width: "300px", height: "300px", background: "rgba(163, 113, 247, 0.2)", filter: "blur(100px)", zIndex: 0, borderRadius: "50%", pointerEvents: "none" }}></div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", position: "relative", zIndex: 10 }}>
              <div>
                <h2 style={{ fontSize: "2.5rem", background: "linear-gradient(135deg, #ffffff 0%, #8b949e 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 12px 0", letterSpacing: "-0.03em" }}>✨ Standout Features</h2>
                <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "1.1rem", maxWidth: "700px", lineHeight: "1.6" }}>
                  <strong>The Vision:</strong> We are fundamentally reimagining the open-source collaboration experience. This is a next-generation ecosystem designed to maximize productivity, gamify contribution, and leverage state-of-the-art AI. Here is our competitive moat:
                </p>
              </div>
              <button onClick={() => setShowFeaturesModal(false)} style={{ position: "relative", zIndex: 50, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", color: "var(--text-secondary)", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", cursor: "pointer", transition: "all 0.2s", pointerEvents: "auto" }} onMouseEnter={(e) => {e.currentTarget.style.background="rgba(255,255,255,0.1)"; e.currentTarget.style.color="#fff";}} onMouseLeave={(e) => {e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.color="var(--text-secondary)";}}>✕</button>
            </div>

            <style>{`
              @keyframes zoomIn { from { opacity: 0; transform: scale(0.95) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
              .bento-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; position: relative; zIndex: 1; }
              @media (max-width: 1024px) { .bento-grid { grid-template-columns: repeat(2, 1fr); } }
              @media (max-width: 768px) { .bento-grid { grid-template-columns: 1fr; } .bento-span-2 { grid-column: auto !important; } }
              .bento-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 28px; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); position: relative; overflow: hidden; backdrop-filter: blur(10px); display: flex; flex-direction: column; }
              .bento-card:hover { transform: translateY(-6px); border-color: rgba(255,255,255,0.2); box-shadow: 0 16px 32px rgba(0,0,0,0.6); background: rgba(255,255,255,0.06); }
              .bento-content { position: relative; z-index: 1; flex-grow: 1; display: flex; flex-direction: column; }
              .bento-icon-wrapper { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
              .bento-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
              .bento-tag { font-size: 0.7rem; font-weight: 700; padding: 4px 10px; border-radius: 100px; letter-spacing: 0.05em; text-transform: uppercase; }
              .bento-list { margin: 12px 0 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
              .bento-list li { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #8b949e; }
              .bento-list li::before { content: '✓'; color: var(--text-primary); font-weight: bold; }
            `}</style>

            <div className="bento-grid">
              
              <div className="bento-card bento-span-2" style={{ gridColumn: "span 2", cursor: "pointer" }} onClick={() => trackFeatureClick("Auto Repo Description Generator")}>
                <div className="bento-content">
                  <div className="bento-icon-wrapper">
                    <div className="bento-icon" style={{ background: "linear-gradient(135deg, rgba(88,166,255,0.2) 0%, rgba(88,166,255,0) 100%)", border: "1px solid rgba(88,166,255,0.3)", color: "#58a6ff" }}>🤖</div>
                    <span className="bento-tag" style={{ background: "rgba(88,166,255,0.1)", color: "#58a6ff", border: "1px solid rgba(88,166,255,0.2)" }}>✨ Gen-AI Powered</span>
                  </div>
                  <h4 style={{ color: "#fff", fontSize: "1.3rem", margin: "0 0 12px 0" }}>Auto Repo Description Generator</h4>
                  <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem", lineHeight: "1.6" }}><strong>The differentiator:</strong> Creating projects is effortless. Our integrated Gemini AI instantly generates dynamic, 50-word, highly professional "investor-pitch" descriptions for any repository in seconds with a simple click.</p>
                  <ul className="bento-list">
                    <li>Instant Investor Pitch Generation</li>
                    <li>Continuous Randomization Seeds</li>
                  </ul>
                </div>
              </div>

              <div className="bento-card" style={{ cursor: "pointer" }} onClick={() => trackFeatureClick("AI Pull Request Reviewer")}>
                <div className="bento-content">
                  <div className="bento-icon-wrapper">
                    <div className="bento-icon" style={{ background: "linear-gradient(135deg, rgba(163,113,247,0.2) 0%, rgba(163,113,247,0) 100%)", border: "1px solid rgba(163,113,247,0.3)", color: "#a371f7" }}>🛡️</div>
                    <span className="bento-tag" style={{ background: "rgba(163,113,247,0.1)", color: "#a371f7", border: "1px solid rgba(163,113,247,0.2)" }}>✨ AI Integration</span>
                  </div>
                  <h4 style={{ color: "#fff", fontSize: "1.2rem", margin: "0 0 12px 0" }}>AI Pull Request Reviewer</h4>
                  <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem", lineHeight: "1.6" }}><strong>The differentiator:</strong> Never merge bad code again. The Gemini AI acts as a Senior Developer, automatically parsing proposed changes and surfacing hidden bugs before you hit merge.</p>
                  <ul className="bento-list">
                    <li>Automated Code Reviews</li>
                    <li>Instant Bug Identification</li>
                  </ul>
                </div>
              </div>

              <div className="bento-card" style={{ cursor: "pointer" }} onClick={() => trackFeatureClick("3D Codebase Visualizer")}>
                <div className="bento-content">
                  <div className="bento-icon-wrapper">
                    <div className="bento-icon" style={{ background: "linear-gradient(135deg, rgba(227,179,65,0.2) 0%, rgba(227,179,65,0) 100%)", border: "1px solid rgba(227,179,65,0.3)", color: "#e3b341" }}>🕸️</div>
                    <span className="bento-tag" style={{ background: "rgba(227,179,65,0.1)", color: "#e3b341", border: "1px solid rgba(227,179,65,0.2)" }}>📊 Visualization</span>
                  </div>
                  <h4 style={{ color: "#fff", fontSize: "1.2rem", margin: "0 0 12px 0" }}>3D Codebase Visualizer</h4>
                  <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem", lineHeight: "1.6" }}><strong>The differentiator:</strong> Legacy platforms present codebases as flat file trees. We dynamically render an interactive 3D galaxy of glowing nodes that maps complex architecture visually.</p>
                  <ul className="bento-list">
                    <li>OrbitControls Auto-Rotation</li>
                    <li>Instant Dependency Insights</li>
                  </ul>
                </div>
              </div>

              <div className="bento-card" style={{ cursor: "pointer" }} onClick={() => trackFeatureClick("Google Docs Pair Programming")}>
                <div className="bento-content">
                  <div className="bento-icon-wrapper">
                    <div className="bento-icon" style={{ background: "linear-gradient(135deg, rgba(63,185,80,0.2) 0%, rgba(63,185,80,0) 100%)", border: "1px solid rgba(63,185,80,0.3)", color: "#3fb950" }}>⚡</div>
                    <span className="bento-tag" style={{ background: "rgba(63,185,80,0.1)", color: "#3fb950", border: "1px solid rgba(63,185,80,0.2)" }}>🚀 10X Faster</span>
                  </div>
                  <h4 style={{ color: "#fff", fontSize: "1.2rem", margin: "0 0 12px 0" }}>Google Docs Pair Programming</h4>
                  <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem", lineHeight: "1.6" }}><strong>The differentiator:</strong> We eliminate the high-friction barrier of cloning repositories. Our Live Session WebSockets feature allows developers to instantly pair-program on code simultaneously in the browser.</p>
                  <ul className="bento-list">
                    <li>Real-time Live Typing</li>
                    <li>Live User Presence Avatars</li>
                  </ul>
                </div>
              </div>

              <div className="bento-card" style={{ cursor: "pointer" }} onClick={() => trackFeatureClick("Gamified Bounty Issue Tracker")}>
                <div className="bento-content">
                  <div className="bento-icon-wrapper">
                    <div className="bento-icon" style={{ background: "linear-gradient(135deg, rgba(247,129,102,0.2) 0%, rgba(247,129,102,0) 100%)", border: "1px solid rgba(247,129,102,0.3)", color: "#f78166" }}>🎮</div>
                    <span className="bento-tag" style={{ background: "rgba(247,129,102,0.1)", color: "#f78166", border: "1px solid rgba(247,129,102,0.2)" }}>🔥 Stickiness</span>
                  </div>
                  <h4 style={{ color: "#fff", fontSize: "1.2rem", margin: "0 0 12px 0" }}>Gamified Bounty Issue Tracker</h4>
                  <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem", lineHeight: "1.6" }}><strong>The differentiator:</strong> We drive unprecedented user engagement by gamifying open-source. Repo owners set XP Bounties on bugs, and developers earn XP by claiming them to level up.</p>
                  <ul className="bento-list">
                    <li>Global XP Leveling System</li>
                    <li>Bounty Quest Claiming</li>
                  </ul>
                </div>
              </div>
              
              <div className="bento-card" style={{ cursor: "pointer" }} onClick={() => trackFeatureClick("Global Hackathon Calendar")}>
                <div className="bento-content">
                  <div className="bento-icon-wrapper">
                    <div className="bento-icon" style={{ background: "linear-gradient(135deg, rgba(210,168,255,0.2) 0%, rgba(210,168,255,0) 100%)", border: "1px solid rgba(210,168,255,0.3)", color: "#d2a8ff" }}>📅</div>
                    <span className="bento-tag" style={{ background: "rgba(210,168,255,0.1)", color: "#d2a8ff", border: "1px solid rgba(210,168,255,0.2)" }}>🌍 Community</span>
                  </div>
                  <h4 style={{ color: "#fff", fontSize: "1.2rem", margin: "0 0 12px 0" }}>Global Hackathon Calendar</h4>
                  <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem", lineHeight: "1.6" }}><strong>The differentiator:</strong> We foster a continuous talent pipeline by scraping live tech events and hackathons from Unstop, HackerEarth, and Devpost directly into your profile.</p>
                  <ul className="bento-list">
                    <li>Multi-Platform Event Aggregation</li>
                    <li>Live Registration Links</li>
                  </ul>
                </div>
              </div>

              <div className="bento-card" style={{ cursor: "pointer" }} onClick={() => trackFeatureClick("Recursive Folder Uploads")}>
                <div className="bento-content">
                  <div className="bento-icon-wrapper">
                    <div className="bento-icon" style={{ background: "linear-gradient(135deg, rgba(247,129,102,0.2) 0%, rgba(247,129,102,0) 100%)", border: "1px solid rgba(247,129,102,0.3)", color: "#f78166" }}>📁</div>
                    <span className="bento-tag" style={{ background: "rgba(247,129,102,0.1)", color: "#f78166", border: "1px solid rgba(247,129,102,0.2)" }}>🚀 Frictionless</span>
                  </div>
                  <h4 style={{ color: "#fff", fontSize: "1.2rem", margin: "0 0 12px 0" }}>Recursive Folder Uploads</h4>
                  <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem", lineHeight: "1.6" }}><strong>The differentiator:</strong> Standard web interfaces make you upload files one by one. Our powerful drag-and-drop zone lets you drop entire deeply-nested project folders and we recreate the exact directory structure instantly.</p>
                  <ul className="bento-list">
                    <li>Deep Nested Folder Parsing</li>
                    <li>Instant Cloud Syncing</li>
                  </ul>
                </div>
              </div>

              <div className="bento-card" style={{ cursor: "pointer" }} onClick={() => trackFeatureClick("Interactive Contribution Heatmap")}>
                <div className="bento-content">
                  <div className="bento-icon-wrapper">
                    <div className="bento-icon" style={{ background: "linear-gradient(135deg, rgba(88,166,255,0.2) 0%, rgba(88,166,255,0) 100%)", border: "1px solid rgba(88,166,255,0.3)", color: "#58a6ff" }}>📈</div>
                    <span className="bento-tag" style={{ background: "rgba(88,166,255,0.1)", color: "#58a6ff", border: "1px solid rgba(88,166,255,0.2)" }}>🔥 Stickiness</span>
                  </div>
                  <h4 style={{ color: "#fff", fontSize: "1.2rem", margin: "0 0 12px 0" }}>Interactive Contribution Heatmap</h4>
                  <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem", lineHeight: "1.6" }}><strong>The differentiator:</strong> Keep developers hooked with a highly responsive, year-long activity heatmap tracking their daily commits and highlighting their most active coding streaks in vibrant colors.</p>
                  <ul className="bento-list">
                    <li>Dynamic 13-Month Tracking</li>
                    <li>Tooltips and Activity Streaks</li>
                  </ul>
                </div>
              </div>

              <div className="bento-card" style={{ cursor: "pointer" }} onClick={() => trackFeatureClick("Real-Time Push Notifications")}>
                <div className="bento-content">
                  <div className="bento-icon-wrapper">
                    <div className="bento-icon" style={{ background: "linear-gradient(135deg, rgba(234,74,90,0.2) 0%, rgba(234,74,90,0) 100%)", border: "1px solid rgba(234,74,90,0.3)", color: "#ea4a5a" }}>🔔</div>
                    <span className="bento-tag" style={{ background: "rgba(234,74,90,0.1)", color: "#ea4a5a", border: "1px solid rgba(234,74,90,0.2)" }}>🔥 Real-Time</span>
                  </div>
                  <h4 style={{ color: "#fff", fontSize: "1.2rem", margin: "0 0 12px 0" }}>Real-Time Push Notifications</h4>
                  <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem", lineHeight: "1.6" }}><strong>The differentiator:</strong> Stay instantly in the loop. We integrated Firebase Cloud Messaging (FCM) to blast real desktop push notifications directly to your OS whenever someone interacts with your work.</p>
                  <ul className="bento-list">
                    <li>FCM Backend Integration</li>
                    <li>Browser Service Workers</li>
                  </ul>
                </div>
              </div>

              <div className="bento-card" style={{ cursor: "pointer" }} onClick={() => trackFeatureClick("1-Click GitHub Importer")}>
                <div className="bento-content">
                  <div className="bento-icon-wrapper">
                    <div className="bento-icon" style={{ background: "linear-gradient(135deg, rgba(163,113,247,0.2) 0%, rgba(163,113,247,0) 100%)", border: "1px solid rgba(163,113,247,0.3)", color: "#a371f7" }}>☁️</div>
                    <span className="bento-tag" style={{ background: "rgba(163,113,247,0.1)", color: "#a371f7", border: "1px solid rgba(163,113,247,0.2)" }}>🚀 Seamless</span>
                  </div>
                  <h4 style={{ color: "#fff", fontSize: "1.2rem", margin: "0 0 12px 0" }}>1-Click GitHub Importer</h4>
                  <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem", lineHeight: "1.6" }}><strong>The differentiator:</strong> Migrate in seconds. Leveraging GitHub OAuth and the GitHub API, we download and unpack massive Zip archives directly into our MongoDB backend instantly.</p>
                  <ul className="bento-list">
                    <li>OAuth 2.0 Integration</li>
                    <li>In-Memory Zip Extraction</li>
                  </ul>
                </div>
              </div>

              <div className="bento-card" style={{ cursor: "pointer" }} onClick={() => trackFeatureClick("Hierarchical File System UI")}>
                <div className="bento-content">
                  <div className="bento-icon-wrapper">
                    <div className="bento-icon" style={{ background: "linear-gradient(135deg, rgba(63,185,80,0.2) 0%, rgba(63,185,80,0) 100%)", border: "1px solid rgba(63,185,80,0.3)", color: "#3fb950" }}>🗂️</div>
                    <span className="bento-tag" style={{ background: "rgba(63,185,80,0.1)", color: "#3fb950", border: "1px solid rgba(63,185,80,0.2)" }}>✨ Authentic UX</span>
                  </div>
                  <h4 style={{ color: "#fff", fontSize: "1.2rem", margin: "0 0 12px 0" }}>Hierarchical File System UI</h4>
                  <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem", lineHeight: "1.6" }}><strong>The differentiator:</strong> No more flat lists. We completely recreated the iconic GitHub folder tree using deeply recursive React components with collapsible folders and smart directory sorting.</p>
                  <ul className="bento-list">
                    <li>Recursive Component Rendering</li>
                    <li>Collapsible Nested Folders</li>
                  </ul>
                </div>
              </div>

              <div className="bento-card" style={{ cursor: "pointer" }} onClick={() => trackFeatureClick("Real-Time Direct Messaging")}>
                <div className="bento-content">
                  <div className="bento-icon-wrapper">
                    <div className="bento-icon" style={{ background: "linear-gradient(135deg, rgba(88,166,255,0.2) 0%, rgba(88,166,255,0) 100%)", border: "1px solid rgba(88,166,255,0.3)", color: "#58a6ff" }}>💬</div>
                    <span className="bento-tag" style={{ background: "rgba(88,166,255,0.1)", color: "#58a6ff", border: "1px solid rgba(88,166,255,0.2)" }}>🚀 Real-Time</span>
                  </div>
                  <h4 style={{ color: "#fff", fontSize: "1.2rem", margin: "0 0 12px 0" }}>Real-Time Direct Messaging</h4>
                  <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem", lineHeight: "1.6" }}><strong>The differentiator:</strong> Instantly collaborate and communicate with other developers using our built-in real-time chat with support for file attachments and emojis.</p>
                  <ul className="bento-list">
                    <li>WebSockets Live Chat</li>
                    <li>File & Emoji Support</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;