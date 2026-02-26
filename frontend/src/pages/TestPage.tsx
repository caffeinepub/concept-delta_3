import { useState, useCallback } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetTestById, useSubmitTestResult } from '../hooks/useQueries';
import { useTestTimer } from '../hooks/useTestTimer';
import ProtectedRoute from '../components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ChevronLeft, ChevronRight, Clock, Send, AlertTriangle } from 'lucide-react';
import type { Answer } from '../backend';
import { toast } from 'sonner';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

function TestContent() {
  const { testId } = useParams({ from: '/test/$testId' });
  const navigate = useNavigate();
  const { data: test, isLoading, error } = useGetTestById(BigInt(testId));
  const { mutateAsync: submitResult, isPending: isSubmitting } = useSubmitTestResult();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

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

    const answerArray: Answer[] = test.questions.map((q, idx) => ({
      questionId: q.id,
      selectedOption: answers[idx] || '',
    }));

    const score = test.questions.reduce((acc, q, idx) => {
      return answers[idx] === q.correctOption ? acc + 1 : acc;
    }, 0);

    try {
      setHasSubmitted(true);
      await submitResult({
        testId: BigInt(testId),
        answers: answerArray,
        score: BigInt(score),
      });
      if (auto) toast.info('Time is up! Test submitted automatically.');
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

  const currentQuestion = test.questions[currentIndex];
  const imageUrl = currentQuestion.image.getDirectURL();
  const selectedAnswer = answers[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = test.questions.length;
  const timerWarning = percentage < 25;

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                disabled={isSubmitting || hasSubmitted || isExpired}
                className="bg-white hover:bg-white/90 text-navy-800 font-bold"
              >
                {isSubmitting ? (
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
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Submit Test?</AlertDialogTitle>
                <AlertDialogDescription>
                  You have answered {answeredCount} out of {totalQuestions} questions.
                  {answeredCount < totalQuestions &&
                    ` ${totalQuestions - answeredCount} question${totalQuestions - answeredCount > 1 ? 's are' : ' is'} unanswered.`}{' '}
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continue Test</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleSubmit(false)}
                  className="bg-navy-800 hover:bg-navy-700 text-white"
                >
                  Submit Now
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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

      {/* Question Image — full viewport width, constrained height */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4">
        <div className="w-full bg-gray-50 border border-border rounded-xl overflow-hidden mb-4">
          <img
            src={imageUrl}
            alt={`Question ${currentIndex + 1}`}
            className="w-full object-contain max-h-[55vh] sm:max-h-[62vh]"
            style={{ display: 'block' }}
          />
        </div>

        {/* A / B / C / D Answer Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {OPTION_LABELS.map((label) => {
            const isSelected = selectedAnswer === label.toLowerCase();
            return (
              <button
                key={label}
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, [currentIndex]: label.toLowerCase() }))
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
