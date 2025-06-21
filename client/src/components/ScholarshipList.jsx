import React, { useEffect, useState } from "react";
import axios from "axios";

const ScholarshipList = ({ user }) => {
  const [scholarships, setScholarships] = useState([]);
  const [applied, setApplied] = useState({}); // scholarship_id → status
  const [documents, setDocuments] = useState({}); // scholarship_id → File

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
      const res = await axios.get(
        `http://localhost:3001/api/my-applications/${user.id}`
      );
      const statusMap = {};
      res.data.forEach((app) => {
        statusMap[app.scholarship_id] = app.status;
      });
      setApplied(statusMap);
    } catch (err) {
      console.error("Error fetching applications", err);
    }
  };

  const handleApply = async (scholarshipId) => {
    const formData = new FormData();
    formData.append("student_id", user.id);
    formData.append("scholarship_id", scholarshipId);

    const selectedFile = documents[scholarshipId];
    if (selectedFile) {
      formData.append("document", selectedFile);
    }

    try {
      const res = await axios.post("http://localhost:3001/api/apply", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert(res.data.message);
      fetchApplications(); // Refresh application status after applying
    } catch (err) {
      console.error("Application failed:", err);
      alert("Failed to apply");
    }
  };

  const handleFileChange = (e, scholarshipId) => {
    setDocuments({ ...documents, [scholarshipId]: e.target.files[0] });
  };

  return (
    <div>
      <h3>🎓 Available Scholarships</h3>
      {scholarships.map((s) => (
        <div
          key={s.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "8px",
          }}
        >
          <h4>{s.title}</h4>
          <p>{s.description}</p>
          <p>
            <strong>Eligibility:</strong> {s.eligibility}
          </p>
          <p>
            <strong>Deadline:</strong>{" "}
            {new Date(s.deadline).toLocaleDateString()}
          </p>
          <p>
            <strong>Amount:</strong> ₹{s.amount}
          </p>
          <p>
            <strong>Alumni:</strong> {s.alumni_name}
          </p>

          {applied[s.id] ? (
            <p style={{ color: "blue" }}>
              <strong>Status:</strong> {applied[s.id]}
            </p>
          ) : (
            <>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, s.id)}
                accept=".pdf,.doc,.docx"
              />
              <br />
              <button
                onClick={() => handleApply(s.id)}
                style={{ marginTop: "8px" }}
              >
                Apply
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ScholarshipList;
