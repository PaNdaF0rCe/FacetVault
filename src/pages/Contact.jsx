import { CONTACT_PHONE, WHATSAPP_NUMBER } from "../config/appConfig";

function Contact() {
  const hasPhone = !!CONTACT_PHONE;
  const hasWhatsApp = !!WHATSAPP_NUMBER;
  const whatsappLink = hasWhatsApp
    ? `https://wa.me/${WHATSAPP_NUMBER}`
    : null;

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-10">

        {/* HERO */}
        <section className="lux-card p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-400/80">
            Contact
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-semibold text-white sm:text-5xl">
            Get in touch directly
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-gray-400 sm:text-base">
            For availability, pricing confirmation, delivery details, or any
            questions, contact directly through WhatsApp or phone.
          </p>
        </section>

        {/* CONTACT OPTIONS */}
        <section className="grid gap-6 md:grid-cols-2">

          {/* WHATSAPP */}
          <div className="lux-card p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-400/80">
              WhatsApp
            </p>

            <h2 className="mt-2 text-lg font-semibold text-white">
              Fastest way to reach out
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              The quickest way to inquire about a stone is through WhatsApp.
            </p>

            {hasWhatsApp ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="lux-button-primary mt-6 w-full"
              >
                Message on WhatsApp
              </a>
            ) : (
              <p className="mt-6 text-sm text-gray-500">
                WhatsApp not configured
              </p>
            )}
          </div>

          {/* PHONE */}
          <div className="lux-card p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-400/80">
              Phone
            </p>

            <h2 className="mt-2 text-lg font-semibold text-white">
              Direct contact number
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Use the contact number for immediate inquiries.
            </p>

            {hasPhone ? (
              <div className="mt-6 rounded-xl border border-white/10 bg-[#020617] px-5 py-4 text-center text-lg font-semibold text-white">
                {CONTACT_PHONE}
              </div>
            ) : (
              <p className="mt-6 text-sm text-gray-500">
                Phone not configured
              </p>
            )}
          </div>

        </section>

        {/* NOTES */}
        <section className="lux-card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-white">
            What to include in your message
          </h2>

          <ul className="mt-5 space-y-3 text-sm text-gray-400">
            <li>• Name of the stone</li>
            <li>• Questions about availability or pricing</li>
            <li>• Request for additional photos or videos</li>
            <li>• Delivery or collection preferences</li>
          </ul>
        </section>

      </div>
    </div>
  );
}

export default Contact;