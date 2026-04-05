'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Crown,
  Mail,
  Phone,
  GraduationCap,
  Loader2,
} from 'lucide-react';
interface TeamMember {
  id: string;
  name: string;
  role: string;
  university: string;
  email: string;
  phone: string;
  initials: string;
  isLeader: boolean;
}

/* ── Page ────────────────────────────────────────────────── */
export default function KomandaUzvlerPage() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    async function loadMembers() {
      try {
        const res = await fetch('/api/team-members');
        const data = await res.json();

        if (data.members && data.members.length > 0) {
          setMembers(
            data.members.map((m: { id: number; full_name: string; email: string; role: string; university: string | null; phone: string | null }) => {
              const nameParts = (m.full_name ?? '').split(' ');
              const initials = nameParts
                .map((p: string) => p[0] ?? '')
                .join('')
                .toUpperCase()
                .slice(0, 2);
              return {
                id: String(m.id),
                name: m.full_name ?? '',
                role: m.role === 'leader' ? 'Lider' : 'Uzv',
                university: m.university ?? '',
                email: m.email ?? '',
                phone: m.phone ?? '',
                initials: initials || '??',
                isLeader: m.role === 'leader',
              };
            })
          );
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#0D47A1]/10 p-2">
          <Users className="size-5 text-[#0D47A1]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Komanda Uzvleri
          </h1>
          <p className="text-muted-foreground">
            Komandanizin butun uzvlerini idar&#601; edin
          </p>
        </div>
      </div>

      {/* Members grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : members.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="mb-3 size-12" />
            <p className="font-medium">Komanda uzvu tapilmadi</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {members.map((member) => (
            <Card key={member.id} className="relative">
              {member.isLeader && (
                <div className="absolute right-4 top-4">
                  <Badge className="bg-[#0D47A1] text-white">
                    <Crown className="mr-1 size-3" />
                    Lider
                  </Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex size-14 items-center justify-center rounded-full bg-[#2EC4B6]/10 text-lg font-bold text-[#2EC4B6]">
                    {member.initials}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      {member.role}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="size-4 shrink-0" />
                  <span>{member.university || 'Gosterilmeyib'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="size-4 shrink-0" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="size-4 shrink-0" />
                  <span>{member.phone || 'Gosterilmeyib'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
