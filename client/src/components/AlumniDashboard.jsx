import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AlumniDashboard = () => {
  const [meetings, setMeetings] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
  });
  const [isFormVisible, setFormVisible] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/meetings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMeetings(response.data);
    } catch (error) {
      console.error('Error fetching meetings:', error.response?.data || error.message);
      setError('Failed to load meetings.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post('http://localhost:3001/meetings', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMeetings((prevMeetings) => [...prevMeetings, response.data]);
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
      });
      setFormVisible(false); // Hide the form after successful submission
    } catch (error) {
      console.error('Error scheduling meeting:', error.response?.data || error.message);
      setError('Failed to schedule meeting.');
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🎓 Alumni Dashboard</h2>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setFormVisible((prev) => !prev)} style={{ marginRight: '10px' }}>
          {isFormVisible ? '❌ Cancel' : '➕ Schedule Meeting'}
        </button>
        <button onClick={handleLogout}>🚪 Logout</button>
      </div>

      <h3>📅 Scheduled Meetings</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {meetings.length > 0 ? (
          meetings.map((meeting) => (
            <li key={meeting.id} style={{ marginBottom: '10px' }}>
              <strong>{meeting.title}</strong> <br />
              📆 {new Date(meeting.start_date).toLocaleString()} - {new Date(meeting.end_date).toLocaleString()} <br />
              📝 {meeting.description}
              <hr />
            </li>
          ))
        ) : (
          <p>No meetings scheduled yet.</p>
        )}
      </ul>

      {/* Schedule Meeting Form */}
      {isFormVisible && (
        <div style={{ marginTop: '20px' }}>
          <h4>📝 Schedule a New Meeting</h4>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Meeting title"
                required
                style={{ padding: '5px', width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Meeting description"
                required
                style={{ padding: '5px', width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Start Date & Time *</label>
              <input
                type="datetime-local"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
                style={{ padding: '5px', width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>End Date & Time *</label>
              <input
                type="datetime-local"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                required
                style={{ padding: '5px', width: '100%' }}
              />
            </div>
            <button type="submit" style={{ padding: '10px', backgroundColor: 'green', color: 'white' }}>
              Schedule Meeting
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AlumniDashboard;
