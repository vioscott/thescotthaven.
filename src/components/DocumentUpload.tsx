import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, CheckCircle } from 'lucide-react';

interface DocumentUploadProps {
    onFileSelect: (file: File) => void;
    onFileRemove?: () => void;
    acceptedTypes?: string;
    maxSizeMB?: number;
    selectedFile?: File | null;
    uploading?: boolean;
}

export function DocumentUpload({
    onFileSelect,
    onFileRemove,
    acceptedTypes = 'image/*,.pdf',
    maxSizeMB = 5,
    selectedFile,
    uploading = false
}: DocumentUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): boolean => {
        setError(null);

        // Check file size
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            setError(`File size must be less than ${maxSizeMB}MB`);
            return false;
        }

        // Check file type
        const acceptedTypesArray = acceptedTypes.split(',').map(t => t.trim());
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const mimeType = file.type;

        const isAccepted = acceptedTypesArray.some(type => {
            if (type.startsWith('.')) {
                return fileExtension === type.toLowerCase();
            }
            if (type.includes('/*')) {
                const baseType = type.split('/')[0];
                return mimeType.startsWith(baseType);
            }
            return mimeType === type;
        });

        if (!isAccepted) {
            setError('File type not supported. Please upload PDF or image files.');
            return false;
        }

        return true;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && validateFile(file)) {
            onFileSelect(file);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file && validateFile(file)) {
            onFileSelect(file);
        }
    };

    const handleRemove = () => {
        setError(null);
        if (onFileRemove) {
            onFileRemove();
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
            return <ImageIcon className="w-8 h-8 text-blue-500" />;
        }
        return <FileText className="w-8 h-8 text-red-500" />;
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-3">
            {!selectedFile ? (
                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Click to upload
                        </button>
                        {' '}or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                        PDF or images (max {maxSizeMB}MB)
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={acceptedTypes}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start gap-3">
                        {getFileIcon(selectedFile.name)}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {formatFileSize(selectedFile.size)}
                            </p>
                        </div>
                        {uploading ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                <span className="text-sm text-gray-600">Uploading...</span>
                            </div>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    disabled={uploading}
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}
        </div>
    );
}
