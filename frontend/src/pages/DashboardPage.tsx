import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { useGetPublishedTests } from '../hooks/useQueries';
import TestCard from '../components/TestCard';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Clock, LayoutGrid } from 'lucide-react';

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: tests, isLoading } = useGetPublishedTests();

  const userName = userProfile?.fullName ?? 'Student';

  const classLabel = userProfile?.userClass
    ? { eleventh: 'Class 11', twelfth: 'Class 12', dropper: 'Dropper' }[userProfile.userClass] ?? ''
    : '';

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <div className="bg-[#0A1F44] py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-white/60 text-sm font-medium mb-1">Welcome back,</p>
          <h1 className="font-heading text-3xl font-bold text-white mb-1">{userName}</h1>
          {classLabel && (
            <span className="inline-block bg-white/10 border border-white/20 text-white/80 text-xs font-medium px-3 py-1 rounded-full mt-1">
              {classLabel}
            </span>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-[#0A1F44]/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#0A1F44]/5 rounded-lg flex items-center justify-center">
                <LayoutGrid className="w-4 h-4 text-[#0A1F44]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Available Tests</p>
                <p className="text-lg font-bold text-[#0A1F44]">
                  {isLoading ? '—' : (tests?.length ?? 0)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#0A1F44]/5 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#0A1F44]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Total Questions</p>
                <p className="text-lg font-bold text-[#0A1F44]">
                  {isLoading ? '—' : (tests?.reduce((acc, t) => acc + t.questions.length, 0) ?? 0)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#0A1F44]/5 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#0A1F44]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Total Duration</p>
                <p className="text-lg font-bold text-[#0A1F44]">
                  {isLoading ? '—' : `${tests?.reduce((acc, t) => acc + Number(t.durationMinutes), 0) ?? 0} min`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tests Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="font-heading text-xl font-semibold text-[#0A1F44] mb-6">Available Tests</h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-gray-100 rounded-lg p-6 space-y-3">
                <Skeleton className="h-5 w-3/4 bg-gray-100" />
                <Skeleton className="h-4 w-1/2 bg-gray-100" />
                <Skeleton className="h-4 w-1/3 bg-gray-100" />
                <Skeleton className="h-10 w-full bg-gray-100 mt-4" />
              </div>
            ))}
          </div>
        ) : tests && tests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map(test => (
              <TestCard key={test.id.toString()} test={test} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-[#0A1F44]/20 rounded-lg">
            <BookOpen className="w-12 h-12 text-[#0A1F44]/30 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold text-[#0A1F44] mb-2">No Tests Available</h3>
            <p className="text-gray-400 text-sm">Check back later for new practice tests.</p>
          </div>
        )}
      </main>
    </div>
  );
}
