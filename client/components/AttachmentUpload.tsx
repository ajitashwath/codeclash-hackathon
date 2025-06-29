'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, File, Image, FileText, AlertCircle } from 'lucide-react';
import { formatFileSize } from '@/utils/helpers';

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
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  disabled?: boolean;
}

const DEFAULT_ACCEPTED_TYPES = [
  'image/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function AttachmentUpload({
  attachments,
  onAttachmentsChange,
  maxFiles = 5,
  maxFileSize = MAX_FILE_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
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
        uploadProgress: 0
      });
    }

    // Simulate upload progress
    for (const attachment of newAttachments.filter(a => !a.error)) {
      for (let progress = 0; progress <= 100; progress += 20) {
        setTimeout(() => {
          attachment.uploadProgress = progress;
          onAttachmentsChange([...attachments, ...newAttachments]);
        }, progress * 10);
      }
    }

    onAttachmentsChange([...attachments, ...newAttachments]);
    setUploading(false);
  }, [attachments, onAttachmentsChange, maxFiles, maxFileSize, disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Upload className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-white">Attachments</span>
        <span className="text-xs text-gray-500">({attachments.length}/{maxFiles})</span>
      </div>

      {/* Upload Area */}
      {attachments.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-gray-600 hover:border-gray-500'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-400 mb-1">
            {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
          </p>
          <p className="text-xs text-gray-500">
            Max {maxFiles} files, up to {formatFileSize(maxFileSize)} each
          </p>
        </div>
      )}

      {/* Attachment List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => {
            const FileIcon = getFileIcon(attachment.type);
            
            return (
              <div key={attachment.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                {/* File Icon/Preview */}
                <div className="flex-shrink-0">
                  {attachment.preview ? (
                    <img 
                      src={attachment.preview} 
                      alt={attachment.file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                      <FileIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {attachment.file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatFileSize(attachment.file.size)}
                  </p>
                  
                  {/* Upload Progress */}
                  {attachment.uploadProgress !== undefined && attachment.uploadProgress < 100 && (
                    <Progress value={attachment.uploadProgress} className="mt-1 h-1" />
                  )}
                  
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
                  className="text-gray-400 hover:text-red-400 p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Status */}
      {uploading && (
        <div className="text-center">
          <p className="text-sm text-blue-400">Uploading files...</p>
        </div>
      )}
    </div>
  );
}

export default AttachmentUpload;