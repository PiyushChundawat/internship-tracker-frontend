import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, Award, Calendar, Edit3, Save, X } from 'lucide-react';

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
      'codechef': 'text-amber-500',
      'codeforces': 'text-blue-500',
      'leetcode': 'text-yellow-500',
    };
    return colors[platform.toLowerCase()] || 'text-gray-500';
  };

  const getPlatformBadge = (platform: string) => {
    const badges: Record<string, string> = {
      'Codechef': 'bg-amber-600',
      'Codeforces': 'bg-blue-600',
      'LeetCode': 'bg-yellow-600',
    };
    return badges[platform] || 'bg-gray-600';
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-800 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
      <div className="flex items-center gap-3 mb-8">
        <Award className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-bold text-white">Competitive Programming</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-900 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Current Ratings */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Current Ratings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ratings.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-500">
              <Award className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-base">No ratings recorded yet</p>
            </div>
          ) : (
            ratings.map((rating) => (
              <div 
                key={rating.platform} 
                className="relative bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors group"
              >
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">{rating.platform}</h4>
                    {editingPlatform === rating.platform ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateRating(rating.platform, editingRating)}
                          className="p-1.5 text-green-400 hover:bg-green-900/20 rounded-lg transition-colors"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingPlatform(null)}
                          className="p-1.5 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingPlatform(rating.platform);
                          setEditingRating(rating.rating);
                        }}
                        className="p-1.5 text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {editingPlatform === rating.platform ? (
                    <input
                      type="number"
                      value={editingRating}
                      onChange={(e) => setEditingRating(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <p className={`text-4xl font-bold mb-2 ${getPlatformColor(rating.platform)}`}>
                      {rating.rating}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    Updated {new Date(rating.updated_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Contests */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-500" />
          Recent Contests
        </h3>
        <div className="space-y-4">
          {recentContests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-base">No contest logs yet</p>
            </div>
          ) : (
            recentContests.map((contest) => (
              <div 
                key={contest.id} 
                className="flex items-center justify-between p-5 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 ${getPlatformBadge(contest.platform)} text-white text-xs font-medium rounded`}>
                      {contest.platform}
                    </span>
                    <span className="font-medium text-white">{contest.contest_name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{new Date(contest.date).toLocaleDateString()}</span>
                    <span className="font-semibold text-white">
                      {contest.problems_solved}/{contest.total_problems}
                    </span>
                    {contest.total_problems > 0 && (
                      <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs font-medium rounded border border-blue-900">
                        {Math.round((contest.problems_solved / contest.total_problems) * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Contest Schedule */}
      <div className="mt-10 pt-8 border-t border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-5">Contest Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Codeforces Div 2', time: 'Fri-Sun at 8:05 PM IST' },
            { name: 'LeetCode Weekly', time: 'Every Sunday at 8:00 AM IST' },
            { name: 'LeetCode Biweekly', time: 'Every 2 weeks Sat at 8:00 PM IST' },
            { name: 'CodeChef Starters', time: 'Every Wednesday at 8:00 PM IST' }
          ].map((schedule, idx) => (
            <div key={idx} className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
              <h4 className="font-medium text-white mb-1">{schedule.name}</h4>
              <p className="text-sm text-gray-400">{schedule.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompetitiveProgrammingDashboard;
