import { CONTACT_PHONE, WHATSAPP_NUMBER } from "../config/appConfig";

function Contact() {
  const hasPhone = !!CONTACT_PHONE;
  const hasWhatsApp = !!WHATSAPP_NUMBER;
  const whatsappLink = hasWhatsApp
    ? `https://wa.me/${WHATSAPP_NUMBER}`
    : null;

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,18,36,0.78),rgba(4,14,30,0.72))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur sm:p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber-400/80 sm:text-xs">
            Contact
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-amber-300 sm:text-5xl">
            Get in touch directly
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-400 sm:text-base sm:leading-7">
            For availability, pricing confirmation, delivery details, or any
            questions about a listed stone, contact directly through WhatsApp or
            phone.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-400/80">
              WhatsApp
            </p>

            <h2 className="mt-2 text-lg font-semibold text-white">
              Fastest way to reach out
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              The quickest way to inquire about a stone is through WhatsApp.
              This is best for checking availability and discussing details.
            </p>

            {hasWhatsApp ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-block rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-300"
              >
                Message on WhatsApp
              </a>
            ) : (
              <p className="mt-5 text-sm text-gray-500">
                WhatsApp number not configured yet
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-400/80">
              Phone
            </p>

            <h2 className="mt-2 text-lg font-semibold text-white">
              Direct contact number
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              You can also use the direct contact number for immediate inquiries.
            </p>

            {hasPhone ? (
              <div className="mt-5 rounded-2xl border border-white/10 bg-[#020617] px-5 py-4 text-center text-base font-semibold text-white">
                {CONTACT_PHONE}
              </div>
            ) : (
              <p className="mt-5 text-sm text-gray-500">
                Contact number not configured yet
              </p>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#020617]/90 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)] sm:p-6">
          <h2 className="text-xl font-semibold text-white">
            What to include in your message
          </h2>

          <ul className="mt-4 space-y-3 text-sm text-gray-400">
            <li>• The name of the stone you are interested in</li>
            <li>• Any questions about availability or pricing</li>
            <li>• If you would like more photos or videos</li>
            <li>• Delivery or collection preferences if relevant</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default Contact;