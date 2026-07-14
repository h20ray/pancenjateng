import { useState } from 'react';
import { useAuth } from '../context/auth-context';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export function SignInPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal. Periksa email dan password Anda.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login — Pancen Jateng</title>
      </Helmet>

      <style>{`
        .branded-bg {
          background-image: url('${toAbsoluteUrl('/media/images/2600x1600/1.png')}');
        }
        .dark .branded-bg {
          background-image: url('${toAbsoluteUrl('/media/images/2600x1600/1-dark.png')}');
        }
      `}</style>

      <div className="grid lg:grid-cols-2 grow">
        <div className="flex justify-center items-center p-8 lg:p-10 order-2 lg:order-1">
          <Card className="w-full max-w-[400px]">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="block w-full space-y-5">
                <div className="space-y-1.5 pb-3">
                  <h1 className="text-2xl font-semibold tracking-tight text-center">
                    Login
                  </h1>
                </div>

                <Button variant="outline" type="button" className="w-full">
                  <img
                    alt=""
                    className="size-5"
                    src={toAbsoluteUrl('/media/brand-logos/google.svg')}
                  />
                  Masuk dengan Google
                </Button>

                <div className="relative py-1.5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      atau
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center gap-2.5">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/auth/reset-password"
                      className="text-sm font-semibold text-foreground hover:text-primary"
                    >
                      Lupa Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={passwordVisible ? 'text' : 'password'}
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      mode="icon"
                      size="sm"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute end-0 top-1/2 -translate-y-1/2 h-7 w-7 me-1.5"
                      aria-label={passwordVisible ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {passwordVisible ? (
                        <EyeOff className="text-muted-foreground" />
                      ) : (
                        <Eye className="text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                  />
                  <label
                    htmlFor="remember-me"
                    className="text-sm leading-none text-muted-foreground"
                  >
                    Ingat saya
                  </label>
                </div>

                <div className="flex flex-col gap-2.5">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    Login
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  Belum punya akun?{' '}
                  <Link
                    to="/auth/signup"
                    className="text-sm font-semibold text-foreground hover:text-primary"
                  >
                    Daftar
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:rounded-xl lg:border lg:border-border lg:m-5 order-1 lg:order-2 bg-top xl:bg-cover bg-no-repeat branded-bg">
          <div className="flex flex-col p-8 lg:p-16 gap-4">
            <Link to="/">
              <img
                src={toAbsoluteUrl('/media/app/mini-logo.svg')}
                className="h-[28px] max-w-none"
                alt=""
              />
            </Link>

            <div className="flex flex-col gap-3">
              <h3 className="text-2xl font-semibold text-foreground">
                Akses Panel Admin
              </h3>
              <div className="text-base font-medium text-secondary-foreground">
                Sistem Pengaduan{' '}
                <span className="text-foreground font-semibold">
                  Rokok Ilegal
                </span>
                <br />
                Akses aman untuk manajemen data
                <br />
                dan pelaporan di Jawa Tengah.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
