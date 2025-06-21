import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import AlumniDashboard from './components/AlumniDashboard';
import PostScholarship from "./components/PostScholarship";
import ScholarshipList from "./components/ScholarshipList";
import ManageApplications from "./components/ManageApplications";

import './App.css';

function App() {
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return token !== null && token !== undefined;
  };

  const getRole = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.role : null;
  };

  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    
    if (requiredRole && getRole() !== requiredRole) {
      return <Navigate to={getRole() === 'student' ? '/student' : '/alumni'} replace />;
    }
    
    return children;
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/student" 
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/alumni" 
            element={
              <ProtectedRoute requiredRole="alumni">
                <AlumniDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/" 
            element={
              isAuthenticated() ? 
                (getRole() === 'student' ? 
                  <Navigate to="/student" replace /> : 
                  <Navigate to="/alumni" replace />) : 
                <Navigate to="/login" replace />
            } 
          />

          <Route path="/post-scholarship" element={<PostScholarship />} />
          <Route path="/scholarships" element={<ScholarshipList />} />

          
         <Route path="/manage-applications/:scholarshipId" element={<ManageApplications />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;