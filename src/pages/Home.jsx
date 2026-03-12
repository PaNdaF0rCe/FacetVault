import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">

      <div className="max-w-4xl text-center space-y-8">

        {/* Title */}
        <h1 className="text-5xl font-bold text-amber-300">
          FacetVault
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-lg">
          Organize and manage your gemstone collection with precision and elegance.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4">

          <Link
            to="/login"
            className="bg-amber-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-amber-300 transition"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="border border-amber-400 text-amber-300 px-6 py-3 rounded-lg font-semibold hover:bg-amber-400 hover:text-black transition"
          >
            Create Account
          </Link>

        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6 pt-10">

          <div className="bg-[#020617] border border-[#1e293b] rounded-xl p-6">
            <h3 className="text-amber-300 font-semibold mb-2">
              Gem Collection
            </h3>
            <p className="text-gray-400 text-sm">
              Store and organize all your gemstones with images and details.
            </p>
          </div>

          <div className="bg-[#020617] border border-[#1e293b] rounded-xl p-6">
            <h3 className="text-amber-300 font-semibold mb-2">
              Stone Records
            </h3>
            <p className="text-gray-400 text-sm">
              Track origin, cut, color, carat weight, and pricing.
            </p>
          </div>

          <div className="bg-[#020617] border border-[#1e293b] rounded-xl p-6">
            <h3 className="text-amber-300 font-semibold mb-2">
              Collection Insights
            </h3>
            <p className="text-gray-400 text-sm">
              Quickly search, filter, and review your entire collection.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Home;