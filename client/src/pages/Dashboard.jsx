import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, BookOpen, GraduationCap, UserCheck, TrendingUp } from 'lucide-react';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/analytics/dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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

  const stats = [
    {
      name: 'Total Students',
      value: data?.stats?.totalStudents || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Courses',
      value: data?.stats?.totalCourses || 0,
      icon: BookOpen,
      color: 'bg-green-500',
    },
    {
      name: 'Teachers',
      value: data?.stats?.totalTeachers || 0,
      icon: GraduationCap,
      color: 'bg-purple-500',
    },
    {
      name: 'Enrollments',
      value: data?.stats?.totalEnrollments || 0,
      icon: UserCheck,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your Educational CRM</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Enrollments */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Enrollments</h2>
        </div>
        <div className="p-6">
          {data?.recentEnrollments?.length > 0 ? (
            <div className="space-y-4">
              {data.recentEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{enrollment.student_name}</p>
                    <p className="text-sm text-gray-600">{enrollment.course_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {enrollment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent enrollments</p>
          )}
        </div>
      </div>

      {/* Course Statistics */}
      {data?.courseStats?.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Course Enrollment Status</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.courseStats.map((course) => (
                <div key={course.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{course.name}</span>
                    <span className="text-sm text-gray-600">
                      {course.enrolled_count || 0} / {course.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(course.fill_percentage || 0, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
