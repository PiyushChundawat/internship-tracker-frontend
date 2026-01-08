import React, { useEffect, useState } from 'react';
import { Plus, Calendar, TrendingUp, Target, Trash2, Edit3, Save, Code, Award, Zap, Star, Hash } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000';

interface DailyLogPiyush {
  id: string;
  date: string;
  striver: number;
  leetcode: number;
  codechef: number;
  codeforces: number;
  atcoder: number;
  total: number;
  notes: string | null;
}

const DailyLogs: React.FC = () => {
  const [dailyLogs, setDailyLogs] = useState<DailyLogPiyush[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [todayLog, setTodayLog] = useState<DailyLogPiyush | null>(null);
  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);

  const platforms: Array<keyof Omit<DailyLogPiyush, 'id' | 'date' | 'total' | 'notes'>> = [
    'striver', 'leetcode', 'codechef', 'codeforces', 'atcoder'
  ];
  
  const platformLabels: Record<string, string> = {
    striver: 'Striver A2Z',
    leetcode: 'LeetCode',
    codechef: 'CodeChef',
    codeforces: 'Codeforces',
    atcoder: 'AtCoder'
  };

  const platformIcons: Record<string, React.ReactNode> = {
    striver: <Target className="w-5 h-5" />,
    leetcode: <Code className="w-5 h-5" />,
    codechef: <Award className="w-5 h-5" />,
    codeforces: <Zap className="w-5 h-5" />,
    atcoder: <Star className="w-5 h-5" />
  };

  const platformColors: Record<string, string> = {
    striver: 'bg-blue-600 hover:bg-blue-700 border-blue-500',
    leetcode: 'bg-yellow-600 hover:bg-yellow-700 border-yellow-500',
    codechef: 'bg-yellow-700 hover:bg-yellow-800 border-yellow-600',
    codeforces: 'bg-red-600 hover:bg-red-700 border-red-500',
    atcoder: 'bg-gray-600 hover:bg-gray-700 border-gray-500'
  };

  const incrementPlatform = (platform: string) => {
    const currentLog = todayLog || {
      id: Date.now().toString(),
      date: selectedDate,
      striver: 0,
      leetcode: 0,
      codechef: 0,
      codeforces: 0,
      atcoder: 0,
      total: 0,
      notes: null
    };

    const newCount = (currentLog[platform as keyof typeof currentLog] as number || 0) + 1;
    const updatedLog = {
      ...currentLog,
      [platform]: newCount,
      total: platforms.reduce((sum, p) => sum + (p === platform ? newCount : (currentLog[p] as number || 0)), 0)
    };

    setTodayLog(updatedLog);
    
    if (dailyLogs.find(log => log.date === selectedDate)) {
      setDailyLogs(dailyLogs.map(log => log.date === selectedDate ? updatedLog : log));
    } else {
      setDailyLogs([updatedLog, ...dailyLogs]);
    }
  };

  const updateNotes = () => {
    if (!todayLog) return;
    
    const updatedLog = { ...todayLog, notes };
    setTodayLog(updatedLog);
    setDailyLogs(dailyLogs.map(log => log.id === todayLog.id ? updatedLog : log));
    setEditingNotes(false);
  };

  const deleteLog = (id: string) => {
    if (!confirm('Are you sure you want to delete this log?')) return;

    setDailyLogs(dailyLogs.filter(log => log.id !== id));
    if (todayLog?.id === id) {
      setTodayLog(null);
    }
  };

  const calculateWeekly = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return dailyLogs
      .filter(log => new Date(log.date) >= oneWeekAgo)
      .reduce((sum, log) => sum + log.total, 0);
  };

  const calculateOverall = () => {
    return dailyLogs.reduce((sum, log) => sum + log.total, 0);
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
      <div className="flex items-center gap-3 mb-8">
        <Calendar className="w-7 h-7 text-green-500" />
        <h2 className="text-2xl font-semibold text-white">Daily Question Tracker</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-400 mb-2">Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            const log = dailyLogs.find(l => l.date === e.target.value);
            setTodayLog(log || null);
            setNotes(log?.notes || '');
          }}
          className="px-4 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          {new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((platform) => {
            const count = (todayLog?.[platform] as number) || 0;
            return (
              <div
                key={platform}
                className="bg-gray-900 border border-gray-700 rounded-lg p-5 hover:border-gray-600 transition-colors"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{platformIcons[platform]}</span>
                    <span className="font-medium text-white">{platformLabels[platform]}</span>
                  </div>
                  <div className={`px-3 py-1 bg-gray-800 border border-gray-700 text-white rounded text-lg font-bold`}>
                    {count}
                  </div>
                </div>
                <button
                  onClick={() => incrementPlatform(platform)}
                  className={`w-full py-2 ${platformColors[platform]} text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium border`}
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>
              </div>
            );
          })}
        </div>

        {todayLog && (
          <div className="mt-6 p-6 bg-blue-900 border border-blue-700 text-white rounded-lg">
            <div className="text-center">
              <p className="text-sm font-medium text-blue-300 mb-2">Total Questions Today</p>
              <p className="text-5xl font-bold">{todayLog.total}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mb-8 p-6 bg-gray-900 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-white">Daily Notes</label>
          {!editingNotes ? (
            <button
              onClick={() => setEditingNotes(true)}
              className="flex items-center gap-2 px-3 py-1 text-sm text-blue-400 hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-700"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={updateNotes}
                className="flex items-center gap-2 px-3 py-1 text-sm text-green-400 hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-700"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => {
                  setEditingNotes(false);
                  setNotes(todayLog?.notes || '');
                }}
                className="px-3 py-1 text-sm text-gray-400 hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        {editingNotes ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes for today..."
            className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:border-blue-500"
            rows={3}
          />
        ) : (
          <p className="text-gray-400">
            {notes || 'No notes for this day. Click Edit to add notes.'}
          </p>
        )}
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-purple-900 border border-purple-700 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-300" />
            <p className="text-sm font-medium text-purple-200">Last 7 Days</p>
          </div>
          <p className="text-4xl font-bold text-white">{calculateWeekly()}</p>
          <p className="text-xs text-purple-300 mt-1">questions solved</p>
        </div>
        <div className="p-6 bg-blue-900 border border-blue-700 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-blue-300" />
            <p className="text-sm font-medium text-blue-200">All Time Total</p>
          </div>
          <p className="text-4xl font-bold text-white">{calculateOverall()}</p>
          <p className="text-xs text-blue-300 mt-1">questions solved</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-5">History</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {dailyLogs.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Calendar className="w-20 h-20 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No logs yet. Start tracking today!</p>
            </div>
          ) : (
            dailyLogs.map((log) => (
              <div key={log.id} className="p-5 bg-gray-900 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <p className="font-semibold text-lg text-white">
                        {new Date(log.date).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <span className="px-3 py-1 bg-blue-900 border border-blue-700 text-blue-300 text-sm font-medium rounded">
                        {log.total} total
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                      {platforms.map(platform => {
                        const count = log[platform];
                        return count > 0 ? (
                          <span key={platform} className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded border border-gray-700 font-medium flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {platformLabels[platform]}: {count}
                          </span>
                        ) : null;
                      })}
                    </div>
                    {log.notes && (
                      <p className="text-sm text-gray-400 mt-2 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
                        {log.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteLog(log.id)}
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
    </div>
  );
};

export default DailyLogs;
