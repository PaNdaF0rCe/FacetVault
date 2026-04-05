import {
  CONTACT_PHONE,
  WHATSAPP_NUMBER,
} from "../config/appConfig";

function Contact() {
  const whatsappLink = `https://wa.me/94773272612`;

  return (
    <div className="px-4 py-12">
      <div className="mx-auto max-w-4xl text-center">

        <h1 className="text-3xl font-semibold text-amber-300 sm:text-4xl">
          Contact
        </h1>

        <p className="mt-6 text-gray-300">
          For any inquiries, feel free to reach out directly.
        </p>

        <div className="mt-8 space-y-4">

          <div className="rounded-2xl border border-white/10 bg-[#020617] p-6">
            <p className="text-sm text-gray-400">Phone</p>
            <p className="mt-2 text-lg text-white">94773272612</p>
          </div>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl bg-amber-400 px-6 py-3 text-black font-semibold hover:bg-amber-300 transition"
          >
            Message on WhatsApp
          </a>

        </div>
      </div>
    </div>
  );
}

export default Contact;