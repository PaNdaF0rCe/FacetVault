import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="flex flex-col">

      {/* HERO */}
      <section className="flex min-h-[92vh] items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 -z-10 flex justify-center">
            <div className="h-[300px] w-[600px] rounded-full bg-amber-400/5 blur-3xl" />
          </div>

        <div className="mx-auto max-w-5xl text-center">
          <p className="text-[11px] uppercase tracking-[0.5em] text-amber-300/75 sm:text-xs">
            FacetVault
          </p>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Curated gemstones,
            <br className="hidden sm:block" /> chosen with intention.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Explore a carefully presented collection of individually selected
            gemstones with clear details, direct inquiry, and a browsing
            experience built to feel refined from start to finish.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/collection" className="lux-button-primary min-w-[220px]">
              Explore Collection
            </Link>

            <Link to="/how-to-buy" className="lux-button-secondary min-w-[220px]">
              How to Buy
            </Link>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-[0.28em] text-amber-300/70">
                Selection
              </p>
              <p className="mt-2 text-sm text-white">
                Individually chosen stones
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-[0.28em] text-amber-300/70">
                Clarity
              </p>
              <p className="mt-2 text-sm text-white">
                Transparent stone details
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-[0.28em] text-amber-300/70">
                Contact
              </p>
              <p className="mt-2 text-sm text-white">
                Direct inquiry without friction
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND VALUE STRIP */}
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          <div className="lux-card p-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300/75">
              Curated Individually
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              Not a bulk catalog
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Each stone is added with attention to character, presentation,
              and overall appeal rather than being treated as just another
              listing.
            </p>
          </div>

          <div className="lux-card p-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300/75">
              Clear Presentation
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              Details that matter
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Review essential information such as stone type, carat, color,
              cut, origin, and pricing before deciding to inquire.
            </p>
          </div>

          <div className="lux-card p-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300/75">
              Direct Communication
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              Inquiry made simple
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Reach out quickly through WhatsApp or phone without unnecessary
              checkout steps or marketplace clutter.
            </p>
          </div>
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,32,0.82),rgba(6,11,22,0.94))] p-8 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-md sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <div>
              <p className="text-[11px] uppercase tracking-[0.34em] text-amber-300/75">
                The Collection
              </p>

              <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Built for people who want a more thoughtful way to browse gemstones.
              </h2>

              <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300 sm:text-base">
                <p>
                  FacetVault is designed to present gemstones in a cleaner,
                  more intentional format — where the focus stays on the stone,
                  the details, and the ease of direct inquiry.
                </p>

                <p>
                  Instead of overwhelming buyers with clutter, the goal is to
                  make every listing feel considered, informative, and easy to
                  explore across both desktop and mobile.
                </p>

                <p>
                  The result is a collection experience that feels more curated,
                  more transparent, and more aligned with the quality of the
                  pieces themselves.
                </p>
              </div>
            </div>

            <div className="grid gap-4 self-start">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-amber-300/70">
                  Browse
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white">
                  Explore available stones in a clean, mobile-friendly collection.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-amber-300/70">
                  Review
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white">
                  Open each listing to check the details before making a decision.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-amber-300/70">
                  Inquire
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white">
                  Contact directly for availability, pricing confirmation, or more photos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PATHWAY / CTA */}
      <section className="px-4 pb-28 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[30px] border border-white/10 bg-[rgba(10,18,32,0.76)] p-8 text-center shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-md sm:p-10">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[220px] w-[480px] -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl" />
          </div>

          <p className="text-[11px] uppercase tracking-[0.34em] text-amber-300/75">
            Begin Browsing
          </p>

          <h2 className="mt-4 text-2xl font-semibold text-white sm:text-4xl">
            Start with the collection.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
            View available stones, explore their details, and reach out directly
            when something stands out.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/collection"
              className="lux-button-primary min-w-[220px]"
            >
              Browse Collection
            </Link>

            <Link
              to="/contact"
              className="lux-button-secondary min-w-[220px]"
            >
              Contact Directly
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;