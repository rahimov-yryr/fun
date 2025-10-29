import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Mail, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialization: '',
    qualification: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('/api/teachers');
      setTeachers(response.data.teachers);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/teachers', formData);
      setShowModal(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        specialization: '',
        qualification: '',
      });
      fetchTeachers();
    } catch (error) {
      console.error('Failed to create teacher:', error);
      alert(error.response?.data?.error || 'Failed to create teacher');
    }
  };

  const canModify = user?.role === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-600 mt-1">Manage teaching staff</p>
        </div>
        {canModify && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Teacher
          </button>
        )}
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="flex items-start">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-primary-600">
                  {teacher.first_name?.charAt(0)}{teacher.last_name?.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {teacher.first_name} {teacher.last_name}
                </h3>
                <span className={`mt-1 inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                  teacher.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {teacher.status}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {teacher.specialization && (
                <p className="text-sm text-gray-600">
                  <strong>Specialization:</strong> {teacher.specialization}
                </p>
              )}
              {teacher.qualification && (
                <p className="text-sm text-gray-600">
                  <strong>Qualification:</strong> {teacher.qualification}
                </p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Mail size={16} className="mr-2" />
                <a href={`mailto:${teacher.email}`} className="hover:text-primary-600">
                  {teacher.email}
                </a>
              </div>
              {teacher.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone size={16} className="mr-2" />
                  <a href={`tel:${teacher.phone}`} className="hover:text-primary-600">
                    {teacher.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Teacher Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Add New Teacher</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualification
                </label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Teachers;
