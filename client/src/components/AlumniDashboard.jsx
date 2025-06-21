import React, { useState, useEffect } from "react";
import PostScholarship from "./PostScholarship";
import ManageApplications from "./ManageApplications";
import axios from "axios";

const AlumniDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("meetings");
  const [meetings, setMeetings] = useState([]);
  const [applications, setApplications] = useState([]);

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

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/my-scholarships/${user.id}`);
      setApplications(res.data);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.post(`http://localhost:3001/api/applications/${id}/status`, { status });
      fetchApplications();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchApplications();
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
                {new Date(m.start_date).toLocaleString()} - {" "}
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
        <div>
          <h3>📥 Scholarship Applications</h3>
          {applications.map((app) => (
            <div
              key={app.id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "8px",
              }}
            >
              <p><strong>Student:</strong> {app.student_name} ({app.email})</p>
              <p><strong>Scholarship:</strong> {app.scholarship_title}</p>
              <p><strong>Status:</strong> {app.status}</p>
              {app.document_path ? (
                <a
                  href={`http://localhost:3001/uploads/${app.document_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📄 View Document
                </a>
              ) : (
                <span>No document</span>
              )}
              <br />
              <button onClick={() => handleStatusChange(app.id, "approved")} style={{ marginRight: "8px" }}>
                ✅ Approve
              </button>
              <button onClick={() => handleStatusChange(app.id, "rejected")}>❌ Reject</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlumniDashboard;
