import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';

const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
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
      toast.success('Account created!');
      navigate('/captain/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏆</div>
          <h1 className="font-display text-2xl font-bold">{t('auth.register_title')}</h1>
          <p className="text-sm text-gray-500 mt-1">Captains only</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.email')}</label>
            <input
              {...register('email')}
              type="email"
              className="input"
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.password')}</label>
            <input
              {...register('password')}
              type="password"
              className="input"
              placeholder="Min. 6 characters"
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('auth.phone')} <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              {...register('phone')}
              type="tel"
              className="input"
              placeholder="0550 000 000"
              autoComplete="tel"
            />
          </div>

          <Button type="submit" loading={isSubmitting} className="w-full mt-2">
            {t('auth.register_btn')}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t('auth.have_account')}{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            {t('auth.login_link')}
          </Link>
        </p>
      </div>
    </div>
  );
}
