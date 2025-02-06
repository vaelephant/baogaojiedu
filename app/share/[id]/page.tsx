"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileText, Loader2 } from 'lucide-react';

interface ShareInfo {
  fileName: string;
  fileUrl: string;
  downloads: number;
}

export default function SharePage() {
  const params = useParams();
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadShareInfo = async () => {
      try {
        const response = await fetch(`/api/share/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '获取分享信息失败');
        }

        setShareInfo(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : '未知错误');
      } finally {
        setIsLoading(false);
      }
    };

    loadShareInfo();
  }, [params.id]);

  const handleDownload = () => {
    if (!shareInfo) return;
    
    const link = document.createElement('a');
    link.href = shareInfo.fileUrl;
    link.download = shareInfo.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md w-full text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">访问失败</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.close()}>
            关闭页面
          </Button>
        </Card>
      </div>
    );
  }

  if (!shareInfo) return null;

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="p-6 max-w-md w-full">
        <div className="text-center mb-6">
          <FileText className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{shareInfo.fileName}</h2>
          <p className="text-sm text-gray-500">
            已下载 {shareInfo.downloads} 次
          </p>
        </div>
        <Button 
          className="w-full" 
          onClick={handleDownload}
        >
          <Download className="mr-2 h-4 w-4" />
          下载文件
        </Button>
      </Card>
    </div>
  );
} 