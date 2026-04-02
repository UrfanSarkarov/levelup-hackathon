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
import { User, Camera, Save, Loader2, Check, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ── Page ────────────────────────────────────────────────── */
export default function MunsifProfilPage() {
  const [formData, setFormData] = useState({
    firstName: 'Elvin',
    lastName: 'Novruzlu',
    email: 'elvin@example.com',
    phone: '+994 70 222 33 44',
    bio: 'CTO ve texnologiya munsifi. Startap ekosisteminde 8+ il tecrube. YC alumni.',
    organization: 'AzStartup',
    expertise: 'Startup Mentoring, Product Strategy, Technical Architecture',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('no user');
        setUserId(user.id);

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, phone, bio, organization')
          .eq('id', user.id)
          .single();

        if (profile) {
          const nameParts = (profile.full_name || '').split(' ');
          const firstName = nameParts[0] || formData.firstName;
          const lastName = nameParts.slice(1).join(' ') || formData.lastName;

          setFormData((prev) => ({
            ...prev,
            firstName,
            lastName,
            email: profile.email || user.email || prev.email,
            phone: profile.phone || prev.phone,
            bio: profile.bio || prev.bio,
            organization: profile.organization || prev.organization,
          }));
        }
      } catch {
        // Keep hardcoded defaults as fallback
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
    setSaving(true);
    setSaveMessage(null);

    if (!userId) {
      setSaving(false);
      setSaveMessage('Istifadeci tapilmadi - demo rejimdedir');
      return;
    }

    try {
      const supabase = createClient();
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: formData.phone,
          bio: formData.bio,
          organization: formData.organization,
        })
        .eq('id', userId);

      if (error) throw error;

      setSaveMessage('Profil ugurla yenilendi');
    } catch {
      setSaveMessage('Xeta bas verdi - melumat saxlanilmadi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-[#0D47A1]" />
      </div>
    );
  }

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
            Munsif profilinizi idarə edin
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

            {/* Feedback message */}
            {saveMessage && (
              <div
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${
                  saveMessage.includes('ugurla')
                    ? 'border border-green-300 bg-green-50 text-green-800'
                    : 'border border-amber-300 bg-amber-50 text-amber-800'
                }`}
              >
                {saveMessage.includes('ugurla') ? (
                  <Check className="size-4 shrink-0" />
                ) : (
                  <AlertTriangle className="size-4 shrink-0" />
                )}
                <span>{saveMessage}</span>
              </div>
            )}

            {/* Save button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#0D47A1] text-white hover:bg-[#0D47A1]/90"
              >
                {saving ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Save className="mr-2 size-4" />
                )}
                Yadda saxla
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
