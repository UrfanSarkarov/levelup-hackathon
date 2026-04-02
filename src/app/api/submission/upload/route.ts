import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: NextRequest) {
  try {
    // Auth is handled by middleware (Supabase session required)
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const teamId = formData.get('teamId') as string | null;

    if (!file || !teamId) {
      return NextResponse.json({ error: 'Fayl ve teamId lazimdir' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Fayl olcusu 10MB-dan boyuk ola bilmez' }, { status: 400 });
    }

    const allowedExtensions = ['.pdf', '.pptx', '.zip'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!hasValidExt) {
      return NextResponse.json({ error: 'Yalniz PDF, PPTX ve ZIP faylları yuklenə biler' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Ensure bucket exists
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === 'submissions');
      if (!bucketExists) {
        await supabase.storage.createBucket('submissions', {
          public: false,
          fileSizeLimit: MAX_FILE_SIZE,
        });
      }
    } catch (bucketErr) {
      console.error('Bucket check/create error:', bucketErr);
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const filePath = `${teamId}/${file.name}`;

    const { error } = await supabase.storage
      .from('submissions')
      .upload(filePath, uint8, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json({ error: 'Fayl yuklenirken xeta: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (err) {
    console.error('Upload route error:', err);
    const msg = err instanceof Error ? err.message : 'Bilinmeyen xeta';
    return NextResponse.json({ error: 'Server xetasi: ' + msg }, { status: 500 });
  }
}
