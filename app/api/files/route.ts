import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function GET() {
  try {
    const files = await readdir(UPLOAD_DIR);
    
    const fileDetails = await Promise.all(
      files.map(async (fileName) => {
        const filePath = path.join(UPLOAD_DIR, fileName);
        const stats = await stat(filePath);
        
        return {
          id: fileName,
          fileName,
          originalName: fileName,
          fileUrl: `/uploads/${fileName}`,
          size: stats.size,
          type: path.extname(fileName).slice(1),
          createdAt: stats.birthtime.toISOString(),
        };
      })
    );

    return NextResponse.json({
      files: fileDetails
    });

  } catch (error) {
    console.error('Error reading files:', error);
    return NextResponse.json(
      { error: '获取文件列表失败' },
      { status: 500 }
    );
  }
} 