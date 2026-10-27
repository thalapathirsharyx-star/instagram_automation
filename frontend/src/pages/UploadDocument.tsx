import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useToast } from '../context/ToastContext';

const UploadDocument: React.FC = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsSaving(true);
      const res = await api.post('/Instagram/KnowledgeBase/Upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.Success) {
        toast.success('Document uploaded', `${file.name} has been processed successfully.`);
        navigate('/knowledge');
      } else {
        toast.error('Upload failed', res.data.Message || 'Failed to process document.');
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error('Upload error', 'Please ensure the file is a valid PDF or TXT.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  // The zone says "drop", so it has to accept a drop, not only a click.
  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isSaving) return;
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!/\.(pdf|txt)$/i.test(file.name)) {
      toast.error('Unsupported file', 'Upload a PDF or TXT file.');
      return;
    }
    uploadFile(file);
  };

  return (
    <div className="page">
      <Link to="/knowledge" className="page-back">
        <ArrowLeft size={16} /> Back to Brain base
      </Link>
      <div className="page-head">
        <div>
          <h1 className="page-title">Upload a document</h1>
          <p className="page-sub">Upload a PDF or TXT file to extract knowledge facts.</p>
        </div>
      </div>

      <div className="surface page-narrow p-5">
        <input
          id="kb-file"
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.txt"
          className="peer sr-only"
          disabled={isSaving}
        />
        <label
          htmlFor="kb-file"
          onDragOver={(e) => { e.preventDefault(); if (!isSaving) setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          aria-busy={isSaving || undefined}
          className={`flex flex-col items-center justify-center rounded-[10px] border-2 border-dashed px-6 py-14 text-center transition-colors peer-focus-visible:border-viridian peer-focus-visible:bg-viridian-tint ${
            isSaving
              ? 'cursor-progress border-hairline'
              : isDragging
                ? 'cursor-copy border-viridian bg-viridian-tint'
                : 'cursor-pointer border-hairline-strong hover:border-viridian hover:bg-porcelain'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 size={32} className="mb-4 animate-spin text-viridian" />
              <p className="text-[16px] font-semibold text-ink">Analyzing content…</p>
              <p className="mt-1 text-[14px] text-ink-soft">This can take a minute for long documents.</p>
            </>
          ) : (
            <>
              <span className="icon-tile mb-4 h-12 w-12"><UploadCloud size={22} /></span>
              <p className="text-[16px] font-semibold text-ink">Drop your file here, or click to browse</p>
              <p className="mt-1 max-w-sm text-[14px] text-ink-soft">
                PDF or TXT. The AI turns the text into searchable knowledge.
              </p>
            </>
          )}
        </label>
      </div>
    </div>
  );
};

export default UploadDocument;
