import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetTestById, useSubmitTestResult } from '../hooks/useQueries';
import { useTestTimer } from '../hooks/useTestTimer';
import ProtectedRoute from '../components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Clock, Send, AlertTriangle } from 'lucide-react';
import type { Answer } from '../backend';
import { toast } from 'sonner';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

// Solid submit confirmation dialog — no transparency
function SubmitConfirmDialog({
  open,
  onClose,
  onConfirm,
  answeredCount,
  totalQuestions,
  isSubmitting,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  answeredCount: number;
  totalQuestions: number;
  isSubmitting: boolean;
}) {
  if (!open) return null;

  const unanswered = totalQuestions - answeredCount;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '2rem',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '1.25rem',
            color: '#0A1F44',
            marginBottom: '0.75rem',
          }}
        >
          Submit Test?
        </h2>

        {/* Description */}
        <p
          style={{
            color: '#374151',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            marginBottom: '1.5rem',
          }}
        >
          You have answered <strong style={{ color: '#0A1F44' }}>{answeredCount}</strong> out of{' '}
          <strong style={{ color: '#0A1F44' }}>{totalQuestions}</strong> questions.
          {unanswered > 0 && (
            <>
              {' '}
              <span style={{ color: '#b91c1c', fontWeight: 600 }}>
                {unanswered} question{unanswered > 1 ? 's are' : ' is'} unanswered.
              </span>
            </>
          )}{' '}
          This action cannot be undone.
        </p>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            style={{
              backgroundColor: '#0A1F44',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {isSubmitting ? (
              <>
                <span
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#ffffff',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }}
                />
                Submitting...
              </>
            ) : (
              'Submit Now'
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              backgroundColor: '#f3f4f6',
              color: '#0A1F44',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Continue Test
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function TestContent() {
  const { testId } = useParams({ from: '/test/$testId' });
  const navigate = useNavigate();
  const { data: test, isLoading, error } = useGetTestById(BigInt(testId));
  const { mutateAsync: submitResult, isPending: isSubmitting } = useSubmitTestResult();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Image pre-loading state
  const [firstImageReady, setFirstImageReady] = useState(false);
  const preloadedImagesRef = useRef<Set<string>>(new Set());

  // Pre-load all question images as soon as test data is available
  useEffect(() => {
    if (!test || test.questions.length === 0) return;

    let firstLoaded = false;

    test.questions.forEach((question, idx) => {
      const url = question.image.getDirectURL();

      // Skip if already pre-loaded
      if (preloadedImagesRef.current.has(url)) {
        if (idx === 0 && !firstLoaded) {
          firstLoaded = true;
          setFirstImageReady(true);
        }
        return;
      }

      const img = new Image();
      img.onload = () => {
        preloadedImagesRef.current.add(url);
        // Mark first question image as ready so the test UI renders immediately
        if (idx === 0) {
          setFirstImageReady(true);
        }
      };
      img.onerror = () => {
        // Even on error, unblock the UI so the test can proceed
        if (idx === 0) {
          setFirstImageReady(true);
        }
      };
      img.src = url;
    });
  }, [test]);

  const handleAutoSubmit = useCallback(() => {
    if (!hasSubmitted) {
      handleSubmit(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSubmitted]);

  const duration = test ? Number(test.durationMinutes) : 0;
  const { formatted, percentage, isExpired } = useTestTimer(duration, handleAutoSubmit);

  const handleSubmit = async (auto = false) => {
    if (!test || hasSubmitted) return;

    // Immediately close dialog and set submitting state for instant feedback
    setShowConfirm(false);
    setHasSubmitted(true);

    const answerArray: Answer[] = test.questions
      .map((q, idx) => ({
        questionId: q.id,
        selectedOption: answers[idx] || '',
      }))
      .filter((a) => a.selectedOption !== '');

    try {
      await submitResult({
        testId: BigInt(testId),
        answers: answerArray,
      });
      if (auto) toast.info('Time is up! Test submitted automatically.');
      // Navigate directly to result — no extra delays
      navigate({ to: '/test/$testId/result', params: { testId } });
    } catch (err) {
      setHasSubmitted(false);
      toast.error('Failed to submit test. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-navy-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <h2 className="font-display font-bold text-navy-800 text-xl mb-2">Test Not Found</h2>
          <p className="text-muted-foreground mb-4">This test is not available.</p>
          <Button
            onClick={() => navigate({ to: '/dashboard' })}
            className="bg-navy-800 text-white hover:bg-navy-700"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Show a brief loading screen until the first question image is ready
  if (!firstImageReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-navy-800 border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <p className="font-display font-semibold text-navy-800 text-base">Preparing your test...</p>
            <p className="text-muted-foreground text-sm mt-1">Loading questions, please wait</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentIndex];
  const imageUrl = currentQuestion.image.getDirectURL();
  const selectedAnswer = answers[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = test.questions.length;
  const timerWarning = percentage < 25;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Submit Confirmation Dialog */}
      <SubmitConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => handleSubmit(false)}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
        isSubmitting={isSubmitting || hasSubmitted}
      />

      {/* Full-screen submitting overlay */}
      {(isSubmitting || (hasSubmitted && !showConfirm)) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            backgroundColor: 'rgba(10, 31, 68, 0.92)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid rgba(255,255,255,0.3)',
              borderTopColor: '#ffffff',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }}
          />
          <p
            style={{
              color: '#ffffff',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '1.1rem',
            }}
          >
            Submitting your test...
          </p>
          <p
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.875rem',
            }}
          >
            Please do not close this page
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-40 bg-navy-800 text-white shadow-navy-lg">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Timer */}
          <div
            className={`flex items-center gap-2 font-mono font-bold text-lg ${
              timerWarning ? 'text-red-300 animate-pulse' : 'text-white'
            }`}
          >
            <Clock className="w-5 h-5 flex-shrink-0" />
            {formatted}
          </div>

          {/* Progress (desktop) */}
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-xs">
            <span className="text-white/70 text-xs whitespace-nowrap">
              {answeredCount}/{totalQuestions}
            </span>
            <Progress value={(answeredCount / totalQuestions) * 100} className="h-1.5 bg-white/20" />
          </div>

          {/* Submit Button */}
          <Button
            size="sm"
            disabled={isSubmitting || hasSubmitted || isExpired}
            onClick={() => setShowConfirm(true)}
            className="bg-white hover:bg-white/90 text-navy-800 font-bold"
          >
            {isSubmitting || hasSubmitted ? (
              <span className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 border-2 border-navy-800 border-t-transparent rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                Submit Test
              </span>
            )}
          </Button>
        </div>

        {/* Progress bar (mobile) */}
        <div className="sm:hidden px-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-white/70 text-xs">{answeredCount}/{totalQuestions} answered</span>
            <Progress
              value={(answeredCount / totalQuestions) * 100}
              className="h-1 bg-white/20 flex-1"
            />
          </div>
        </div>
      </div>

      {/* Question Header */}
      <div className="max-w-4xl mx-auto w-full px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          {selectedAnswer && (
            <span className="text-xs bg-navy-50 text-navy-800 border border-navy-100 px-2 py-0.5 rounded-full font-medium">
              Answered: {selectedAnswer.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Question Image */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4">
        <div className="w-full bg-gray-50 border border-border rounded-xl overflow-hidden mb-4">
          <img
            key={imageUrl}
            src={imageUrl}
            alt={`Question ${currentIndex + 1}`}
            className="w-full object-contain max-h-[55vh] sm:max-h-[62vh]"
            style={{ display: 'block' }}
          />
        </div>

        {/* A / B / C / D Answer Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {OPTION_LABELS.map((label) => {
            const isSelected = selectedAnswer === label;
            return (
              <button
                key={label}
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, [currentIndex]: label }))
                }
                className={`
                  min-h-[52px] rounded-xl border-2 font-display font-bold text-lg transition-all duration-150
                  flex items-center justify-center gap-2
                  ${
                    isSelected
                      ? 'bg-navy-800 border-navy-800 text-white shadow-navy'
                      : 'bg-white border-border text-navy-800 hover:border-navy-300 hover:bg-navy-50'
                  }
                `}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                    isSelected ? 'bg-white/20' : 'bg-navy-50'
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pb-6">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="border-navy-200 text-navy-800 hover:bg-navy-50"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          {/* Question dots (desktop) */}
          <div className="hidden sm:flex items-center gap-1.5 flex-wrap justify-center max-w-xs">
            {test.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  idx === currentIndex
                    ? 'bg-navy-800 text-white'
                    : answers[idx]
                    ? 'bg-navy-200 text-navy-800'
                    : 'bg-gray-100 text-gray-500 hover:bg-navy-50'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
            disabled={currentIndex === totalQuestions - 1}
            className="border-navy-200 text-navy-800 hover:bg-navy-50"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function TestPage() {
  return (
    <ProtectedRoute>
      <TestContent />
    </ProtectedRoute>
  );
}
