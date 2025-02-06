import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// 添加配置
export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 解码文件名并清理路径
    const decodedId = decodeURIComponent(params.id);
    const safePath = path.normalize(decodedId).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(UPLOAD_DIR, safePath);
    
    // 验证文件路径是否在允许的目录内
    if (!filePath.startsWith(UPLOAD_DIR)) {
      return NextResponse.json(
        { error: '无效的文件路径' },
        { status: 400 }
      );
    }

    await unlink(filePath);

    return NextResponse.json({
      success: true,
      message: '文件删除成功'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { 
        error: '删除文件失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 