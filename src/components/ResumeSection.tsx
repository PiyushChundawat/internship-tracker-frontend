import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface ResumeSection {
  id: string;
  section_type: string;
  content: string;
  sort_order: number;
}

const ResumeSectionComponent: React.FC = () => {
  const [sections, setSections] = useState<ResumeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const sectionLabels: { [key: string]: string } = {
    work_experience: 'Work Experience',
    skills: 'Skills',
    projects: 'Projects',
    achievements: 'Achievements',
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/resume-sections`);
      if (response.data.success) {
        setSections(response.data.data);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching resume sections:', err);
      setError(err.response?.data?.error || 'Failed to fetch resume sections');
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (id: string, content: string) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/resume-sections/${id}`, {
        content
      });
      
      if (response.data.success) {
        setSections(sections.map(s => s.id === id ? response.data.data : s));
        setEditingId(null);
        setEditContent('');
      }
    } catch (err: any) {
      console.error('Error updating resume section:', err);
      setError(err.response?.data?.error || 'Failed to update section');
    }
  };

  const startEdit = (section: ResumeSection) => {
    setEditingId(section.id);
    setEditContent(section.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const saveEdit = (id: string) => {
    updateSection(id, editContent);
  };

  const getSectionByType = (type: string): ResumeSection | undefined => {
    return sections.find(s => s.section_type === type);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-teal-500">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-teal-500">
      <h2 className="text-xl font-bold mb-4 text-teal-800 flex items-center">
        <span className="w-3 h-3 bg-teal-500 rounded-full mr-2"></span>
        Resume Section
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {Object.keys(sectionLabels).map((sectionType) => {
          const section = getSectionByType(sectionType);
          const isEditing = editingId === section?.id;

          return (
            <div key={sectionType} className="bg-teal-50 p-4 rounded-lg border border-teal-200">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-teal-700">
                  {sectionLabels[sectionType]}
                </label>
                {section && !isEditing && (
                  <button
                    onClick={() => startEdit(section)}
                    className="text-sm text-teal-600 hover:text-teal-800"
                  >
                    Edit
                  </button>
                )}
              </div>

              {section ? (
                isEditing ? (
                  <div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      rows={4}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => saveEdit(section.id)}
                        className="px-3 py-1 bg-teal-500 text-white rounded hover:bg-teal-600 text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded border border-teal-200">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {section.content || <span className="text-gray-400 italic">No content yet. Click Edit to add.</span>}
                    </p>
                  </div>
                )
              ) : (
                <div className="p-3 bg-white rounded border border-teal-200">
                  <p className="text-gray-400 italic">Section not found in database</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
        <p className="text-sm text-teal-700">
          💡 <strong>Tip:</strong> Keep your resume sections up to date with your latest achievements and skills. 
          This will help you quickly generate tailored resumes for job applications.
        </p>
      </div>
    </div>
  );
};

export default ResumeSectionComponent;