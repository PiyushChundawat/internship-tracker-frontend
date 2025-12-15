import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface Certificate {
  id: string;
  profile: string;
  title: string;
  issuer: string;
  date: string;
  file_url: string | null;
}

interface CertificatesProps {
  profile: 'piyush' | 'shruti';
}

const Certificates: React.FC<CertificatesProps> = ({ profile }) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newCertificate, setNewCertificate] = useState({
    title: '',
    issuer: '',
    date: new Date().toISOString().split('T')[0],
    file_url: '',
  });

  useEffect(() => {
    fetchCertificates();
  }, [profile]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/certificates`, {
        params: { profile }
      });
      if (response.data.success) {
        setCertificates(response.data.data);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching certificates:', err);
      setError(err.response?.data?.error || 'Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertificate.title.trim() || !newCertificate.issuer.trim() || !newCertificate.date) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/certificates`, {
        ...newCertificate,
        profile
      });
      if (response.data.success) {
        setCertificates([response.data.data, ...certificates]);
        setNewCertificate({ 
          title: '', 
          issuer: '', 
          date: new Date().toISOString().split('T')[0],
          file_url: '' 
        });
        setIsAdding(false);
      }
    } catch (err: any) {
      console.error('Error adding certificate:', err);
      setError(err.response?.data?.error || 'Failed to add certificate');
    }
  };

  const handleDeleteCertificate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/certificates/${id}`);
      if (response.data.success) {
        setCertificates(certificates.filter(cert => cert.id !== id));
      }
    } catch (err: any) {
      console.error('Error deleting certificate:', err);
      setError(err.response?.data?.error || 'Failed to delete certificate');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Certificates</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isAdding ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAddCertificate} className="mb-4 p-3 border rounded bg-gray-50">
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={newCertificate.title}
              onChange={(e) => setNewCertificate({ ...newCertificate, title: e.target.value })}
              className="w-full px-2 py-1 text-sm border rounded"
              placeholder="Certificate name"
              required
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Issuer *</label>
            <input
              type="text"
              value={newCertificate.issuer}
              onChange={(e) => setNewCertificate({ ...newCertificate, issuer: e.target.value })}
              className="w-full px-2 py-1 text-sm border rounded"
              placeholder="Organization/Platform"
              required
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Date *</label>
            <input
              type="date"
              value={newCertificate.date}
              onChange={(e) => setNewCertificate({ ...newCertificate, date: e.target.value })}
              className="w-full px-2 py-1 text-sm border rounded"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">File URL (optional)</label>
            <input
              type="text"
              value={newCertificate.file_url}
              onChange={(e) => setNewCertificate({ ...newCertificate, file_url: e.target.value })}
              className="w-full px-2 py-1 text-sm border rounded"
              placeholder="https://..."
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save Certificate
          </button>
        </form>
      )}

      <ul className="space-y-2">
        {certificates.length === 0 ? (
          <li className="text-gray-500 text-sm text-center py-4">
            No certificates yet. Add your first one!
          </li>
        ) : (
          certificates.map((cert) => (
            <li key={cert.id} className="flex justify-between items-start p-2 hover:bg-gray-50 rounded">
              <div className="flex-1">
                {profile === 'piyush' ? (
                  <span className="text-sm">
                    <strong>{cert.title}</strong> by {cert.issuer} on{' '}
                    {new Date(cert.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                ) : (
                  <span className="text-sm">
                    <strong>{cert.issuer}</strong> on{' '}
                    {new Date(cert.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                )}
                {cert.file_url && (
                  <div className="mt-1">
                    <a
                      href={cert.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View Certificate →
                    </a>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDeleteCertificate(cert.id)}
                className="ml-2 text-red-500 hover:text-red-700 text-xs"
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Certificates;