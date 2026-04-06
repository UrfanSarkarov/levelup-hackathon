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
import { Button } from '@/components/ui/button';
import {
  Bell,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Inbox,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ── Local notification shape ───────────────────────────── */
interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  isRead: boolean;
}

/* ── Icon by type ────────────────────────────────────────── */
function NotificationIcon({ type }: { type: Notification['type'] }) {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="size-5 text-[#6BBF6B]" />;
    case 'warning':
      return <AlertTriangle className="size-5 text-amber-500" />;
    case 'error':
      return <XCircle className="size-5 text-red-500" />;
    default:
      return <Info className="size-5 text-[#0D47A1]" />;
  }
}

/* ── Normalize notification_type enum to simple type ───── */
function normalizeType(dbType: string): Notification['type'] {
  if (dbType === 'success') return 'success';
  if (dbType === 'warning') return 'warning';
  if (dbType === 'error') return 'error';
  return 'info'; // info, team_invite, team_update, phase_change, etc.
}

/* ── Page ────────────────────────────────────────────────── */
export default function BildirislerPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data: notifs } = await supabase
          .from('notifications')
          .select('id, title, body, type, is_read, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (notifs && notifs.length > 0) {
          setNotifications(
            notifs.map((n) => ({
              id: n.id,
              title: n.title,
              body: n.body ?? '',
              type: normalizeType(n.type),
              timestamp: n.created_at,
              isRead: n.is_read,
            }))
          );
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
      }
    } catch {
      // Silently fail
    }
  };

  const toggleRead = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    if (!target) return;

    const newIsRead = !target.isRead;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: newIsRead } : n))
    );

    try {
      const supabase = createClient();
      await supabase
        .from('notifications')
        .update({ is_read: newIsRead })
        .eq('id', id);
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#0D47A1]/10 p-2">
            <Bell className="size-5 text-[#0D47A1]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Bildirisler
              </h1>
              {unreadCount > 0 && (
                <Badge className="bg-[#0D47A1] text-white">
                  {unreadCount} yeni
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Butun bildirisleriniz burada
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllRead}>
            <CheckCheck className="mr-2 size-4" />
            Hamisini oxunmus et
          </Button>
        )}
      </div>

      {/* Notifications list */}
      <div aria-live="polite" aria-relevant="additions">
      {loading ? (
        <div className="flex items-center justify-center py-12" role="status" aria-label="Yüklənir">
          <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Bildirişlər yüklənir...</span>
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Inbox className="mb-3 size-12" />
            <p className="font-medium">Hec bir bildiris yoxdur</p>
            <p className="mt-1 text-sm">
              Yeni bildirisler olduqda burada gorunecek
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3" role="list" aria-label="Bildirişlər siyahısı">
          {notifications.map((n) => (
            <Card
              key={n.id}
              role="listitem"
              aria-label={`${n.title}${!n.isRead ? ' - oxunmamış' : ''}`}
              className={`cursor-pointer transition-colors ${
                !n.isRead ? 'border-[#0D47A1]/20 bg-[#0D47A1]/5' : ''
              }`}
              onClick={() => toggleRead(n.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleRead(n.id); } }}
              tabIndex={0}
            >
              <CardContent className="flex items-start gap-4 py-4">
                <div className="mt-0.5 shrink-0">
                  <NotificationIcon type={n.type} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{n.title}</p>
                    {!n.isRead && (
                      <Badge variant="secondary" className="text-[10px]">
                        Yeni
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {n.body}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(n.timestamp).toLocaleDateString('az-AZ', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
