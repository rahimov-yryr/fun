import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Users, BookOpen, Award } from 'lucide-react';

function Analytics() {
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [coursePerformance, setCoursePerformance] = useState([]);
  const [teacherWorkload, setTeacherWorkload] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [studentRes, courseRes, teacherRes] = await Promise.all([
        axios.get('/api/analytics/student-performance'),
        axios.get('/api/analytics/course-performance'),
        axios.get('/api/analytics/teacher-workload')
      ]);
      setStudentPerformance(studentRes.data.performance || []);
      setCoursePerformance(courseRes.data.performance || []);
      setTeacherWorkload(teacherRes.data.workload || []);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-1">Insights and performance metrics</p>
      </div>

      {/* Student Performance */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center">
          <Award className="text-primary-600 mr-3" size={24} />
          <h2 className="text-lg font-semibold text-gray-900">Top Student Performance</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Rank</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Student</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Courses</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Avg Grade</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {studentPerformance.slice(0, 10).map((student, index) => (
                  <tr key={student.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.student_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.total_courses || 0}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full ${
                        student.average_grade >= 90 ? 'bg-green-100 text-green-800' :
                        student.average_grade >= 80 ? 'bg-blue-100 text-blue-800' :
                        student.average_grade >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.average_grade?.toFixed(1) || 'N/A'}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.average_attendance?.toFixed(1) || 'N/A'}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Course Performance */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center">
          <BookOpen className="text-primary-600 mr-3" size={24} />
          <h2 className="text-lg font-semibold text-gray-900">Course Performance</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coursePerformance.map((course) => (
              <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{course.name}</h3>
                    <p className="text-sm text-gray-600">{course.code}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    course.average_grade >= 80 ? 'bg-green-100 text-green-800' :
                    course.average_grade >= 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {course.average_grade?.toFixed(1) || 'N/A'}%
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    <Users size={16} className="inline mr-1" />
                    {course.enrolled_students || 0} students
                  </span>
                  <span className="text-gray-600">{course.teacher_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Teacher Workload */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center">
          <TrendingUp className="text-primary-600 mr-3" size={24} />
          <h2 className="text-lg font-semibold text-gray-900">Teacher Workload</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {teacherWorkload.map((teacher) => (
              <div key={teacher.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{teacher.teacher_name}</p>
                  <p className="text-sm text-gray-600">{teacher.specialization || 'No specialization'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{teacher.total_courses || 0}</span> courses
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{teacher.total_students || 0}</span> students
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
