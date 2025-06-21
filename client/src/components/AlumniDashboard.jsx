import React, { useState, useEffect } from "react";
import PostScholarship from "./PostScholarship";
import ManageApplications from "./ManageApplications";

import axios from "axios";

const AlumniDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("meetings");
  const [meetings, setMeetings] = useState([]);

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
    fetchMeetings();
  }, []);

  return (
    <div>
      <h2>🎓 Alumni Dashboard</h2>
      <p>Welcome, {user.name}</p>
      <button onClick={() => setActiveTab("meetings")}>Meetings</button>
      <button onClick={() => setActiveTab("scholarships")}>Scholarships</button>
      <button onClick={() => setActiveTab("applications")}>Applications</button>

      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
      >
        Logout
      </button>

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
          <PostScholarship user={user} />
        </div>
      )}

      {activeTab === "applications" && (
  <ManageApplications user={user} />
)}

    </div>
  );
};

export default AlumniDashboard;
