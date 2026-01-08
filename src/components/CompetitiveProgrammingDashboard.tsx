import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, TrendingUp, Calendar, Edit3, Check, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface CPRating {
  id: string;
  platform: string;
  rating: number;
  updated_at: string;
}

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

const CompetitiveProgrammingDashboard: React.FC = () => {
  const [ratings, setRatings] = useState<CPRating[]>([]);
  const [recentContests, setRecentContests] = useState<ContestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [editingRating, setEditingRating] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const ratingsResponse = await axios.get(`${API_BASE_URL}/cp-ratings`);
      if (ratingsResponse.data.success) {
        setRatings(ratingsResponse.data.data);
      }

      const contestsResponse = await axios.get(`${API_BASE_URL}/contest-logs`);
      if (contestsResponse.data.success) {
        setRecentContests(contestsResponse.data.data.slice(0, 5));
      }

      setError(null);
    } catch (err: any) {
      console.error('Error fetching CP data:', err);
      setError(err.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRating = async (platform: string, newRating: number) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/cp-ratings/${platform}`, {
        rating: newRating
      });
      if (response.data.success) {
        setRatings(ratings.map(r => 
          r.platform === platform ? response.data.data : r
        ));
        setEditingPlatform(null);
      }
    } catch (err: any) {
      console.error('Error updating rating:', err);
      setError(err.response?.data?.error || 'Failed to update rating');
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      'codechef': 'from-amber-500 to-orange-600',
      'codeforces': 'from-blue-500 to-indigo-600',
      'leetcode': 'from-yellow-500 to-orange-500',
      'atcoder': 'from-gray-600 to-gray-800',
    };
    return colors[platform.toLowerCase()] || 'from-slate-500 to-slate-700';
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
          <Trophy className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">
          CP Dashboard
        </h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Current Ratings */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Current Ratings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ratings.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-slate-500">
              No ratings tracked yet. Update your ratings!
            </div>
          ) : (
            ratings.map((rating) => (
              <div key={rating.platform} className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-3 py-1 bg-gradient-to-r ${getPlatformColor(rating.platform)} text-white text-sm font-bold rounded-lg shadow-md`}>
                    {rating.platform}
                  </span>
                  {editingPlatform !== rating.platform && (
                    <button
                      onClick={() => {
                        setEditingPlatform(rating.platform);
                        setEditingRating(rating.rating);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {editingPlatform === rating.platform ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editingRating}
                      onChange={(e) => setEditingRating(parseInt(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xl"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateRating(rating.platform, editingRating)}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setEditingPlatform(null)}
                      className="p-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-4xl font-bold text-slate-800 mb-2">{rating.rating}</p>
                    <p className="text-xs text-slate-500">
                      Updated {new Date(rating.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Contests */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Recent Contests
        </h3>
        <div className="space-y-3">
          {recentContests.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No contest logs yet. Add your performance!
            </div>
          ) : (
            recentContests.map((contest) => (
              <div key={contest.id} className="bg-gradient-to-r from-slate-50 to-slate-100 p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 bg-gradient-to-r ${getPlatformColor(contest.platform)} text-white text-xs font-bold rounded-lg shadow-md`}>
                        {contest.platform}
                      </span>
                      {contest.upsolved && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-lg">
                          ✓ Upsolved
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1">{contest.contest_name}</h4>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>
                        <span className="font-bold text-blue-600">{contest.problems_solved}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span>{contest.total_problems}</span>
                      </span>
                      <span className="text-slate-400">•</span>
                      <span>{new Date(contest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {recentContests.length > 0 && (
          <div className="mt-4 text-center">
            <a href="#contests" className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
              View all contests →
            </a>
          </div>
        )}
      </div>

      {/* Contest Schedule */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">📅 Regular Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <p className="font-semibold text-slate-800 mb-1">Codeforces Div 2</p>
            <p className="text-sm text-slate-600">Fri-Sun • 8:05 PM IST</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <p className="font-semibold text-slate-800 mb-1">LeetCode Weekly</p>
            <p className="text-sm text-slate-600">Sunday • 8:00 AM IST</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <p className="font-semibold text-slate-800 mb-1">LeetCode Biweekly</p>
            <p className="text-sm text-slate-600">Alt Saturday • 8:00 PM IST</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <p className="font-semibold text-slate-800 mb-1">CodeChef Starters</p>
            <p className="text-sm text-slate-600">Wednesday • 8:00 PM IST</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitiveProgrammingDashboard;