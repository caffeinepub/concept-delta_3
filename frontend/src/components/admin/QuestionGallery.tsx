import React, { useState, useRef } from 'react';
import { useGetAllQuestions, useAddQuestion, useDeleteQuestion } from '../../hooks/useQueries';
import { ExternalBlob } from '../../backend';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, Trash2, ImageIcon, Loader2 } from 'lucide-react';

const OPTIONS = ['A', 'B', 'C', 'D'];

export default function QuestionGallery() {
  const { data: questions, isLoading } = useGetAllQuestions();
  const addQuestion = useAddQuestion();
  const deleteQuestion = useDeleteQuestion();

  const [selectedOption, setSelectedOption] = useState('A');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const arrayBuffer = await selectedFile.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => setUploadProgress(pct));
    await addQuestion.mutateAsync({ image: blob, correctOption: selectedOption });
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm('Delete this question?')) return;
    await deleteQuestion.mutateAsync(id);
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="bg-white border border-[#0A1F44]/15 rounded-lg p-6">
        <h2 className="font-heading text-lg font-semibold text-[#0A1F44] mb-5">Upload Question</h2>
        <div className="space-y-4">
          {/* File Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#0A1F44]/20 rounded-lg p-8 text-center cursor-pointer hover:border-[#0A1F44]/40 hover:bg-[#0A1F44]/2 transition-colors"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <ImageIcon className="w-10 h-10 text-[#0A1F44]/20" />
                <p className="text-sm">Click to select an image</p>
                <p className="text-xs">PNG, JPG, WEBP supported</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Correct Answer */}
          <div>
            <label className="block text-sm font-medium text-[#0A1F44] mb-2">Correct Answer</label>
            <div className="flex gap-2">
              {OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setSelectedOption(opt)}
                  className={`w-10 h-10 rounded font-semibold text-sm transition-colors ${
                    selectedOption === opt
                      ? 'bg-[#0A1F44] text-white'
                      : 'bg-white border border-[#0A1F44]/20 text-[#0A1F44] hover:border-[#0A1F44]/50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress !== null && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-[#0A1F44] h-1.5 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || addQuestion.isPending}
            className="flex items-center gap-2 bg-[#0A1F44] text-white px-5 py-2.5 rounded font-medium text-sm hover:bg-[#1a3a6e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addQuestion.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="w-4 h-4" /> Upload Question</>
            )}
          </button>
        </div>
      </div>

      {/* Gallery */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-[#0A1F44] mb-4">
          Question Gallery {questions && <span className="text-gray-400 font-normal text-base">({questions.length})</span>}
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-40 rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : questions && questions.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {questions.map(q => (
              <QuestionCard key={q.id.toString()} question={q} onDelete={handleDelete} isDeleting={deleteQuestion.isPending} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-[#0A1F44]/20 rounded-lg">
            <ImageIcon className="w-10 h-10 text-[#0A1F44]/20 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No questions uploaded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  onDelete,
  isDeleting,
}: {
  question: { id: bigint; correctOption: string; image: ExternalBlob };
  onDelete: (id: bigint) => void;
  isDeleting: boolean;
}) {
  const [imgUrl, setImgUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const url = question.image.getDirectURL();
    setImgUrl(url);
  }, [question.image]);

  return (
    <div className="bg-white border border-[#0A1F44]/15 rounded-lg overflow-hidden group">
      <div className="relative aspect-video bg-gray-50">
        {imgUrl ? (
          <img src={imgUrl} alt={`Q${question.id}`} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-200" />
          </div>
        )}
        <button
          onClick={() => onDelete(question.id)}
          disabled={isDeleting}
          className="absolute top-2 right-2 w-7 h-7 bg-[#0A1F44] text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#1a3a6e] disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-400">Q{question.id.toString()}</span>
        <span className="text-xs font-semibold text-[#0A1F44] bg-[#0A1F44]/5 px-2 py-0.5 rounded">
          Ans: {question.correctOption}
        </span>
      </div>
    </div>
  );
}
