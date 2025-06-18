import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ViewMeetings() {
  const [meetings, setMeetings] = useState([]);

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

  return (
    <div className="meetings-list">
      <h2>Scheduled Meetings</h2>
      <Link to="/" className="back-link">← Schedule New Meeting</Link>
      
      {meetings.length === 0 ? (
        <p>No meetings scheduled yet.</p>
      ) : (
        <ul>
          {meetings.map(meeting => (
            <li key={meeting.id} className="meeting-item">
              <h3>{meeting.title}</h3>
              <p>{meeting.description}</p>
              <p>
                <strong>Time:</strong> {new Date(meeting.start_time).toLocaleString()} - 
                {new Date(meeting.end_time).toLocaleString()}
              </p>
              <p><strong>Participants:</strong> {meeting.participants}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ViewMeetings;