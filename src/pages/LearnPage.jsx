import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const ARTICLES = [
  {
    tag: "Sapphires",
    title: "What Makes Ceylon Sapphires Special?",
    body: "Ceylon sapphires — mined in Sri Lanka's gem-rich Ratnapura district — are world-renowned for their vivid cornflower-blue hue and exceptional clarity. The island's unique geological conditions produce stones with a warmth and brilliance that collectors prize above almost any other origin. The name \"Ceylon\" refers to Sri Lanka's former name and remains the global gold standard for fine blue sapphires.",
  },
  {
    tag: "Treatment",
    title: "Understanding Heat Treatment in Gemstones",
    body: "Heat treatment enhances colour and clarity in many gems by dissolving inclusions and deepening saturation. A \"No Heat\" designation — confirmed by an independent gem lab — means the stone has reached its colour entirely through nature. No Heat stones are significantly rarer and command strong premiums at auction. All FacetVault stones disclose treatment status transparently on every listing.",
  },
  {
    tag: "Certification",
    title: "How to Read a Gem Lab Certificate",
    body: "A reputable certificate (GIA, GRS, AGL, or Sri Lanka's own LGL) documents a stone's weight, dimensions, colour grade, clarity, and treatment status. The certificate number lets you verify authenticity directly with the lab. When buying without a cert, ask for the stone code and request independent verification — FacetVault can arrange LGL certification for eligible stones on request.",
  },
  {
    tag: "Basics",
    title: "Carat Weight vs. Stone Size: Know the Difference",
    body: "Carat is a weight measurement (1 ct = 0.2 grams), not a size. Two stones of identical carat weight can look very different on the finger depending on their cut depth. A shallow-cut stone spreads weight across a larger face; a deep-cut stone hides weight below the girdle. Always ask for millimetre dimensions alongside carat weight for an accurate sense of how a stone will look when set.",
  },
  {
    tag: "Basics",
    title: "Precious vs. Semi-Precious: Does It Still Matter?",
    body: "The terms \"precious\" (diamond, ruby, sapphire, emerald) and \"semi-precious\" (everything else) are largely outdated marketing labels. A fine alexandrite or Paraíba tourmaline commands far higher prices than many low-quality rubies. Judge stones on rarity, colour saturation, origin, and treatment status — not on category labels inherited from 19th-century gem trade.",
  },
  {
    tag: "Buying Tips",
    title: "5 Questions to Ask Before Buying a Gemstone",
    body: "1. What is the origin? Sri Lankan and Burmese origins carry premium value. 2. Is it heat-treated? No Heat stones are rarer and more valuable. 3. Is there a lab certificate? Always verify with an independent report. 4. Can I see a real video? Photos can be misleading — insist on a live WhatsApp video. 5. What is the return policy? Reputable sellers offer some recourse if the stone misrepresents its description.",
  },
  {
    tag: "Care",
    title: "Caring for Your Gemstone Jewellery",
    body: "Most coloured stones are safe to clean with warm soapy water and a soft brush. Avoid ultrasonic cleaners for included, fracture-filled, or oiled stones — they can worsen existing damage. Store pieces separately to prevent scratching. Sapphires and rubies (corundum, Mohs hardness 9) are among the most durable gems for everyday wear, second only to diamonds.",
  },
  {
    tag: "Origins",
    title: "Why Sri Lanka Is Called the Gem Island",
    body: "Sri Lanka has been exporting gemstones for over 2,500 years — ancient texts mention sapphires gifted to Persian kings. The island's Precambrian rock belt contains one of the highest natural concentrations of gem-bearing gravel (illam) on Earth. Beyond sapphires, Sri Lanka produces rubies, alexandrite, cat's eye chrysoberyl, spinel, tourmaline, and garnets — often in the same small river valley.",
  },
];

function ArticleCard({ article }) {
  return (
    <article className="lux-card flex flex-col gap-3 p-6">
      <span className="w-fit rounded-full border border-amber-300/16 bg-amber-300/8 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-amber-300/80">
        {article.tag}
      </span>
      <h2 className="text-[15px] font-semibold leading-snug text-white">
        {article.title}
      </h2>
      <p className="text-[13.5px] leading-[1.72] text-white/60">{article.body}</p>
    </article>
  );
}

export default function LearnPage() {
  return (
    <>
      <Helmet>
        <title>Gemstone Education | Learn About Ceylon Gems | FacetVault</title>
        <meta
          name="description"
          content="Learn about Ceylon sapphires, heat treatment, certifications, and how to buy gemstones confidently. Buyer guides by FacetVault Sri Lanka."
        />
        <link rel="canonical" href="https://facetvault.store/learn" />
      </Helmet>

      <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
        <p className="lux-eyebrow-rule text-[10px] text-amber-300/75">
          Knowledge Base
        </p>
        <h1 className="lux-display mt-4 text-[2rem] text-white sm:text-[2.4rem]">
          Learn About Gems
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-[1.72] text-white/55">
          Everything you need to buy gemstones with confidence — from reading
          lab certificates to understanding treatments and origins.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((a) => (
            <ArticleCard key={a.title} article={a} />
          ))}
        </div>

        <div className="mt-14 rounded-[28px] border border-amber-300/14 bg-amber-300/5 p-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-300/60">
            Ready to find your stone?
          </p>
          <h2 className="lux-display mt-3 text-[1.6rem] text-white">
            Browse the Collection
          </h2>
          <p className="mt-2 text-sm text-white/45">
            Every stone in the vault comes with full treatment disclosure and
            direct WhatsApp access to our team.
          </p>
          <Link
            to="/collection"
            className="lux-button-primary mt-6 inline-flex"
          >
            View All Stones
          </Link>
        </div>
      </div>
    </>
  );
}
