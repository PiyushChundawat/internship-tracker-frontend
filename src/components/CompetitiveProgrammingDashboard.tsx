import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
      
      // Fetch CP ratings
      const ratingsResponse = await axios.get(`${API_BASE_URL}/cp-ratings`);
      if (ratingsResponse.data.success) {
        setRatings(ratingsResponse.data.data);
      }

      // Fetch recent contest logs (last 5)
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

  const startEdit = (platform: string, currentRating: number) => {
    setEditingPlatform(platform);
    setEditingRating(currentRating);
  };

  const cancelEdit = () => {
    setEditingPlatform(null);
    setEditingRating(0);
  };

  const saveEdit = (platform: string) => {
    handleUpdateRating(platform, editingRating);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-pink-500">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-pink-500">
      <h2 className="text-xl font-bold mb-4 text-pink-800 flex items-center">
        <span className="w-3 h-3 bg-pink-500 rounded-full mr-2"></span>
        Competitive Programming Dashboard
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* CP Ratings Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-pink-700">Current Ratings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ratings.length === 0 ? (
            <div className="col-span-3 text-gray-500 text-center py-4">
              No ratings yet. Add ratings for Codeforces, LeetCode, and CodeChef!
            </div>
          ) : (
            ratings.map((rating) => (
              <div key={rating.platform} className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                <h4 className="font-semibold text-pink-800 mb-2">{rating.platform}</h4>
                {editingPlatform === rating.platform ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editingRating}
                      onChange={(e) => setEditingRating(parseInt(e.target.value) || 0)}
                      className="w-24 px-2 py-1 border rounded text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(rating.platform)}
                      className="text-green-600 hover:text-green-800 text-xs"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-600 hover:text-gray-800 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-pink-600">{rating.rating}</p>
                    <button
                      onClick={() => startEdit(rating.platform, rating.rating)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                )}
                <p className="text-xs text-pink-500 mt-1">
                  Updated: {new Date(rating.updated_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Contests Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-pink-700">Recent Contests</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentContests.length === 0 ? (
            <div className="col-span-2 text-gray-500 text-center py-4">
              No contest logs yet. Add your contest performance!
            </div>
          ) : (
            recentContests.map((contest) => (
              <div key={contest.id} className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                <h4 className="font-semibold text-pink-800">{contest.platform}</h4>
                <p className="text-sm text-pink-700 font-medium">{contest.contest_name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-pink-600">
                    Solved: <span className="font-bold">{contest.problems_solved}/{contest.total_problems}</span>
                  </p>
                  <p className="text-xs text-pink-500">
                    {new Date(contest.date).toLocaleDateString()}
                  </p>
                </div>
                {contest.notes && (
                  <p className="text-xs text-gray-600 mt-2 italic">{contest.notes}</p>
                )}
              </div>
            ))
          )}
        </div>
        {recentContests.length > 0 && (
          <div className="mt-4 text-center">
            <a
              href="#contests"
              className="text-sm text-pink-600 hover:underline"
            >
              View all contest logs →
            </a>
          </div>
        )}
      </div>

      {/* Static Contest Schedule (can be made dynamic later) */}
      <div className="mt-6 pt-6 border-t border-pink-200">
        <h3 className="text-lg font-semibold mb-3 text-pink-700">Regular Contest Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
            <h4 className="font-semibold text-pink-800">Codeforces - Div 2</h4>
            <p className="text-pink-600">Usually Friday-Sunday at 8:05 PM IST</p>
          </div>
          <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
            <h4 className="font-semibold text-pink-800">LeetCode Weekly</h4>
            <p className="text-pink-600">Every Sunday at 8:00 AM IST</p>
          </div>
          <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
            <h4 className="font-semibold text-pink-800">LeetCode Biweekly</h4>
            <p className="text-pink-600">Every 2 weeks Saturday at 8:00 PM IST</p>
          </div>
          <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
            <h4 className="font-semibold text-pink-800">CodeChef Starters</h4>
            <p className="text-pink-600">Every Wednesday at 8:00 PM IST</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitiveProgrammingDashboard;