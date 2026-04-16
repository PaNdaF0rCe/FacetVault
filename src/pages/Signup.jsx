import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Signup() {
  const { signup, loginWithGoogle, user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const getPostLoginRoute = () => (isAdmin ? "/admin" : "/collection");

  useEffect(() => {
    if (!loading && user) {
      navigate(getPostLoginRoute(), { replace: true });
    }
  }, [user, loading, isAdmin, navigate]);

  const handleChange = (e) =>
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const cred = await signup(form.email, form.password, form.name);
      const nextRoute =
        cred?.user?.uid &&
        import.meta.env.VITE_ADMIN_UID &&
        cred.user.uid === import.meta.env.VITE_ADMIN_UID
          ? "/admin"
          : "/collection";

      navigate(nextRoute, { replace: true });
    } catch (err) {
      let message = "Failed to create account.";

      if (err.code === "auth/email-already-in-use") {
        message = "An account already exists with this email.";
      } else if (err.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (err.code === "auth/weak-password") {
        message = "Password should be at least 6 characters.";
      }

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setSubmitting(true);

    try {
      const result = await loginWithGoogle();
      if (result?.user) {
        const nextRoute =
          result.user.uid &&
          import.meta.env.VITE_ADMIN_UID &&
          result.user.uid === import.meta.env.VITE_ADMIN_UID
            ? "/admin"
            : "/collection";

        navigate(nextRoute, { replace: true });
      }
    } catch (err) {
      setError(err.message || "Google sign-up failed.");
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-2rem)] items-center justify-center overflow-x-hidden px-4 py-6 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-120px] h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-amber-400/8 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[-60px] h-[240px] w-[240px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(5,12,24,0.94),rgba(4,10,20,0.88))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur sm:p-7">
          <div className="mb-6 text-center sm:mb-7">
            <p className="text-[11px] uppercase tracking-[0.26em] text-amber-300/90">
              FacetVault
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              Create account
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Create an account to browse the public collection and contact for
              listed stones.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <input
              name="name"
              type="text"
              required
              placeholder="Full name"
              className="lux-input w-full"
              value={form.name}
              onChange={handleChange}
            />

            <input
              name="email"
              type="email"
              required
              placeholder="Email address"
              className="lux-input w-full"
              value={form.email}
              onChange={handleChange}
            />

            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              className="lux-input w-full"
              value={form.password}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={submitting}
              className="lux-button-primary mt-1 w-full"
            >
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 sm:my-6">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
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
            Continue with Google
          </button>

          <p className="mt-5 text-center text-sm text-slate-400 sm:mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-amber-300 transition hover:text-amber-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;