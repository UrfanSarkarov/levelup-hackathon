'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { User, Camera, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ── Page ────────────────────────────────────────────────── */
export default function MentorProfilPage() {
  const [formData, setFormData] = useState({
    firstName: 'Kamran',
    lastName: 'Resulzade',
    email: 'kamran@example.com',
    phone: '+994 55 111 22 33',
    bio: 'Cloud architect ve DevOps mutexessisi. AWS, GCP ve Azure platformalarinda 10+ il tecrube.',
    organization: 'CloudAz Solutions',
    expertise: 'Cloud Architecture, DevOps, CI/CD',
  });
  const [useMock, setUseMock] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user');

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (!profile) throw new Error('No profile');

        // Split full_name into first/last
        const nameParts = (profile.full_name || '').trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        setFormData({
          firstName,
          lastName,
          email: profile.email || user.email || '',
          phone: profile.phone || '',
          bio: profile.bio || '',
          organization: profile.organization || '',
          expertise: formData.expertise, // not in profiles table, keep default
        });
        setUseMock(false);
      } catch {
        // Keep hardcoded defaults on error
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSaving(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: formData.phone,
          bio: formData.bio,
          organization: formData.organization,
        })
        .eq('id', user.id);

      if (error) throw error;

      setFeedback({ type: 'success', message: 'Profil ugurla yenilendi!' });
    } catch {
      setFeedback({ type: 'error', message: 'Profili yenilemek mumkun olmadi.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Yuklenilir...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mock-data warning */}
      {useMock && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
          <AlertTriangle className="size-4 shrink-0" />
          <span>Supabase-a qosula bilmedi. Default melumatlar gosterilir.</span>
        </div>
      )}

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
            feedback.type === 'success'
              ? 'border-green-300 bg-green-50 text-green-800'
              : 'border-red-300 bg-red-50 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="size-4 shrink-0" />
          ) : (
            <AlertTriangle className="size-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#2EC4B6]/10 p-2">
          <User className="size-5 text-[#2EC4B6]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
          <p className="text-muted-foreground">
            Mentor profilinizi idarə edin
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Sexsi Melumatlar</CardTitle>
            <CardDescription>
              Profilinizi yenilemek ucun asagidaki formu doldurun
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar upload placeholder */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="flex size-20 items-center justify-center rounded-full bg-[#0D47A1]/10 text-2xl font-bold text-[#0D47A1]">
                  {formData.firstName[0]}
                  {formData.lastName[0]}
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#0D47A1] text-white"
                >
                  <Camera className="size-4" />
                </button>
              </div>
              <div>
                <p className="font-medium">Profil sekli</p>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG. Maks. 2MB
                </p>
              </div>
            </div>

            <Separator />

            {/* Name fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Ad</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Soyad</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email (disabled) */}
            <div className="space-y-2">
              <Label htmlFor="email">E-poct</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                E-poct unvani deyisdirile bilmez
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* Expertise */}
            <div className="space-y-2">
              <Label htmlFor="expertise">Ixtisas sahesi</Label>
              <Input
                id="expertise"
                name="expertise"
                value={formData.expertise}
                onChange={handleChange}
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
              />
            </div>

            {/* Organization */}
            <div className="space-y-2">
              <Label htmlFor="organization">Teskilat</Label>
              <Input
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
              />
            </div>

            <Separator />

            {/* Save button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#0D47A1] text-white hover:bg-[#0D47A1]/90"
              >
                <Save className="mr-2 size-4" />
                {saving ? 'Saxlanilir...' : 'Yadda saxla'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
