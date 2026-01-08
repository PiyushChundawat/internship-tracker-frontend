import React, { useEffect, useState } from 'react';
import { Trophy, Plus, CheckCircle, Circle, Trash2, X } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000';

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
  const [loading, setLoading] = useState(false);
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

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      'Codechef': 'bg-yellow-600',
      'Codeforces': 'bg-blue-600',
      'LeetCode': 'bg-yellow-500',
      'AtCoder': 'bg-gray-600',
    };
    return colors[platform] || 'bg-gray-600';
  };

  const handleAddContest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContest.platform.trim() || !newContest.contest_name.trim() || !newContest.date) return;

    const mockContest: ContestLog = {
      id: Date.now().toString(),
      ...newContest
    };
    
    setContestLogs([mockContest, ...contestLogs]);
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
  };

  const toggleUpsolved = (id: string) => {
    setContestLogs(contestLogs.map(log => 
      log.id === id ? { ...log, upsolved: !log.upsolved } : log
    ));
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setContestLogs(contestLogs.map(log => 
      log.id === id ? { ...log, notes } : log
    ));
    setEditingId(null);
  };

  const handleDeleteContest = (id: string) => {
    if (!confirm('Are you sure you want to delete this contest log?')) return;
    setContestLogs(contestLogs.filter(log => log.id !== id));
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="h-48 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Trophy className="w-7 h-7 text-purple-500" />
          <h2 className="text-2xl font-semibold text-white">Contest Performance Log</h2>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 border border-blue-500"
        >
          {isAdding ? <><X className="w-5 h-5" /> Cancel</> : <><Plus className="w-5 h-5" /> Add Contest</>}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAddContest} className="mb-8 p-6 bg-gray-900 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-5">Add New Contest</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Platform *</label>
              <select
                value={newContest.platform}
                onChange={(e) => setNewContest({ ...newContest, platform: e.target.value })}
                className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                required
              >
                {platformOptions.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Contest Name *</label>
              <input
                type="text"
                value={newContest.contest_name}
                onChange={(e) => setNewContest({ ...newContest, contest_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                placeholder="Starters 219"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Date *</label>
              <input
                type="date"
                value={newContest.date}
                onChange={(e) => setNewContest({ ...newContest, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Problems Solved</label>
              <input
                type="number"
                value={newContest.problems_solved}
                onChange={(e) => setNewContest({ ...newContest, problems_solved: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Total Problems</label>
              <input
                type="number"
                value={newContest.total_problems}
                onChange={(e) => setNewContest({ ...newContest, total_problems: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                min="0"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Notes</label>
            <textarea
              value={newContest.notes}
              onChange={(e) => setNewContest({ ...newContest, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:border-blue-500"
              rows={3}
              placeholder="Performance notes, learnings..."
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium border border-green-500"
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
              className="p-6 bg-gray-900 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 ${getPlatformColor(contest.platform)} text-white text-sm font-medium rounded`}>
                      {contest.platform}
                    </span>
                    <button
                      onClick={() => toggleUpsolved(contest.id)}
                      className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium transition-colors border ${
                        contest.upsolved 
                          ? 'bg-green-900 text-green-300 border-green-700 hover:border-green-600' 
                          : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      {contest.upsolved ? (
                        <><CheckCircle className="w-4 h-4" /> Upsolved</>
                      ) : (
                        <><Circle className="w-4 h-4" /> Not Upsolved</>
                      )}
                    </button>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{contest.contest_name}</h3>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm text-gray-400">
                      {new Date(contest.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-400">{contest.problems_solved}</span>
                      <span className="text-gray-600">/</span>
                      <span className="text-lg text-gray-400">{contest.total_problems}</span>
                      {contest.total_problems > 0 && (
                        <span className="ml-2 px-2 py-1 bg-blue-900 text-blue-300 text-sm font-medium rounded border border-blue-700">
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
                        className="flex-1 px-3 py-2 border border-gray-700 rounded-lg text-sm bg-gray-800 text-white focus:outline-none focus:border-blue-500"
                        rows={2}
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdateNotes(contest.id, editingNotes)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors border border-green-500"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
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
                      className="text-sm text-gray-400 italic cursor-pointer hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-gray-700"
                    >
                      {contest.notes || 'Click to add notes...'}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteContest(contest.id)}
                  className="ml-4 p-2 text-red-400 hover:bg-red-900 hover:bg-opacity-30 rounded-lg transition-colors"
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
