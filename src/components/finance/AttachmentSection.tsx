import React, { useRef, useState } from 'react';
import { Paperclip, X, FileText, Image, FileSpreadsheet, File, Upload } from 'lucide-react';

const TEXT_MAIN = 'hsl(215,28%,14%)';
const TEXT_MUTE = 'hsl(220,12%,54%)';
const BORDER    = 'hsl(220,16%,90%)';
const PRIMARY   = 'hsl(184,72%,32%)';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Props {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
}

function fileIcon(type: string) {
  if (type.startsWith('image/')) return <Image size={14} style={{ color: 'hsl(270,60%,50%)' }} />;
  if (type === 'application/pdf') return <FileText size={14} style={{ color: 'hsl(354,70%,50%)' }} />;
  if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet size={14} style={{ color: 'hsl(158,70%,36%)' }} />;
  return <File size={14} style={{ color: TEXT_MUTE }} />;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function AttachmentSection({ attachments, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const newAttachments: Attachment[] = Array.from(files).map(f => ({
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: f.name,
      size: f.size,
      type: f.type,
      url: URL.createObjectURL(f),
    }));
    onChange([...attachments, ...newAttachments]);
  }

  function remove(id: string) {
    onChange(attachments.filter(a => a.id !== id));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Paperclip size={13} style={{ color: TEXT_MUTE }} />
        <span className="text-xs font-medium" style={{ color: TEXT_MUTE }}>Attachments</span>
        {attachments.length > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: `${PRIMARY}18`, color: PRIMARY }}>
            {attachments.length}
          </span>
        )}
      </div>

      {/* Drop zone */}
      <div
        className="rounded-lg border-2 border-dashed p-4 flex flex-col items-center gap-2 cursor-pointer transition-colors"
        style={{
          borderColor: dragging ? PRIMARY : BORDER,
          background: dragging ? `${PRIMARY}08` : 'transparent',
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      >
        <Upload size={18} style={{ color: dragging ? PRIMARY : TEXT_MUTE }} />
        <p className="text-xs text-center" style={{ color: TEXT_MUTE }}>
          <span className="font-medium" style={{ color: PRIMARY }}>Click to upload</span> or drag & drop
        </p>
        <p className="text-[10px]" style={{ color: TEXT_MUTE }}>PNG, JPG, PDF, XLSX · Max 10 MB</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,application/pdf,.xlsx,.xls,.doc,.docx,.csv"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Attachment list */}
      {attachments.length > 0 && (
        <div className="space-y-1.5">
          {attachments.map(a => (
            <div
              key={a.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border"
              style={{ borderColor: BORDER, background: 'hsl(220,16%,98%)' }}
            >
              <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: BORDER }}>
                {fileIcon(a.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate" style={{ color: TEXT_MAIN }}>{a.name}</p>
                <p className="text-[10px]" style={{ color: TEXT_MUTE }}>{formatBytes(a.size)}</p>
              </div>
              <button
                className="p-0.5 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                onClick={() => remove(a.id)}
                title="Remove"
              >
                <X size={12} style={{ color: 'hsl(354,70%,50%)' }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
