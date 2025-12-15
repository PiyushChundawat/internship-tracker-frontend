import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface ContestLog {
  id: string;
  platform: string;
  contest_name: string;
  date: string;
  problems_solved: number;
  total_problems: number;
  notes: string | null;
}

const ContestPerformanceLog: React.FC = () => {
  const [contestLogs, setContestLogs] = useState<ContestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newContest, setNewContest] = useState({
    platform: '',
    contest_name: '',
    date: new Date().toISOString().split('T')[0],
    problems_solved: 0,
    total_problems: 0,
    notes: '',
  });

  useEffect(() => {
    fetchContestLogs();
  }, []);

  const fetchContestLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/contest-logs`);
      if (response.data.success) {
        setContestLogs(response.data.data);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching contest logs:', err);
      setError(err.response?.data?.error || 'Failed to fetch contest logs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContest.platform.trim() || !newContest.contest_name.trim() || !newContest.date) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/contest-logs`, newContest);
      if (response.data.success) {
        setContestLogs([response.data.data, ...contestLogs]);
        setNewContest({
          platform: '',
          contest_name: '',
          date: new Date().toISOString().split('T')[0],
          problems_solved: 0,
          total_problems: 0,
          notes: '',
        });
        setIsAdding(false);
      }
    } catch (err: any) {
      console.error('Error adding contest log:', err);
      setError(err.response?.data?.error || 'Failed to add contest log');
    }
  };

  const handleUpdateContest = async (id: string, updates: Partial<ContestLog>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/contest-logs/${id}`, updates);
      if (response.data.success) {
        setContestLogs(contestLogs.map(log => 
          log.id === id ? response.data.data : log
        ));
        setEditingId(null);
      }
    } catch (err: any) {
      console.error('Error updating contest log:', err);
      setError(err.response?.data?.error || 'Failed to update contest log');
    }
  };

  const handleDeleteContest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contest log?')) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/contest-logs/${id}`);
      if (response.data.success) {
        setContestLogs(contestLogs.filter(log => log.id !== id));
      }
    } catch (err: any) {
      console.error('Error deleting contest log:', err);
      setError(err.response?.data?.error || 'Failed to delete contest log');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Contest Performance Log</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isAdding ? 'Cancel' : '+ Add Contest'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAddContest} className="mb-6 p-4 border rounded bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1">Platform *</label>
              <input
                type="text"
                value={newContest.platform}
                onChange={(e) => setNewContest({ ...newContest, platform: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="Codeforces, LeetCode, etc."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contest Name *</label>
              <input
                type="text"
                value={newContest.contest_name}
                onChange={(e) => setNewContest({ ...newContest, contest_name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="Weekly Contest 380"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <input
                type="date"
                value={newContest.date}
                onChange={(e) => setNewContest({ ...newContest, date: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Problems Solved</label>
              <input
                type="number"
                value={newContest.problems_solved}
                onChange={(e) => setNewContest({ ...newContest, problems_solved: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Problems</label>
              <input
                type="number"
                value={newContest.total_problems}
                onChange={(e) => setNewContest({ ...newContest, total_problems: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded"
                min="0"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={newContest.notes}
              onChange={(e) => setNewContest({ ...newContest, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={2}
              placeholder="Performance notes, learnings..."
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save Contest
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="border p-2 text-left">Platform</th>
              <th className="border p-2 text-left">Contest Name</th>
              <th className="border p-2 text-left">Date</th>
              <th className="border p-2 text-center">Problems Solved</th>
              <th className="border p-2 text-left">Notes</th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contestLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="border p-8 text-center text-gray-500">
                  No contest logs yet. Add your first contest!
                </td>
              </tr>
            ) : (
              contestLogs.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="border p-2">{entry.platform}</td>
                  <td className="border p-2">{entry.contest_name}</td>
                  <td className="border p-2">
                    {new Date(entry.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </td>
                  <td className="border p-2 text-center">
                    <span className="font-semibold">{entry.problems_solved}</span> / {entry.total_problems}
                    {entry.total_problems > 0 && (
                      <span className="text-xs text-gray-600 ml-2">
                        ({Math.round((entry.problems_solved / entry.total_problems) * 100)}%)
                      </span>
                    )}
                  </td>
                  <td className="border p-2">
                    {editingId === entry.id ? (
                      <input
                        type="text"
                        defaultValue={entry.notes || ''}
                        onBlur={(e) => handleUpdateContest(entry.id, { notes: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateContest(entry.id, { notes: e.currentTarget.value });
                          }
                        }}
                        className="w-full px-2 py-1 border rounded text-sm"
                        autoFocus
                      />
                    ) : (
                      <span 
                        onClick={() => setEditingId(entry.id)}
                        className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded block"
                      >
                        {entry.notes || <span className="text-gray-400 italic">Click to add notes</span>}
                      </span>
                    )}
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleDeleteContest(entry.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContestPerformanceLog;