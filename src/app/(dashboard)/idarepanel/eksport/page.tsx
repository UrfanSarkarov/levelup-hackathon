'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Download,
  FileSpreadsheet,
  Users,
  UserCheck,
  ClipboardList,
  GraduationCap,
  Star,
  Presentation,
  FileText,
  Loader2,
} from 'lucide-react';

interface ExportItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  endpoint: string;
}

const EXPORT_ITEMS: ExportItem[] = [
  {
    id: 'participants',
    title: 'Istirakcilar',
    description: 'Butun istirakcilarinn adi, emaili, universiteti ve diger melumatlari',
    icon: Users,
    endpoint: '/api/admin/export?type=participants',
  },
  {
    id: 'teams',
    title: 'Komandalar',
    description: 'Komanda adlari, uzv sayi, statuslari ve layihe melumatlari',
    icon: UserCheck,
    endpoint: '/api/admin/export?type=teams',
  },
  {
    id: 'registrations',
    title: 'Qeydiyyat melumatlari',
    description: 'Qeydiyyat tarixi, status ve motivasiya melumat lari',
    icon: ClipboardList,
    endpoint: '/api/admin/export?type=registrations',
  },
  {
    id: 'attendance',
    title: 'Telim davamiyyeti',
    description: 'Telim sessiyalarina qatilim ve davamiyyet melumatlari',
    icon: GraduationCap,
    endpoint: '/api/admin/export?type=attendance',
  },
  {
    id: 'scores',
    title: 'Qiymetler',
    description: 'Munsif qiymetleri, ballar ve reyleri',
    icon: Star,
    endpoint: '/api/admin/export?type=scores',
  },
  {
    id: 'submissions',
    title: 'Teqdimatlar',
    description: 'Komanda layihe teqdimatlari, demo ve repo linkleri',
    icon: Presentation,
    endpoint: '/api/admin/export?type=submissions',
  },
  {
    id: 'full_report',
    title: 'Tam hesabat',
    description: 'Butun melumatlari ehate eden umumi hesabat',
    icon: FileText,
    endpoint: '/api/admin/export?type=full_report',
  },
];

export default function EksportPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDownload = async (item: ExportItem) => {
    setLoadingId(item.id);
    try {
      const res = await fetch(item.endpoint, { credentials: 'include' });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert('Xeta: ' + (data?.error || 'Yuklenme ugursuz oldu'));
        return;
      }

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('json')) {
        const data = await res.json();
        alert('Xeta: ' + (data?.error || 'Yuklenme ugursuz oldu'));
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get('content-disposition') || '';
      const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch?.[1] || `${item.title}.xlsx`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Yuklenme zamani xeta bas verdi');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Melumat Eksportu</h1>
        <p className="text-muted-foreground">
          Hackathon melumatlarini Excel formatinda yukleyin
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXPORT_ITEMS.map((item) => {
          const Icon = item.icon;
          const isLoading = loadingId === item.id;

          return (
            <Card key={item.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[#0D47A1]/10">
                    <Icon className="size-5 text-[#0D47A1]" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {item.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <Button
                  variant="outline"
                  className="w-full border-[#0D47A1]/20 text-[#0D47A1] hover:bg-[#0D47A1]/5"
                  onClick={() => handleDownload(item)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="size-4 mr-2" />
                  )}
                  {isLoading ? 'Yuklenir...' : 'Excel-e yukle'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-[#2EC4B6]/20 bg-[#2EC4B6]/5">
        <CardContent className="flex items-start gap-3 py-4">
          <Download className="size-5 text-[#2EC4B6] mt-0.5" />
          <div>
            <p className="font-medium text-sm">Eksport haqqinda</p>
            <p className="text-sm text-muted-foreground mt-1">
              Butun eksportlar Excel (.xlsx) formatinda yuklenir. Boyuk melumat
              setleri ucun yuklenme bir nece deqiqe ceke biler. Tam hesabat
              butun cedvelleri ehate edir.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
