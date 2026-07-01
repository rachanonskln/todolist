import { FormEvent, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { api } from "@/lib/api";
import { useLocale } from "@/i18n/LocaleContext";

export function Settings() {
  const { t } = useLocale();
  const [notionToken, setNotionToken] = useState("");
  const [lineToken, setLineToken] = useState("");
  const [emailConnected, setEmailConnected] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    // Secrets are written server-side only; the client never stores them
    // beyond this form submission (see backend/src/routes/auth.routes.ts).
    await api.post("/settings/integrations", {
      notionToken,
      lineChannelAccessToken: lineToken,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <GlassCard accent="lavender">
        <h2 className="mb-4 text-base font-semibold text-slate-700">{t.settings.integrations}</h2>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-slate-600">{t.settings.notionApiKey}</label>
            <input
              type="password"
              className="glass-input"
              value={notionToken}
              onChange={(e) => setNotionToken(e.target.value)}
              placeholder="secret_xxxxxxxxxxxx"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">{t.settings.lineToken}</label>
            <input
              type="password"
              className="glass-input"
              value={lineToken}
              onChange={(e) => setLineToken(e.target.value)}
              placeholder={t.settings.lineTokenPlaceholder}
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-white/40 p-4">
            <div>
              <p className="text-sm font-medium text-slate-700">{t.settings.emailMonitoring}</p>
              <p className="text-xs text-slate-500">
                {emailConnected ? t.settings.connected : t.settings.notConnected}
              </p>
            </div>
            <GlassButton
              type="button"
              onClick={() => setEmailConnected((v) => !v)}
            >
              {emailConnected ? t.settings.disconnect : t.settings.connectGmail}
            </GlassButton>
          </div>

          <div className="mt-2 flex justify-end">
            <GlassButton type="submit" variant="primary">
              {saved ? t.settings.saved : t.settings.save}
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
