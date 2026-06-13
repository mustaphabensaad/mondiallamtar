import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export default function Login() {
  const { t } = useTranslation();
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  if (user) {
    navigate(user.role === 'admin' ? '/admin' : '/captain/dashboard', { replace: true });
    return null;
  }

  async function onSubmit({ email, password }) {
    try {
      const loggedUser = await login(email, password);
      toast.success(t('auth.welcome'));
      navigate(loggedUser.role === 'admin' ? '/admin' : '/captain/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
  }

  return (
    <div className="min-h-[90vh] flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative text-center text-white">
          <img
            src="/logo.png"
            alt="Mundial Lamtar 2026"
            className="w-32 h-32 rounded-3xl object-cover mx-auto mb-6 shadow-2xl"
          />
          <h1 className="font-display font-black text-4xl mb-2">مونديال لمطار</h1>
          <p className="text-2xl font-bold text-primary-light mb-3">2026</p>
          <p className="text-green-400/80 italic text-sm mb-8">From us to all – Créativité sans limite</p>

          <div className="flex items-center justify-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-2xl px-5 py-3 text-amber-300 text-sm">
            <span className="text-lg">🦅</span>
            <span>طبعة الوفاء — بن نجة يوسف</span>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 text-left">
            {[
              { icon: '📍', label: 'الملعب البلدي — لمطار' },
              { icon: '💰', label: '8 000 دج / فريق' },
              { icon: '👥', label: '6 + 4 احتياط' },
              { icon: '🎽', label: 'لباس موحد' },
            ].map(i => (
              <div key={i.label} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 text-sm text-gray-300">
                <span>{i.icon}</span><span>{i.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-[#0a0f1e]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <img src="/logo.png" alt="Mundial Lamtar 2026" className="w-20 h-20 rounded-2xl object-cover mx-auto mb-2 shadow-lg" />
            <h1 className="font-display font-black text-2xl text-gradient">مونديال لمطار 2026</h1>
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl p-8">
            <div className="mb-8">
              <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white">{t('auth.login_title')}</h2>
              <p className="text-gray-500 text-sm mt-1">{t('auth.connect_caption')}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                  {t('auth.email')}
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1.5">{t('auth.invalid_email')}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                  {t('auth.password')}
                </label>
                <input
                  {...register('password')}
                  type="password"
                  className={`input ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-1"
              >
                {isSubmitting && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {isSubmitting ? t('auth.loading') : t('auth.login_btn')}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs text-gray-400 bg-white dark:bg-[#111827] px-3">
                {t('auth.or')}
              </div>
            </div>

            <p className="text-center text-sm text-gray-500">
              {t('auth.no_account')}{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                {t('auth.register_link')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
