import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Trash2, 
  FileText, 
  Image as ImageIcon,
  File as FileIcon,
  Search,
  SortAsc,
  SortDesc,
  Share2,
  Link,
  Copy
} from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface FileRecord {
  id: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  size: number;
  type: string;
  createdAt: string;
}

interface FileListProps {
  files?: FileRecord[];
  isLoading?: boolean;
  onDelete?: () => void;
}

export function FileList({ 
  files = [],
  isLoading = false, 
  onDelete = () => {} 
}: FileListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof FileRecord>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [localFiles, setLocalFiles] = useState<FileRecord[]>([]);

  // 加载文件列表
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const response = await fetch('/api/files');
        const data = await response.json();
        setLocalFiles(data.files || []);
      } catch (error) {
        console.error('Failed to load files:', error);
        toast.error('加载文件列表失败');
      }
    };

    loadFiles();
  }, []);

  // 使用本地状态的文件列表
  const filesToDisplay = localFiles.length > 0 ? localFiles : files;

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  };

  // 获取文件图标
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  // 处理文件删除
  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('删除失败');
      
      toast.success('文件已删除');
      onDelete();
    } catch (error) {
      toast.error('删除失败');
      console.error('Delete error:', error);
    }
  };

  // 处理文件下载
  const handleDownload = (fileUrl: string, originalName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 排序和过滤文件
  const sortedAndFilteredFiles = filesToDisplay
    .filter(file => 
      file.originalName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // 添加分享对话框组件
  function ShareDialog({ file, onShare }: { file: FileRecord, onShare: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [expiresIn, setExpiresIn] = useState('');

    const handleShare = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/share', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileId: file.fileName,
            fileName: file.originalName,
            expiresIn: expiresIn ? parseInt(expiresIn) : null,
          }),
        });

        const data = await response.json();
        if (!data.shareId) throw new Error('Failed to create share link');

        const shareUrl = `${window.location.origin}/share/${data.shareId}`;
        setShareUrl(shareUrl);
        onShare();
      } catch (error) {
        toast.error('创建分享链接失败');
        console.error('Share error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const copyToClipboard = () => {
      navigator.clipboard.writeText(shareUrl);
      toast.success('分享链接已复制到剪贴板');
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>分享文件</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">文件名</p>
              <p className="text-sm font-medium">{file.originalName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">有效期</p>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger>
                  <SelectValue placeholder="选择有效期" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">永久有效</SelectItem>
                  <SelectItem value="3600">1小时</SelectItem>
                  <SelectItem value="86400">1天</SelectItem>
                  <SelectItem value="604800">7天</SelectItem>
                  <SelectItem value="2592000">30天</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!shareUrl ? (
              <Button 
                onClick={handleShare} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成分享链接...
                  </>
                ) : (
                  '生成分享链接'
                )}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                  <Link className="h-4 w-4 text-gray-500" />
                  <p className="text-sm flex-1 truncate">{shareUrl}</p>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {expiresIn ? `链接将在${parseInt(expiresIn) / 86400}天后过期` : '链接永久有效'}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="搜索文件..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-gray-100 bg-gray-800 border-gray-700"
          />
        </div>
      </div>

      <div className="rounded-md border border-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800">
              <TableHead className="text-gray-100">文件名</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-100 hover:text-gray-300"
                  onClick={() => {
                    setSortField("createdAt");
                    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
                  }}
                >
                  上传时间
                  {sortField === "createdAt" && (
                    sortDirection === "asc" ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-gray-100">大小</TableHead>
              <TableHead className="text-gray-100">类型</TableHead>
              <TableHead className="text-gray-100">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-100">
                  加载中...
                </TableCell>
              </TableRow>
            ) : sortedAndFilteredFiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-100">
                  暂无文件
                </TableCell>
              </TableRow>
            ) : (
              sortedAndFilteredFiles.map((file) => (
                <TableRow key={file.id} className="border-gray-800">
                  <TableCell className="font-medium text-gray-100">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.type)}
                      {file.originalName}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-100">
                    {format(new Date(file.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                  </TableCell>
                  <TableCell className="text-gray-100">{formatFileSize(file.size)}</TableCell>
                  <TableCell className="text-gray-100">{file.type}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-100 hover:text-gray-300"
                        onClick={() => handleDownload(file.fileUrl, file.originalName)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <ShareDialog 
                        file={file} 
                        onShare={() => {}} 
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-100 hover:text-gray-300"
                        onClick={() => handleDelete(file.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 