function About() {
  return (
    <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,18,36,0.78),rgba(4,14,30,0.72))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur sm:p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber-400/80 sm:text-xs">
            About FacetVault
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-amber-300 sm:text-5xl">
            A curated gemstone collection built with care
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-400 sm:text-base sm:leading-7">
            FacetVault is a personal gemstone collection focused on individually
            selected stones, clear presentation, and direct communication. The
            aim is to make browsing and inquiring about gemstones simple,
            transparent, and accessible.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-5">
            <h2 className="text-lg font-semibold text-white">
              Curated individually
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              Each stone is selected and added one by one rather than presented
              as part of a bulk catalog. The focus is on quality, character, and
              variety.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-5">
            <h2 className="text-lg font-semibold text-white">
              Clear information
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              Available listings include practical details such as stone type,
              size, color, cut, origin, and selling price so buyers can review
              the essentials with confidence.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-5">
            <h2 className="text-lg font-semibold text-white">
              Direct contact
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              Buyers can inquire directly through WhatsApp or phone without
              unnecessary account requirements or extra steps.
            </p>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#020617]/90 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)] sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                What this collection is about
              </h2>

              <div className="mt-4 space-y-4 text-sm leading-7 text-gray-400 sm:text-base">
                <p>
                  This platform is designed to present gemstones in a clean and
                  trustworthy way, with an emphasis on direct inquiry rather
                  than overcomplicated checkout flows.
                </p>

                <p>
                  The collection is intended for buyers who want to browse
                  available stones, review their details, and get in touch
                  quickly if something stands out.
                </p>

                <p>
                  FacetVault is also built with long-term growth in mind, so the
                  collection can continue to expand while still remaining easy
                  to browse on both desktop and mobile.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-400/80">
                Why buyers use it
              </p>

              <ul className="mt-4 space-y-3 text-sm text-gray-300">
                <li>Clear listings with essential stone details</li>
                <li>Fast direct contact without extra friction</li>
                <li>Simple browsing experience on mobile and desktop</li>
                <li>No unnecessary marketplace clutter</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;