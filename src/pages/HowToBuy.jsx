function StepCard({ number, title, description }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[rgba(10,18,32,0.7)] p-6 backdrop-blur-md transition hover:border-amber-400/20 hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)]">

      {/* BIG NUMBER */}
      <div className="pointer-events-none absolute right-4 top-2 text-[70px] font-semibold text-white/[0.04]">
        {number}
      </div>

      <p className="text-xs uppercase tracking-[0.25em] text-amber-400/80">
        Step {number}
      </p>

      <h2 className="mt-2 text-lg font-semibold text-white">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-gray-400">
        {description}
      </p>
    </div>
  );
}

function HowToBuy() {
  return (
    <div className="px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-10">

        {/* HERO */}
        <section className="rounded-[28px] border border-white/10 bg-[rgba(10,18,32,0.75)] p-6 backdrop-blur-md sm:p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-amber-400/80 sm:text-xs">
            How to Buy
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Simple and direct purchase process
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-gray-400 sm:text-base">
            The process is straightforward. Browse the collection, choose a stone,
            and contact directly to confirm availability and complete the purchase.
          </p>
        </section>

        {/* STEPS */}
        <section className="grid gap-6 md:grid-cols-2">

          <StepCard
            number="01"
            title="Browse the collection"
            description="Go through the available gemstones and explore details such as size, color, cut, origin, and pricing."
          />

          <StepCard
            number="02"
            title="Open the stone details"
            description="Click on a stone to view full details and confirm that it matches what you are looking for."
          />

          <StepCard
            number="03"
            title="Contact directly"
            description="Use the WhatsApp button or phone number to get in touch. You can quickly check availability and ask any questions."
          />

          <StepCard
            number="04"
            title="Confirm purchase"
            description="Finalize payment, delivery method, and any other details directly."
          />

        </section>

        {/* IMPORTANT NOTES */}
        <section className="rounded-[28px] border border-white/10 bg-[rgba(2,6,23,0.9)] p-6 backdrop-blur-md sm:p-8">
          <h2 className="text-xl font-semibold text-white">
            Important notes
          </h2>

          <ul className="mt-5 space-y-3 text-sm text-gray-400">
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
            className="mt-5 inline-flex items-center justify-center rounded-2xl bg-amber-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-300 shadow-[0_10px_30px_rgba(251,191,36,0.25)]"
          >
            Browse Collection
          </a>
        </section>

      </div>
    </div>
  );
}

export default HowToBuy;