import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function StudentDashboard() {
  const [alumni, setAlumni] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [activeTab, setActiveTab] = useState('alumni');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (activeTab === 'alumni') {
      fetchAlumni();
    } else if (activeTab === 'meetings') {
      fetchMeetings();
    }
  }, [activeTab, user, navigate]);

  const fetchAlumni = async () => {
    try {
      const res = await axios.get('http://localhost:3001/alumni', {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });
      setAlumni(res.data);
      setError('');
    } catch (err) {
      handleApiError(err, 'Failed to load alumni directory');
    }
  };

  const fetchMeetings = async () => {
    try {
      const res = await axios.get('http://localhost:3001/meetings', {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });
      console.log("Fetched Meetings:", res.data);
      setMeetings(res.data);
      setError('');
    } catch (err) {
      handleApiError(err, 'Failed to load meetings');
    }
  };

  const handleApiError = (err, defaultMessage) => {
    console.error(defaultMessage, err);
    if (err.response?.status === 401) {
      handleLogout();
    } else {
      setError(err.response?.data?.message || defaultMessage);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Welcome, {user?.name}</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'alumni' ? 'active' : ''}`} 
          onClick={() => setActiveTab('alumni')}
        >
          Alumni Directory
        </button>
        <button 
          className={`tab-btn ${activeTab === 'meetings' ? 'active' : ''}`} 
          onClick={() => setActiveTab('meetings')}
        >
          Meetings
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      {activeTab === 'alumni' && (
        <div className="tab-content">
          <h3>Alumni Directory</h3>
          <div className="alumni-grid">
            {alumni.map((alumnus) => (
              <div key={alumnus.user_id} className="alumni-card">
                <h4>{alumnus.name}</h4>
                <p><strong>Department:</strong> {alumnus.department}</p>
                <p><strong>Year of Passing:</strong> {alumnus.year_of_passing}</p>
                <p><strong>Current Position:</strong> {alumnus.current_position}</p>
                <p><strong>Email:</strong> {alumnus.email}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'meetings' && (
        <div className="tab-content">
          <h3>Upcoming Meetings</h3>
          {meetings.length > 0 ? (
            <div className="meetings-list">
              {meetings.map((meeting) => (
                <div key={meeting.meeting_id} className="meeting-card">
                  <h4>{meeting.title}</h4>
                  <p><strong>Description:</strong> {meeting.description}</p>
                  <p><strong>Date & Time:</strong> {new Date(meeting.start_date).toLocaleString()}</p>
                  <p><strong>End Date & Time:</strong> {new Date(meeting.end_date).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No upcoming meetings scheduled.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;