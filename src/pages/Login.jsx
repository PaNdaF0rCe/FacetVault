import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Login() {
  const { login, loginWithGoogle, user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const getPostLoginRoute = () => (isAdmin ? "/admin" : "/collection");

  useEffect(() => {
    if (!loading && user) {
      sessionStorage.removeItem("fv_google_redirect_pending");
      navigate(getPostLoginRoute(), { replace: true });
      return;
    }

    if (!loading && !user) {
      const pendingRedirect = sessionStorage.getItem(
        "fv_google_redirect_pending"
      );
      if (pendingRedirect) {
        setSubmitting(false);
        sessionStorage.removeItem("fv_google_redirect_pending");
      }
      if (!loading && user) {
        setSubmitting(false); // 🔥 add this
        sessionStorage.removeItem("fv_google_redirect_pending");
        navigate(getPostLoginRoute(), { replace: true });
      }
    }
  }, [user, loading, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const cred = await login(email, password);
      const nextRoute =
        cred?.user?.uid &&
        import.meta.env.VITE_ADMIN_UID &&
        cred.user.uid === import.meta.env.VITE_ADMIN_UID
          ? "/admin"
          : "/collection";

      navigate(nextRoute, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to sign in.");
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setSubmitting(true);

    try {
      await loginWithGoogle();
      // ❌ DO NOT navigate here
      // Let useEffect handle it when user updates
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#13203f_0%,#0b1224_35%,#060b16_100%)] px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-amber-300">
            FacetVault
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to continue.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email address"
            className="lux-input w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            required
            placeholder="Password"
            className="lux-input w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={submitting}
            className="lux-button-primary w-full"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-widest text-slate-500">
            or
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={submitting}
          className="lux-button-secondary w-full"
        >
          {submitting ? "Opening Google..." : "Continue with Google"}
        </button>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-amber-300 hover:text-amber-200"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;