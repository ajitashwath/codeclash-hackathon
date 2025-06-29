'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { X, Upload, File, Image, FileText, AlertCircle } from 'lucide-react';

export interface AttachmentFile {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'document' | 'other';
  uploadProgress?: number;
  error?: string;
}

interface AttachmentUploadProps {
  attachments: AttachmentFile[];
  onAttachmentsChange: (attachments: AttachmentFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function AttachmentUpload({
  attachments,
  onAttachmentsChange,
  maxFiles = 3,
  maxFileSize = MAX_FILE_SIZE,
  disabled = false
}: AttachmentUploadProps) {
  const [uploading, setUploading] = useState(false);

  const getFileType = (file: File): AttachmentFile['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) return 'document';
    return 'other';
  };

  const createFilePreview = async (file: File): Promise<string | undefined> => {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }
    return undefined;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return;

    setUploading(true);
    const newAttachments: AttachmentFile[] = [];

    for (const file of acceptedFiles) {
      if (attachments.length + newAttachments.length >= maxFiles) {
        break;
      }

      if (file.size > maxFileSize) {
        newAttachments.push({
          id: `${Date.now()}_${Math.random()}`,
          file,
          type: getFileType(file),
          error: `File too large. Max size: ${formatFileSize(maxFileSize)}`
        });
        continue;
      }

      const preview = await createFilePreview(file);
      newAttachments.push({
        id: `${Date.now()}_${Math.random()}`,
        file,
        type: getFileType(file),
        preview,
        uploadProgress: 100
      });
    }

    onAttachmentsChange([...attachments, ...newAttachments]);
    setUploading(false);
  }, [attachments, onAttachmentsChange, maxFiles, maxFileSize, disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'application/pdf': [],
      'text/plain': []
    },
    maxFiles: maxFiles - attachments.length,
    disabled: disabled || attachments.length >= maxFiles
  });

  const removeAttachment = (id: string) => {
    onAttachmentsChange(attachments.filter(a => a.id !== id));
  };

  const getFileIcon = (type: AttachmentFile['type']) => {
    switch (type) {
      case 'image': return Image;
      case 'document': return FileText;
      default: return File;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Upload className="w-3 h-3 text-gray-400" />
        <span className="text-xs font-medium text-white">Attachments</span>
        <span className="text-xs text-gray-500">({attachments.length}/{maxFiles})</span>
      </div>

      {/* Upload Area */}
      {attachments.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/30'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-400 mb-1">
            {isDragActive ? 'Drop files here...' : 'Drag & drop files'}
          </p>
          <p className="text-xs text-gray-500">
            Max {maxFiles} files, {formatFileSize(maxFileSize)} each
          </p>
        </div>
      )}

      {/* Attachment List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => {
            const FileIcon = getFileIcon(attachment.type);
            
            return (
              <div key={attachment.id} className="flex items-center gap-2 p-2 bg-gray-800/50 rounded border border-gray-700">
                {/* File Icon/Preview */}
                <div className="flex-shrink-0">
                  {attachment.preview ? (
                    <img 
                      src={attachment.preview} 
                      alt={attachment.file.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                      <FileIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {attachment.file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatFileSize(attachment.file.size)}
                  </p>
                  
                  {/* Error Message */}
                  {attachment.error && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-red-400" />
                      <p className="text-xs text-red-400">{attachment.error}</p>
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(attachment.id)}
                  className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 p-1 h-6 w-6"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AttachmentUpload;