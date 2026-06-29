import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { marvelBoys, marvelGirls } from "../../utils/marvelAvatars";
import axios from "axios";
import "./profile.css";
import "./repoProfile.css";
import Navbar from "../Navbar";
import { UnderlineNav } from "@primer/react";
import { RepoIcon, LinkIcon, LocationIcon, StarIcon, IssueOpenedIcon, GitPullRequestIcon, OrganizationIcon, CheckIcon, CheckCircleFillIcon, CheckCircleIcon, RocketIcon, HeartIcon, PlusIcon, SyncIcon, ShieldCheckIcon, HistoryIcon, BookIcon, PersonIcon, PackageIcon, ProjectIcon, GraphIcon, FlameIcon, TrophyIcon, MailIcon, PencilIcon, CommentIcon, CalendarIcon, LightBulbIcon, XIcon, ShieldIcon, DownloadIcon, PeopleIcon } from "@primer/octicons-react";
import HeatMapProfile from "./HeatMap";
import FollowList from "./FollowList";
import { useAuth } from "../../authContext";
import EventCalendar from "../events/EventCalendar";
import html2pdf from "html2pdf.js";
import ReactGA from "react-ga4";

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [activeTab, setActiveTab] = useState(queryParams.get("tab") || "overview");

  // Sync activeTab with URL changes
  useEffect(() => {
    const currentTab = new URLSearchParams(location.search).get("tab") || "overview";
    setActiveTab(currentTab);
  }, [location.search]);

  const [userDetails, setUserDetails] = useState({ username: "Loading..." });
  const [isEditing, setIsEditing] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarGender, setAvatarGender] = useState(null);
  const [avatarCategory, setAvatarCategory] = useState(null);
  const fileInputRef = useRef(null);
  const resumeRef = useRef(null);
  const { setCurrentUser } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [generatedBios, setGeneratedBios] = useState([]);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const { id: urlUserId } = useParams();
  const loggedInUserId = localStorage.getItem("userId");
  const targetUserId = urlUserId || loggedInUserId;
  const isOwnProfile = loggedInUserId === targetUserId;
  const [isFollowing, setIsFollowing] = useState(false);

  // Gamification States
  const [commits, setCommits] = useState([]);
  const [xpData, setXpData] = useState({ current: 0, max: 100, level: 1, percent: 0 });
  const [streakDays, setStreakDays] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    bio: "",
    profilePicture: "",
    college: "",
    linkedin: "",
    instagram: "",
    leetcode: "",
    portfolio: "",
    course: "",
    branch: "",
    year: "",
    semester: "",
    theme: "default",
  });

  useEffect(() => {
    const fetchUserDetailsAndCommits = async () => {
      if (targetUserId) {
        try {
          // 1. Fetch User Details
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/userProfile/${targetUserId}?loggedInUserId=${loggedInUserId || ''}`
          );
          setUserDetails(response.data);
          setFormData({
            bio: response.data.bio || "",
            profilePicture: response.data.profilePicture || "",
            college: response.data.college || "",
            linkedin: response.data.linkedin || "",
            instagram: response.data.instagram || "",
            leetcode: response.data.leetcode || "",
            portfolio: response.data.portfolio || "",
            resume: response.data.resume || "",
            course: response.data.course || "",
            branch: response.data.branch || "",
            year: response.data.year || "",
            semester: response.data.semester || "",
            theme: response.data.theme || "default",
          });
          
          if (!isOwnProfile && response.data.isFollowing !== undefined) {
            setIsFollowing(response.data.isFollowing);
          }

          // 2. Fetch User Commits
          const commitResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/userProfile/${targetUserId}/commits`);
          const userCommits = commitResponse.data;
          setCommits(userCommits);

          // 3. Calculate Real Gamification Metrics
          // Combines baseline commit XP (15 per commit) + earned bounty XP (user.xp)
          const totalXP = (userCommits.length * 15) + (response.data.xp || 0);
          const currentLevel = Math.floor(totalXP / 100) + 1;
          const currentLevelXP = totalXP % 100;
          setXpData({
            current: currentLevelXP,
            max: 100,
            level: currentLevel,
            percent: (currentLevelXP / 100) * 100
          });

          // 4. Calculate Streak
          if (userCommits.length > 0) {
            const getLocalDateString = (d) => {
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            };

            const commitDates = [...new Set(userCommits.map(c => getLocalDateString(new Date(c.createdAt))))];
            const todayDate = new Date();
            const todayStr = getLocalDateString(todayDate);
            
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterdayStr = getLocalDateString(yesterdayDate);

            let streak = 0;
            let cursorDate = new Date(); 
            let hasActiveStreak = false;

            if (commitDates.includes(todayStr)) {
              hasActiveStreak = true;
            } else if (commitDates.includes(yesterdayStr)) {
              hasActiveStreak = true;
              cursorDate = yesterdayDate;
            }

            if (hasActiveStreak) {
              while (commitDates.includes(getLocalDateString(cursorDate))) {
                streak++;
                cursorDate.setDate(cursorDate.getDate() - 1);
              }
            }
            
            setStreakDays(streak);
          }

        } catch (err) {
          console.error("Cannot fetch user details or commits: ", err);
        }
      }
    };
    fetchUserDetailsAndCommits();
  }, [navigate]);

  useEffect(() => {
    const fetchRepos = async () => {
      if (targetUserId && (activeTab === "repositories" || activeTab === "stars")) {
        setLoadingRepos(true);
        try {
          let repoResponse;
          if (activeTab === "stars") {
             repoResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/repo/starred/${targetUserId}`);
          } else {
             repoResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/repo/user/${targetUserId}`);
          }
          setRepositories(repoResponse.data.repositories || []);
        } catch (err) {
          console.error("Cannot fetch repos: ", err);
        } finally {
          setLoadingRepos(false);
        }
      }
    };
    fetchRepos();
  }, [activeTab, targetUserId]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFollow = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/userProfile/${targetUserId}/follow`, {
        followerId: loggedInUserId
      });
      setIsFollowing(response.data.isFollowing);
      // Refresh the target user's stats
      const userResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/userProfile/${targetUserId}`
      );
      setUserDetails(userResponse.data);
    } catch (error) {
      console.error("Error following user", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async () => {
    const userId = localStorage.getItem("userId");
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/updateProfile/${userId}`,
        formData
      );
      setUserDetails(response.data);
      setIsEditing(false);
      // Immediately apply to global body
      if (response.data.theme) {
        document.body.className = `theme-${response.data.theme}`;
      }
    } catch (err) {
      console.error("Failed to update profile", err);
    }
  };

  const handleGenerateBio = async () => {
    setIsGeneratingBio(true);
    setGeneratedBios([]);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/ai/generate-bios`, {
        currentBio: formData.bio,
        username: userDetails.username
      });
      setGeneratedBios(response.data.bios || []);
    } catch (err) {
      console.error("Failed to generate bios", err);
      alert("Failed to generate bios. Try again later.");
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const selectBio = (bio) => {
    setFormData({ ...formData, bio });
    setGeneratedBios([]);
  };

  const handleSyncGitHub = async () => {
    setIsSyncing(true);
    try {
      const githubUsername = prompt("Enter your GitHub username to sync data:", userDetails.username);
      if (!githubUsername) {
        setIsSyncing(false);
        return;
      }
      const userId = localStorage.getItem("userId");
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/github/sync-profile`, { githubUsername, userId });
      
      const newFormData = {
        ...formData,
        bio: response.data.bio || formData.bio,
        profilePicture: response.data.avatarUrl || formData.profilePicture,
      };
      
      setFormData(newFormData);
      
      // Auto-save the fetched data to DB
      const updateResponse = await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/updateProfile/${userId}`,
        newFormData
      );
      
      setUserDetails({
        ...updateResponse.data,
        followersCount: response.data.followersCount,
        followingCount: response.data.followingCount
      });
      
      // Re-fetch commits to update heatmap with new GitHub data
      const commitResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/userProfile/${userId}/commits`);
      setCommits(commitResponse.data);

      alert("GitHub profile and heatmap synced successfully!");
    } catch (err) {
      console.error("Failed to sync GitHub profile", err);
      alert("Failed to sync GitHub profile. Check console for details.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImageClick = () => {
    if (isEditing) {
      setShowAvatarModal(true);
    }
  };

  const handleSelectAvatar = (avatarUrl) => {
    setFormData({ ...formData, profilePicture: avatarUrl });
    setShowAvatarModal(false);
  };

  const handleGenerateResume = () => {
    const element = resumeRef.current;
    const opt = {
      margin:       15,
      filename:     `${userDetails.username}_resume.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();

    ReactGA.event({
      category: "Gamification",
      action: "Generated Resume",
      label: "Profile"
    });
  };

  return (
    <>
      <Navbar />
      <UnderlineNav aria-label="Repository">
        <UnderlineNav.Item
          aria-current={activeTab === "overview" ? "page" : undefined}
          icon={BookIcon}
          onClick={() => navigate("?tab=overview")}
          sx={{
            backgroundColor: "transparent",
            color: activeTab === "overview" ? "var(--text-primary)" : "var(--text-secondary)",
            "&:hover": { textDecoration: "underline", color: "var(--accent-hover)" },
            cursor: "pointer"
          }}
        >
          Overview
        </UnderlineNav.Item>

        <UnderlineNav.Item
          aria-current={activeTab === "events" ? "page" : undefined}
          icon={CalendarIcon}
          onClick={() => navigate("?tab=events")}
          sx={{
            backgroundColor: "transparent",
            color: activeTab === "events" ? "var(--text-primary)" : "var(--text-secondary)",
            "&:hover": { textDecoration: "underline", color: "var(--accent-hover)" },
            cursor: "pointer"
          }}
        >
          Upcoming Events
        </UnderlineNav.Item>

        <UnderlineNav.Item
          aria-current={activeTab === "repositories" ? "page" : undefined}
          onClick={() => navigate("?tab=repositories")}
          icon={RepoIcon}
          sx={{
            backgroundColor: "transparent",
            color: activeTab === "repositories" ? "var(--text-primary)" : "var(--text-secondary)",
            "&:hover": { textDecoration: "underline", color: "var(--accent-hover)" },
            cursor: "pointer"
          }}
        >
          Repositories
        </UnderlineNav.Item>

        <UnderlineNav.Item
          aria-current={activeTab === "stars" ? "page" : undefined}
          onClick={() => navigate("?tab=stars")}
          icon={StarIcon}
          sx={{
            backgroundColor: "transparent",
            color: activeTab === "stars" ? "var(--text-primary)" : "var(--text-secondary)",
            "&:hover": { textDecoration: "underline", color: "var(--accent-hover)" },
            cursor: "pointer"
          }}
        >
          Stars
        </UnderlineNav.Item>

        <UnderlineNav.Item
          aria-current={activeTab === "followers" ? "page" : undefined}
          onClick={() => navigate("?tab=followers")}
          icon={PeopleIcon}
          sx={{
            backgroundColor: "transparent",
            color: activeTab === "followers" ? "var(--text-primary)" : "var(--text-secondary)",
            "&:hover": { textDecoration: "underline", color: "var(--accent-hover)" },
            cursor: "pointer"
          }}
        >
          Followers
        </UnderlineNav.Item>

        <UnderlineNav.Item
          aria-current={activeTab === "following" ? "page" : undefined}
          onClick={() => navigate("?tab=following")}
          icon={PersonIcon}
          sx={{
            backgroundColor: "transparent",
            color: activeTab === "following" ? "var(--text-primary)" : "var(--text-secondary)",
            "&:hover": { textDecoration: "underline", color: "var(--accent-hover)" },
            cursor: "pointer"
          }}
        >
          Following
        </UnderlineNav.Item>
      </UnderlineNav>

      {isOwnProfile && (
        <button
          onClick={() => {
            ReactGA.event({
              category: "User",
              action: "User logged out",
              label: "Logout button"
            });
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            setCurrentUser(null);
            window.location.href = "/auth";
          }}
          id="logout"
        >
        </button>
      )}

      {activeTab !== "events" ? (
      <div className="profile-page-wrapper">
        <div className="user-profile-section">
          <div 
            className={`profile-image pulsing ${isEditing ? 'editable' : ''}`}
            style={{ 
              backgroundImage: (isEditing && formData.profilePicture) ? `url(${formData.profilePicture})` : (userDetails.profilePicture ? `url(${userDetails.profilePicture})` : 'none'),
              backgroundSize: 'cover',
              backgroundPosition: ((isEditing && formData.profilePicture) ? formData.profilePicture : userDetails.profilePicture)?.includes('static.wikia.nocookie.net/disney') ? 'top center' : 'center',
              cursor: isEditing ? 'pointer' : 'default'
            }}
            onClick={handleImageClick}
          >
            {isEditing && (
              <div className="image-overlay">
                <PencilIcon size={24} />
                <span>Change Photo</span>
              </div>
            )}
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            style={{ display: "none" }} 
          />

          <div className="name">
            <h3>{userDetails.username}</h3>
          </div>

          <div className="xp-container">
            <div className="xp-header">
              <span>XP: {xpData.current} / {xpData.max}</span>
              <span className="level-text">Level {xpData.level}</span>
            </div>
            <div className="xp-bar-bg">
              <div className="xp-bar-fill" style={{ width: `${xpData.percent}%` }}></div>
            </div>
          </div>

          {!isEditing ? (
            <div className="profile-details-view">
              <div className="profile-actions">
                <button className="premium-btn generate-pdf-btn" onClick={handleGenerateResume}>
                  <DownloadIcon size={16} /> Generate Resume
                </button>
                
                {isOwnProfile ? (
                  <>
                    <button className="glass-btn sync-btn" onClick={handleSyncGitHub} disabled={isSyncing}>
                      <RepoIcon size={16} /> {isSyncing ? "Syncing..." : "Sync with GitHub"}
                    </button>
                    <button className="glass-btn edit-profile-btn" onClick={() => setIsEditing(true)}>
                      <PencilIcon size={16} /> Edit Profile
                    </button>
                  </>
                ) : (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="premium-btn" 
                      onClick={handleFollow}
                      style={{ flex: 1, background: isFollowing ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #58a6ff 0%, #3b82f6 100%)', border: isFollowing ? '1px solid rgba(255,255,255,0.2)' : 'none' }}
                    >
                      <PersonIcon size={16} /> {isFollowing ? "Unfollow" : "Follow"}
                    </button>
                    <button 
                      className="premium-btn" 
                      onClick={() => window.dispatchEvent(new CustomEvent('openChat', { detail: { targetUserId } }))}
                      style={{ flex: 1, background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)', border: 'none' }}
                    >
                      <CommentIcon size={16} /> Message
                    </button>
                  </div>
                )}
              </div>

              {userDetails.bio && <p className="bio-text" style={{ fontSize: '1.3em', fontWeight: 'bold', background: 'linear-gradient(90deg, #ffd700, #ff8a00, #ff007f)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 10px rgba(255, 215, 0, 0.4)' }}>{userDetails.bio}</p>}

              <div className="social-links">
                {userDetails.college && (
                  <p><span style={{ fontSize: '1.8em', marginRight: '8px', verticalAlign: 'middle', filter: 'drop-shadow(0px 0px 8px rgba(255,255,255,0.4))' }}>🎓</span> <span style={{ verticalAlign: 'middle', fontSize: '1.2em', fontWeight: 'bold' }}>{userDetails.college}</span></p>
                )}
                {(userDetails.course || userDetails.branch || userDetails.year || userDetails.semester) && (
                  <p>
                    <span style={{ fontSize: '1.8em', marginRight: '8px', verticalAlign: 'middle', filter: 'drop-shadow(0px 0px 8px rgba(255,255,255,0.4))' }}>📘</span> 
                    <span style={{ verticalAlign: 'middle', fontSize: '1.1em', fontWeight: '500' }}>
                      {[userDetails.course, userDetails.branch, userDetails.year, userDetails.semester].filter(Boolean).join(" • ")}
                    </span>
                  </p>
                )}
                {userDetails.portfolio && (
                  <p><span style={{ fontSize: '1.8em', marginRight: '8px', verticalAlign: 'middle', filter: 'drop-shadow(0px 0px 8px rgba(255,255,255,0.4))' }}>🌐</span> <a href={userDetails.portfolio} target="_blank" rel="noreferrer" style={{ verticalAlign: 'middle' }}>Portfolio Website</a></p>
                )}
                {userDetails.resume && (
                  <p><span style={{ fontSize: '1.8em', marginRight: '8px', verticalAlign: 'middle', filter: 'drop-shadow(0px 0px 8px rgba(255,255,255,0.4))' }}>📄</span> <a href={userDetails.resume} target="_blank" rel="noreferrer" style={{ verticalAlign: 'middle' }}>Resume / CV</a></p>
                )}
                {userDetails.linkedin && (
                  <p><img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/linkedin.svg" alt="LinkedIn" style={{ width: '28px', height: '28px', marginRight: '10px', verticalAlign: 'middle', filter: 'invert(1) drop-shadow(0px 2px 4px rgba(255,255,255,0.2))' }} /> <a href={userDetails.linkedin} target="_blank" rel="noreferrer" style={{ verticalAlign: 'middle' }}>LinkedIn</a></p>
                )}
                {userDetails.leetcode && (
                  <p><img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/leetcode.svg" alt="LeetCode" style={{ width: '28px', height: '28px', marginRight: '10px', verticalAlign: 'middle', filter: 'invert(1) drop-shadow(0px 2px 4px rgba(255,255,255,0.2))' }} /> <a href={userDetails.leetcode} target="_blank" rel="noreferrer" style={{ verticalAlign: 'middle' }}>LeetCode</a></p>
                )}
                {userDetails.instagram && (
                  <p><img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/instagram.svg" alt="Instagram" style={{ width: '28px', height: '28px', marginRight: '10px', verticalAlign: 'middle', filter: 'invert(1) drop-shadow(0px 2px 4px rgba(255,255,255,0.2))' }} /> <a href={userDetails.instagram} target="_blank" rel="noreferrer" style={{ verticalAlign: 'middle' }}>Instagram</a></p>
                )}
              </div>

              {userDetails.badges && userDetails.badges.length > 0 && (
                <div className="badges-showcase">
                  <h4 className="badges-title"><TrophyIcon size={16}/> Achievements</h4>
                  <div className="badges-container">
                    {userDetails.badges.map((badge, idx) => (
                      <div key={idx} className="badge-item">
                        {badge === "Early Adopter" && <StarIcon size={16} className="badge-icon gold" />}
                        {badge === "Code Contributor" && <RepoIcon size={16} className="badge-icon silver" />}
                        <span>{badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="profile-edit-form">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Bio</label>
                <button 
                  type="button" 
                  onClick={handleGenerateBio} 
                  disabled={isGeneratingBio}
                  style={{ background: 'linear-gradient(90deg, #58a6ff, #a371f7)', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                >
                  {isGeneratingBio ? "Generating..." : <>Generate with AI <span style={{ fontSize: '1.8em', verticalAlign: 'middle', filter: 'drop-shadow(0px 1px 2px rgba(255,255,255,0.6))' }}>✨</span></>}
                </button>
              </div>
              <textarea name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Tell us about yourself..."></textarea>
              
              {generatedBios.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#58a6ff' }}>Select an AI-generated bio:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                    {generatedBios.map((bio, index) => (
                      <div 
                        key={index} 
                        onClick={() => selectBio(bio)}
                        style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
                      >
                        {bio}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setGeneratedBios([])} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '12px', marginTop: '10px', padding: 0 }}>Cancel</button>
                </div>
              )}

              <label>College / University</label>
              <input type="text" name="college" value={formData.college} onChange={handleInputChange} placeholder="Harvard University" />

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label>Course</label>
                  <input type="text" name="course" value={formData.course} onChange={handleInputChange} placeholder="B.Tech, B.Sc, etc." />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Branch</label>
                  <input type="text" name="branch" value={formData.branch} onChange={handleInputChange} placeholder="Computer Science" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label>Year</label>
                  <input type="text" name="year" value={formData.year} onChange={handleInputChange} placeholder="3rd Year" />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Semester</label>
                  <input type="text" name="semester" value={formData.semester} onChange={handleInputChange} placeholder="6th Semester" />
                </div>
              </div>

              <label>Portfolio Website URL</label>
              <input type="text" name="portfolio" value={formData.portfolio} onChange={handleInputChange} placeholder="https://your-portfolio.com" />

              <label>Resume Link (Google Drive / PDF)</label>
              <input type="text" name="resume" value={formData.resume} onChange={handleInputChange} placeholder="https://link-to-your-resume.pdf" />

              <label>LeetCode URL</label>
              <input type="text" name="leetcode" value={formData.leetcode} onChange={handleInputChange} placeholder="https://leetcode.com/username" />

              <label>LinkedIn URL</label>
              <input type="text" name="linkedin" value={formData.linkedin} onChange={handleInputChange} placeholder="https://linkedin.com/in/..." />

              <label>Instagram URL</label>
              <input type="text" name="instagram" value={formData.instagram} onChange={handleInputChange} placeholder="https://instagram.com/..." />

              <label>Profile Theme <span className="premium-tag">PREMIUM</span></label>
              <select name="theme" value={formData.theme} onChange={handleInputChange} className="theme-selector">
                <option value="default">Default Dark</option>
                <option value="cyberpunk">Cyberpunk Neon</option>
                <option value="matrix">Matrix Hacker</option>
                <option value="sunset">Sunset Glow</option>
                <option value="ocean">Midnight Ocean</option>
                <option value="dracula">Dracula Dark</option>
                <option value="forest">Forest Canopy</option>
                <option value="vaporwave">Retro Vaporwave</option>
              </select>

              <div className="edit-actions">
                <button className="save-btn" onClick={handleProfileSave}>Save</button>
                <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div className="stats-container">
            <div className="stat-card" onClick={() => navigate("?tab=followers")} style={{ cursor: "pointer" }}>
              <h4>{userDetails.followersCount !== undefined ? userDetails.followersCount : 0}</h4>
              <p>Followers</p>
            </div>
            <div className="stat-card" onClick={() => navigate("?tab=following")} style={{ cursor: "pointer" }}>
              <h4>{userDetails.followingCount !== undefined ? userDetails.followingCount : 0}</h4>
              <p>Following</p>
            </div>
          </div>
        </div>

        <div className="main-content-section" style={{ flex: 1, paddingLeft: '20px', minWidth: 0 }}>
          {activeTab === "overview" && (
            <div className="heat-map-section">
              <div className="heat-map-header">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className="streak-counter">
                    <span className="streak-icon">🔥</span> {streakDays} Day Streak
                  </div>
                  <h3 style={{ margin: 0 }}>Contribution Activity</h3>
                </div>
                <button className="guide-btn" onClick={() => {
                  setShowGuide(true);
                  ReactGA.event({
                    category: "Gamification",
                    action: "Opened Pro Tips",
                    label: "Profile Guide"
                  });
                }}>
                  <LightBulbIcon size={16} /> Pro Tips
                </button>
              </div>
              <HeatMapProfile commits={commits} />
            </div>
          )}

          {(activeTab === "repositories" || activeTab === "stars") && (
            <div className="repo-profile-wrapper" style={{ marginTop: '0' }}>
              {loadingRepos ? (
                <div className="no-repos" style={{ color: 'var(--text-secondary)' }}>Loading repositories...</div>
              ) : (
                <div className="repo-grid">
                  {repositories.length === 0 ? (
                    <div className="no-repos" style={{ color: 'var(--text-secondary)' }}>
                      <h3>No repositories found</h3>
                      <p>You haven't {activeTab === "stars" ? "starred" : "created"} any repositories yet.</p>
                    </div>
                  ) : (
                    repositories.map((repo) => (
                      <div 
                        className="repo-card" 
                        key={repo._id} 
                        onClick={() => navigate(`/repo/${repo._id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <h3>
                          <RepoIcon /> {repo.name}
                          <span className="repo-visibility">
                            {repo.visibility ? "Public" : "Private"}
                          </span>
                        </h3>
                        <p>{repo.description || "No description provided."}</p>
                        <div className="repo-footer" style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-secondary)" }}><StarIcon size={14} /> {repo.starCount || 0}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {(activeTab === "followers" || activeTab === "following") && (
            <FollowList userId={targetUserId} type={activeTab} />
          )}
        </div>
      </div>
      ) : (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
          <EventCalendar />
        </div>
      )}

      {showGuide && (
        <div className="guide-modal-overlay">
          <div className="guide-modal">
            <div className="guide-header">
              <h2>✨ GitHub Profile Guide</h2>
              <button className="close-btn" onClick={() => setShowGuide(false)}><XIcon size={24} /></button>
            </div>
            <div className="guide-content">
              <p className="guide-intro">
                Your GitHub profile is your digital resume. Whether you are applying for jobs, contributing to open source, or building your personal brand, a professional profile builds instant credibility. Here is a comprehensive guide to mastering your GitHub presence.
              </p>

              <div className="guide-section">
                <h3>1. Master the Basics</h3>
                <p><strong>Profile Picture:</strong> Use a clear, high-quality headshot or a recognizable personal logo. Faceless profiles are less approachable.</p>
                <p><strong>The Bio:</strong> Your bio is your elevator pitch. In 1-2 short sentences, summarize your current role, your core tech stack, and what you are passionate about building.</p>
                <p><strong>Social Links:</strong> Always include links to your LinkedIn, personal portfolio, and Twitter/X. Make it effortless for recruiters and collaborators to reach you.</p>
              </div>

              <div className="guide-section">
                <h3>2. Create a Profile README</h3>
                <p>Did you know you can create a secret repository with the same name as your username (e.g., <code>octocat/octocat</code>)? Adding a <code>README.md</code> to this repository will display it prominently at the top of your profile!</p>
                <ul>
                  <li>Include a dynamic introduction using markdown.</li>
                  <li>Use badges (like Shields.io) to showcase your tech stack and tools.</li>
                  <li>Link to your latest blog posts or currently active projects.</li>
                  <li>Add GitHub stats widgets to show off your top languages.</li>
                </ul>
              </div>

              <div className="guide-section">
                <h3>3. Curate Pinned Repositories</h3>
                <p>By default, GitHub shows your most recent repositories. Instead, <strong>Pin up to 6 of your best repositories</strong> to the top of your profile.</p>
                <p>Pinned repositories should represent your best code. Ensure each pinned repository has a clear name, a brief description, and relevant topic tags (e.g., <code>react</code>, <code>machine-learning</code>).</p>
              </div>

              <div className="guide-section">
                <h3>4. Write Exceptional Repository READMEs</h3>
                <p>A repository without a README is a repository that no one will use. Every pinned project MUST have a high-quality README that includes:</p>
                <ul>
                  <li><strong>Title & Description:</strong> What does the project do?</li>
                  <li><strong>Visuals:</strong> Screenshots or GIFs of the application in action.</li>
                  <li><strong>Installation:</strong> Step-by-step commands on how to run it locally.</li>
                  <li><strong>Tech Stack:</strong> What technologies were used?</li>
                </ul>
              </div>

              <div className="guide-section">
                <h3>5. Maintain the Contribution Heatmap</h3>
                <p>Your contribution graph (the green heatmap) is a visual indicator of your consistency. You don't need to commit every single day, but showing steady, authentic activity over time proves your passion for coding.</p>
                <p><strong>Pro Tip:</strong> Contributions count for opening issues, reviewing pull requests, and pushing code. Get involved in Open Source!</p>
              </div>

              <div className="guide-section">
                <h3>6. Clean Up Your History</h3>
                <p>Quality over quantity. Archive old or abandoned projects that no longer represent your current skill level. Keep your public profile focused on active, high-quality codebases.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Resume Template */}
      <div style={{ display: 'none' }}>
        <div ref={resumeRef} style={{ padding: '40px', fontFamily: 'Arial, sans-serif', color: '#24292e', background: '#ffffff', width: '800px' }}>
          <div style={{ borderBottom: '2px solid #e1e4e8', paddingBottom: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            {userDetails.profilePicture && (
               <img src={userDetails.profilePicture} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%' }} crossOrigin="anonymous" />
            )}
            <div>
              <h1 style={{ margin: '0 0 10px 0', fontSize: '36px', color: '#24292e' }}>{userDetails.username}</h1>
              <p style={{ margin: '0', fontSize: '18px', color: '#586069' }}>{userDetails.bio || "Software Engineer"}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '40px', marginBottom: '30px' }}>
             <div style={{ flex: 1 }}>
               <h3 style={{ borderBottom: '1px solid #e1e4e8', paddingBottom: '8px', color: '#24292e', marginBottom: '12px' }}>Contact & Links</h3>
               <ul style={{ listStyle: 'none', padding: 0, color: '#586069', fontSize: '15px', lineHeight: '2' }}>
                 {userDetails.linkedin && <li><img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/linkedin.svg" alt="LinkedIn" style={{ width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'text-bottom', filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.2))' }} /> <strong>LinkedIn:</strong> {userDetails.linkedin}</li>}
                 {userDetails.portfolio && <li><span style={{ fontSize: '1.5em', marginRight: '8px', verticalAlign: 'middle', filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))' }}>🌐</span> <strong>Portfolio:</strong> {userDetails.portfolio}</li>}
                 {userDetails.college && <li><span style={{ fontSize: '1.5em', marginRight: '8px', verticalAlign: 'middle', filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))' }}>🎓</span> <strong style={{ fontSize: '1.1em' }}>Education:</strong> <span style={{ fontSize: '1.1em' }}>{userDetails.college}</span></li>}
                 {(userDetails.course || userDetails.branch || userDetails.year || userDetails.semester) && (
                   <li>
                     <span style={{ fontSize: '1.5em', marginRight: '8px', verticalAlign: 'middle', filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))' }}>📘</span> 
                     <strong style={{ fontSize: '1.1em' }}>Program:</strong> <span style={{ fontSize: '1.1em' }}>{[userDetails.course, userDetails.branch, userDetails.year, userDetails.semester].filter(Boolean).join(" • ")}</span>
                   </li>
                 )}
                 <li><img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/github.svg" alt="GitHub" style={{ width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'text-bottom', filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.2))' }} /> <strong>GitHub:</strong> github.com/{userDetails.username}</li>
               </ul>
             </div>
             <div style={{ flex: 1 }}>
               <h3 style={{ borderBottom: '1px solid #e1e4e8', paddingBottom: '8px', color: '#24292e', marginBottom: '12px' }}>GitHub Metrics</h3>
               <ul style={{ listStyle: 'none', padding: 0, color: '#586069', fontSize: '15px', lineHeight: '2' }}>
                 <li><strong>Total Commits:</strong> {commits.length}</li>
                 <li><strong>Current Streak:</strong> {streakDays} Days</li>
                 <li><strong>Developer Level:</strong> {xpData.level} (XP: {xpData.current})</li>
                 <li><strong>Followers:</strong> {userDetails.followersCount || 0}</li>
               </ul>
             </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
             <h3 style={{ borderBottom: '1px solid #e1e4e8', paddingBottom: '8px', color: '#24292e', marginBottom: '12px' }}>Recent Open Source Activity</h3>
             {commits.length === 0 && <p style={{ color: '#586069' }}>No recent commits.</p>}
             {commits.slice(0, 7).map((commit, idx) => (
                <div key={idx} style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0366d6', fontSize: '16px', marginBottom: '4px' }}>{commit.message}</div>
                  <div style={{ fontSize: '13px', color: '#586069' }}>{new Date(commit.createdAt).toLocaleDateString()} • Code Contribution</div>
                </div>
             ))}
          </div>

          {userDetails.badges && userDetails.badges.length > 0 && (
             <div>
               <h3 style={{ borderBottom: '1px solid #e1e4e8', paddingBottom: '8px', color: '#24292e', marginBottom: '12px' }}>Achievements</h3>
               <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                 {userDetails.badges.map((badge, idx) => (
                   <span key={idx} style={{ background: '#f6f8fa', border: '1px solid #e1e4e8', padding: '6px 14px', borderRadius: '2em', fontSize: '14px', color: '#24292e', fontWeight: '500' }}>
                     🏆 {badge}
                   </span>
                 ))}
               </div>
             </div>
          )}
        </div>
      </div>

      {showAvatarModal && (
        <div className="guide-modal-overlay">
          <div className="guide-modal avatar-modal">
            <div className="guide-header">
              <h2>✨ Select Your Avatar</h2>
              <button className="close-btn" onClick={() => { setShowAvatarModal(false); setAvatarGender(null); setAvatarCategory(null); }}><XIcon size={24} /></button>
            </div>
            <div className="guide-content" style={{ textAlign: "center" }}>
              
              {avatarGender === null ? (
                <div>
                  <h3 style={{ marginBottom: "32px", color: "var(--text-primary)" }}>Are you a boy or a girl?</h3>
                  <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "40px" }}>
                    <button 
                      onClick={() => setAvatarGender("boy")}
                      style={{ background: "linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%)", color: "white", padding: "20px 40px", borderRadius: "16px", border: "none", fontSize: "1.5rem", fontWeight: "bold", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", boxShadow: "0 8px 20px rgba(88, 166, 255, 0.3)", transition: "transform 0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                      <span style={{ fontSize: "3rem" }}>👦🏽</span>
                      Boy
                    </button>
                    <button 
                      onClick={() => setAvatarGender("girl")}
                      style={{ background: "linear-gradient(135deg, #ff7b72 0%, #d23d5a 100%)", color: "white", padding: "20px 40px", borderRadius: "16px", border: "none", fontSize: "1.5rem", fontWeight: "bold", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", boxShadow: "0 8px 20px rgba(255, 123, 114, 0.3)", transition: "transform 0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                      <span style={{ fontSize: "3rem" }}>👧🏽</span>
                      Girl
                    </button>
                  </div>
                </div>
              ) : avatarCategory === null ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <button 
                      onClick={() => setAvatarGender(null)}
                      style={{ background: "transparent", color: "var(--text-secondary)", border: "none", cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      ← Back
                    </button>
                    <h3 style={{ margin: 0, color: "var(--text-primary)", textAlign: "center", flex: 1 }}>Disney, Anime, or Marvel?</h3>
                    <div style={{ width: "60px" }}></div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "40px", marginTop: "32px" }}>
                    <button 
                      onClick={() => setAvatarCategory("disney")}
                      style={{ background: "linear-gradient(135deg, #a371f7 0%, #7533f9 100%)", color: "white", padding: "20px 40px", borderRadius: "16px", border: "none", fontSize: "1.5rem", fontWeight: "bold", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", boxShadow: "0 8px 20px rgba(163, 113, 247, 0.3)", transition: "transform 0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                      <span style={{ fontSize: "3rem" }}>🏰</span>
                      Disney
                    </button>
                    <button 
                      onClick={() => setAvatarCategory("anime")}
                      style={{ background: "linear-gradient(135deg, #ffb347 0%, #ff7b00 100%)", color: "white", padding: "20px 40px", borderRadius: "16px", border: "none", fontSize: "1.5rem", fontWeight: "bold", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", boxShadow: "0 8px 20px rgba(255, 179, 71, 0.3)", transition: "transform 0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                      <span style={{ fontSize: "3rem" }}>⚔️</span>
                      Anime
                    </button>
                    <button 
                      onClick={() => setAvatarCategory("marvel")}
                      style={{ background: "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)", color: "white", padding: "20px 40px", borderRadius: "16px", border: "none", fontSize: "1.5rem", fontWeight: "bold", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", boxShadow: "0 8px 20px rgba(255, 65, 108, 0.3)", transition: "transform 0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                      <span style={{ fontSize: "3rem" }}>🦸</span>
                      Marvel
                    </button>
                  </div>
                  {isOwnProfile && (
                    <div style={{ padding: "0 24px" }}>
                      <button type="button" onClick={() => setShowGuide(true)} className="guide-btn">
                        How do I get XP & level up?
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <button 
                      onClick={() => setAvatarCategory(null)}
                      style={{ background: "transparent", color: "var(--text-secondary)", border: "none", cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      ← Back
                    </button>
                    <p style={{ color: "var(--text-secondary)", margin: 0 }}>Select your favorite character:</p>
                    <div style={{ width: "60px" }}></div> {/* spacer for centering */}
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "16px", marginBottom: "24px", maxHeight: "400px", overflowY: "auto", padding: "10px" }}>
                    {avatarGender === "boy" ? (
                      (avatarCategory === "disney" ? [
                        { url: "https://static.wikia.nocookie.net/disney/images/3/37/Profile_-_Simba.jpeg", name: "Simba (The Lion King)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/e/ec/Profile_-_Prince_Charming.png", name: "Prince Charming (Cinderella)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/8/86/Profile_-_Prince_Phillip.png", name: "Prince Phillip (Sleeping Beauty)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/f/f1/Profile_-_Prince_Eric.jpeg", name: "Prince Eric (The Little Mermaid)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/8/84/Profile_-_Beast.jpeg", name: "The Beast (Beauty and the Beast)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/b/bb/Profile_-_Aladdin.png", name: "Aladdin (Aladdin)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/5/5e/Profile_-_John_Smith.png", name: "John Smith (Pocahontas)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/d/da/Profile_-_Shang.jpeg", name: "Li Shang (Mulan)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/9/92/Profile_-_Prince_Naveen.jpeg", name: "Prince Naveen (The Princess and the Frog)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/8/84/Profile_-_Flynn_Rider.jpeg", name: "Flynn Rider (Tangled)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/b/b4/Profile_-_Kristoff.jpeg", name: "Kristoff (Frozen)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/7/70/Profile_-_Hercules.jpeg", name: "Hercules (Hercules)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/2/2e/Profile_-_Tarzan.png", name: "Tarzan (Tarzan)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/5/5e/Profile_-_Peter_Pan.jpeg", name: "Peter Pan (Peter Pan)" }
                      ] : (avatarCategory === "marvel" ? marvelBoys : [
                        { url: "https://cdn.myanimelist.net/images/characters/8/406163.jpg", name: "Lelouch Lamperouge" },
                        { url: "https://cdn.myanimelist.net/images/characters/9/310307.jpg", name: "Luffy Monkey D." },
                        { url: "https://cdn.myanimelist.net/images/characters/2/241413.jpg", name: "Levi" },
                        { url: "https://cdn.myanimelist.net/images/characters/10/249647.jpg", name: "L Lawliet" },
                        { url: "https://cdn.myanimelist.net/images/characters/3/100534.jpg", name: "Zoro Roronoa" },
                        { url: "https://cdn.myanimelist.net/images/characters/2/327920.jpg", name: "Killua Zoldyck" },
                        { url: "https://cdn.myanimelist.net/images/characters/6/122643.jpg", name: "Rintarou Okabe" },
                        { url: "https://cdn.myanimelist.net/images/characters/6/63870.jpg", name: "Light Yagami" },
                        { url: "https://cdn.myanimelist.net/images/characters/9/72533.jpg", name: "Edward Elric" },
                        { url: "https://cdn.myanimelist.net/images/characters/2/284121.jpg", name: "Naruto Uzumaki" },
                        { url: "https://cdn.myanimelist.net/images/characters/13/284125.jpg", name: "Guts" },
                        { url: "https://cdn.myanimelist.net/images/characters/15/241479.jpg", name: "Gintoki Sakata" },
                        { url: "https://cdn.myanimelist.net/images/characters/10/216895.jpg", name: "Eren Yeager" },
                        { url: "https://cdn.myanimelist.net/images/characters/9/284122.jpg", name: "Itachi Uchiha" },
                        { url: "https://cdn.myanimelist.net/images/characters/15/422168.jpg", name: "Satoru Gojou" },
                        { url: "https://cdn.myanimelist.net/images/characters/15/307255.jpg", name: "Ken Kaneki" },
                        { url: "https://cdn.myanimelist.net/images/characters/4/203555.jpg", name: "Hachiman Hikigaya" },
                        { url: "https://cdn.myanimelist.net/images/characters/7/284129.jpg", name: "Kakashi Hatake" },
                        { url: "https://cdn.myanimelist.net/images/characters/11/516853.jpg", name: "Spike Spiegel" },
                        { url: "https://cdn.myanimelist.net/images/characters/11/294388.jpg", name: "Saitama" },
                        { url: "https://cdn.myanimelist.net/images/characters/7/316615.jpg", name: "Joseph Joestar" },
                        { url: "https://cdn.myanimelist.net/images/characters/16/308364.jpg", name: "Arataka Reigen" },
                        { url: "https://cdn.myanimelist.net/images/characters/7/204821.jpg", name: "Kazuto Kirigaya" },
                        { url: "https://cdn.myanimelist.net/images/characters/11/510227.jpg", name: "Roy Mustang" },
                        { url: "https://cdn.myanimelist.net/images/characters/3/328158.jpg", name: "Yato" },
                        { url: "https://cdn.myanimelist.net/images/characters/3/512788.jpg", name: "Ichigo Kurosaki" },
                        { url: "https://cdn.myanimelist.net/images/characters/4/539058.jpg", name: "Kiyotaka Ayanokouji" },
                        { url: "https://cdn.myanimelist.net/images/characters/11/302824.jpg", name: "Osamu Dazai" },
                        { url: "https://cdn.myanimelist.net/images/characters/9/309871.jpg", name: "Thorfinn" },
                        { url: "https://cdn.myanimelist.net/images/characters/3/174561.jpg", name: "Hisoka Morow" },
                        { url: "https://cdn.myanimelist.net/images/characters/7/83946.jpg", name: "Kamina" },
                        { url: "https://cdn.myanimelist.net/images/characters/8/241475.jpg", name: "Eikichi Onizuka" },
                        { url: "https://cdn.myanimelist.net/images/characters/5/136769.jpg", name: "Sanji" },
                        { url: "https://cdn.myanimelist.net/images/characters/16/559456.jpg", name: "Koyomi Araragi" },
                        { url: "https://cdn.myanimelist.net/images/characters/15/72546.jpg", name: "Gokuu Son" },
                        { url: "https://cdn.myanimelist.net/images/characters/14/401940.jpg", name: "Askeladd" },
                        { url: "https://cdn.myanimelist.net/images/characters/9/131317.jpg", name: "Sasuke Uchiha" },
                        { url: "https://cdn.myanimelist.net/images/characters/15/74607.jpg", name: "Alucard" },
                        { url: "https://cdn.myanimelist.net/images/characters/14/559023.jpg", name: "Erwin Smith" },
                        { url: "https://cdn.myanimelist.net/images/characters/6/343344.jpg", name: "Shigeo Kageyama" },
                        { url: "https://cdn.myanimelist.net/images/characters/4/316522.jpg", name: "Johan Liebert" },
                        { url: "https://cdn.myanimelist.net/images/characters/15/315153.jpg", name: "Subaru Natsuki" },
                        { url: "https://cdn.myanimelist.net/images/characters/9/312302.jpg", name: "Joutarou Kuujou" },
                        { url: "https://cdn.myanimelist.net/images/characters/3/549312.jpg", name: "Kurapika" },
                        { url: "https://cdn.myanimelist.net/images/characters/7/299404.jpg", name: "Izuku Midoriya" },
                        { url: "https://cdn.myanimelist.net/images/characters/12/332527.jpg", name: "Shouto Todoroki" },
                        { url: "https://cdn.myanimelist.net/images/characters/6/386735.jpg", name: "Tanjirou Kamado" },
                        { url: "https://cdn.myanimelist.net/images/characters/12/337932.jpg", name: "Kusuo Saiki" },
                        { url: "https://cdn.myanimelist.net/images/characters/12/299406.jpg", name: "Katsuki Bakugou" },
                        { url: "https://cdn.myanimelist.net/images/characters/4/495795.jpg", name: "Rimuru Tempest" },
                        { url: "https://cdn.myanimelist.net/images/characters/4/478454.jpg", name: "Senkuu Ishigami" }
                      ])).map((item, index) => {
                        const isObj = typeof item === "object";
                        const url = isObj ? item.url : item;
                        const name = isObj ? item.name : null;
                        return (
                          <div 
                            key={index} 
                            className="avatar-option" 
                            onClick={() => handleSelectAvatar(url)}
                            style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px", borderRadius: "12px", transition: "all 0.2s", height: "100%" }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                          >
                            <img src={url} alt={`Avatar Boy ${index}`} loading="lazy" style={{ width: "100%", height: "100px", borderRadius: "50%", objectFit: "cover", objectPosition: avatarCategory === 'disney' ? 'top center' : 'center', marginBottom: name ? "8px" : "0" }} />
                            {name && <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center", lineHeight: "1.2" }}>{name}</span>}
                          </div>
                        );
                      })
                    ) : (
                      (avatarCategory === "disney" ? [
                        { url: "https://static.wikia.nocookie.net/disney/images/3/33/Profile_-_Snow_White.jpeg", name: "Snow White (Snow White)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/e/e5/Profile_-_Cinderella.jpeg", name: "Cinderella (Cinderella)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/2/2a/Profile_-_Aurora.jpeg", name: "Aurora (Sleeping Beauty)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/8/8a/Profile_-_Ariel.jpg", name: "Ariel (The Little Mermaid)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/1/1b/Profile_-_Belle.jpeg", name: "Belle (Beauty and the Beast)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/c/cd/Profile_-_Jasmine.jpeg", name: "Jasmine (Aladdin)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/7/7b/Profile_-_Pocahontas.jpeg", name: "Pocahontas (Pocahontas)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/0/04/Profile_-_Mulan.jpeg", name: "Mulan (Mulan)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/f/fa/Profile_-_Tiana.jpeg", name: "Tiana (The Princess and the Frog)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/a/ae/Profile_-_Rapunzel.jpeg", name: "Rapunzel (Tangled)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/7/7d/Profile_-_Moana.png", name: "Moana (Moana)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/8/8b/Profile_-_Raya.jpg", name: "Raya (Raya and the Last Dragon)" },
                        { url: "https://upload.wikimedia.org/wikipedia/en/5/5e/Elsa_from_Disney%27s_Frozen.png", name: "Elsa (Frozen)" },
                        { url: "https://static.wikia.nocookie.net/disney/images/0/0f/Profile_-_Anna.jpeg", name: "Anna (Frozen)" }
                      ] : (avatarCategory === "marvel" ? marvelGirls : Array.from({ length: 50 }, (_, i) => ({ url: `https://thisanimedoesnotexist.ai/results/psi-1.0/seed100${String(i).padStart(2, '0')}.png`, name: `Anime Girl ${i + 1}` })))).map((item, index) => {
                        const isObj = typeof item === "object";
                        const url = isObj ? item.url : item;
                        const name = isObj ? item.name : null;
                        return (
                          <div 
                            key={index} 
                            className="avatar-option" 
                            onClick={() => handleSelectAvatar(url)}
                            style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px", borderRadius: "12px", transition: "all 0.2s", height: "100%" }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                          >
                            <img src={url} alt={`Avatar Girl ${index}`} loading="lazy" style={{ width: "100%", height: "100px", borderRadius: "50%", objectFit: "cover", objectPosition: url.includes('Elsa_from_Disney') ? 'center 15%' : (avatarCategory === 'disney' ? 'top center' : 'center'), marginBottom: name ? "8px" : "0", backgroundColor: url.includes('Elsa_from_Disney') ? 'rgba(255,255,255,0.1)' : 'transparent' }} />
                            {name && <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center", lineHeight: "1.2" }}>{name}</span>}
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "24px", display: "flex", justifyContent: "center" }}>
                <button 
                  className="glass-btn" 
                  onClick={() => {
                    setShowAvatarModal(false);
                    setAvatarGender(null);
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                  style={{ maxWidth: "250px" }}
                >
                  <PencilIcon size={16} /> Upload from Computer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;