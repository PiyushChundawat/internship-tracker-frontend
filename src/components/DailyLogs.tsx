import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Calendar, TrendingUp, Target, Trash2, Edit3, Save } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface DailyLogPiyush {
  id: string;
  date: string;
  striver: number;
  leetcode: number;
  codechef: number;
  codeforces: number;
  atcoder: number;
  notes: string | null;
}

interface DailyLogShruti {
  id: string;
  date: string;
  python_questions_solved: number;
  sql_questions_solved: number;
  notes: string | null;
}

interface DailyLogsProps {
  profile: 'piyush' | 'shruti';
}

const DailyLogs: React.FC<DailyLogsProps> = ({ profile }) => {
  const [dailyLogs, setDailyLogs] = useState<(DailyLogPiyush | DailyLogShruti)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [todayLog, setTodayLog] = useState<DailyLogPiyush | null>(null);
  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);

  const platforms = ['striver', 'leetcode', 'codechef', 'codeforces', 'atcoder'];
  const platformLabels: Record<string, string> = {
    striver: 'Striver A2Z',
    leetcode: 'LeetCode',
    codechef: 'CodeChef',
    codeforces: 'Codeforces',
    atcoder: 'AtCoder'
  };

  const platformEmojis: Record<string, string> = {
    striver: '🎯',
    leetcode: '💻',
    codechef: '🔥',
    codeforces: '⚡',
    atcoder: '🌟'
  };

  const platformColors: Record<string, string> = {
    striver: 'from-blue-500 to-blue-600',
    leetcode: 'from-yellow-500 to-orange-500',
    codechef: 'from-amber-600 to-orange-600',
    codeforces: 'from-red-500 to-red-600',
    atcoder: 'from-gray-600 to-gray-800'
  };

  useEffect(() => {
    fetchDailyLogs();
    fetchTodayLog();
  }, [profile, selectedDate]);

  const fetchDailyLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/daily-logs/${profile}`);
      if (response.data.success) {
        setDailyLogs(response.data.data);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching daily logs:', err);
      setError(err.response?.data?.error || 'Failed to fetch daily logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayLog = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/daily-logs/${profile}/${selectedDate}`);
      if (response.data.success && response.data.data) {
        setTodayLog(response.data.data);
        setNotes(response.data.data.notes || '');
      } else {
        setTodayLog(null);
        setNotes('');
      }
    } catch (err: any) {
      console.error('Error fetching today log:', err);
      setTodayLog(null);
    }
  };

  const incrementPlatform = async (platform: string) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/daily-logs/${profile}/${selectedDate}/increment`,
        { platform }
      );
      if (response.data.success) {
        setTodayLog(response.data.data);
        fetchDailyLogs();
      }
    } catch (err: any) {
      console.error('Error incrementing:', err);
      setError(err.response?.data?.error || 'Failed to update');
    }
  };

  const updateNotes = async () => {
    if (!todayLog) return;
    
    try {
      const response = await axios.put(
        `${API_BASE_URL}/daily-logs/${profile}/${todayLog.id}`,
        { notes }
      );
      if (response.data.success) {
        setTodayLog(response.data.data);
        fetchDailyLogs();
        setEditingNotes(false);
      }
    } catch (err: any) {
      console.error('Error updating notes:', err);
      setError(err.response?.data?.error || 'Failed to update notes');
    }
  };

  const deleteLog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this log?')) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/daily-logs/${profile}/${id}`);
      if (response.data.success) {
        setDailyLogs(dailyLogs.filter(log => log.id !== id));
        if (todayLog?.id === id) {
          setTodayLog(null);
        }
      }
    } catch (err: any) {
      console.error('Error deleting daily log:', err);
      setError(err.response?.data?.error || 'Failed to delete daily log');
    }
  };

  const calculateTotal = (log: DailyLogPiyush) => {
    return log.striver + log.leetcode + log.codechef + log.codeforces + log.atcoder;
  };

  const calculateWeekly = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return dailyLogs
      .filter(log => new Date(log.date) >= oneWeekAgo)
      .reduce((sum, log) => {
        if (profile === 'piyush') {
          return sum + calculateTotal(log as DailyLogPiyush);
        } else {
          const shrutiLog = log as DailyLogShruti;
          return sum + shrutiLog.python_questions_solved + shrutiLog.sql_questions_solved;
        }
      }, 0);
  };

  const calculateOverall = () => {
    return dailyLogs.reduce((sum, log) => {
      if (profile === 'piyush') {
        return sum + calculateTotal(log as DailyLogPiyush);
      } else {
        const shrutiLog = log as DailyLogShruti;
        return sum + shrutiLog.python_questions_solved + shrutiLog.sql_questions_solved;
      }
    }, 0);
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

  // Only show Piyush profile content
  if (profile !== 'piyush') {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
          <Calendar className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Daily Question Tracker</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {/* Date Selector */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Platform Counters */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" />
          {new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((platform) => {
            const count = todayLog?.[platform as keyof DailyLogPiyush] || 0;
            return (
              <div
                key={platform}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{platformEmojis[platform]}</span>
                    <span className="font-semibold text-gray-800">{platformLabels[platform]}</span>
                  </div>
                  <div className={`px-4 py-2 bg-gradient-to-r ${platformColors[platform]} text-white rounded-full text-xl font-bold shadow-sm`}>
                    {count}
                  </div>
                </div>
                <button
                  onClick={() => incrementPlatform(platform)}
                  className={`w-full py-3 bg-gradient-to-r ${platformColors[platform]} text-white rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 font-semibold shadow-md`}
                >
                  <Plus className="w-5 h-5" />
                  Add Question
                </button>
              </div>
            );
          })}
        </div>

        {/* Total Display */}
        {todayLog && (
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-xl">
            <div className="text-center">
              <p className="text-sm font-medium opacity-90 mb-2">Total Questions Today</p>
              <p className="text-6xl font-bold">{calculateTotal(todayLog)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-bold text-gray-800">Daily Notes</label>
          {!editingNotes ? (
            <button
              onClick={() => setEditingNotes(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={updateNotes}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-all"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => {
                  setEditingNotes(false);
                  setNotes(todayLog?.notes || '');
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-all"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        ) : (
          <p className="text-gray-700 italic">
            {notes || 'No notes for this day. Click Edit to add notes.'}
          </p>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <p className="text-sm font-semibold text-purple-800">Last 7 Days</p>
          </div>
          <p className="text-4xl font-bold text-purple-900">{calculateWeekly()}</p>
          <p className="text-xs text-purple-600 mt-1">questions solved</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-blue-600" />
            <p className="text-sm font-semibold text-blue-800">All Time Total</p>
          </div>
          <p className="text-4xl font-bold text-blue-900">{calculateOverall()}</p>
          <p className="text-xs text-blue-600 mt-1">questions solved</p>
        </div>
      </div>

      {/* Logs History */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-5">History</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {dailyLogs.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Calendar className="w-20 h-20 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No logs yet. Start tracking today!</p>
            </div>
          ) : (
            dailyLogs.map((log) => {
              const piyushLog = log as DailyLogPiyush;
              const total = calculateTotal(piyushLog);
              return (
                <div key={log.id} className="p-5 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <p className="font-bold text-lg text-gray-900">
                          {new Date(log.date).toLocaleDateString('en-US', { 
                            weekday: 'short',
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold rounded-full">
                          {total} total
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                        {platforms.map(platform => {
                          const count = piyushLog[platform as keyof DailyLogPiyush];
                          return count > 0 ? (
                            <span key={platform} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
                              <span>{platformEmojis[platform]}</span>
                              {platformLabels[platform]}: {count}
                            </span>
                          ) : null;
                        })}
                      </div>
                      {log.notes && (
                        <p className="text-sm text-gray-600 italic mt-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                          📝 {log.notes}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyLogs;