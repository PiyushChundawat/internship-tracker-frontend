import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, Plus, CheckCircle, Circle, Trash2, X } from 'lucide-react';

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
  const [editingNotes, setEditingNotes] = useState('');
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

  const handleUpdateNotes = async (id: string, notes: string) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/contest-logs/${id}`, { notes });
      if (response.data.success) {
        setContestLogs(contestLogs.map(log => 
          log.id === id ? response.data.data : log
        ));
        setEditingId(null);
      }
    } catch (err: any) {
      console.error('Error updating notes:', err);
      setError(err.response?.data?.error || 'Failed to update notes');
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

  const getPlatformGradient = (platform: string) => {
    const colors: Record<string, string> = {
      'Codechef': 'from-amber-500 to-orange-600',
      'Codeforces': 'from-blue-500 to-indigo-600',
      'LeetCode': 'from-yellow-500 to-orange-500',
      'AtCoder': 'from-gray-600 to-gray-800',
    };
    return colors[platform] || 'from-gray-500 to-gray-700';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Contest Performance Log</h2>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all font-semibold shadow-md flex items-center gap-2"
        >
          {isAdding ? <><X className="w-5 h-5" /> Cancel</> : <><Plus className="w-5 h-5" /> Add Contest</>}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAddContest} className="mb-8 p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-5">Add New Contest</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Platform *</label>
              <select
                value={newContest.platform}
                onChange={(e) => setNewContest({ ...newContest, platform: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Problems Solved</label>
              <input
                type="number"
                value={newContest.problems_solved}
                onChange={(e) => setNewContest({ ...newContest, problems_solved: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Total Problems</label>
              <input
                type="number"
                value={newContest.total_problems}
                onChange={(e) => setNewContest({ ...newContest, total_problems: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
            <textarea
              value={newContest.notes}
              onChange={(e) => setNewContest({ ...newContest, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Performance notes, learnings..."
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-md"
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
              className="p-6 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-4 py-1.5 bg-gradient-to-r ${getPlatformGradient(contest.platform)} text-white text-sm font-bold rounded-full shadow-sm`}>
                      {contest.platform}
                    </span>
                    <button
                      onClick={() => toggleUpsolved(contest.id)}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                        contest.upsolved 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      {contest.upsolved ? (
                        <><CheckCircle className="w-4 h-4" /> Upsolved</>
                      ) : (
                        <><Circle className="w-4 h-4" /> Not Upsolved</>
                      )}
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{contest.contest_name}</h3>
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
                        <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full border border-blue-200">
                          {Math.round((contest.problems_solved / contest.total_problems) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                  {editingId === contest.id ? (
                    <div className="flex gap-2">
                      <textarea
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                        className="flex-1 px-3 py-2 border-2 border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdateNotes(contest.id, editingNotes)}
                        className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p 
                      onClick={() => {
                        setEditingId(contest.id);
                        setEditingNotes(contest.notes || '');
                      }}
                      className="text-sm text-gray-600 italic cursor-pointer hover:bg-blue-50 px-3 py-2 rounded-lg transition-all border border-transparent hover:border-blue-200"
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
