import React, { useState } from 'react';
import { useGetAllQuestions, useCreateTest } from '../../hooks/useQueries';
import { ExternalBlob } from '../../backend';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageIcon, Loader2, PlusCircle } from 'lucide-react';

export default function TestBuilder() {
  const { data: questions, isLoading: questionsLoading } = useGetAllQuestions();
  const createTest = useCreateTest();

  const [testName, setTestName] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleQuestion = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!testName.trim() || !duration || selectedIds.size === 0) return;
    const questionIds = Array.from(selectedIds).map(id => BigInt(id));
    await createTest.mutateAsync({
      name: testName.trim(),
      durationMinutes: BigInt(parseInt(duration)),
      questionIds,
    });
    setTestName('');
    setDuration('');
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#0A1F44]/15 rounded-lg p-6">
        <h2 className="font-heading text-lg font-semibold text-[#0A1F44] mb-5">Create New Test</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="space-y-1.5">
            <Label htmlFor="testName" className="text-[#0A1F44] text-sm font-medium">Test Name</Label>
            <Input
              id="testName"
              value={testName}
              onChange={e => setTestName(e.target.value)}
              placeholder="e.g. Physics Chapter 1"
              className="border-[#0A1F44]/20 focus:border-[#0A1F44] focus:ring-[#0A1F44]/20"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="duration" className="text-[#0A1F44] text-sm font-medium">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder="e.g. 30"
              min="1"
              className="border-[#0A1F44]/20 focus:border-[#0A1F44] focus:ring-[#0A1F44]/20"
            />
          </div>
        </div>

        {/* Question Selection */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[#0A1F44]">
              Select Questions{' '}
              <span className="text-gray-400 font-normal">({selectedIds.size} selected)</span>
            </h3>
          </div>

          {questionsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-lg bg-gray-100" />)}
            </div>
          ) : questions && questions.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
              {questions.map(q => {
                const idStr = q.id.toString();
                const isSelected = selectedIds.has(idStr);
                return (
                  <div
                    key={idStr}
                    onClick={() => toggleQuestion(idStr)}
                    className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#0A1F44] ring-2 ring-[#0A1F44]/20'
                        : 'border-[#0A1F44]/15 hover:border-[#0A1F44]/40'
                    }`}
                  >
                    <QuestionThumbnail image={q.image} id={q.id} />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#0A1F44] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                    <div className="px-2 py-1 bg-white">
                      <span className="text-xs text-gray-400">Q{idStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-[#0A1F44]/20 rounded-lg">
              <ImageIcon className="w-8 h-8 text-[#0A1F44]/20 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No questions available. Upload questions first.</p>
            </div>
          )}
        </div>

        <button
          onClick={handleCreate}
          disabled={!testName.trim() || !duration || selectedIds.size === 0 || createTest.isPending}
          className="flex items-center gap-2 bg-[#0A1F44] text-white px-5 py-2.5 rounded font-medium text-sm hover:bg-[#1a3a6e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createTest.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
          ) : (
            <><PlusCircle className="w-4 h-4" /> Create Test</>
          )}
        </button>
      </div>
    </div>
  );
}

function QuestionThumbnail({ image, id }: { image: ExternalBlob; id: bigint }) {
  const [imgUrl, setImgUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    setImgUrl(image.getDirectURL());
  }, [image]);

  return (
    <div className="aspect-video bg-gray-50 flex items-center justify-center">
      {imgUrl ? (
        <img src={imgUrl} alt={`Q${id}`} className="w-full h-full object-contain" />
      ) : (
        <ImageIcon className="w-6 h-6 text-gray-200" />
      )}
    </div>
  );
}
