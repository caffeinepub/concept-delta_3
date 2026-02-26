import React, { useState, useEffect, useRef } from 'react';
import { useIsCallerAdmin, useMarkAdminVisited } from '../hooks/useQueries';
import QuestionGallery from '../components/admin/QuestionGallery';
import TestBuilder from '../components/admin/TestBuilder';
import TestManagement from '../components/admin/TestManagement';
import UsersTab from '../components/admin/UsersTab';
import ResultsTab from '../components/admin/ResultsTab';
import { Shield } from 'lucide-react';

type Tab = 'questions' | 'builder' | 'management' | 'users' | 'results';

const tabs: { id: Tab; label: string }[] = [
  { id: 'questions', label: 'Question Gallery' },
  { id: 'builder', label: 'Test Builder' },
  { id: 'management', label: 'Test Management' },
  { id: 'users', label: 'Users' },
  { id: 'results', label: 'Results' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('questions');
  const { data: isAdmin } = useIsCallerAdmin();
  const { mutate: markVisited } = useMarkAdminVisited();
  const hasMarked = useRef(false);

  // Mark admin as visited on first mount (only once)
  useEffect(() => {
    if (isAdmin && !hasMarked.current) {
      hasMarked.current = true;
      markVisited();
    }
  }, [isAdmin, markVisited]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-[#0A1F44]/30 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-semibold text-[#0A1F44] mb-2">Access Denied</h2>
          <p className="text-gray-400">You do not have admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Admin Header */}
      <div className="bg-[#0A1F44] py-8 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Shield className="w-6 h-6 text-white/70" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-white/60 text-sm">Manage questions, tests, users, and results</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-[#0A1F44]/10 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-0 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#0A1F44] text-[#0A1F44] bg-[#0A1F44]/5'
                    : 'border-transparent text-gray-500 hover:text-[#0A1F44] hover:border-[#0A1F44]/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white">
          {activeTab === 'questions' && <QuestionGallery />}
          {activeTab === 'builder' && <TestBuilder />}
          {activeTab === 'management' && <TestManagement />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'results' && <ResultsTab />}
        </div>
      </main>
    </div>
  );
}
