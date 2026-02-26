import React, { useState } from 'react';
import { useGetAllQuestions, useCreateTest } from '../../hooks/useQueries';
import { ExternalBlob } from '../../backend';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageIcon, Loader2, PlusCircle } from 'lucide-react';

export default function TestBuilder() {
  const { data: questions, isLoading: questionsLoading } = useGetAllQuestions();
  const createTest = useCreateTest();

  const [testName, setTestName] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [marksPerCorrect, setMarksPerCorrect] = useState('1');
  const [negativeMarks, setNegativeMarks] = useState('0');
  const [marksError, setMarksError] = useState('');
  const [negativeError, setNegativeError] = useState('');

  const toggleQuestion = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const validateMarks = (): boolean => {
    let valid = true;
    const mpc = parseInt(marksPerCorrect);
    const nm = parseInt(negativeMarks);

    if (!marksPerCorrect || isNaN(mpc) || mpc < 1 || !Number.isInteger(mpc)) {
      setMarksError('Must be a positive integer (min 1)');
      valid = false;
    } else {
      setMarksError('');
    }

    if (negativeMarks === '' || isNaN(nm) || nm < 0 || !Number.isInteger(nm)) {
      setNegativeError('Must be a non-negative integer (min 0)');
      valid = false;
    } else {
      setNegativeError('');
    }

    return valid;
  };

  const handleCreate = async () => {
    if (!testName.trim() || !duration || selectedIds.size === 0) return;
    if (!validateMarks()) return;

    const questionIds = Array.from(selectedIds).map(id => BigInt(id));
    await createTest.mutateAsync({
      name: testName.trim(),
      durationMinutes: BigInt(parseInt(duration)),
      questionIds,
      marksPerCorrect: BigInt(parseInt(marksPerCorrect)),
      negativeMarks: BigInt(parseInt(negativeMarks)),
    });
    setTestName('');
    setDuration('');
    setSelectedIds(new Set());
    setMarksPerCorrect('1');
    setNegativeMarks('0');
    setMarksError('');
    setNegativeError('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#0A1F44]/15 rounded-lg p-6">
        <h2 className="font-heading text-lg font-semibold text-[#0A1F44] mb-5">Create New Test</h2>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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

        {/* Marks Configuration */}
        <div className="bg-[#0A1F44]/3 border border-[#0A1F44]/10 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-[#0A1F44] mb-3 flex items-center gap-1.5">
            <span className="w-5 h-5 bg-[#0A1F44] text-white rounded text-xs flex items-center justify-center font-bold">M</span>
            Marking Scheme
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="marksPerCorrect" className="text-[#0A1F44] text-sm font-medium">
                Marks per Correct Answer
              </Label>
              <Input
                id="marksPerCorrect"
                type="number"
                value={marksPerCorrect}
                onChange={e => {
                  setMarksPerCorrect(e.target.value);
                  setMarksError('');
                }}
                placeholder="e.g. 2"
                min="1"
                step="1"
                className={`border-[#0A1F44]/20 focus:border-[#0A1F44] focus:ring-[#0A1F44]/20 ${marksError ? 'border-red-400' : ''}`}
              />
              {marksError && <p className="text-red-500 text-xs">{marksError}</p>}
              <p className="text-gray-400 text-xs">Points awarded for each correct answer (min 1)</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="negativeMarks" className="text-[#0A1F44] text-sm font-medium">
                Negative Marks per Wrong Answer
              </Label>
              <Input
                id="negativeMarks"
                type="number"
                value={negativeMarks}
                onChange={e => {
                  setNegativeMarks(e.target.value);
                  setNegativeError('');
                }}
                placeholder="e.g. 0"
                min="0"
                step="1"
                className={`border-[#0A1F44]/20 focus:border-[#0A1F44] focus:ring-[#0A1F44]/20 ${negativeError ? 'border-red-400' : ''}`}
              />
              {negativeError && <p className="text-red-500 text-xs">{negativeError}</p>}
              <p className="text-gray-400 text-xs">Points deducted for each wrong answer (0 = no penalty)</p>
            </div>
          </div>
        </div>

        {/* Question Selection */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[#0A1F44]">
              Select Questions{' '}
              <span className="text-gray-400 font-normal">({selectedIds.size} selected)</span>
            </h3>
            {selectedIds.size > 0 && (
              <span className="text-xs text-[#0A1F44]/60 bg-[#0A1F44]/5 px-2 py-0.5 rounded">
                Max marks: {selectedIds.size * parseInt(marksPerCorrect || '1')}
              </span>
            )}
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
