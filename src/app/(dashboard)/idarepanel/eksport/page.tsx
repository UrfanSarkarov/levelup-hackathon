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
} from 'lucide-react';

/* ── Export items ─────────────────────────────────────────── */
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

/* ── Page ─────────────────────────────────────────────────── */
export default function EksportPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Melumat Eksportu</h1>
        <p className="text-muted-foreground">
          Hackathon melumatlarini Excel formatinda yukleyin
        </p>
      </div>

      {/* Export cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXPORT_ITEMS.map((item) => {
          const Icon = item.icon;

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
                <a href={item.endpoint} download>
                  <Button
                    variant="outline"
                    className="w-full border-[#0D47A1]/20 text-[#0D47A1] hover:bg-[#0D47A1]/5"
                  >
                    <FileSpreadsheet className="size-4 mr-2" />
                    Excel-e yukle
                  </Button>
                </a>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info card */}
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
