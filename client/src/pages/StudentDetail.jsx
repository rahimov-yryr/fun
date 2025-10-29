import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, BookOpen, Award, TrendingUp } from 'lucide-react';

function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    try {
      const [studentRes, statsRes] = await Promise.all([
        axios.get(`/api/students/${id}`),
        axios.get(`/api/students/${id}/stats`)
      ]);
      setStudent(studentRes.data.student);
      setEnrollments(studentRes.data.enrollments || []);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Failed to fetch student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!student) {
    return <div>Student not found</div>;
  }

  return (
    <div className="space-y-6">
      <Link
        to="/students"
        className="inline-flex items-center text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Students
      </Link>

      {/* Student Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {student.first_name} {student.last_name}
            </h1>
            <span className={`mt-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {student.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
            <dl className="mt-2 space-y-2">
              <div>
                <dt className="text-sm text-gray-600">Phone</dt>
                <dd className="text-sm font-medium text-gray-900">{student.phone || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Address</dt>
                <dd className="text-sm font-medium text-gray-900">{student.address || 'N/A'}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Parent Information</h3>
            <dl className="mt-2 space-y-2">
              <div>
                <dt className="text-sm text-gray-600">Parent Name</dt>
                <dd className="text-sm font-medium text-gray-900">{student.parent_name || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Parent Email</dt>
                <dd className="text-sm font-medium text-gray-900">{student.parent_email || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Parent Phone</dt>
                <dd className="text-sm font-medium text-gray-900">{student.parent_phone || 'N/A'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <BookOpen className="text-blue-500 mr-3" size={24} />
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <TrendingUp className="text-green-500 mr-3" size={24} />
              <div>
                <p className="text-sm text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCourses}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Award className="text-purple-500 mr-3" size={24} />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Award className="text-orange-500 mr-3" size={24} />
              <div>
                <p className="text-sm text-gray-600">Average Grade</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageGrade?.toFixed(1) || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enrollments */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Enrolled Courses</h2>
        </div>
        <div className="p-6">
          {enrollments.length > 0 ? (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{enrollment.course_name}</p>
                    <p className="text-sm text-gray-600">{enrollment.course_code}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      enrollment.status === 'enrolled' ? 'bg-green-100 text-green-800' :
                      enrollment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {enrollment.status}
                    </span>
                    {enrollment.final_grade && (
                      <p className="text-sm text-gray-600 mt-1">Grade: {enrollment.final_grade}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No enrollments found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDetail;
