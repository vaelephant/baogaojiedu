"use client";

import { useState, useEffect } from "react";
import { FileList } from "@/components/file/file-list";
import { FileStats } from "@/components/file/file-stats";
import { UploadCard } from "@/components/upload/upload-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function FilesPage() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载文件列表
  const loadFiles = async () => {
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      setFiles(data.files);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // 处理文件上传完成
  const handleUploadComplete = async () => {
    await loadFiles(); // 重新加载文件列表
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-100">文件管理</h1>
      
      <Tabs defaultValue="files" className="w-full">
        <TabsList>
          <TabsTrigger value="files">文件列表</TabsTrigger>
          <TabsTrigger value="upload">上传文件</TabsTrigger>
          <TabsTrigger value="stats">统计信息</TabsTrigger>
        </TabsList>

        <TabsContent value="files">
          <FileList 
            files={files} 
            isLoading={isLoading} 
            onDelete={loadFiles}
          />
        </TabsContent>

        <TabsContent value="upload">
          <Card className="p-6">
            <UploadCard 
              onFileSelect={() => handleUploadComplete()} 
              multiple={true}
            />
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <FileStats files={files} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 