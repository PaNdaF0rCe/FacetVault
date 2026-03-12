import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-300">FacetVault</p>
        <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
          A private vault for your gemstone collection
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
          Organize photos, stone details, origin, pricing, and notes in one elegant place.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/signup" className="lux-button-primary min-w-[180px]">
            Create account
          </Link>
          <Link to="/login" className="lux-button-secondary min-w-[180px]">
            Sign in
          </Link>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6 text-left">
            <h3 className="text-lg font-semibold text-amber-300">Store every stone</h3>
            <p className="mt-2 text-sm text-slate-300">
              Save photos, type, cut, color, origin, carat, and price in one clean record.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6 text-left">
            <h3 className="text-lg font-semibold text-amber-300">Browse quickly</h3>
            <p className="mt-2 text-sm text-slate-300">
              Search, filter, and open your gem records in a compact collection view.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6 text-left">
            <h3 className="text-lg font-semibold text-amber-300">Use it anywhere</h3>
            <p className="mt-2 text-sm text-slate-300">
              Access your vault from desktop or phone with secure sign-in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;