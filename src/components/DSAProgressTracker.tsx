import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, CheckSquare, Square, Plus, ExternalLink, Youtube, Trash2 } from 'lucide-react';

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
  tutorial_link: string | null;
  completed: boolean;
}

const DSAProgressTracker: React.FC = () => {
  const [a2zProgress, setA2zProgress] = useState<A2ZProgress | null>(null);
  const [blind75, setBlind75] = useState<Blind75Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingA2Z, setEditingA2Z] = useState(false);
  const [tempA2Z, setTempA2Z] = useState<A2ZProgress | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question_name: '',
    solution_link: '',
    tutorial_link: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const a2zResponse = await axios.get(`${API_BASE_URL}/a2z-progress`);
      if (a2zResponse.data.success) {
        setA2zProgress(a2zResponse.data.data);
        setTempA2Z(a2zResponse.data.data);
      }

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

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.question_name.trim()) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/blind75`, newQuestion);
      if (response.data.success) {
        setBlind75([...blind75, response.data.data]);
        setNewQuestion({ question_name: '', solution_link: '', tutorial_link: '' });
        setIsAddingQuestion(false);
      }
    } catch (err: any) {
      console.error('Error adding question:', err);
      setError(err.response?.data?.error || 'Failed to add question');
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

  const deleteBlind75Question = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/blind75/${id}`);
      if (response.data.success) {
        setBlind75(blind75.filter(q => q.id !== id));
      }
    } catch (err: any) {
      console.error('Error deleting question:', err);
      setError(err.response?.data?.error || 'Failed to delete question');
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
          <div className="flex justify-between mb-2">
            <span className="text-sm font-bold text-gray-800">{label}</span>
            <span className="text-sm font-bold text-gray-800">
              {solved} / {total} <span className="text-gray-500">({percent}%)</span>
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
            <div 
              className={`h-4 rounded-full ${color} transition-all duration-500 shadow-md`} 
              style={{ width: `${percent}%` }}
            ></div>
          </div>
        </div>
      );
    };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl shadow-2xl border border-orange-200">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-orange-200 rounded w-1/3"></div>
          <div className="h-48 bg-orange-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!a2zProgress) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl shadow-2xl border border-orange-200">
        <h2 className="text-3xl font-bold text-orange-900">DSA Progress Tracker</h2>
        <p className="text-gray-500 mt-4">No progress data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl shadow-2xl border border-orange-200">
      <h2 className="text-3xl font-bold mb-6 text-orange-900 flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-orange-600" />
        DSA Progress Tracker
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* A2Z Striver Sheet Section */}
      <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border-2 border-orange-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-orange-800">A2Z Striver Sheet</h3>
          <button
            onClick={() => {
              if (editingA2Z) {
                updateA2ZProgress();
              } else {
                setEditingA2Z(true);
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold shadow-md"
          >
            {editingA2Z ? 'Save Progress' : 'Edit Progress'}
          </button>
        </div>

        {editingA2Z && tempA2Z ? (
          <div className="mb-6 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Easy Solved</label>
                <input
                  type="number"
                  value={tempA2Z.easy_solved}
                  onChange={(e) => setTempA2Z({ ...tempA2Z, easy_solved: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  min="0"
                  max={tempA2Z.easy_total}
                />
                <label className="block text-xs font-bold text-gray-700 mt-2 mb-1">Easy Total</label>
                <input
                  type="number"
                  value={tempA2Z.easy_total}
                  onChange={(e) => setTempA2Z({ ...tempA2Z, easy_total: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Medium Solved</label>
                <input
                  type="number"
                  value={tempA2Z.medium_solved}
                  onChange={(e) => setTempA2Z({ ...tempA2Z, medium_solved: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  min="0"
                  max={tempA2Z.medium_total}
                />
                <label className="block text-xs font-bold text-gray-700 mt-2 mb-1">Medium Total</label>
                <input
                  type="number"
                  value={tempA2Z.medium_total}
                  onChange={(e) => setTempA2Z({ ...tempA2Z, medium_total: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Hard Solved</label>
                <input
                  type="number"
                  value={tempA2Z.hard_solved}
                  onChange={(e) => setTempA2Z({ ...tempA2Z, hard_solved: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  min="0"
                  max={tempA2Z.hard_total}
                />
                <label className="block text-xs font-bold text-gray-700 mt-2 mb-1">Hard Total</label>
                <input
                  type="number"
                  value={tempA2Z.hard_total}
                  onChange={(e) => setTempA2Z({ ...tempA2Z, hard_total: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  min="0"
                />
              </div>
            </div>
            <button
              onClick={() => {
                setEditingA2Z(false);
                setTempA2Z(a2zProgress);
              }}
              className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all font-semibold"
            >
              Cancel
            </button>
          </div>
        ) : null}

        <ProgressBar 
          label="Easy" 
          solved={a2zProgress.easy_solved} 
          total={a2zProgress.easy_total} 
          color="bg-gradient-to-r from-green-400 to-green-500" 
        />
        <ProgressBar 
          label="Medium" 
          solved={a2zProgress.medium_solved} 
          total={a2zProgress.medium_total} 
          color="bg-gradient-to-r from-yellow-400 to-orange-400" 
        />
        <ProgressBar 
          label="Hard" 
          solved={a2zProgress.hard_solved} 
          total={a2zProgress.hard_total} 
          color="bg-gradient-to-r from-red-500 to-red-600" 
        />
        
        <div className="mt-6 p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-xl">
          <p className="text-sm font-semibold opacity-90 mb-1">Overall Progress</p>
          <p className="text-5xl font-bold">{calculateOverall()}%</p>
        </div>
      </div>

      {/* Blind 75 Tracker Section */}
      <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-orange-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-orange-800 flex items-center gap-2">
            Blind 75 Tracker 
            <span className="text-lg font-normal text-gray-600">
              ({blind75.filter(q => q.completed).length} / {blind75.length})
            </span>
          </h3>
          <button
            onClick={() => setIsAddingQuestion(!isAddingQuestion)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold shadow-md flex items-center gap-2"
          >
            {isAddingQuestion ? 'Cancel' : <><Plus className="w-5 h-5" /> Add Question</>}
          </button>
        </div>

        {isAddingQuestion && (
          <form onSubmit={handleAddQuestion} className="mb-6 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Question Name *</label>
                <input
                  type="text"
                  value={newQuestion.question_name}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question_name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  placeholder="Two Sum"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Solution Link (optional)</label>
                <input
                  type="url"
                  value={newQuestion.solution_link}
                  onChange={(e) => setNewQuestion({ ...newQuestion, solution_link: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  placeholder="https://leetcode.com/problems/two-sum/"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tutorial Video Link (optional)</label>
                <input
                  type="url"
                  value={newQuestion.tutorial_link}
                  onChange={(e) => setNewQuestion({ ...newQuestion, tutorial_link: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-md"
              >
                Add Question
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blind75.length === 0 ? (
            <div className="col-span-2 text-center py-16 text-gray-500">
              <BookOpen className="w-20 h-20 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No Blind75 questions yet. Add questions to start tracking!</p>
            </div>
          ) : (
            blind75.map((item) => (
              <div 
                key={item.id} 
                className={`p-4 rounded-xl border-2 transition-all shadow-md hover:shadow-lg ${
                  item.completed 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-white border-orange-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      onClick={() => toggleBlind75Completion(item.id, item.completed)}
                      className="flex-shrink-0"
                    >
                      {item.completed ? (
                        <CheckSquare className="w-6 h-6 text-green-600 cursor-pointer hover:text-green-700" />
                      ) : (
                        <Square className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-600" />
                      )}
                    </button>
                    <h4 className={`font-bold text-lg ${item.completed ? 'text-green-800 line-through' : 'text-orange-800'}`}>
                      {item.question_name}
                    </h4>
                  </div>
                  <button
                    onClick={() => deleteBlind75Question(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {item.solution_link && (
                    <a 
                      href={item.solution_link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full hover:bg-blue-200 transition-all"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Solution
                    </a>
                  )}
                  {item.tutorial_link && (
                    <a 
                      href={item.tutorial_link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full hover:bg-red-200 transition-all"
                    >
                      <Youtube className="w-3 h-3" />
                      Tutorial
                    </a>
                  )}
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
