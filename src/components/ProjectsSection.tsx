import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface Project {
  id: string;
  profile: string;
  project_name: string;
  description: string | null;
  notes: string | null;
}

interface ProjectsSectionProps {
  profile: 'piyush' | 'shruti';
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ profile }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState({
    project_name: '',
    description: '',
    notes: '',
  });

  useEffect(() => {
    fetchProjects();
  }, [profile]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/projects`, {
        params: { profile }
      });
      if (response.data.success) {
        setProjects(response.data.data);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.error || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.project_name.trim()) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/projects`, {
        ...newProject,
        profile
      });
      if (response.data.success) {
        setProjects([...projects, response.data.data]);
        setNewProject({ project_name: '', description: '', notes: '' });
        setIsAdding(false);
      }
    } catch (err: any) {
      console.error('Error adding project:', err);
      setError(err.response?.data?.error || 'Failed to add project');
    }
  };

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/projects/${id}`, updates);
      if (response.data.success) {
        setProjects(projects.map(p => p.id === id ? response.data.data : p));
      }
    } catch (err: any) {
      console.error('Error updating project:', err);
      setError(err.response?.data?.error || 'Failed to update project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/projects/${id}`);
      if (response.data.success) {
        setProjects(projects.filter(p => p.id !== id));
      }
    } catch (err: any) {
      console.error('Error deleting project:', err);
      setError(err.response?.data?.error || 'Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-cyan-500">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-cyan-500">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-cyan-800 flex items-center">
          <span className="w-3 h-3 bg-cyan-500 rounded-full mr-2"></span>
          Projects Section
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
        >
          {isAdding ? 'Cancel' : '+ Add Project'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAddProject} className="mb-6 p-4 border rounded bg-cyan-50">
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Project Name *</label>
            <input
              type="text"
              value={newProject.project_name}
              onChange={(e) => setNewProject({ ...newProject, project_name: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g., E-commerce Platform"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={3}
              placeholder="Brief description of the project..."
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Personal Notes</label>
            <textarea
              value={newProject.notes}
              onChange={(e) => setNewProject({ ...newProject, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={3}
              placeholder="Technologies used, learnings, challenges..."
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save Project
          </button>
        </form>
      )}

      <ul className="space-y-4">
        {projects.length === 0 ? (
          <li className="text-gray-500 text-center py-8">
            No projects yet. Add your first project!
          </li>
        ) : (
          projects.map((project) => (
            <li key={project.id} className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-cyan-800 mb-2">{project.project_name}</h3>
                  {project.description && (
                    <p className="text-cyan-700 mb-2">{project.description}</p>
                  )}
                  {project.notes && (
                    <p className="text-sm text-cyan-600 italic">{project.notes}</p>
                  )}
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => {
                      const notes = prompt('Edit notes:', project.notes || '');
                      if (notes !== null) {
                        handleUpdateProject(project.id, { notes });
                      }
                    }}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
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

export default ProjectsSection;