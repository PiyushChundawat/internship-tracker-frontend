import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface Guesstimate {
  id: string;
  topic: string;
  learnings: string | null;
  notes: string | null;
}

const Guesstimates: React.FC = () => {
  const [guesstimates, setGuesstimates] = useState<Guesstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newGuesstimate, setNewGuesstimate] = useState({
    topic: '',
    learnings: '',
    notes: '',
  });

  useEffect(() => {
    fetchGuesstimates();
  }, []);

  const fetchGuesstimates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/guesstimates`);
      if (response.data.success) {
        setGuesstimates(response.data.data);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching guesstimates:', err);
      setError(err.response?.data?.error || 'Failed to fetch guesstimates');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuesstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuesstimate.topic.trim()) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/guesstimates`, newGuesstimate);
      if (response.data.success) {
        setGuesstimates([...guesstimates, response.data.data]);
        setNewGuesstimate({ topic: '', learnings: '', notes: '' });
        setIsAdding(false);
      }
    } catch (err: any) {
      console.error('Error adding guesstimate:', err);
      setError(err.response?.data?.error || 'Failed to add guesstimate');
    }
  };

  const handleUpdateGuesstimate = async (id: string, updates: Partial<Guesstimate>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/guesstimates/${id}`, updates);
      if (response.data.success) {
        setGuesstimates(guesstimates.map(g => g.id === id ? response.data.data : g));
      }
    } catch (err: any) {
      console.error('Error updating guesstimate:', err);
      setError(err.response?.data?.error || 'Failed to update guesstimate');
    }
  };

  const handleDeleteGuesstimate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guesstimate?')) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/guesstimates/${id}`);
      if (response.data.success) {
        setGuesstimates(guesstimates.filter(g => g.id !== id));
      }
    } catch (err: any) {
      console.error('Error deleting guesstimate:', err);
      setError(err.response?.data?.error || 'Failed to delete guesstimate');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Guesstimates</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isAdding ? 'Cancel' : '+ Add Guesstimate'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAddGuesstimate} className="mb-6 p-4 border rounded bg-gray-50">
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Topic *</label>
            <input
              type="text"
              value={newGuesstimate.topic}
              onChange={(e) => setNewGuesstimate({ ...newGuesstimate, topic: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g., Number of pizzas sold in Mumbai daily"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Learnings</label>
            <textarea
              value={newGuesstimate.learnings}
              onChange={(e) => setNewGuesstimate({ ...newGuesstimate, learnings: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={3}
              placeholder="Key learnings from this guesstimate..."
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={newGuesstimate.notes}
              onChange={(e) => setNewGuesstimate({ ...newGuesstimate, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={3}
              placeholder="Approach, assumptions, calculations..."
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save Guesstimate
          </button>
        </form>
      )}

      <ul className="space-y-3">
        {guesstimates.length === 0 ? (
          <li className="text-gray-500 text-center py-8">
            No guesstimates yet. Add your first one!
          </li>
        ) : (
          guesstimates.map((guess) => (
            <li key={guess.id} className="p-4 border rounded bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{guess.topic}</h3>
                  {guess.learnings && (
                    <div className="mb-2">
                      <span className="text-sm font-semibold text-gray-700">Learnings: </span>
                      <p className="text-gray-600">{guess.learnings}</p>
                    </div>
                  )}
                  {guess.notes && (
                    <div>
                      <span className="text-sm font-semibold text-gray-700">Notes: </span>
                      <p className="text-gray-600">{guess.notes}</p>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => {
                      const learnings = prompt('Edit learnings:', guess.learnings || '');
                      if (learnings !== null) {
                        handleUpdateGuesstimate(guess.id, { learnings });
                      }
                    }}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteGuesstimate(guess.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Guesstimates;