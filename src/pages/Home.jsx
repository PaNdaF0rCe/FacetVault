import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="flex flex-col">

      {/* HERO */}
      <section className="flex min-h-[85vh] items-center justify-center px-4 py-12">
        <div className="mx-auto max-w-5xl text-center">

          <p className="text-sm uppercase tracking-[0.35em] text-amber-300">
            FacetVault
          </p>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Rare and curated gemstones
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300 sm:text-lg">
            Explore a carefully selected collection of gemstones sourced and documented individually.
            Each piece is available for direct inquiry and purchase.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">

            {/* PRIMARY CTA */}
            <Link
              to="/collection"
              className="lux-button-primary min-w-[200px]"
            >
              View Collection
            </Link>

            {/* SECONDARY CTA */}
            <Link
              to="/login"
              className="lux-button-secondary min-w-[200px]"
            >
              Login / Sign up
            </Link>
          </div>

        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6 text-left">
            <h3 className="text-lg font-semibold text-amber-300">
              Individually selected
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              Each gemstone is hand-picked and added to the collection with attention to color, clarity, and uniqueness.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6 text-left">
            <h3 className="text-lg font-semibold text-amber-300">
              Transparent details
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              View origin, cut, size, and other key information before making an inquiry.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6 text-left">
            <h3 className="text-lg font-semibold text-amber-300">
              Direct contact
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              Reach out instantly via WhatsApp or phone for any stone you are interested in.
            </p>
          </div>

        </div>
      </section>

      {/* MINI CTA */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-[#04101f]/70 p-8 text-center">

          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Start exploring the collection
          </h2>

          <p className="mt-3 text-sm text-gray-400 sm:text-base">
            Discover available stones and contact directly for purchase inquiries.
          </p>

          <Link
            to="/collection"
            className="mt-6 inline-block rounded-2xl bg-amber-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-300"
          >
            Browse Now
          </Link>

        </div>
      </section>

    </div>
  );
}

export default Home;