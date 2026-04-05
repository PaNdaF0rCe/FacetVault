function HowToBuy() {
  return (
    <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">

        {/* HERO */}
        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,18,36,0.78),rgba(4,14,30,0.72))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur sm:p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber-400/80 sm:text-xs">
            How to Buy
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-amber-300 sm:text-5xl">
            Simple and direct purchase process
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-400 sm:text-base sm:leading-7">
            The process is straightforward. Browse the collection, choose a stone,
            and contact directly to confirm availability and complete the purchase.
          </p>
        </section>

        {/* STEPS */}
        <section className="grid gap-5 md:grid-cols-2">

          <div className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-400/80">
              Step 1
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              Browse the collection
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              Go through the available gemstones and explore details such as
              size, color, cut, origin, and pricing.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-400/80">
              Step 2
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              Open the stone details
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              Click on a stone to view full details and confirm that it matches
              what you are looking for.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-400/80">
              Step 3
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              Contact directly
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              Use the WhatsApp button or phone number to get in touch. You can
              quickly check availability and ask any questions.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-400/80">
              Step 4
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              Confirm purchase
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              Finalize payment, delivery method, and any other details directly.
            </p>
          </div>

        </section>

        {/* IMPORTANT NOTES */}
        <section className="rounded-[28px] border border-white/10 bg-[#020617]/90 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)] sm:p-6">
          <h2 className="text-xl font-semibold text-white">
            Important notes
          </h2>

          <ul className="mt-4 space-y-3 text-sm text-gray-400">
            <li>• Availability is confirmed on a first-contact basis</li>
            <li>• Prices may vary depending on stone and demand</li>
            <li>• Additional photos or videos can be requested before purchase</li>
            <li>• Delivery and payment details are discussed directly</li>
          </ul>
        </section>

        {/* CTA */}
        <section className="text-center">
          <p className="text-sm text-gray-400">
            Found something you like?
          </p>

          <a
            href="/collection"
            className="mt-4 inline-block rounded-2xl bg-amber-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-300"
          >
            Browse Collection
          </a>
        </section>

      </div>
    </div>
  );
}

export default HowToBuy;