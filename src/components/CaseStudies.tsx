import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface CaseStudy {
  id: string;
  title: string;
  notes: string;
  date: string;
}

const CaseStudies: React.FC = () => {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newStudy, setNewStudy] = useState({
    title: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  const fetchCaseStudies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/case-studies`);
      if (response.data.success) {
        setCaseStudies(response.data.data);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching case studies:', err);
      setError(err.response?.data?.error || 'Failed to fetch case studies');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudy.title.trim() || !newStudy.date) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/case-studies`, newStudy);
      if (response.data.success) {
        setCaseStudies([response.data.data, ...caseStudies]);
        setNewStudy({ title: '', notes: '', date: new Date().toISOString().split('T')[0] });
        setIsAdding(false);
      }
    } catch (err: any) {
      console.error('Error adding case study:', err);
      setError(err.response?.data?.error || 'Failed to add case study');
    }
  };

  const handleUpdateStudy = async (id: string, updates: Partial<CaseStudy>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/case-studies/${id}`, updates);
      if (response.data.success) {
        setCaseStudies(caseStudies.map(study => 
          study.id === id ? response.data.data : study
        ));
      }
    } catch (err: any) {
      console.error('Error updating case study:', err);
      setError(err.response?.data?.error || 'Failed to update case study');
    }
  };

  const handleDeleteStudy = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case study?')) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/case-studies/${id}`);
      if (response.data.success) {
        setCaseStudies(caseStudies.filter(study => study.id !== id));
      }
    } catch (err: any) {
      console.error('Error deleting case study:', err);
      setError(err.response?.data?.error || 'Failed to delete case study');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Case Studies</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isAdding ? 'Cancel' : '+ Add Case Study'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAddStudy} className="mb-6 p-4 border rounded bg-gray-50">
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={newStudy.title}
              onChange={(e) => setNewStudy({ ...newStudy, title: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Date *</label>
            <input
              type="date"
              value={newStudy.date}
              onChange={(e) => setNewStudy({ ...newStudy, date: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={newStudy.notes}
              onChange={(e) => setNewStudy({ ...newStudy, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={4}
              placeholder="Key learnings, insights, frameworks used..."
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save Case Study
          </button>
        </form>
      )}

      <ul className="space-y-4">
        {caseStudies.length === 0 ? (
          <li className="text-gray-500 text-center py-8">
            No case studies yet. Add your first one!
          </li>
        ) : (
          caseStudies.map((study) => (
            <li key={study.id} className="p-4 border rounded bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{study.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(study.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  {study.notes && (
                    <p className="text-gray-600 mt-3 whitespace-pre-wrap">{study.notes}</p>
                  )}
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => {
                      const notes = prompt('Edit notes:', study.notes || '');
                      if (notes !== null) {
                        handleUpdateStudy(study.id, { notes });
                      }
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStudy(study.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default CaseStudies;