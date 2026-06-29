import React, { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, LocationIcon, ListUnorderedIcon } from "@primer/octicons-react";
import "./eventCalendar.css";

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState("All");
  const [viewMode, setViewMode] = useState("calendar"); // calendar | list
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/events/all`);
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const filteredEvents = filter === "All" ? events : events.filter(e => e.platform === filter);

  // Blanks
  const blanks = Array.from({ length: firstDay }, (_, i) => <div key={`blank-${i}`} className="calendar-day empty"></div>);
  
  // Days
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const currentIterDate = new Date(year, month, dayNum);
    
    const dayEvents = filteredEvents.filter(event => {
      if (!event.startDate || !event.endDate) return false;
      
      const eStart = new Date(event.startDate);
      eStart.setHours(0, 0, 0, 0);
      
      const eEnd = new Date(event.endDate);
      eEnd.setHours(23, 59, 59, 999);
      
      const currentIterDate = new Date(year, month, dayNum);
      currentIterDate.setHours(12, 0, 0, 0); // Noon to avoid timezone shifts
      
      return currentIterDate >= eStart && currentIterDate <= eEnd;
    });

    const isToday = new Date().toDateString() === currentIterDate.toDateString();

    return (
      <div key={`day-${dayNum}`} className={`calendar-day ${isToday ? 'today' : ''}`}>
        <div className="day-number">{dayNum}</div>
        <div className="day-events">
          {dayEvents.map(ev => {
            const platformClass = ev.platform.toLowerCase();
            return (
              <div key={ev.id} className="event-badge-wrapper">
                <a 
                  href={ev.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className={`event-badge ${platformClass}`}
                >
                  {ev.logo && <img src={ev.logo} alt={ev.platform} className="event-logo" />}
                  <span className="event-title">{ev.title}</span>
                </a>
                <div className="event-popover">
                  <div className="popover-header">
                    {ev.logo && <img src={ev.logo} alt={ev.platform} />}
                    <div>
                      <h4>{ev.platform}</h4>
                      <span>{ev.organization}</span>
                    </div>
                  </div>
                  <div className="popover-body">
                    <strong>{ev.title}</strong>
                    <div className="popover-dates">
                      <CalendarIcon size={12} /> 
                      {new Date(ev.startDate).toLocaleDateString()} - {new Date(ev.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  });

  return (
    <div className="event-calendar-container">
      <div className="calendar-header">
        <div className="calendar-title">
          <CalendarIcon size={20} className="mr-2" />
          <h3>Upcoming Events</h3>
          <div className="platform-filters">
            <div className="view-toggle">
              <button 
                className={`filter-pill ${viewMode === 'calendar' ? 'active' : ''}`}
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon size={14} /> Grid
              </button>
              <button 
                className={`filter-pill ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <ListUnorderedIcon size={14} /> List
              </button>
            </div>
            <div className="vertical-divider"></div>
            {["All", "Unstop", "HackerEarth", "Devpost"].map(p => (
              <button 
                key={p} 
                className={`filter-pill ${filter === p ? 'active' : ''}`}
                onClick={() => setFilter(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        {viewMode === "calendar" && (
          <div className="calendar-controls">
            <button onClick={handlePrevMonth} className="btn-icon"><ChevronLeftIcon /></button>
            <span className="current-month">{monthNames[month]} {year}</span>
            <button onClick={handleNextMonth} className="btn-icon"><ChevronRightIcon /></button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-calendar">
          <div className="spinner"></div>
          <p>Fetching live events...</p>
        </div>
      ) : viewMode === "calendar" ? (
        <div className="calendar-grid-wrapper">
          <div className="calendar-weekdays">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>
          <div className="calendar-grid">
            {[...blanks, ...days]}
          </div>
        </div>
      ) : (
        <div className="events-list-view">
          {filteredEvents.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "40px" }}>No events found for this platform.</p>
          ) : (
            filteredEvents.map(ev => (
              <div key={ev.id} className="event-list-item">
                <div className="event-list-header">
                  {ev.logo && <img src={ev.logo} alt={ev.platform} />}
                  <div>
                    <h4>{ev.platform} <span className="event-org">• {ev.organization}</span></h4>
                  </div>
                </div>
                <h3>{ev.title}</h3>
                <div className="event-list-dates">
                  <CalendarIcon size={14} /> 
                  <span>{new Date(ev.startDate).toLocaleDateString()} - {new Date(ev.endDate).toLocaleDateString()}</span>
                </div>
                <a href={ev.url} target="_blank" rel="noreferrer" className="register-btn">Register Now</a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default EventCalendar;
