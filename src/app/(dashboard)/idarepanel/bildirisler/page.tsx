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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// native select for form reliability
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  CheckCircle2,
  Clock,
  Send,
} from 'lucide-react';

/* ── Mock sent notifications ─────────────────────────────── */
interface SentNotification {
  id: string;
  recipient: string;
  subject: string;
  sentAt: string;
  status: 'delivered' | 'pending';
}

const RECIPIENT_OPTIONS = [
  { value: 'all_teams', label: 'Butun komandalar' },
  { value: 'selected_teams', label: 'Secilmis komandalar' },
  { value: 'trainers', label: 'Telimciler' },
  { value: 'mentors', label: 'Mentorlar' },
];

/* ── Page ─────────────────────────────────────────────────── */
export default function BildirislerPage() {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load sent notifications from Supabase
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/notifications');
        const { notifications: notifs } = await res.json();
        const error = !notifs;

        if (error || !notifs || notifs.length === 0) throw new Error('no data');

        const RECIPIENT_LABELS: Record<string, string> = {
          announcement: 'Butun komandalar',
          team_update: 'Komandalar',
          session_reminder: 'Istirakcilar',
        };

        setSentNotifications(notifs.map((n: { id: string; title: string; body: string; type: string; created_at: string; user_id: string | null }) => ({
          id: n.id,
          recipient: n.user_id ? 'Ferdi bildiris' : (RECIPIENT_LABELS[n.type] ?? 'Hamiya'),
          subject: n.title,
          sentAt: n.created_at,
          status: 'delivered' as const,
        })));
      } catch {
        // leave defaults
      } finally {
        setLoadingHistory(false);
      }
    })();
  }, [sent]);

  async function handleSend() {
    if (!recipient || !subject || !body) return;
    setSending(true);
    try {
      const { sendNotification } = await import('./actions');
      const result = await sendNotification({
        recipient,
        title: subject,
        message: body,
        type: 'announcement',
      });
      if (result.error) {
        alert('Xeta: ' + result.error);
      } else {
        setSent(true);
        setSubject('');
        setBody('');
        setRecipient('');
        setTimeout(() => setSent(false), 3000);
      }
    } catch {
      alert('Şəbəkə xətası');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bildiris Gonder</h1>
        <p className="text-muted-foreground">
          Istirakci ve komandalara bildiris gonderin
        </p>
      </div>

      {/* Send form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-5 text-[#0D47A1]" />
            Yeni Bildiris
          </CardTitle>
          <CardDescription>
            Alicini secin, movzu ve mezmunu yazin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recipient */}
          <div className="space-y-2">
            <Label>Alici</Label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Alici secin...</option>
              {RECIPIENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label>Movzu</Label>
            <Input
              placeholder="Bildiris movzusu..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label>Mezmun</Label>
            <Textarea
              placeholder="Bildiris mezmununu yazin..."
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          {/* Send button */}
          <div className="flex items-center gap-3">
            <Button
              className="bg-[#0D47A1] hover:bg-[#0D47A1]/90 text-white"
              onClick={handleSend}
              disabled={!recipient || !subject || !body || sending}
            >
              {sending ? (
                <>
                  <Clock className="size-4 mr-2 animate-spin" />
                  Gonderilir...
                </>
              ) : (
                <>
                  <Send className="size-4 mr-2" />
                  Gonder
                </>
              )}
            </Button>
            {sent && (
              <div className="flex items-center gap-1.5 text-sm text-[#6BBF6B]">
                <CheckCircle2 className="size-4" />
                Bildiris ugurla gonderildi!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Sent notifications list */}
      <Card>
        <CardHeader>
          <CardTitle>Son Gonderilen Bildirisler</CardTitle>
          <CardDescription>
            Axirinci gonderilen bildirisler
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="text-center py-8 text-muted-foreground">Yuklenilir...</div>
          ) : sentNotifications.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Hələ bildiris göndərilməyib
            </p>
          ) : (
          <div className="space-y-4">
            {sentNotifications.map((notif) => (
              <div
                key={notif.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex size-8 items-center justify-center rounded-full ${
                      notif.status === 'delivered'
                        ? 'bg-[#6BBF6B]/10'
                        : 'bg-amber-100'
                    }`}
                  >
                    {notif.status === 'delivered' ? (
                      <CheckCircle2 className="size-4 text-[#6BBF6B]" />
                    ) : (
                      <Clock className="size-4 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{notif.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      Alici: {notif.recipient}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notif.sentAt).toLocaleDateString('az-AZ', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    notif.status === 'delivered' ? 'default' : 'secondary'
                  }
                >
                  {notif.status === 'delivered' ? 'Catdirildi' : 'Gozleyir'}
                </Badge>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
