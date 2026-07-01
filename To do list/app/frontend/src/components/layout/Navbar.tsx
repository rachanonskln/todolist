import { useLocale } from "@/i18n/LocaleContext";
import { useAuth } from "@/lib/AuthContext";

export function Navbar() {
  const { locale, setLocale, t } = useLocale();
  const { logout } = useAuth();

  return (
    <header className="glass-panel mb-6 flex items-center justify-between px-5 py-3">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">{t.navbar.greeting}</h1>
        <p className="text-sm text-slate-500">{t.navbar.subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="glass-button !px-3 !py-1.5 text-xs font-semibold uppercase tracking-wide"
          onClick={() => setLocale(locale === "th" ? "en" : "th")}
          aria-label="Switch language"
        >
          {locale === "th" ? "EN" : "ไทย"}
        </button>
        <button className="glass-button !px-3 !py-2 text-lg" aria-label="Notifications">
          🔔
        </button>
        <button
          className="glass-button !px-3 !py-2 text-sm"
          onClick={logout}
          aria-label={t.login.logout}
          title={t.login.logout}
        >
          🚪
        </button>
        <div className="h-9 w-9 rounded-full bg-rainbow-pastel bg-300% animate-gradient-shift" />
      </div>
    </header>
  );
}
