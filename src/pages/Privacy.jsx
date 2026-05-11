import { Helmet } from "react-helmet-async";

function Section({ title, children }) {
  return (
    <section className="mt-9">
      <h2 className="font-display text-[1.35rem] font-semibold tracking-tight text-white">
        {title}
      </h2>
      <div className="mt-2 text-[14px] leading-relaxed text-white/65">
        {children}
      </div>
    </section>
  );
}

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | FacetVault</title>
        <meta
          name="description"
          content="FacetVault privacy policy — how we collect, use, and protect your information when you contact us or use our gemstone browsing service."
        />
        <link rel="canonical" href="https://facetvault.store/privacy" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="lux-eyebrow">Legal</p>

          <h1 className="lux-display mt-4 text-[2.2rem] text-white sm:text-[3rem]">
            Privacy Policy
          </h1>

          <div className="mt-5 h-px w-12 bg-gradient-to-r from-transparent via-amber-300/55 to-transparent" />

          <p className="mt-7 text-[14.5px] leading-relaxed text-white/70">
            FacetVault (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) values your privacy.
            This policy explains how we collect, use, and protect your
            information when you interact with us.
          </p>

          <Section title="1. Information We Collect">
            Name, username, messages, and any details you provide when
            contacting us.
          </Section>

          <Section title="2. How We Use It">
            To respond to inquiries, provide product info, and improve our
            services.
          </Section>

          <Section title="3. Data Storage">
            Data may be stored securely using cloud services.
          </Section>

          <Section title="4. Third Parties">
            We may use Meta (Instagram/Facebook) and OpenAI for chatbot
            responses.
          </Section>

          <Section title="5. Your Rights">
            You can request data access or deletion by contacting:
            <br />
            <a
              href="mailto:andrew.fdo@hotmail.com"
              className="text-amber-300 transition-colors hover:text-amber-200"
            >
              andrew.fdo@hotmail.com
            </a>
          </Section>

          <p className="mt-12 text-[12px] uppercase tracking-[0.24em] text-white/40">
            Last updated · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  );
}
