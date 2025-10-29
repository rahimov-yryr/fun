import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Users, Calendar, MapPin, User } from 'lucide-react';

function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      const response = await axios.get(`/api/courses/${id}`);
      setCourse(response.data.course);
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Failed to fetch course data:', error);
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

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="space-y-6">
      <Link
        to="/courses"
        className="inline-flex items-center text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Courses
      </Link>

      {/* Course Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
            <p className="text-lg text-gray-600 mt-1">{course.code}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
            course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {course.status}
          </span>
        </div>

        <p className="mt-4 text-gray-700">{course.description || 'No description available'}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="flex items-start">
            <User className="text-primary-600 mr-3 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-600">Teacher</p>
              <p className="font-medium text-gray-900">{course.teacher_name || 'Not assigned'}</p>
              {course.teacher_email && (
                <p className="text-sm text-gray-600">{course.teacher_email}</p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <Users className="text-primary-600 mr-3 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-600">Enrollment</p>
              <p className="font-medium text-gray-900">{students.length} / {course.capacity}</p>
            </div>
          </div>

          <div className="flex items-start">
            <Calendar className="text-primary-600 mr-3 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-600">Schedule</p>
              <p className="font-medium text-gray-900">{course.schedule || 'TBA'}</p>
            </div>
          </div>

          <div className="flex items-start">
            <MapPin className="text-primary-600 mr-3 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-600">Room</p>
              <p className="font-medium text-gray-900">{course.room || 'TBA'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Students */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Enrolled Students ({students.length})</h2>
        </div>
        <div className="p-6">
          {students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <Link
                  key={student.id}
                  to={`/students/${student.id}`}
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-semibold">
                      {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {student.first_name} {student.last_name}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      student.enrollment_status === 'enrolled' ? 'bg-green-100 text-green-800' :
                      student.enrollment_status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {student.enrollment_status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No students enrolled yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;
