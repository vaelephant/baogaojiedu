import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

// 存储分享链接信息的文件
const SHARE_FILE = path.join(process.cwd(), 'data', 'shares.json');
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// 分享链接的数据结构
interface ShareLink {
  id: string;
  fileId: string;
  fileName: string;
  createdAt: string;
  expiresAt: string | null;
  downloads: number;
}

// 生成唯一的分享ID
function generateShareId(): string {
  return randomBytes(8).toString('hex');
}

// 读取分享数据
async function getShares(): Promise<ShareLink[]> {
  try {
    const data = await fs.readFile(SHARE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// 保存分享数据
async function saveShares(shares: ShareLink[]): Promise<void> {
  await fs.mkdir(path.dirname(SHARE_FILE), { recursive: true });
  await fs.writeFile(SHARE_FILE, JSON.stringify(shares, null, 2));
}

// 创建分享链接
export async function POST(request: Request) {
  try {
    const { fileId, fileName, expiresIn } = await request.json();

    // 验证文件是否存在
    const filePath = path.join(UPLOAD_DIR, fileId);
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      );
    }

    const shares = await getShares();
    
    // 检查是否已经存在分享链接
    const existingShare = shares.find(s => s.fileId === fileId);
    if (existingShare) {
      return NextResponse.json({ shareId: existingShare.id });
    }

    const shareId = generateShareId();
    const now = new Date();
    const share: ShareLink = {
      id: shareId,
      fileId,
      fileName,
      createdAt: now.toISOString(),
      expiresAt: expiresIn ? new Date(now.getTime() + expiresIn * 1000).toISOString() : null,
      downloads: 0
    };

    shares.push(share);
    await saveShares(shares);

    return NextResponse.json({ shareId });

  } catch (error) {
    console.error('Share creation error:', error);
    return NextResponse.json(
      { error: '创建分享链接失败' },
      { status: 500 }
    );
  }
}

// 获取分享链接列表
export async function GET() {
  try {
    const shares = await getShares();
    
    // 清理过期的分享
    const now = new Date();
    const validShares = shares.filter(share => {
      if (!share.expiresAt) return true;
      return new Date(share.expiresAt) > now;
    });

    if (validShares.length !== shares.length) {
      await saveShares(validShares);
    }

    return NextResponse.json({ shares: validShares });

  } catch (error) {
    console.error('Share list error:', error);
    return NextResponse.json(
      { error: '获取分享列表失败' },
      { status: 500 }
    );
  }
} 