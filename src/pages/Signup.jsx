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
      setError(err.message || "Failed to create account.");
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
    <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-amber-300">
            FacetVault
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Create account
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Create an account to browse the public collection and contact for
            listed stones.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="lux-button-primary w-full"
          >
            {submitting ? "Creating account..." : "Create account"}
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
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-amber-300 hover:text-amber-200"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;