import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useToast } from '../context/ToastContext';

const UploadDocument: React.FC = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  return (
    <div className="flex flex-col gap-8 min-h-full animate-in fade-in duration-700 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <button 
            onClick={() => navigate('/knowledge')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary-foreground mb-4 transition-colors font-medium"
          >
            <ArrowLeft size={18} /> Back to Brain Base
          </button>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Upload Document</h1>
          <p className="text-muted-foreground font-medium">Upload a PDF or TXT file to extract knowledge facts.</p>
        </div>
      </div>

      <div className="w3-card p-10 border-purple-500/20 bg-primary animate-in slide-in-from-bottom-4 duration-500 shadow-xl max-w-3xl">
        <div 
          onClick={() => !isSaving && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-white/10 rounded-3xl p-16 text-center ${!isSaving ? 'cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5' : ''} transition-all duration-300 group`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".pdf,.txt" 
            className="hidden"
            disabled={isSaving}
          />
          {isSaving ? (
            <div className="flex flex-col items-center gap-6">
              <Loader2 size={48} className="animate-spin text-purple-500" />
              <p className="font-bold text-zinc-100 text-lg">Analyzing content...</p>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <UploadCloud size={40} className="text-purple-400" />
              </div>
              <h4 className="text-xl font-bold text-zinc-100 mb-2">Drop your file here</h4>
              <p className="text-muted-foreground font-medium max-w-sm mx-auto">Supports PDF and TXT. AI will process the text into searchable knowledge.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadDocument;
