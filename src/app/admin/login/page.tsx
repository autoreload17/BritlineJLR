"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminLoginPage() {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(t('invalidPassword'));
      }
    } catch (err) {
      setError(t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--space-black)] px-4">
      <div className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">{t('adminLogin')}</h1>
          <p className="text-sm sm:text-base text-zinc-400">{t('enterPassword')}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password')}
              className="w-full h-14 sm:h-12 rounded-full border border-white/20 bg-white/10 px-4 text-base sm:text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
              required
              autoFocus
            />
          </div>
          
          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 sm:h-12 rounded-full bg-[var(--accent-gold)] text-white font-medium hover:bg-[var(--accent-gold)]/90 disabled:opacity-50 text-base sm:text-sm"
          >
            {loading ? t('loggingIn') : t('login')}
          </button>
        </form>
        
        <p className="mt-6 text-center text-xs text-zinc-500">
          {t('defaultPassword')}
        </p>
      </div>
    </div>
  );
}


