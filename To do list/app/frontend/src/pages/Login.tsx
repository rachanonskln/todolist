import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { AuthApi } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useLocale } from "@/i18n/LocaleContext";

export function Login() {
  const { t } = useLocale();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(false);
    setSubmitting(true);
    try {
      const { token } = await AuthApi.login(email, password);
      login(token);
      const redirectTo = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(redirectTo, { replace: true });
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="app-background" />
      <GlassCard accent="lavender" className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mb-2 text-3xl">🌈</div>
          <h1 className="text-lg font-semibold text-slate-800">{t.login.title}</h1>
          <p className="text-sm text-slate-500">{t.login.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-slate-600">{t.login.email}</label>
            <input
              required
              type="email"
              autoComplete="username"
              className="glass-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">{t.login.password}</label>
            <input
              required
              type="password"
              autoComplete="current-password"
              className="glass-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-rose-500">{t.login.invalidCredentials}</p>}

          <GlassButton type="submit" variant="primary" disabled={submitting} className="mt-2">
            {submitting ? t.login.submitting : t.login.submit}
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
