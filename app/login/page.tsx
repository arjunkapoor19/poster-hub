'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation' // Import useRouter for redirection
import { supabase } from '@/lib/supabaseClient'
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
    weight: "400",
    subsets: ["latin"],
  });

export default function LoginPage() {
  const router = useRouter(); // Initialize the router
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('') // New state to hold the OTP code
  const [otpSent, setOtpSent] = useState(false) // New state to track if we're on the OTP entry step
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // This single handler now manages both sending the code and verifying it
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!otpSent) {
      // --- STEP 1: Send the verification code ---
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Supabase sends a 6-digit code by default with this setup.
          // No need to specify a redirect URL for an OTP flow.
          shouldCreateUser: true, // Allow new users to sign up
        },
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Check your email for the 6-digit code!')
        setOtpSent(true) // Move to the OTP entry view
      }

    } else {
      // --- STEP 2: Verify the code ---
      if (!otp) {
        setMessage('Please enter the code.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email', // The type of OTP we're verifying
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        // On successful verification, the user is logged in.
        // The `data` object contains the session.
        setMessage('Login successful! Redirecting...')
        router.push('/profile') // Redirect to a protected page
        router.refresh() // Refresh to update server components and layout
      }
    }

    setLoading(false)
  }

  // A helper to go back and change the email
  const handleGoBack = () => {
    setOtpSent(false)
    setMessage('')
    setEmail('')
    setOtp('')
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-100 px-4 antialiased ${montserrat.className}`}>
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        {!otpSent ? (
          <>
            <h1 className="text-2xl font-bold mb-3">Login / Sign Up</h1>
            <h3 className='mb-6 text-sm text-gray-600'>Enter your email and we will send you a login code.</h3>

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 border rounded-lg mb-4 focus:ring-2 focus:ring-black outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-3">Check your email</h1>
            <h3 className='mb-6 text-sm text-gray-600'>
              We sent a 6-digit code to <strong>{email}</strong>.
            </h3>

            <input
              type="text"
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 border rounded-lg mb-4 text-center tracking-[0.5em] font-mono focus:ring-2 focus:ring-black outline-none transition"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              disabled={loading}
              maxLength={6}
              // Better mobile experience with numeric keyboard
              inputMode="numeric"
              pattern="[0-9]{6}"
            />
             <a onClick={handleGoBack} className="text-sm text-gray-500 hover:text-black cursor-pointer">
              Use a different email
            </a>
          </>
        )}

        <button
          type="submit"
          className="w-full py-3 mt-4 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Processing...' : (otpSent ? 'Verify & Login' : 'Send Code')}
        </button>

        {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
      </form>
    </div>
  )
}