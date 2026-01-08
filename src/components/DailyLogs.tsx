import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Minus, Calendar, TrendingUp, Target } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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

  const platforms = ['striver', 'leetcode', 'codechef', 'codeforces', 'atcoder'];
  const platformLabels: Record<string, string> = {
    striver: 'Striver',
    leetcode: 'LeetCode',
    codechef: 'CodeChef',
    codeforces: 'Codeforces',
    atcoder: 'AtCoder'
  };

  const platformColors: Record<string, string> = {
    striver: 'from-blue-500 to-blue-600',
    leetcode: 'from-yellow-500 to-orange-500',
    codechef: 'from-amber-600 to-amber-700',
    codeforces: 'from-red-500 to-red-600',
    atcoder: 'from-gray-600 to-gray-700'
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

  const calculateWeekly = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return dailyLogs
      .filter(log => new Date(log.date) >= oneWeekAgo)
      .reduce((sum, log) => {
        if (profile === 'piyush') {
          return sum + (log as DailyLogPiyush).total;
        } else {
          const shrutiLog = log as DailyLogShruti;
          return sum + shrutiLog.python_questions_solved + shrutiLog.sql_questions_solved;
        }
      }, 0);
  };

  const calculateTotal = () => {
    return dailyLogs.reduce((sum, log) => {
      if (profile === 'piyush') {
        return sum + (log as DailyLogPiyush).total;
      } else {
        const shrutiLog = log as DailyLogShruti;
        return sum + shrutiLog.python_questions_solved + shrutiLog.sql_questions_solved;
      }
    }, 0);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-2xl border border-purple-200">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-purple-200 rounded w-1/3"></div>
          <div className="h-48 bg-purple-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-2xl border border-purple-200">
      <h2 className="text-3xl font-bold mb-6 text-purple-900 flex items-center gap-3">
        <Calendar className="w-8 h-8 text-purple-600" />
        Daily Question Logs
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Date Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-purple-700 mb-2">Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full md:w-auto px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all"
        />
      </div>

      {/* Platform Counters (Piyush only) */}
      {profile === 'piyush' && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
            <Target className="w-6 h-6" />
            Platform Counters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform) => (
              <div
                key={platform}
                className="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-100 hover:shadow-xl transition-all"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-gray-700">{platformLabels[platform]}</span>
                  <div className={`px-3 py-1 bg-gradient-to-r ${platformColors[platform]} text-white rounded-full text-xl font-bold`}>
                    {todayLog?.[platform as keyof DailyLogPiyush] || 0}
                  </div>
                </div>
                <button
                  onClick={() => incrementPlatform(platform)}
                  className={`w-full py-3 bg-gradient-to-r ${platformColors[platform]} text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 font-semibold shadow-md`}
                >
                  <Plus className="w-5 h-5" />
                  Add Question
                </button>
              </div>
            ))}
          </div>

          {/* Total Display */}
          {todayLog && (
            <div className="mt-6 p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-xl">
              <div className="text-center">
                <p className="text-sm font-medium opacity-90 mb-1">Total Questions Today</p>
                <p className="text-5xl font-bold">{todayLog.total}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notes Section */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-purple-700 mb-2">Notes</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={updateNotes}
            placeholder="Add notes for this day..."
            className="flex-1 px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-purple-100">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <p className="text-sm font-semibold text-purple-600">Weekly Total (Last 7 Days)</p>
          </div>
          <p className="text-4xl font-bold text-purple-900">{calculateWeekly()}</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-pink-100">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-pink-600" />
            <p className="text-sm font-semibold text-pink-600">Overall Total</p>
          </div>
          <p className="text-4xl font-bold text-pink-900">{calculateTotal()}</p>
        </div>
      </div>

      {/* Logs History */}
      <div>
        <h3 className="text-xl font-bold text-purple-800 mb-4">History</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {dailyLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No daily logs yet. Start tracking today!</p>
            </div>
          ) : (
            dailyLogs.map((log) => (
              <div key={log.id} className="p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-purple-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-bold text-lg text-purple-900 mb-2">
                      {new Date(log.date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                    {profile === 'piyush' ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                        {platforms.map(platform => {
                          const count = (log as DailyLogPiyush)[platform as keyof DailyLogPiyush];
                          return count > 0 ? (
                            <span key={platform} className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                              {platformLabels[platform]}: {count}
                            </span>
                          ) : null;
                        })}
                        <span className="text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full font-bold">
                          Total: {(log as DailyLogPiyush).total}
                        </span>
                      </div>
                    ) : (
                      <div className="flex gap-2 mb-2">
                        <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                          Python: {(log as DailyLogShruti).python_questions_solved}
                        </span>
                        <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                          SQL: {(log as DailyLogShruti).sql_questions_solved}
                        </span>
                      </div>
                    )}
                    {log.notes && (
                      <p className="text-sm text-gray-600 italic mt-2">
                        📝 {log.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteLog(log.id)}
                    className="ml-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                  >
                    Delete
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
