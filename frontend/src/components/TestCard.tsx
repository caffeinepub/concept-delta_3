import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CompleteTest } from '../backend';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';

interface TestCardProps {
  test: CompleteTest;
}

export default function TestCard({ test }: TestCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-[#0A1F44]/15 rounded-lg p-6 hover:shadow-navy transition-shadow flex flex-col">
      <div className="flex-1">
        <h3 className="font-heading font-semibold text-[#0A1F44] text-lg mb-3 leading-snug">
          {test.name}
        </h3>
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <Clock className="w-4 h-4 text-[#0A1F44]/50" />
            <span>{Number(test.durationMinutes)} min</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <BookOpen className="w-4 h-4 text-[#0A1F44]/50" />
            <span>{test.questions.length} questions</span>
          </div>
        </div>
      </div>
      <button
        onClick={() => navigate({ to: '/test/$testId', params: { testId: test.id.toString() } })}
        className="w-full flex items-center justify-center gap-2 bg-[#0A1F44] text-white font-medium py-2.5 px-4 rounded hover:bg-[#1a3a6e] transition-colors mt-2"
      >
        Start Test
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
