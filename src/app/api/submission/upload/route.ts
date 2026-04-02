import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: NextRequest) {
  try {
    const authClient = await createServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Giris edin' }, { status: 401 });

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
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'submissions');
    if (!bucketExists) {
      await supabase.storage.createBucket('submissions', {
        public: false,
        fileSizeLimit: MAX_FILE_SIZE,
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = `${teamId}/${file.name}`;

    const { error } = await supabase.storage
      .from('submissions')
      .upload(filePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Server xetasi: ' + (err instanceof Error ? err.message : 'Unknown') }, { status: 500 });
  }
}
