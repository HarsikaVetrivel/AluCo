import React, { useState, useEffect } from "react";
import axios from "axios";
import ScholarshipList from "./ScholarshipList";

const StudentDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("alumni");
  const [alumni, setAlumni] = useState([]);
  const [meetings, setMeetings] = useState([]);

  const fetchAlumni = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3001/alumni", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlumni(res.data);
    } catch (err) {
      console.error("Failed to fetch alumni:", err);
    }
  };

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3001/meetings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMeetings(res.data);
    } catch (err) {
      console.error("Failed to fetch meetings:", err);
    }
  };

  useEffect(() => {
    fetchAlumni();
    fetchMeetings();
  }, []);

  return (
    <div>
      <h2>🎓 Student Dashboard</h2>
      <p>Welcome, {user.name}</p>
      <button onClick={() => setActiveTab("alumni")}>Alumni Directory</button>
      <button onClick={() => setActiveTab("meetings")}>Meetings</button>
      <button onClick={() => setActiveTab("scholarships")}>Scholarships</button>
      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
      >
        Logout
      </button>

      {activeTab === "alumni" && (
        <div>
          <h3>👥 Alumni Directory</h3>
          {alumni.map((a) => (
            <div key={a.user_id}>
              <h4>{a.name}</h4>
              <p>Department: {a.department}</p>
              <p>Year of Passing: {a.year_of_passing}</p>
              <p>Current Position: {a.current_position}</p>
              <p>Email: {a.email}</p>
              <hr />
            </div>
          ))}
        </div>
      )}

      {activeTab === "meetings" && (
        <div>
          <h3>📅 Scheduled Meetings</h3>
          {meetings.map((m) => (
            <div key={m.id}>
              <h4>{m.title}</h4>
              <p>{m.description}</p>
              <p>
                {new Date(m.start_date).toLocaleString()} -{" "}
                {new Date(m.end_date).toLocaleString()}
              </p>
              <hr />
            </div>
          ))}
        </div>
      )}

      {activeTab === "scholarships" && (
        <div>
          <ScholarshipList user={user} />
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
