import React from 'react';
import { useGetAllTests, useTogglePublishTest } from '../../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { ClipboardList, Loader2 } from 'lucide-react';

export default function TestManagement() {
  const { data: tests, isLoading } = useGetAllTests();
  const togglePublish = useTogglePublishTest();

  const handleToggle = async (testId: bigint) => {
    await togglePublish.mutateAsync(testId);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-lg font-semibold text-[#0A1F44]">Test Management</h2>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-lg bg-gray-100" />)}
        </div>
      ) : tests && tests.length > 0 ? (
        <div className="bg-white border border-[#0A1F44]/15 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0A1F44]">
                <th className="text-left px-5 py-3 text-white font-medium">Test Name</th>
                <th className="text-left px-5 py-3 text-white font-medium hidden sm:table-cell">Duration</th>
                <th className="text-left px-5 py-3 text-white font-medium hidden sm:table-cell">Questions</th>
                <th className="text-left px-5 py-3 text-white font-medium">Status</th>
                <th className="text-left px-5 py-3 text-white font-medium">Publish</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test, idx) => (
                <tr
                  key={test.id.toString()}
                  className={`border-t border-[#0A1F44]/8 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#0A1F44]/2'}`}
                >
                  <td className="px-5 py-3 font-medium text-[#0A1F44]">{test.name}</td>
                  <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{Number(test.durationMinutes)} min</td>
                  <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{test.questions.length}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      test.isPublished
                        ? 'bg-[#0A1F44]/5 border-[#0A1F44]/20 text-[#0A1F44]'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}>
                      {test.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {togglePublish.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#0A1F44]" />
                    ) : (
                      <Switch
                        checked={test.isPublished}
                        onCheckedChange={() => handleToggle(test.id)}
                        className="data-[state=checked]:bg-[#0A1F44]"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-[#0A1F44]/20 rounded-lg">
          <ClipboardList className="w-10 h-10 text-[#0A1F44]/20 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No tests created yet.</p>
        </div>
      )}
    </div>
  );
}
