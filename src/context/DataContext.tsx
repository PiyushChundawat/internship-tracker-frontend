import React, { createContext, useContext, useState } from 'react';

type Profile = 'piyush' | 'shruti';

interface DataContextType {
  profile: Profile;
  setProfile: (profile: Profile) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile>('piyush');

  return (
    <DataContext.Provider value={{ profile, setProfile }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};