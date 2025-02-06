import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SHARE_FILE = path.join(process.cwd(), 'data', 'shares.json');
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const shareId = params.id;
    
    // 读取分享数据
    const sharesData = await fs.readFile(SHARE_FILE, 'utf-8');
    const shares = JSON.parse(sharesData);
    
    // 查找分享链接
    const share = shares.find((s: any) => s.id === shareId);
    if (!share) {
      return NextResponse.json(
        { error: '分享链接不存在或已过期' },
        { status: 404 }
      );
    }

    // 检查是否过期
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: '分享链接已过期' },
        { status: 410 }
      );
    }

    // 更新下载次数
    share.downloads += 1;
    await fs.writeFile(SHARE_FILE, JSON.stringify(shares, null, 2));

    // 返回文件信息
    return NextResponse.json({
      fileName: share.fileName,
      fileUrl: `/uploads/${share.fileId}`,
      downloads: share.downloads
    });

  } catch (error) {
    console.error('Share access error:', error);
    return NextResponse.json(
      { error: '访问分享链接失败' },
      { status: 500 }
    );
  }
} 