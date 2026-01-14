import React, { useState } from 'react';

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
}

const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
  <div className="w-full bg-slate-900 rounded-xl border border-slate-800">
    <div className="flex border-b border-slate-800 px-2 overflow-x-auto">
      {tabs.map((tab, index) => (
        <button
          key={index}
          onClick={() => setActiveTab(index)}
          className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === index
              ? 'text-slate-100 border-b-2 border-slate-100'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>

    <div className="p-4 bg-slate-900 text-slate-100">
      {tabs[activeTab].content}
    </div>
  </div>
);


export default Tabs;
