import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Edit, Save, X } from 'lucide-react';

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
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
        <FileText className="w-6 h-6 text-purple-500" />
        Resume Section
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {Object.keys(sectionLabels).map((sectionType) => {
          const section = getSectionByType(sectionType);
          const isEditing = editingId === section?.id;

          return (
            <div key={sectionType} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-400">
                  {sectionLabels[sectionType]}
                </label>
                {section && !isEditing && (
                  <button
                    onClick={() => startEdit(section)}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
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
                      className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:border-blue-500 resize-none"
                      rows={4}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => saveEdit(section.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm border border-green-500 flex items-center gap-1"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm border border-gray-600 flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <p className="text-gray-300 whitespace-pre-wrap">
                      {section.content || <span className="text-gray-500 italic">No content yet. Click Edit to add.</span>}
                    </p>
                  </div>
                )
              ) : (
                <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <p className="text-gray-500 italic">Section not found in database</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
        <p className="text-sm text-gray-400">
          <FileText className="w-4 h-4 inline mr-1 text-purple-500" />
          <strong className="text-white">Tip:</strong> Keep your resume sections up to date with your latest achievements and skills. 
          This will help you quickly generate tailored resumes for job applications.
        </p>
      </div>
    </div>
  );
};

export default ResumeSectionComponent;
