import React from 'react';
import { useGetAllResults, useGetAllTests, useGetAllUsers } from '../../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart2 } from 'lucide-react';

export default function ResultsTab() {
  const { data: results, isLoading: resultsLoading } = useGetAllResults();
  const { data: tests } = useGetAllTests();
  const { data: users } = useGetAllUsers();

  const getTestName = (testId: bigint) =>
    tests?.find(t => t.id === testId)?.name ?? `Test #${testId}`;

  const getTest = (testId: bigint) =>
    tests?.find(t => t.id === testId);

  const getUserName = (userId: { toString(): string }) => {
    const match = users?.find(([p]) => p.toString() === userId.toString());
    return match ? match[1].fullName : userId.toString().slice(0, 12) + '…';
  };

  const formatDate = (time: bigint) => {
    const ms = Number(time) / 1_000_000;
    return new Date(ms).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-lg font-semibold text-[#0A1F44]">
        Test Results{' '}
        {results && <span className="text-gray-400 font-normal text-base">({results.length})</span>}
      </h2>

      {resultsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-lg bg-gray-100" />)}
        </div>
      ) : results && results.length > 0 ? (
        <div className="bg-white border border-[#0A1F44]/15 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0A1F44]">
                  <th className="text-left px-5 py-3 text-white font-medium">Student</th>
                  <th className="text-left px-5 py-3 text-white font-medium hidden sm:table-cell">Test</th>
                  <th className="text-left px-5 py-3 text-white font-medium">Marks</th>
                  <th className="text-left px-5 py-3 text-white font-medium hidden lg:table-cell">Correct</th>
                  <th className="text-left px-5 py-3 text-white font-medium hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, idx) => {
                  const test = getTest(result.testId);
                  const totalQuestions = test?.questions.length ?? 0;
                  const marksPerCorrect = test ? Number(test.marksPerCorrect) : 1;
                  const negativeMarks = test ? Number(test.negativeMarks) : 0;
                  const maxMarks = totalQuestions * marksPerCorrect;
                  const marks = Number(result.marks);
                  const correctCount = Number(result.score);
                  const marksPercent = maxMarks > 0 ? Math.round((Math.max(0, marks) / maxMarks) * 100) : 0;

                  return (
                    <tr
                      key={idx}
                      className={`border-t border-[#0A1F44]/8 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#0A1F44]/2'}`}
                    >
                      <td className="px-5 py-3 font-medium text-[#0A1F44]">
                        {getUserName(result.userId)}
                      </td>
                      <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">
                        {getTestName(result.testId)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#0A1F44]">
                            {marks} / {maxMarks}
                          </span>
                          <span className="text-xs text-gray-400">({marksPercent}%)</span>
                        </div>
                        {negativeMarks > 0 && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            +{marksPerCorrect}/−{negativeMarks}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-500 hidden lg:table-cell">
                        {correctCount}/{totalQuestions} correct
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs hidden md:table-cell">
                        {formatDate(result.submittedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-[#0A1F44]/20 rounded-lg">
          <BarChart2 className="w-10 h-10 text-[#0A1F44]/20 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No results submitted yet.</p>
        </div>
      )}
    </div>
  );
}
