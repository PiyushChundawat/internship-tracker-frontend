import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface CaseCompetition {
  id: string;
  competition_name: string;
  notes: string;
  document_url: string;
}

const CaseCompetitions: React.FC = () => {
  const [caseCompetitions, setCaseCompetitions] = useState<CaseCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newCompetition, setNewCompetition] = useState({
    competition_name: '',
    notes: '',
    document_url: '',
  });

  useEffect(() => {
    fetchCaseCompetitions();
  }, []);

  const fetchCaseCompetitions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/case-competitions`);
      if (response.data.success) {
        setCaseCompetitions(response.data.data);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching case competitions:', err);
      setError(err.response?.data?.error || 'Failed to fetch case competitions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompetition.competition_name.trim()) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/case-competitions`, newCompetition);
      if (response.data.success) {
        setCaseCompetitions([...caseCompetitions, response.data.data]);
        setNewCompetition({ competition_name: '', notes: '', document_url: '' });
        setIsAdding(false);
      }
    } catch (err: any) {
      console.error('Error adding case competition:', err);
      setError(err.response?.data?.error || 'Failed to add case competition');
    }
  };

  const handleDeleteCompetition = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case competition?')) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/case-competitions/${id}`);
      if (response.data.success) {
        setCaseCompetitions(caseCompetitions.filter(comp => comp.id !== id));
      }
    } catch (err: any) {
      console.error('Error deleting case competition:', err);
      setError(err.response?.data?.error || 'Failed to delete case competition');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Case Competitions</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isAdding ? 'Cancel' : '+ Add Competition'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAddCompetition} className="mb-6 p-4 border rounded bg-gray-50">
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Competition Name *</label>
            <input
              type="text"
              value={newCompetition.competition_name}
              onChange={(e) => setNewCompetition({ ...newCompetition, competition_name: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={newCompetition.notes}
              onChange={(e) => setNewCompetition({ ...newCompetition, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={3}
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Document URL</label>
            <input
              type="text"
              value={newCompetition.document_url}
              onChange={(e) => setNewCompetition({ ...newCompetition, document_url: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="https://..."
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save Competition
          </button>
        </form>
      )}

      <ul className="space-y-4">
        {caseCompetitions.length === 0 ? (
          <li className="text-gray-500 text-center py-8">
            No case competitions yet. Add your first one!
          </li>
        ) : (
          caseCompetitions.map((comp) => (
            <li key={comp.id} className="p-4 border rounded bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{comp.competition_name}</h3>
                  {comp.notes && <p className="text-gray-600 mt-2">{comp.notes}</p>}
                  {comp.document_url && (
                    <p className="text-sm text-blue-600 mt-2">
                      Document: <a href={comp.document_url} target="_blank" rel="noopener noreferrer" className="underline">
                        View Document
                      </a>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteCompetition(comp.id)}
                  className="ml-4 text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default CaseCompetitions;