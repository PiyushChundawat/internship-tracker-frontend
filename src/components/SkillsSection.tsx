import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface Skill {
  id: string;
  profile: string;
  skill_name: string;
  notes: string | null;
}

interface SkillsSectionProps {
  profile: 'piyush' | 'shruti';
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ profile }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newSkill, setNewSkill] = useState({
    skill_name: '',
    notes: '',
  });

  useEffect(() => {
    fetchSkills();
  }, [profile]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/skills`, {
        params: { profile }
      });
      if (response.data.success) {
        setSkills(response.data.data);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching skills:', err);
      setError(err.response?.data?.error || 'Failed to fetch skills');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.skill_name.trim()) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/skills`, {
        ...newSkill,
        profile
      });
      if (response.data.success) {
        setSkills([...skills, response.data.data]);
        setNewSkill({ skill_name: '', notes: '' });
        setIsAdding(false);
      }
    } catch (err: any) {
      console.error('Error adding skill:', err);
      setError(err.response?.data?.error || 'Failed to add skill');
    }
  };

  const handleUpdateSkill = async (id: string, updates: Partial<Skill>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/skills/${id}`, updates);
      if (response.data.success) {
        setSkills(skills.map(s => s.id === id ? response.data.data : s));
      }
    } catch (err: any) {
      console.error('Error updating skill:', err);
      setError(err.response?.data?.error || 'Failed to update skill');
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/skills/${id}`);
      if (response.data.success) {
        setSkills(skills.filter(s => s.id !== id));
      }
    } catch (err: any) {
      console.error('Error deleting skill:', err);
      setError(err.response?.data?.error || 'Failed to delete skill');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-lime-500">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-lime-500">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-lime-800 flex items-center">
          <span className="w-3 h-3 bg-lime-500 rounded-full mr-2"></span>
          Skills Section
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-lime-500 text-white rounded hover:bg-lime-600"
        >
          {isAdding ? 'Cancel' : '+ Add Skill'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAddSkill} className="mb-6 p-4 border rounded bg-lime-50">
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Skill Name *</label>
            <input
              type="text"
              value={newSkill.skill_name}
              onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g., Python, React, SQL"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={newSkill.notes}
              onChange={(e) => setNewSkill({ ...newSkill, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={2}
              placeholder="Proficiency level, experience, certifications..."
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save Skill
          </button>
        </form>
      )}

      <ul className="space-y-3">
        {skills.length === 0 ? (
          <li className="text-gray-500 text-center py-8">
            No skills yet. Add your first skill!
          </li>
        ) : (
          skills.map((skill) => (
            <li key={skill.id} className="p-3 bg-lime-50 rounded-lg border border-lime-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <strong className="text-lime-800">{skill.skill_name}</strong>
                  {skill.notes && (
                    <span className="text-lime-700 ml-2">: {skill.notes}</span>
                  )}
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => {
                      const notes = prompt('Edit notes:', skill.notes || '');
                      if (notes !== null) {
                        handleUpdateSkill(skill.id, { notes });
                      }
                    }}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
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

export default SkillsSection;