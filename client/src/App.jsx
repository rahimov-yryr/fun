import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Teachers from './pages/Teachers';
import Enrollments from './pages/Enrollments';
import Analytics from './pages/Analytics';
import Communications from './pages/Communications';
import { AuthProvider, useAuth } from './context/AuthContext';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/students/:id" element={<StudentDetail />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/courses/:id" element={<CourseDetail />} />
                    <Route path="/teachers" element={<Teachers />} />
                    <Route path="/enrollments" element={<Enrollments />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/communications" element={<Communications />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
