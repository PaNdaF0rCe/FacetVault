function About() {
  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-10">

        {/* HERO */}
        <section className="lux-card p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-400/80">
            About FacetVault
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-semibold text-white sm:text-5xl">
            A curated gemstone collection built with care
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-gray-400 sm:text-base">
            FacetVault is a personal gemstone collection focused on individually
            selected stones, clear presentation, and direct communication.
            The aim is to make browsing and inquiring about gemstones simple,
            transparent, and accessible.
          </p>
        </section>

        {/* FEATURES */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="lux-card p-6">
            <h2 className="text-lg font-semibold text-white">
              Curated individually
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Each stone is selected one by one with focus on quality,
              character, and uniqueness.
            </p>
          </div>

          <div className="lux-card p-6">
            <h2 className="text-lg font-semibold text-white">
              Clear information
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Listings include key details so buyers can review essentials
              with confidence before reaching out.
            </p>
          </div>

          <div className="lux-card p-6">
            <h2 className="text-lg font-semibold text-white">
              Direct contact
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Buyers can inquire directly through WhatsApp or phone without
              unnecessary friction.
            </p>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <section className="lux-card p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">

            <div>
              <h2 className="text-2xl font-semibold text-white">
                What this collection is about
              </h2>

              <div className="mt-5 space-y-4 text-sm leading-relaxed text-gray-400 sm:text-base">
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
                  Built with long-term growth in mind, the collection can expand
                  while still remaining easy to browse across devices.
                </p>
              </div>
            </div>

            <div className="lux-card p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-400/80">
                Why buyers use it
              </p>

              <ul className="mt-5 space-y-3 text-sm text-gray-300">
                <li>Clear listings with essential details</li>
                <li>Fast direct contact</li>
                <li>Simple browsing experience</li>
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