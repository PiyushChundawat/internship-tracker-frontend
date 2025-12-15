import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface DailyLogPiyush {
  id: string;
  date: string;
  dsa_questions_solved: number;
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
  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split('T')[0],
    dsa_questions_solved: 0,
    python_questions_solved: 0,
    sql_questions_solved: 0,
    notes: '',
  });

  useEffect(() => {
    fetchDailyLogs();
  }, [profile]);

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

  const addLog = async () => {
    if (!newLog.date) return;

    try {
      const logData = profile === 'piyush'
        ? {
            date: newLog.date,
            dsa_questions_solved: newLog.dsa_questions_solved,
            notes: newLog.notes || null,
          }
        : {
            date: newLog.date,
            python_questions_solved: newLog.python_questions_solved,
            sql_questions_solved: newLog.sql_questions_solved,
            notes: newLog.notes || null,
          };

      const response = await axios.post(`${API_BASE_URL}/daily-logs/${profile}`, logData);
      
      if (response.data.success) {
        setDailyLogs([response.data.data, ...dailyLogs]);
        setNewLog({
          date: new Date().toISOString().split('T')[0],
          dsa_questions_solved: 0,
          python_questions_solved: 0,
          sql_questions_solved: 0,
          notes: '',
        });
      }
    } catch (err: any) {
      console.error('Error adding daily log:', err);
      setError(err.response?.data?.error || 'Failed to add daily log');
    }
  };

  const deleteLog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this log?')) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/daily-logs/${profile}/${id}`);
      if (response.data.success) {
        setDailyLogs(dailyLogs.filter(log => log.id !== id));
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
          return sum + (log as DailyLogPiyush).dsa_questions_solved;
        } else {
          const shrutiLog = log as DailyLogShruti;
          return sum + shrutiLog.python_questions_solved + shrutiLog.sql_questions_solved;
        }
      }, 0);
  };

  const calculateTotal = () => {
    return dailyLogs.reduce((sum, log) => {
      if (profile === 'piyush') {
        return sum + (log as DailyLogPiyush).dsa_questions_solved;
      } else {
        const shrutiLog = log as DailyLogShruti;
        return sum + shrutiLog.python_questions_solved + shrutiLog.sql_questions_solved;
      }
    }, 0);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-purple-500">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-purple-500">
      <h2 className="text-xl font-bold mb-4 text-purple-800 flex items-center">
        <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
        Daily Logs
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Add Entry Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <input
          type="date"
          value={newLog.date}
          onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        
        {profile === 'piyush' ? (
          <input
            type="number"
            placeholder="DSA Questions"
            value={newLog.dsa_questions_solved || ''}
            onChange={(e) => setNewLog({ ...newLog, dsa_questions_solved: parseInt(e.target.value) || 0 })}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            min="0"
          />
        ) : (
          <>
            <input
              type="number"
              placeholder="Python Questions"
              value={newLog.python_questions_solved || ''}
              onChange={(e) => setNewLog({ ...newLog, python_questions_solved: parseInt(e.target.value) || 0 })}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              min="0"
            />
            <input
              type="number"
              placeholder="SQL Questions"
              value={newLog.sql_questions_solved || ''}
              onChange={(e) => setNewLog({ ...newLog, sql_questions_solved: parseInt(e.target.value) || 0 })}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              min="0"
            />
          </>
        )}
        
        <input
          type="text"
          placeholder="Notes"
          value={newLog.notes}
          onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        
        <button 
          onClick={addLog} 
          className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 font-medium"
        >
          Add Entry
        </button>
      </div>

      {/* Summary Stats */}
      <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-purple-600 mb-1">Weekly Total (Last 7 Days)</p>
            <p className="text-2xl font-bold text-purple-800">{calculateWeekly()}</p>
          </div>
          <div>
            <p className="text-sm text-purple-600 mb-1">Overall Total</p>
            <p className="text-2xl font-bold text-purple-800">{calculateTotal()}</p>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <ul className="space-y-2">
        {dailyLogs.length === 0 ? (
          <li className="text-gray-500 text-center py-8">
            No daily logs yet. Add your first entry!
          </li>
        ) : (
          dailyLogs.map((log) => (
            <li key={log.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-start hover:bg-gray-100">
              <div className="flex-1">
                <strong className="text-gray-800">
                  {new Date(log.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}:
                </strong>
                {profile === 'piyush' ? (
                  <span className="ml-2">
                    DSA: <span className="font-semibold">{(log as DailyLogPiyush).dsa_questions_solved}</span>
                  </span>
                ) : (
                  <span className="ml-2">
                    Python: <span className="font-semibold">{(log as DailyLogShruti).python_questions_solved}</span>, 
                    SQL: <span className="font-semibold">{(log as DailyLogShruti).sql_questions_solved}</span>
                  </span>
                )}
                {log.notes && (
                  <span className="block text-gray-600 text-sm mt-1">
                    📝 {log.notes}
                  </span>
                )}
              </div>
              <button
                onClick={() => deleteLog(log.id)}
                className="ml-4 text-red-500 hover:text-red-700 text-sm"
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

export default DailyLogs;