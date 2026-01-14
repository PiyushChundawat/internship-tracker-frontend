import React from 'react';

interface ProfileToggleProps {
  profile: 'piyush' | 'shruti';
  setProfile: (profile: 'piyush' | 'shruti') => void;
}

const ProfileToggle: React.FC<ProfileToggleProps> = ({ profile, setProfile }) => {
  return (
    <div className="flex items-center space-x-4">
      <span className="text-white-600 font-medium">Profile:</span>
      <div className="flex bg-gray-200 rounded-lg p-1">
        <button
          onClick={() => setProfile('piyush')}
          className={`px-4 py-2 rounded-md font-medium transition duration-200 ${
            profile === 'piyush' 
              ? 'bg-blue-600 text-white shadow' 
              : 'text-gray-700 hover:bg-gray-300'
          }`}
        >
          Piyush
        </button>
        <button
          onClick={() => setProfile('shruti')}
          className={`px-4 py-2 rounded-md font-medium transition duration-200 ${
            profile === 'shruti' 
              ? 'bg-blue-600 text-white shadow' 
              : 'text-gray-700 hover:bg-gray-300'
          }`}
        >
          Shruti
        </button>
      </div>
    </div>
  );
};

export default ProfileToggle;
