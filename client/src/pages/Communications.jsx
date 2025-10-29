import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Send, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Communications() {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    recipient_type: 'all',
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    try {
      const response = await axios.get('/api/communication');
      setCommunications(response.data.communications);
    } catch (error) {
      console.error('Failed to fetch communications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/communication', formData);
      setShowModal(false);
      setFormData({
        subject: '',
        message: '',
        recipient_type: 'all',
      });
      fetchCommunications();
    } catch (error) {
      console.error('Failed to send communication:', error);
      alert(error.response?.data?.error || 'Failed to send communication');
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/communication/${id}/read`);
      fetchCommunications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
          <p className="text-gray-600 mt-1">Messages and announcements</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          New Message
        </button>
      </div>

      {/* Communications List */}
      <div className="bg-white rounded-lg shadow">
        {communications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {communications.map((comm) => (
              <div
                key={comm.id}
                className={`p-6 hover:bg-gray-50 cursor-pointer ${
                  comm.status === 'read' ? 'bg-white' : 'bg-blue-50'
                }`}
                onClick={() => comm.status !== 'read' && markAsRead(comm.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Mail
                      size={20}
                      className={comm.status === 'read' ? 'text-gray-400' : 'text-primary-600'}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-medium ${
                          comm.status === 'read' ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {comm.subject}
                        </h3>
                        {comm.status !== 'read' && (
                          <span className="px-2 py-0.5 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">From: {comm.sender_email}</p>
                      <p className="text-sm text-gray-700 mt-2">{comm.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(comm.sent_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    comm.type === 'email' ? 'bg-blue-100 text-blue-800' :
                    comm.type === 'notification' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {comm.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Mail size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No communications yet</p>
          </div>
        )}
      </div>

      {/* Send Message Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">New Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipients *
                </label>
                <select
                  value={formData.recipient_type}
                  onChange={(e) => setFormData({ ...formData, recipient_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Users</option>
                  <option value="student">All Students</option>
                  <option value="teacher">All Teachers</option>
                  <option value="parent">All Parents</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows="5"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
                >
                  <Send size={18} className="mr-2" />
                  Send
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

export default Communications;
