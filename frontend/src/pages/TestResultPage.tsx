import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetMyResults, useGetTestById } from '../hooks/useQueries';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { SiTelegram } from 'react-icons/si';
import { Trophy, LayoutDashboard } from 'lucide-react';

function TestResultContent() {
  const { testId } = useParams({ from: '/test/$testId/result' });
  const navigate = useNavigate();
  const { data: results, isLoading: resultsLoading } = useGetMyResults();
  const { data: test } = useGetTestById(BigInt(testId));

  const latestResult = results
    ?.filter((r) => r.testId.toString() === testId)
    .sort((a, b) => Number(b.submittedAt - a.submittedAt))[0];

  const score = latestResult ? Number(latestResult.score) : 0;
  const total = test?.questions.length ?? 0;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 rounded-full bg-[#0A1F44]/5 border-4 border-[#0A1F44] flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-[#0A1F44]" />
          </div>

          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#0A1F44] mb-2">
            Test Complete!
          </h1>

          {resultsLoading ? (
            <p className="text-gray-400">Loading your results...</p>
          ) : (
            <>
              <p className="text-4xl font-heading font-bold text-[#0A1F44] mb-1">{pct}%</p>
              <p className="text-gray-500 mb-2">
                Score: <span className="font-bold text-[#0A1F44]">{score}</span> / {total}
              </p>
              <p className="text-sm text-gray-400 mb-8">
                {test?.name && <span className="font-medium text-[#0A1F44]">{test.name}</span>}
              </p>
            </>
          )}

          <div className="bg-[#0A1F44]/5 border border-[#0A1F44]/15 rounded-xl p-5 mb-6 text-left">
            <p className="text-[#0A1F44] font-semibold text-sm mb-2">📢 Get Detailed Explanations</p>
            <p className="text-gray-500 text-sm mb-3">
              Join our Telegram channel for step-by-step solutions, short notes, and more free tests.
            </p>
            <a
              href="https://t.me/Conceptdelta"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0A1F44] hover:bg-[#1a3a6e] text-white font-semibold px-4 py-2 rounded text-sm transition-colors"
            >
              <SiTelegram className="w-4 h-4" />
              Join Telegram for Explanations
            </a>
          </div>

          <Button
            onClick={() => navigate({ to: '/dashboard' })}
            className="w-full bg-[#0A1F44] hover:bg-[#1a3a6e] text-white font-semibold"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}

export default function TestResultPage() {
  return (
    <ProtectedRoute>
      <TestResultContent />
    </ProtectedRoute>
  );
}
