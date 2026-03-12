// import { useState, useEffect } from 'react';
// import { auth } from '../lib/firebase/config';
// import { 
//   signInWithPopup, 
//   GoogleAuthProvider,
// } from 'firebase/auth';
// import { Link } from 'react-router-dom';
// import Navbar from '../components/Navbar';

// function Home() {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     console.log("Home component mounted");
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       console.log("Auth state changed:", user);
//       setUser(user);
//     });
//     return () => unsubscribe();
//   }, []);

//   console.log("Rendering Home component");

//   const loginWithGoogle = async () => {
//     try {
//       const provider = new GoogleAuthProvider();
//       await signInWithPopup(auth, provider);
//     } catch (error) {
//       console.error("Error signing in:", error);
//     }
//   };

//   return (
//     <div>
//         <Navbar user={user} />
//     <div className="text-center">
//       <h1 className="text-4xl font-bold mb-8">Welcome to Inventory Manager</h1>
//       <p className="text-xl mb-8">
//         Manage your inventory efficiently and effectively!
//       </p>
//       {!user ? (
//         <>
//           <button
//             onClick={loginWithGoogle}
//             className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600"
//           >
//             Get Started with Google
//           </button>
//           <p className="mt-4">
//             Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Sign Up</Link> 
//           </p>
//           <p className="mt-4">
//             <Link to="/login" className="text-blue-500 hover:underline">login </Link>
//           </p>
//         </>
//       ) : (
//         <p className="mt-4">You are logged in as {user.email}</p>
//       )}
//       <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
//         <FeatureCard
//           title="Organize Your Inventory"
//           description="Upload and categorize your inventory items for easy access."
//         />
//         <FeatureCard
//           title="Track Stock Levels"
//           description="Monitor your stock levels and receive alerts for low inventory."
//         />
//         <FeatureCard
//           title="Manage Suppliers"
//           description="Keep track of your suppliers and their contact information."
//         />
//       </div>
//     </div>
//     </div>
    

//   );
// }

// function FeatureCard({ title, description }) {
//   return (
//     <div className="p-6 bg-white rounded-lg shadow-md">
//       <h3 className="text-xl font-semibold mb-4">{title}</h3>
//       <p className="text-gray-600">{description}</p>
//     </div>
//   );
// }

// export default Home;


import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase/config';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar user={user} />
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Welcome to </span>
            <span className="block text-blue-600">Facet Vault</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Organize and track your gemstone collection with photos and detailed records.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            {!user ? (
              <button
                onClick={loginWithGoogle}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:text-lg"
              >
                Get Started
              </button>
            ) : (
              <Link
                to="/dashboard"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:text-lg"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Powerful Features for Your Kitchen
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Everything you need to manage your kitchen efficiently
          </p>
        </div>

        <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon="🤖"
            title="Gem Collection"
            description="Check your own collection"
          />
          <FeatureCard
            icon="📝"
            title="Stone Records"
            description="Keep track of your stones"
          />
          {/* <FeatureCard
            icon="🛒"
            title="Shopping List Generator"
            description="Automatically generate shopping lists based on your recipes and inventory"
          />
          <FeatureCard
            icon="📅"
            title="Meal Planning"
            description="Plan your meals for the week with our intuitive calendar interface"
          />
          <FeatureCard
            icon="🔄"
            title="Recipe Sharing"
            description="Share your favorite recipes with friends and family"
          /> */}
          <FeatureCard
            icon="📊"
            title="Collection Insights"
            description="Get detailed  information for all your collections"
          />
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Three simple steps to transform your kitchen management
            </p>
          </div>

          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-3">
            <StepCard
              number="1"
              title="Add Your Ingredients"
              description="Input your available ingredients into your digital pantry"
            />
            <StepCard
              number="2"
              title="Get Recipe Suggestions"
              description="Receive AI-powered recipe suggestions based on your ingredients"
            />
            <StepCard
              number="3"
              title="Cook and Enjoy"
              description="Follow the recipe instructions and enjoy your meal"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Join thousands of users who are already managing their kitchens smarter.
            </p>
            <div className="mt-8">
              {!user ? (
                <button
                  onClick={loginWithGoogle}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 md:text-lg"
                >
                  Sign Up Now
                </button>
              ) : (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 md:text-lg"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-600 text-white rounded-full text-xl font-bold">
        {number}
      </div>
      <h3 className="mt-4 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
}

export default Home;
