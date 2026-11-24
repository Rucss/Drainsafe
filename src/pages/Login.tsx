import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Activity, ArrowUpRight, Droplets, Waves } from "lucide-react";

type LoginLocationState = { from?: { pathname?: string } };

const Login = () => {
  const { configured, user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname === "/register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const from = (location.state as LoginLocationState | null)?.from?.pathname ?? "/dashboard";

  useEffect(() => {
    setError("");
    setPassword("");
    setConfirmPassword("");
  }, [location.pathname]);

  if (user) return <Navigate to={from} replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      if (isRegister) {
        const result = await signUp(email, password);
        if (result === "signed_in") {
          navigate(from, { replace: true });
        } else if (result === "confirmation_required") {
          setError("Your account was created, but Supabase still requires email confirmation. Turn off Confirm email in Supabase Authentication settings to allow immediate sign-in.");
        } else {
          setError("This email may already have an account. Sign in with its existing password or use Forgot password? to reset it.");
        }
      } else {
        await signIn(email, password);
        navigate(from, { replace: true });
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to complete your request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#edf9f7] via-[#f7fbfd] to-[#eef5ff] text-slate-900">
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-teal-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />
      <main className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-8">
        <header className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-lg shadow-teal-900/15">
              <Activity className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight text-slate-900">DrainSafe</span>
              <span className="block text-xs font-medium text-slate-500">Drainage monitoring</span>
            </span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/70 hover:text-teal-800">
            Back to website <ArrowUpRight className="h-4 w-4" />
          </Link>
        </header>

        <section className="flex flex-1 items-center justify-center py-8 sm:py-12">
          <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_30px_90px_-35px_rgba(15,76,80,0.28)] md:grid-cols-[1.02fr_0.98fr]">
            <div className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#d9f5ef] via-[#dff6f8] to-[#e9f1ff] p-10 md:flex lg:p-12">
              <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border-[42px] border-white/35" />
              <div className="pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-cyan-200/40 blur-2xl" />
              <div className="relative">
                <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
                  <Droplets className="h-7 w-7" />
                </div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-teal-800/70">A clearer view of your system</p>
                <h2 className="max-w-sm text-4xl font-semibold leading-tight tracking-tight text-slate-900">
                  Know what’s happening beneath the streets.
                </h2>
                <p className="mt-4 max-w-sm text-base leading-7 text-slate-600">
                  Keep sensor readings, water levels, and alerts together in one place.
                </p>
              </div>

              <div className="relative rounded-3xl border border-white/80 bg-white/75 p-5 shadow-xl shadow-teal-900/5 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">System overview</p>
                    <p className="mt-1 text-xs text-slate-500">Your monitoring workspace</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <Waves className="h-5 w-5" />
                  </span>
                </div>
                <svg className="mt-6 h-24 w-full" viewBox="0 0 360 96" fill="none" role="img" aria-label="Decorative water monitoring waveform">
                  <defs>
                    <linearGradient id="signin-wave" x1="0" y1="0" x2="360" y2="0" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#0D9488" />
                      <stop offset="1" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                  <path d="M0 56H55L70 45L83 67L99 20L118 79L136 48L150 56H187L203 42L218 61L235 31L250 72L267 51L281 56H360" stroke="url(#signin-wave)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M0 86H360" stroke="#CBD5E1" strokeDasharray="4 7" />
                </svg>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Flow</span>
                  <span>Levels</span>
                  <span>Alerts</span>
                </div>
              </div>

              <p className="relative text-xs font-medium text-slate-500">DrainSafe monitoring workspace</p>
            </div>

            <div className="flex items-center px-6 py-10 sm:px-10 md:px-12">
              <div className="mx-auto w-full max-w-md">
                <Card className="border-0 bg-transparent shadow-none">
                  <CardHeader className="px-0 pb-7 text-left">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                      {isRegister ? "Get started" : "Welcome back"}
                    </p>
                    <CardTitle className="text-3xl font-semibold tracking-tight text-slate-900">
                      {isRegister ? "Create your account" : "Sign in"}
                    </CardTitle>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {isRegister
                        ? "Create an account to access your DrainSafe workspace."
                        : "Sign in to continue to your DrainSafe workspace."}
                    </p>
                  </CardHeader>
                  <CardContent className="px-0">
            {!configured ? (
              <div className="space-y-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                <p>Connect a Supabase project to enable the monitoring dashboard.</p>
                <p>
                  Copy <code>.env.example</code> to <code>.env.local</code>, add your Supabase project URL and anon key,
                  then run the SQL in <code>supabase/schema.sql</code>.
                </p>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email address</Label>
                  <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" className="h-12 rounded-xl border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-600" required value={email} onChange={(event) => setEmail(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
                    {!isRegister && (
                      <Link to="/forgot-password" className="text-sm font-semibold text-teal-700 transition hover:text-teal-900">
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <Input id="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 rounded-xl border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-600" />
                </div>
                {isRegister && (
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-semibold text-slate-700">Confirm password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="h-12 rounded-xl border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-600"
                    />
                  </div>
                )}
                {isRegister && (
                  <p className="-mt-2 text-xs leading-5 text-slate-500">
                    Gmail addresses work too. Use your email and a DrainSafe password.
                  </p>
                )}
                {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">{error}</p>}
                <Button type="submit" className="h-12 w-full rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-base font-semibold text-white shadow-lg shadow-teal-700/15 transition hover:from-teal-700 hover:to-cyan-700 hover:shadow-teal-700/25" disabled={submitting}>
                  {submitting ? (isRegister ? "Creating account…" : "Signing in…") : (isRegister ? "Register" : "Sign in")}
                </Button>
                <p className="pt-1 text-center text-sm text-slate-500">
                  {isRegister ? "Already have an account?" : "New to DrainSafe?"}{" "}
                  <Link to={isRegister ? "/login" : "/register"} className="font-semibold text-teal-700 hover:text-teal-900">
                    {isRegister ? "Sign in" : "Register"}
                  </Link>
                </p>
                {!isRegister && (
                  <p className="text-center text-xs text-slate-400">
                    Use your email and DrainSafe password. Google sign-in isn’t needed.
                  </p>
                )}
              </form>
            )}
          </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
        <footer className="pb-3 text-center text-xs font-medium text-slate-400">
          Secure access to your drainage monitoring workspace
        </footer>
      </main>
    </div>
  );
};

export default Login;
