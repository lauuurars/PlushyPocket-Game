import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import Background1 from "../../assets/onboarding/background1.svg";
import {
  persistSupabaseSession,
  persistUsername,
  registerWithBackend,
  signInWithGoogle,
} from "../../lib/api";

/** Multicolor Google “G” for the social button (brand colors). */
function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

/**
 * Sign up screen (Figma 144:159). Red + pattern header, white sheet, form and social CTA.
 * Icons: Flaticon Uicons Regular Rounded (same glyph set as fi-rr-* in the design file).
 */
export default function SignUp() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fieldClass =
    "h-14 w-full rounded-[30px] border border-[#cacaca] bg-[#fafafa] pl-12 pr-3 text-base text-[#583921] outline-none transition-[box-shadow] placeholder:text-[#bfbfbf] focus:border-[#76d6ff] focus:ring-2 focus:ring-[#76d6ff]/35";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!username.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await registerWithBackend({
        email: email.trim(),
        password,
        username: username.trim(),
      });
      if (result.session) {
        await persistSupabaseSession(result.session);
        persistUsername(username.trim());
        navigate("/age", { replace: true });
        return;
      }
      setInfo(
        "Account created. Check your email to confirm, then you can log in.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const { error: oErr } = await signInWithGoogle();
      if (oErr) setError(oErr.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400;600;700&family=Nunito:wght@400;500;600;700&display=swap');
        @import url('https://cdn-uicons.flaticon.com/uicons-regular-rounded/css/uicons-regular-rounded.css');

        .signup-viewport {
          min-height: 100svh;
          min-height: 100dvh;
        }

        .signup-field-icon {
          font-size: 18px;
          line-height: 1;
          color: #8c8c8c;
        }
      `}</style>
      <div
        className="signup-viewport relative isolate w-full overflow-hidden"
        style={{ backgroundColor: "#ED1C24" }}
      >
        <img
          src={Background1}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 h-full w-full max-h-none object-cover object-center"
        />

        <div className="signup-viewport relative z-10 flex w-full min-w-0 flex-col">
          <div
            className="shrink-0"
            style={{ minHeight: "clamp(96px, 22vw, 166px)" }}
            aria-hidden
          />

          <main className="mt-20 flex w-full min-w-0 flex-1 flex-col rounded-tl-[49px] rounded-tr-[49px] bg-[#fafafa] px-[25px] pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-12">
            <h1
              className="mx-auto mb-10 max-w-[240px] text-center text-[40px] leading-[37px] tracking-[-1px] text-[#d51017]"
              style={{
                fontFamily: "'Baloo Da 2', 'Baloo 2', cursive, system-ui",
                fontWeight: 600,
              }}
            >
              Get Started
            </h1>

            {(error || info) && (
              <p
                className={`mb-4 text-center text-sm ${error ? "text-[#d51017]" : "text-[#583921]"}`}
                role="alert"
                style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
              >
                {error ?? info}
              </p>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="relative">
                <i
                  className="fi-rr-user-add signup-field-icon pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2"
                  aria-hidden
                />
                <input
                  className={`${fieldClass} border-[rgba(140,140,140,0.44)]`}
                  type="text"
                  name="username"
                  autoComplete="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
                />
              </div>

              <div className="relative">
                <i
                  className="fi-rr-envelope signup-field-icon pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2"
                  aria-hidden
                />
                <input
                  className={fieldClass}
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
                />
              </div>

              <div className="relative">
                <i
                  className="fi-rr-lock signup-field-icon pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2"
                  aria-hidden
                />
                <input
                  className={fieldClass}
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
                />
              </div>

              <div className="relative">
                <i
                  className="fi-rr-lock signup-field-icon pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2"
                  aria-hidden
                />
                <input
                  className={fieldClass}
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-5 flex h-[52px] w-full cursor-pointer items-center justify-center rounded-[30px] bg-[#ff7be2] text-lg font-medium text-[#fafafa] shadow-[0px_3px_4px_rgba(76,76,76,0.25)] transition-transform enabled:hover:scale-[1.02] enabled:active:scale-[0.98] disabled:opacity-60"
                style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
              >
                {loading ? "Please wait…" : "Create Account"}
              </button>
            </form>

            <p
              className="mx-auto mt-6 text-base leading-6 text-[#8a8686]"
              style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
            >
              Or
            </p>

            <button
              type="button"
              disabled={loading}
              onClick={handleGoogle}
              className="mt-6 flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-[30px] bg-[#76d6ff] px-6 text-lg font-medium text-[#fafafa] shadow-[0px_3px_4px_rgba(76,76,76,0.25)] transition-transform enabled:hover:scale-[1.02] enabled:active:scale-[0.98] disabled:opacity-60"
              style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
            >
              <GoogleGlyph className="h-5 w-5 shrink-0" />
              Sign Up with Google
            </button>

            <p
              className="mx-auto mt-9 flex flex-wrap items-center justify-center gap-1 text-center text-base leading-6"
              style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
            >
              <span className="text-[#8a8686]">Already have an account?</span>
              <Link
                to="/login"
                className="font-medium text-[#583921] underline-offset-2 hover:underline"
              >
                Log In
              </Link>
            </p>
          </main>
        </div>
      </div>
    </>
  );
}
