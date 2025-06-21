import React, { useEffect, useState } from "react";
import axios from "axios";

const ScholarshipList = ({ user }) => {
  const [scholarships, setScholarships] = useState([]);
  const [applied, setApplied] = useState({}); // store application status by scholarship id

  useEffect(() => {
    fetchScholarships();
    fetchApplications();
  }, []);

  const fetchScholarships = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/scholarships");
      setScholarships(res.data);
    } catch (err) {
      console.error("Error fetching scholarships", err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/my-applications/${user.id}`);
      const statusMap = {};
      res.data.forEach(app => {
        statusMap[app.scholarship_id] = app.status;
      });
      setApplied(statusMap);
    } catch (err) {
      console.error("Error fetching applications", err);
    }
  };

  const handleApply = async (id) => {
    try {
      await axios.post("http://localhost:3001/api/apply", {
        student_id: user.id,
        scholarship_id: id
      });
      alert("Applied successfully");
      fetchApplications();
    } catch (err) {
      console.error("Application error:", err);
      alert("Already applied or something went wrong");
    }
  };

  return (
    <div>
      <h3>🎓 Available Scholarships</h3>
      {scholarships.map((s) => (
        <div key={s.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
          <h4>{s.title}</h4>
          <p>{s.description}</p>
          <p><strong>Eligibility:</strong> {s.eligibility}</p>
          <p><strong>Deadline:</strong> {new Date(s.deadline).toDateString()}</p>
          <p><strong>Amount:</strong> ₹{s.amount}</p>
          <p><strong>Alumni:</strong> {s.alumni_name}</p>
          {applied[s.id] ? (
            <p style={{ color: "blue" }}>
              <strong>Status:</strong> {applied[s.id]}
            </p>
          ) : (
            <button onClick={() => handleApply(s.id)}>Apply</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ScholarshipList;
