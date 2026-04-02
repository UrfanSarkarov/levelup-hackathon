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
import { User, Camera, Save, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ── Page ────────────────────────────────────────────────── */
export default function TelminciProfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: 'Ceyhun',
    lastName: 'Huseynov',
    email: 'ceyhun@example.com',
    phone: '+994 50 987 65 43',
    bio: 'Senior frontend developer, 7+ il tecrube. React, Next.js, TypeScript uzre mutexessis.',
    organization: 'TechAz MMC',
    trainingTopic: 'React Advanced Patterns, TypeScript Best Practices',
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, phone, bio, organization, expertise_area')
          .eq('id', user.id)
          .single();

        if (profile) {
          const nameParts = (profile.full_name ?? '').split(' ');
          setFormData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: profile.email ?? user.email ?? '',
            phone: profile.phone ?? '',
            bio: profile.bio ?? '',
            organization: profile.organization ?? '',
            trainingTopic: profile.expertise_area ?? '',
          });
        }
      } catch {
        // Keep hardcoded defaults as fallback
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear feedback when user edits
    if (saveSuccess) setSaveSuccess(false);
    if (saveError) setSaveError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('no user');

      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: formData.phone || null,
          bio: formData.bio || null,
          organization: formData.organization || null,
          expertise_area: formData.trainingTopic || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      setSaveSuccess(true);
    } catch {
      setSaveError('Melumatlar yadda saxlanila bilmedi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#2EC4B6]/10 p-2">
          <User className="size-5 text-[#2EC4B6]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
          <p className="text-muted-foreground">
            Telimci profilinizi idarə edin
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
                  {formData.firstName[0] ?? ''}
                  {formData.lastName[0] ?? ''}
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

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
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

                {/* Training topic */}
                <div className="space-y-2">
                  <Label htmlFor="trainingTopic">Telim movzusu</Label>
                  <Input
                    id="trainingTopic"
                    name="trainingTopic"
                    value={formData.trainingTopic}
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

                {/* Save feedback */}
                {saveSuccess && (
                  <div className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>Melumatlar ugurla yadda saxlandi</span>
                  </div>
                )}
                {saveError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                {/* Save button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-[#0D47A1] text-white hover:bg-[#0D47A1]/90"
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 size-4" />
                    )}
                    Yadda saxla
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
