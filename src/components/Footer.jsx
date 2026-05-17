import { Link } from "react-router-dom";
import { MessageCircle, Phone } from "lucide-react";
import { FaInstagram, FaFacebook } from "react-icons/fa";
import { WHATSAPP_NUMBER } from "../config/appConfig";
import logo from "../assets/logo-diamond.png";

const INSTAGRAM_URL = "https://www.instagram.com/facetvault/";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61572045051162";

function FooterColumn({ title, children }) {
  return (
    <div>
      <p className="lux-eyebrow text-[10px]">{title}</p>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ to, href, children, external = false }) {
  const className =
    "text-[13px] text-white/55 transition-colors duration-200 hover:text-amber-200";

  if (href) {
    return (
      <li>
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          className={className}
        >
          {children}
        </a>
      </li>
    );
  }

  return (
    <li>
      <Link to={to} className={className}>
        {children}
      </Link>
    </li>
  );
}

function IconButton({ href, label, children, external = false }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/65 transition-colors duration-200 hover:border-amber-300/40 hover:bg-amber-300/10 hover:text-amber-200"
    >
      {children}
    </a>
  );
}

function Footer() {
  const year = new Date().getFullYear();

  // Phone is the same line as WhatsApp.
  const whatsappLink = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%27m%20interested%20in%20a%20gemstone%20from%20FacetVault.`
    : null;

  const telLink = WHATSAPP_NUMBER ? `tel:+${WHATSAPP_NUMBER}` : null;

  // Pretty-format the WhatsApp number for display, e.g. "+94 77 123 4567"
  const formatPhone = (raw) => {
    if (!raw) return null;
    if (raw.length >= 10) {
      // Generic international: +CC XX XXX XXXX
      const cc = raw.slice(0, raw.length - 9);
      const a = raw.slice(-9, -7);
      const b = raw.slice(-7, -4);
      const c = raw.slice(-4);
      return `+${cc} ${a} ${b} ${c}`;
    }
    return `+${raw}`;
  };
  const displayPhone = formatPhone(WHATSAPP_NUMBER);

  return (
    <footer className="relative mt-24 border-t border-white/8 bg-[rgba(2,6,23,0.86)] backdrop-blur-xl">
      {/* faint gold rule along the top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/25 to-transparent" />

      {/* halo glow behind the brand */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 flex justify-center">
        <div className="h-[180px] w-[520px] rounded-full bg-amber-400/[0.04] blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-[1400px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src={logo}
                alt="FacetVault"
                className="h-9 w-9 shrink-0 object-contain"
              />
              <span className="text-[1rem] font-semibold tracking-[0.26em] text-amber-300">
                FACET VAULT
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-white/55">
              Curated natural gemstones and Ceylon sapphires sourced directly
              from Sri Lanka — presented with intention, sold without clutter.
            </p>

            <div className="mt-6 flex items-center gap-2.5">
              {whatsappLink && (
                <IconButton
                  href={whatsappLink}
                  label="Inquire on WhatsApp"
                  external
                >
                  <MessageCircle size={15} strokeWidth={1.6} />
                </IconButton>
              )}
              {telLink && (
                <IconButton href={telLink} label="Call FacetVault">
                  <Phone size={15} strokeWidth={1.6} />
                </IconButton>
              )}
              <IconButton
                href={INSTAGRAM_URL}
                label="FacetVault on Instagram"
                external
              >
                <FaInstagram size={15} />
              </IconButton>
              <IconButton
                href={FACEBOOK_URL}
                label="FacetVault on Facebook"
                external
              >
                <FaFacebook size={15} />
              </IconButton>
            </div>
          </div>

          {/* Browse */}
          <FooterColumn title="Browse">
            <FooterLink to="/collection">Collection</FooterLink>
            <FooterLink to="/collection?filter=featured">Featured</FooterLink>
            <FooterLink to="/collection?filter=new">New Arrivals</FooterLink>
            <FooterLink to="/collection?filter=collector">
              Collector Pieces
            </FooterLink>
          </FooterColumn>

          {/* Direct Inquiry */}
          <FooterColumn title="Direct Inquiry">
            {whatsappLink && (
              <FooterLink href={whatsappLink} external>
                WhatsApp
              </FooterLink>
            )}
            {telLink && (
              <FooterLink href={telLink}>
                Call {displayPhone}
              </FooterLink>
            )}
            <FooterLink href={INSTAGRAM_URL} external>
              Instagram @facetvault
            </FooterLink>
            <FooterLink href={FACEBOOK_URL} external>
              Facebook @facetvault
            </FooterLink>
          </FooterColumn>
        </div>

        <div className="lux-divider mt-12 opacity-60" />

        <div className="mt-6 flex flex-col items-start justify-between gap-3 text-[11px] text-white/35 sm:flex-row sm:items-center">
          <p>
            © {year} FacetVault. Curated gemstones, sourced from Sri Lanka.
            {" "}·{" "}
            <Link to="/privacy" className="hover:text-white/60 transition-colors duration-200">Privacy</Link>
          </p>
          <p className="font-mono tracking-[0.2em] text-white/30">
            CRAFTED · WITH · CARE
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
