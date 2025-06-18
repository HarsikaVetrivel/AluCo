import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: '',
    year_of_passing: '',
    current_position: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!form.name || !form.email || !form.password || !form.role) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:3001/register', form);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Name *</label>
            <input 
              name="name" 
              value={form.name}
              onChange={handleChange} 
              placeholder="Your full name" 
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input 
              name="email" 
              type="email" 
              value={form.email}
              onChange={handleChange} 
              placeholder="Your email address" 
            />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input 
              name="password" 
              type="password" 
              value={form.password}
              onChange={handleChange} 
              placeholder="Create a password" 
            />
          </div>
          <div className="form-group">
            <label>Role *</label>
            <select 
              name="role" 
              value={form.role}
              onChange={handleChange}
            >
              <option value="">Select your role</option>
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>
          <div className="form-group">
            <label>Department</label>
            <input 
              name="department" 
              value={form.department}
              onChange={handleChange} 
              placeholder="Your department" 
            />
          </div>
          <div className="form-group">
            <label>Year of Passing</label>
            <input 
              name="year_of_passing" 
              type="number" 
              value={form.year_of_passing}
              onChange={handleChange} 
              placeholder="Graduation year" 
            />
          </div>
          <div className="form-group">
            <label>Current Position</label>
            <input 
              name="current_position" 
              value={form.current_position}
              onChange={handleChange} 
              placeholder="Your current job position" 
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <span onClick={() => navigate('/login')}>Login here</span>
        </div>
      </div>
    </div>
  );
}

export default Register;