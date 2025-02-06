import { NextResponse } from 'next/server';
import { writeFile, mkdir, access } from 'fs/promises';
import path from 'path';
import { Readable } from 'stream';

// 定义允许的文件类型
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

// 最大文件大小 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 上传目录配置
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// 处理文件名，确保唯一性并保持原始文件名（包括中文）
async function generateUniqueFileName(originalName: string, uploadDir: string): Promise<string> {
  // 对文件名进行 URL 编码，然后再解码，以处理特殊字符
  const decodedName = decodeURIComponent(originalName);
  
  // 只替换文件系统不允许的字符
  const cleanName = decodedName.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
  let fileName = cleanName;
  let counter = 1;

  // 检查文件是否已存在，如果存在则添加数字后缀
  while (true) {
    try {
      await access(path.join(uploadDir, fileName));
      // 文件存在，添加数字后缀
      const ext = path.extname(cleanName);
      const nameWithoutExt = path.basename(cleanName, ext);
      fileName = `${nameWithoutExt}_${counter}${ext}`;
      counter++;
    } catch {
      // 文件不存在，可以使用这个名字
      break;
    }
  }

  return fileName;
}

export async function POST(request: Request) {
  try {
    // 直接克隆请求以避免流锁定问题
    const clonedRequest = request.clone();
    const formData = await clonedRequest.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '未提供文件' },
        { status: 400 }
      );
    }

    // 文件类型验证
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型' },
        { status: 400 }
      );
    }

    // 文件大小验证
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '文件大小不能超过10MB' },
        { status: 400 }
      );
    }

    // 确保上传目录存在
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error) {
      console.error('Failed to create upload directory:', error);
    }

    const fileName = await generateUniqueFileName(file.name, UPLOAD_DIR);
    const filePath = path.join(UPLOAD_DIR, fileName);

    // 将文件内容转换为 Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 写入文件
    await writeFile(filePath, buffer);

    // 生成文件的访问URL
    const fileUrl = `/uploads/${encodeURIComponent(fileName)}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName,
      originalName: file.name,
      size: file.size,
      type: file.type
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: '上传失败',
        details: error.message || '未知错误'
      },
      { status: 500 }
    );
  }
}

// 增加响应超时时间
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
}; 