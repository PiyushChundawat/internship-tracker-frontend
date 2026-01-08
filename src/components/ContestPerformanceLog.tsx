import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, Plus, CheckCircle, Circle, Edit2, Trash2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface ContestLog {
  id: string;
  platform: string;
  contest_name: string;
  date: string;
  problems_solved: number;
  total_problems: number;
  notes: string | null;
  upsolved: boolean;
}

const ContestPerformanceLog: React.FC = () => {
  const [contestLogs, setContestLogs] = useState<ContestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newContest, setNewContest] = useState({
    platform: 'Codechef',
    contest_name: '',
    date: new Date().toISOString().split('T')[0],
    problems_solved: 0,
    total_problems: 0,
    notes: '',
    upsolved: false,
  });

  const platformOptions = ['Codechef', 'Codeforces', 'LeetCode', 'AtCoder'];

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
          platform: 'Codechef',
          contest_name: '',
          date: new Date().toISOString().split('T')[0],
          problems_solved: 0,
          total_problems: 0,
          notes: '',
          upsolved: false,
        });
        setIsAdding(false);
      }
    } catch (err: any) {
      console.error('Error adding contest log:', err);
      setError(err.response?.data?.error || 'Failed to add contest log');
    }
  };

  const toggleUpsolved = async (id: string) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/contest-logs/${id}/toggle-upsolved`);
      if (response.data.success) {
        setContestLogs(contestLogs.map(log => 
          log.id === id ? response.data.data : log
        ));
      }
    } catch (err: any) {
      console.error('Error toggling upsolved:', err);
      setError(err.response?.data?.error || 'Failed to update status');
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

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      'Codechef': 'from-amber-500 to-orange-500',
      'Codeforces': 'from-blue-500 to-blue-600',
      'LeetCode': 'from-yellow-500 to-orange-500',
      'AtCoder': 'from-gray-600 to-gray-700',
    };
    return colors[platform] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-2xl border border-blue-200">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-blue-200 rounded w-1/3"></div>
          <div className="h-48 bg-blue-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-2xl border border-blue-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-blue-600" />
          Contest Performance Log
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all font-semibold shadow-lg flex items-center gap-2"
        >
          {isAdding ? 'Cancel' : <><Plus className="w-5 h-5" /> Add Contest</>}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAddContest} className="mb-8 p-6 bg-white rounded-xl shadow-lg border-2 border-blue-100">
          <h3 className="text-lg font-bold text-blue-800 mb-4">Add New Contest</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Platform *</label>
              <select
                value={newContest.platform}
                onChange={(e) => setNewContest({ ...newContest, platform: e.target.value })}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
                required
              >
                {platformOptions.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contest Name *</label>
              <input
                type="text"
                value={newContest.contest_name}
                onChange={(e) => setNewContest({ ...newContest, contest_name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
                placeholder="Starters 219"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                value={newContest.date}
                onChange={(e) => setNewContest({ ...newContest, date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Problems Solved</label>
              <input
                type="number"
                value={newContest.problems_solved}
                onChange={(e) => setNewContest({ ...newContest, problems_solved: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Total Problems</label>
              <input
                type="number"
                value={newContest.total_problems}
                onChange={(e) => setNewContest({ ...newContest, total_problems: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
                min="0"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
            <textarea
              value={newContest.notes}
              onChange={(e) => setNewContest({ ...newContest, notes: e.target.value })}
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
              rows={3}
              placeholder="Performance notes, learnings..."
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-lg"
          >
            Save Contest
          </button>
        </form>
      )}

      <div className="space-y-4">
        {contestLogs.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Trophy className="w-20 h-20 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No contest logs yet. Add your first contest!</p>
          </div>
        ) : (
          contestLogs.map((contest) => (
            <div 
              key={contest.id} 
              className={`p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border-l-4 ${
                contest.upsolved ? 'border-green-500' : 'border-blue-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-4 py-1 bg-gradient-to-r ${getPlatformColor(contest.platform)} text-white text-sm font-bold rounded-full`}>
                      {contest.platform}
                    </span>
                    <button
                      onClick={() => toggleUpsolved(contest.id)}
                      className={`flex items-center gap-2 px-4 py-1 rounded-full text-sm font-semibold transition-all ${
                        contest.upsolved 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {contest.upsolved ? (
                        <><CheckCircle className="w-4 h-4" /> Upsolved</>
                      ) : (
                        <><Circle className="w-4 h-4" /> Not Upsolved</>
                      )}
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{contest.contest_name}</h3>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm text-gray-600">
                      📅 {new Date(contest.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-600">{contest.problems_solved}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-lg text-gray-600">{contest.total_problems}</span>
                      {contest.total_problems > 0 && (
                        <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                          {Math.round((contest.problems_solved / contest.total_problems) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                  {editingId === contest.id ? (
                    <textarea
                      defaultValue={contest.notes || ''}
                      onBlur={(e) => handleUpdateContest(contest.id, { notes: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleUpdateContest(contest.id, { notes: e.currentTarget.value });
                        }
                      }}
                      className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      autoFocus
                    />
                  ) : (
                    <p 
                      onClick={() => setEditingId(contest.id)}
                      className="text-sm text-gray-600 italic cursor-pointer hover:bg-blue-50 px-3 py-2 rounded-lg transition-all"
                    >
                      {contest.notes || '📝 Click to add notes...'}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteContest(contest.id)}
                  className="ml-4 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContestPerformanceLog;
