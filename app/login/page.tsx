'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
    weight: "400",
    subsets: ["latin"],
  });

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // emailRedirectTo: 'https://poster-hub-iota.vercel.app/',
      },
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Check your email for the login link!')
    }

    setLoading(false)
  }

  return (
    <div className = {` min-h-screen flex items-center justify-center bg-gray-100 px-4 antialiased ${montserrat.className}`}>
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-3 ">Login</h1>
        <h3 className='mb-6 text-sm'>Enter your email id and we will send you a login code.</h3>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full px-4 py-2 border rounded-lg mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Login'}
        </button>

        {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
      </form>
    </div>
  )
}
