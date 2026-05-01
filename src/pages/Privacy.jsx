export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

        <p className="mb-4 text-white/70">
          FacetVault (“we”, “our”, “us”) values your privacy. This policy explains how we collect, use, and protect your information when you interact with us.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
        <p className="text-white/70">
          Name, username, messages, and any details you provide when contacting us.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use It</h2>
        <p className="text-white/70">
          To respond to inquiries, provide product info, and improve our services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Data Storage</h2>
        <p className="text-white/70">
          Data may be stored securely using cloud services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Third Parties</h2>
        <p className="text-white/70">
          We may use Meta (Instagram/Facebook) and OpenAI for chatbot responses.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Your Rights</h2>
        <p className="text-white/70">
          You can request data access or deletion by contacting:
          <br />
          <span className="text-amber-300">andrew.fdo@hotmail.com</span>
        </p>

        <p className="mt-8 text-sm text-white/40">
          Last updated: {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}