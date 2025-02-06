"use client";

import { Upload, FileText, Loader2, X, Image as ImageIcon, FileIcon } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import Image from "next/image";

interface FileWithPreview extends File {
  preview?: string;
}

interface UploadCardProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 获取文件类型图标
function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <ImageIcon className="h-6 w-6" />;
  return <FileIcon className="h-6 w-6" />;
}

export function UploadCard({ onFileSelect, accept = ".txt,.doc,.docx,.pdf,.png,.jpg,.jpeg", multiple = true }: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 创建文件预览
  const createPreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        resolve('');
      }
    });
  }, []);

  // 处理文件选择
  const handleFiles = useCallback(async (files: FileList) => {
    const newFiles: FileWithPreview[] = Array.from(files);
    
    // 为每个文件创建预览
    for (const file of newFiles) {
      file.preview = await createPreview(file);
    }
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  }, [createPreview]);

  // 处理文件上传
  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    const uploads = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const xhr = new XMLHttpRequest();
        
        // 更精确的进度跟踪
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: progress
            }));
            console.log(`Upload progress for ${file.name}: ${progress}%`); // 调试用
          }
        };

        const response = await new Promise((resolve, reject) => {
          xhr.open('POST', '/api/upload');
          
          // 添加事件监听器
          xhr.upload.onloadstart = () => {
            console.log(`Started uploading ${file.name}`); // 调试用
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: 0
            }));
          };

          xhr.upload.onload = () => {
            console.log(`Completed uploading ${file.name}`); // 调试用
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: 100
            }));
          };

          xhr.onload = () => resolve(xhr.response);
          xhr.onerror = () => reject(xhr.statusText);
          xhr.send(formData);
        });

        const result = JSON.parse(response as string);
        if (!result.success) throw new Error(result.error);
        
        toast.success(`${file.name} 上传成功`);
        return result;
      } catch (error) {
        toast.error(`${file.name} 上传失败`);
        throw error;
      }
    });

    try {
      await Promise.all(uploads);
      onFileSelect(files);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      // 延迟清除状态，让用户能看到 100% 的进度
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress({});
        setSelectedFiles([]);
      }, 1000);
    }
  };

  // 移除选中的文件
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Card 
        className={`relative overflow-hidden border-2 border-dashed transition-colors ${
          isDragging 
            ? 'border-gray-400 bg-gray-800/50' 
            : 'border-gray-700 hover:border-gray-600 bg-gray-900'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 opacity-50"></div>
        <div className="relative p-8 text-center">
          <div className="bg-gray-800 p-4 rounded-full inline-block shadow-md mb-4">
            <Upload className="h-8 w-8 text-gray-100" />
          </div>
          <h2 className="text-xl font-semibold text-gray-100">
            {isDragging ? '释放以上传文件' : '上传医疗报告'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            支持拖拽或点击上传，可以同时选择多个文件
          </p>
          <div className="mt-6">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-100 hover:bg-white text-gray-900"
              disabled={isUploading}
            >
              选择文件
            </Button>
          </div>
        </div>
      </Card>

      {/* 选中文件预览 */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {selectedFiles.map((file, index) => (
              <Card key={index} className="p-4 bg-gray-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {file.preview ? (
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden">
                        <Image
                          src={file.preview}
                          alt={file.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      getFileIcon(file.type)
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-gray-300"
                    disabled={isUploading}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {uploadProgress[file.name] !== undefined && (
                  <div className="mt-3">
                    <Progress 
                      value={uploadProgress[file.name]} 
                      className="h-1"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {Math.round(uploadProgress[file.name])}%
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={() => uploadFiles(selectedFiles)}
              disabled={isUploading || selectedFiles.length === 0}
              className="bg-gray-100 hover:bg-white text-gray-900"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在上传...
                </>
              ) : (
                '开始上传'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 