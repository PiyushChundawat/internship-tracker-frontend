import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface A2ZProgress {
  id: string;
  easy_total: number;
  easy_solved: number;
  medium_total: number;
  medium_solved: number;
  hard_total: number;
  hard_solved: number;
}

interface Blind75Question {
  id: string;
  question_name: string;
  solution_link: string | null;
  completed: boolean;
}

const DSAProgressTracker: React.FC = () => {
  const [a2zProgress, setA2zProgress] = useState<A2ZProgress | null>(null);
  const [blind75, setBlind75] = useState<Blind75Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingA2Z, setEditingA2Z] = useState(false);
  const [tempA2Z, setTempA2Z] = useState<A2ZProgress | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch A2Z Progress
      const a2zResponse = await axios.get(`${API_BASE_URL}/a2z-progress`);
      if (a2zResponse.data.success) {
        setA2zProgress(a2zResponse.data.data);
        setTempA2Z(a2zResponse.data.data);
      }

      // Fetch Blind75
      const blind75Response = await axios.get(`${API_BASE_URL}/blind75`);
      if (blind75Response.data.success) {
        setBlind75(blind75Response.data.data);
      }

      setError(null);
    } catch (err: any) {
      console.error('Error fetching DSA progress:', err);
      setError(err.response?.data?.error || 'Failed to fetch DSA progress');
    } finally {
      setLoading(false);
    }
  };

  const updateA2ZProgress = async () => {
    if (!tempA2Z) return;

    try {
      const response = await axios.put(`${API_BASE_URL}/a2z-progress`, tempA2Z);
      if (response.data.success) {
        setA2zProgress(response.data.data);
        setEditingA2Z(false);
      }
    } catch (err: any) {
      console.error('Error updating A2Z progress:', err);
      setError(err.response?.data?.error || 'Failed to update A2Z progress');
    }
  };

  const toggleBlind75Completion = async (id: string, currentStatus: boolean) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/blind75/${id}`, {
        completed: !currentStatus
      });
      if (response.data.success) {
        setBlind75(blind75.map(q => q.id === id ? response.data.data : q));
      }
    } catch (err: any) {
      console.error('Error updating Blind75:', err);
      setError(err.response?.data?.error || 'Failed to update question');
    }
  };

  const calculatePercent = (solved: number, total: number) => 
    total > 0 ? Math.round((solved / total) * 100) : 0;

  const calculateOverall = () => {
    if (!a2zProgress) return 0;
    const totalSolved = a2zProgress.easy_solved + a2zProgress.medium_solved + a2zProgress.hard_solved;
    const totalQuestions = a2zProgress.easy_total + a2zProgress.medium_total + a2zProgress.hard_total;
    return totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0;
  };

  const ProgressBar: React.FC<{ label: string; solved: number; total: number; color: string }> = 
    ({ label, solved, total, color }) => {
      const percent = calculatePercent(solved, total);
      return (
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <span className="text-sm font-medium text-gray-700">
              {solved} / {total} ({percent}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${color} transition-all duration-300`} 
              style={{ width: `${percent}%` }}
            ></div>
          </div>
        </div>
      );
    };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-orange-500">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!a2zProgress) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-orange-500">
        <h2 className="text-xl font-bold mb-4 text-orange-800">DSA Progress Tracker</h2>
        <p className="text-gray-500">No progress data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-orange-500">
      <h2 className="text-xl font-bold mb-4 text-orange-800 flex items-center">
        <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
        DSA Progress Tracker
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* A2Z Striver Sheet Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-orange-700">A2Z Striver Sheet</h3>
          <button
            onClick={() => {
              if (editingA2Z) {
                updateA2ZProgress();
              } else {
                setEditingA2Z(true);
              }
            }}
            className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            {editingA2Z ? 'Save' : 'Edit Progress'}
          </button>
        </div>

        {editingA2Z && tempA2Z ? (
          <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="grid grid-cols-3 gap-4">
              {/* Easy */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Easy Solved</label>
                <input
                  type="number"
                  value={tempA2Z.easy_solved}
                  onChange={(e) => setTempA2Z({ ...tempA2Z, easy_solved: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1 text-sm border rounded"
                  min="0"
                  max={tempA2Z.easy_total}
                />
                <label className="block text-xs font-medium text-gray-700 mt-2 mb-1">Easy Total</label>
                <input
                  type="number"
                  value={tempA2Z.easy_total}
                  onChange={(e) => setTempA2Z({ ...tempA2Z, easy_total: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1 text-sm border rounded"
                  min="0"
                />
              </div>
              {/* Medium */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Medium Solved</label>
                <input
                  type="number"
                  value={tempA2Z.medium_solved}
                  onChange={(e) => setTempA2Z({ ...tempA2Z, medium_solved: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1 text-sm border rounded"
                  min="0"
                  max={tempA2Z.medium_total}
                />
                <label className="block text-xs font-medium text-gray-700 mt-2 mb-1">Medium Total</label>
                <input
                  type="number"
                  value={tempA2Z.medium_total}
                  onChange={(e) => setTempA2Z({ ...tempA2Z, medium_total: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1 text-sm border rounded"
                  min="0"
                />
              </div>
              {/* Hard */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Hard Solved</label>
                <input
                  type="number"
                  value={tempA2Z.hard_solved}
                  onChange={(e) => setTempA2Z({ ...tempA2Z, hard_solved: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1 text-sm border rounded"
                  min="0"
                  max={tempA2Z.hard_total}
                />
                <label className="block text-xs font-medium text-gray-700 mt-2 mb-1">Hard Total</label>
                <input
                  type="number"
                  value={tempA2Z.hard_total}
                  onChange={(e) => setTempA2Z({ ...tempA2Z, hard_total: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1 text-sm border rounded"
                  min="0"
                />
              </div>
            </div>
            <button
              onClick={() => {
                setEditingA2Z(false);
                setTempA2Z(a2zProgress);
              }}
              className="mt-3 px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        ) : null}

        <ProgressBar 
          label="Easy" 
          solved={a2zProgress.easy_solved} 
          total={a2zProgress.easy_total} 
          color="bg-green-500" 
        />
        <ProgressBar 
          label="Medium" 
          solved={a2zProgress.medium_solved} 
          total={a2zProgress.medium_total} 
          color="bg-yellow-500" 
        />
        <ProgressBar 
          label="Hard" 
          solved={a2zProgress.hard_solved} 
          total={a2zProgress.hard_total} 
          color="bg-red-500" 
        />
        
        <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-lg font-medium text-orange-800">
            Overall: {calculateOverall()}%
          </p>
        </div>
      </div>

      {/* Blind 75 Tracker Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-orange-700">
          Blind 75 Tracker ({blind75.filter(q => q.completed).length} / {blind75.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {blind75.length === 0 ? (
            <div className="col-span-2 text-gray-500 text-center py-8">
              No Blind75 questions yet. Add questions to track!
            </div>
          ) : (
            blind75.map((item) => (
              <div 
                key={item.id} 
                className={`p-3 rounded-lg border transition duration-200 ${
                  item.completed 
                    ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                    : 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`font-medium ${item.completed ? 'text-green-800 line-through' : 'text-orange-800'}`}>
                      {item.question_name}
                    </h4>
                    {item.solution_link && (
                      <a 
                        href={item.solution_link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Solution Link →
                      </a>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleBlind75Completion(item.id, item.completed)}
                    className="mt-1 h-5 w-5 text-green-600 cursor-pointer"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DSAProgressTracker;