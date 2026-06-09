import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(6, 'Minimum 6 caractères'),
  phone:    z.string().optional(),
});

export default function Register() {
  const { t } = useTranslation();
  const { register: registerUser, user } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  if (user) {
    navigate('/captain/dashboard', { replace: true });
    return null;
  }

  async function onSubmit({ email, password, phone }) {
    try {
      await registerUser(email, password, phone);
      toast.success('Compte créé avec succès !');
      navigate('/captain/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
  }

  return (
    <div className="min-h-[90vh] flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative text-center text-white max-w-sm">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-green-400 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 shadow-2xl">
            ⚽
          </div>
          <h1 className="font-display font-black text-3xl mb-2">سجّل فريقك</h1>
          <p className="text-green-400/80 text-sm mb-8">Inscrivez votre équipe et participez au championnat</p>

          <div className="space-y-3 text-right">
            {[
              { step: '١', text: 'أنشئ حسابك كقائد فريق' },
              { step: '٢', text: 'سجّل فريقك ورفع الشعار' },
              { step: '٣', text: 'ادعُ لاعبيك عبر روابط خاصة' },
              { step: '٤', text: 'سدّد رسوم التسجيل (8 000 دج)' },
              { step: '٥', text: 'انتظر موافقة الإدارة' },
            ].map(s => (
              <div key={s.step} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/30 text-primary-light flex items-center justify-center text-sm font-black shrink-0">
                  {s.step}
                </span>
                <span className="text-sm text-gray-300">{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-[#0a0f1e]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <span className="text-4xl">⚽</span>
            <h1 className="font-display font-black text-2xl mt-2 text-gradient">Inscription Capitaine</h1>
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl p-8">
            <div className="mb-8">
              <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white">{t('auth.register_title')}</h2>
              <div className="flex items-center gap-2 mt-2 bg-primary/5 border border-primary/20 rounded-xl px-3 py-2">
                <span className="text-green-500">✓</span>
                <p className="text-xs text-gray-600 dark:text-gray-400">Accès réservé aux capitaines d'équipe</p>
              </div>
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
                {errors.email && <p className="text-red-500 text-xs mt-1.5">Email invalide</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                  {t('auth.password')}
                </label>
                <input
                  {...register('password')}
                  type="password"
                  className={`input ${errors.password ? 'input-error' : ''}`}
                  placeholder="Minimum 6 caractères"
                  autoComplete="new-password"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                  {t('auth.phone')}
                  <span className="text-gray-400 font-normal text-xs ml-1">(optionnel)</span>
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="input"
                  placeholder="0550 000 000"
                  autoComplete="tel"
                />
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
                {isSubmitting ? t('auth.loading') : t('auth.register_btn')}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              {t('auth.have_account')}{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                {t('auth.login_link')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
