import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [meetings, setMeetings] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    participants: ''
  });

  // Fetch meetings on component mount
  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/meetings');
      setMeetings(response.data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/meetings', formData);
      fetchMeetings(); // Refresh the list
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        participants: ''
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  return (
    <div className="App">
      <h1>Meeting Scheduler</h1>
      
      <div className="meeting-form">
        <h2>Schedule a New Meeting</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Start Time:</label>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>End Time:</label>
            <input
              type="datetime-local"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Participants (comma separated):</label>
            <input
              type="text"
              name="participants"
              value={formData.participants}
              onChange={handleChange}
            />
          </div>
          <button type="submit">Schedule Meeting</button>
        </form>
      </div>

      
    </div>
  );
}

export default App;