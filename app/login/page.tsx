'use client'

import { Montserrat } from 'next/font/google'
import { redirectToShopifyLogin } from '@/lib/shopify'

const montserrat = Montserrat({
    weight: "400",
    subsets: ["latin"],
});

export default function LoginPage() {
  const handleLogin = () => {
    redirectToShopifyLogin();
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-100 px-4 antialiased ${montserrat.className}`}>
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-3">Sign In or Sign Up</h1>
          <h3 className='mb-6 text-sm text-gray-500'>
            Access your account with secure email authentication.
          </h3>

          <button
            onClick={handleLogin}
            className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition duration-200 font-medium"
          >
            Continue with Email
          </button>

          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>You'll be redirected to secure Shopify login</p>
            <p>A code will be sent to your email address</p>
          </div>
        </div>
      </div>
    </div>
  );
}