import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface CPRating {
  id: string;
  platform: string;
  rating: number;
  updated_at: string;
}

const RatingTracker: React.FC = () => {
  const [ratings, setRatings] = useState<{ [key: string]: number }>({
    codeforces: 0,
    leetcode: 0,
    codechef: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/cp-ratings`);
      if (response.data.success) {
        const ratingsMap: { [key: string]: number } = {};
        response.data.data.forEach((r: CPRating) => {
          ratingsMap[r.platform.toLowerCase()] = r.rating;
        });
        
        setRatings({
          codeforces: ratingsMap['codeforces'] || 0,
          leetcode: ratingsMap['leetcode'] || 0,
          codechef: ratingsMap['codechef'] || 0,
        });
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching ratings:', err);
      setError(err.response?.data?.error || 'Failed to fetch ratings');
    } finally {
      setLoading(false);
    }
  };

  const updateRating = async (platform: string, value: string) => {
    const numValue = parseInt(value) || 0;
    
    setRatings(prev => ({ ...prev, [platform]: numValue }));

    try {
      const response = await axios.put(`${API_BASE_URL}/cp-ratings/${platform}`, {
        rating: numValue
      });
      
      if (response.data.success) {
        // Update confirmed
      }
    } catch (err: any) {
      console.error('Error updating rating:', err);
      setError(err.response?.data?.error || 'Failed to update rating');
      fetchRatings();
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-6">
            <div className="h-24 bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-purple-500" />
        Rating Tracker
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <label className="block text-sm font-medium text-gray-400 mb-2">Codeforces</label>
          <input
            type="number"
            value={ratings.codeforces}
            onChange={(e) => updateRating('codeforces', e.target.value)}
            className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-center text-xl font-bold text-white focus:outline-none focus:border-blue-500"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-2">
            {ratings.codeforces >= 1400 && ratings.codeforces < 1600 && 'Specialist'}
            {ratings.codeforces >= 1600 && ratings.codeforces < 1900 && 'Expert'}
            {ratings.codeforces >= 1900 && ratings.codeforces < 2100 && 'Candidate Master'}
            {ratings.codeforces >= 2100 && ratings.codeforces < 2300 && 'Master'}
            {ratings.codeforces >= 2300 && 'International Master+'}
          </p>
        </div>

        <div className="text-center">
          <label className="block text-sm font-medium text-gray-400 mb-2">LeetCode</label>
          <input
            type="number"
            value={ratings.leetcode}
            onChange={(e) => updateRating('leetcode', e.target.value)}
            className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-center text-xl font-bold text-white focus:outline-none focus:border-blue-500"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-2">
            {ratings.leetcode < 1500 && 'Working towards Guardian'}
            {ratings.leetcode >= 1500 && ratings.leetcode < 1800 && 'Guardian'}
            {ratings.leetcode >= 1800 && ratings.leetcode < 2200 && 'Knight'}
            {ratings.leetcode >= 2200 && 'Guardian+'}
          </p>
        </div>

        <div className="text-center">
          <label className="block text-sm font-medium text-gray-400 mb-2">CodeChef</label>
          <input
            type="number"
            value={ratings.codechef}
            onChange={(e) => updateRating('codechef', e.target.value)}
            className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-center text-xl font-bold text-white focus:outline-none focus:border-blue-500"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-2">
            {ratings.codechef < 1400 && '1★'}
            {ratings.codechef >= 1400 && ratings.codechef < 1600 && '2★'}
            {ratings.codechef >= 1600 && ratings.codechef < 1800 && '3★'}
            {ratings.codechef >= 1800 && ratings.codechef < 2000 && '4★'}
            {ratings.codechef >= 2000 && ratings.codechef < 2200 && '5★'}
            {ratings.codechef >= 2200 && ratings.codechef < 2500 && '6★'}
            {ratings.codechef >= 2500 && '7★'}
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
        <p className="text-sm text-gray-400">
          <TrendingUp className="w-4 h-4 inline mr-1 text-purple-500" />
          <strong className="text-white">Tip:</strong> Update your ratings after each contest to track your progress over time!
        </p>
      </div>
    </div>
  );
};

export default RatingTracker;
