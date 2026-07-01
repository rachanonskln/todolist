import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { ProfileApi } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useLocale } from "@/i18n/LocaleContext";

const AVATAR_SIZE = 256;

/** Downscales + center-crops any uploaded image to a square JPEG data URL so
 * the avatar stays small enough to store as Notion rich_text (chunked, but
 * still bounded) instead of needing separate file storage. */
function resizeToAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not read image"));
      img.onload = () => {
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        const canvas = document.createElement("canvas");
        canvas.width = AVATAR_SIZE;
        canvas.height = AVATAR_SIZE;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function Settings() {
  const { t } = useLocale();
  const { profile, setProfile } = useAuth();
  const [name, setName] = useState(profile?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // `profile` loads asynchronously after this page mounts, so seed the
  // editable field once it arrives instead of only reading it at mount time.
  useEffect(() => {
    if (profile) setName(profile.name ?? "");
  }, [profile]);

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    try {
      const avatarUrl = await resizeToAvatar(file);
      const updated = await ProfileApi.update({ avatarUrl });
      setProfile(updated);
    } catch (err) {
      console.error("Failed to update avatar", err);
      setError(t.profile.avatarError);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const updated = await ProfileApi.update({ avatarUrl: "" });
      setProfile(updated);
    } catch (err) {
      console.error("Failed to remove avatar", err);
      setError(t.profile.avatarError);
    }
  };

  const handleSaveName = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await ProfileApi.update({ name });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save profile", err);
      setError(t.profile.saveError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <GlassCard accent="lavender">
        <h2 className="mb-4 text-base font-semibold text-slate-700">{t.profile.title}</h2>

        <div className="mb-6 flex items-center gap-4">
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={t.profile.avatarAlt}
              className="h-20 w-20 rounded-full object-cover shadow-glass"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-rainbow-pastel bg-300% animate-gradient-shift" />
          )}
          <div className="flex flex-col gap-2">
            <label className="glass-button cursor-pointer !px-4 !py-2 text-sm">
              {t.profile.changePhoto}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
            {profile?.avatarUrl && (
              <button
                type="button"
                className="text-xs text-slate-500 underline hover:text-slate-700"
                onClick={handleRemoveAvatar}
              >
                {t.profile.removePhoto}
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSaveName} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-slate-600">{t.profile.email}</label>
            <input type="text" className="glass-input" value={profile?.email ?? ""} disabled />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">{t.profile.name}</label>
            <input
              type="text"
              className="glass-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.profile.namePlaceholder}
            />
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <div className="mt-2 flex justify-end">
            <GlassButton type="submit" variant="primary" disabled={saving}>
              {saved ? t.profile.saved : saving ? t.profile.saving : t.profile.save}
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
