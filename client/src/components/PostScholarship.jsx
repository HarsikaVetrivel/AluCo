import React, { useState } from "react";
import axios from "axios";

const PostScholarship = ({ user }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eligibility: "",
    deadline: "",
    amount: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        created_by: user.id, // alumni user_id from localStorage
      };

      const res = await axios.post("http://localhost:3001/api/scholarships", payload);
      alert("Scholarship posted successfully!");
      setFormData({
        title: "",
        description: "",
        eligibility: "",
        deadline: "",
        amount: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to post scholarship.");
    }
  };

  return (
    <div>
      <h3>🎓 Post New Scholarship</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Title" required />
        <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />
        <input type="text" name="eligibility" value={formData.eligibility} onChange={handleChange} placeholder="Eligibility" required />
        <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required />
        <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="Amount" required />
        <button type="submit">Post Scholarship</button>
      </form>
    </div>
  );
};

export default PostScholarship;
