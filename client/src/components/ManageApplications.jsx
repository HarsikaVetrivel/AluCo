import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageApplications = ({ user }) => {
  const [applications, setApplications] = useState([]);

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/my-scholarships/${user.id}`);
      setApplications(res.data);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }
  };

  const updateStatus = async (appId, status) => {
    try {
      await axios.post(`http://localhost:3001/api/applications/${appId}/status`, { status });
      fetchApplications(); // Refresh after update
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div>
      <h3>📋 Applications for My Scholarships</h3>
      {applications.length === 0 && <p>No applications yet.</p>}
      {applications.map((app) => (
        <div key={app.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
          <p><strong>Scholarship:</strong> {app.scholarship_title}</p>
          <p><strong>Student:</strong> {app.student_name} ({app.email})</p>
          <p><strong>Status:</strong> {app.status}</p>
          <button onClick={() => updateStatus(app.id, "approved")}>✅ Approve</button>
          <button onClick={() => updateStatus(app.id, "rejected")}>❌ Reject</button>
        </div>
      ))}
    </div>
  );
};

export default ManageApplications;
