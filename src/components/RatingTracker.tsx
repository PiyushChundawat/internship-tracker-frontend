import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);

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
        
        // Ensure all three platforms exist
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
    
    // Optimistic update
    setRatings(prev => ({ ...prev, [platform]: numValue }));

    try {
      const response = await axios.put(`${API_BASE_URL}/cp-ratings/${platform}`, {
        rating: numValue
      });
      
      if (response.data.success) {
        // Update confirmed
        setEditingPlatform(null);
      }
    } catch (err: any) {
      console.error('Error updating rating:', err);
      setError(err.response?.data?.error || 'Failed to update rating');
      // Revert on error
      fetchRatings();
    }
  };

  const handleBlur = (platform: string) => {
    setEditingPlatform(null);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-pink-500">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-6">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-pink-500">
      <h2 className="text-xl font-bold mb-4 text-pink-800 flex items-center">
        <span className="w-3 h-3 bg-pink-500 rounded-full mr-2"></span>
        Rating Tracker
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Codeforces */}
        <div className="text-center">
          <label className="block text-sm font-medium text-gray-700 mb-2">Codeforces</label>
          <input
            type="number"
            value={ratings.codeforces}
            onChange={(e) => updateRating('codeforces', e.target.value)}
            onFocus={() => setEditingPlatform('codeforces')}
            onBlur={() => handleBlur('codeforces')}
            className="w-full p-3 border border-pink-300 rounded-lg text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
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

        {/* LeetCode */}
        <div className="text-center">
          <label className="block text-sm font-medium text-gray-700 mb-2">LeetCode</label>
          <input
            type="number"
            value={ratings.leetcode}
            onChange={(e) => updateRating('leetcode', e.target.value)}
            onFocus={() => setEditingPlatform('leetcode')}
            onBlur={() => handleBlur('leetcode')}
            className="w-full p-3 border border-pink-300 rounded-lg text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-2">
            {ratings.leetcode < 1500 && 'Working towards Guardian'}
            {ratings.leetcode >= 1500 && ratings.leetcode < 1800 && 'Guardian'}
            {ratings.leetcode >= 1800 && ratings.leetcode < 2200 && 'Knight'}
            {ratings.leetcode >= 2200 && 'Guardian+'}
          </p>
        </div>

        {/* CodeChef */}
        <div className="text-center">
          <label className="block text-sm font-medium text-gray-700 mb-2">CodeChef</label>
          <input
            type="number"
            value={ratings.codechef}
            onChange={(e) => updateRating('codechef', e.target.value)}
            onFocus={() => setEditingPlatform('codechef')}
            onBlur={() => handleBlur('codechef')}
            className="w-full p-3 border border-pink-300 rounded-lg text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
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

      <div className="mt-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
        <p className="text-sm text-pink-700">
          💡 <strong>Tip:</strong> Update your ratings after each contest to track your progress over time!
        </p>
      </div>
    </div>
  );
};

export default RatingTracker;