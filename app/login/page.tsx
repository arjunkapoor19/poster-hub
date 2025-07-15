'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Montserrat } from 'next/font/google'
import { Mail, ArrowLeft, Shield, Sparkles } from 'lucide-react'

const montserrat = Montserrat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
})

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!otpSent) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Check your email for the 6-digit code!')
        setOtpSent(true)
      }
    } else {
      if (!otp) {
        setMessage('Please enter the code.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Login successful! Redirecting...')
        router.push('/profile')
        router.refresh()
      }
    }

    setLoading(false)
  }

  const handleGoBack = () => {
    setOtpSent(false)
    setMessage('')
    setEmail('')
    setOtp('')
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 antialiased ${montserrat.className}`}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-300">Sign in to your account</p>
        </div>

        {/* Main form card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {!otpSent ? (
              <>
                {/* Email step */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-2xl mb-4">
                    <Mail className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">Enter your email</h2>
                  <p className="text-gray-300 text-sm">We'll send you a secure login code</p>
                </div>

                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 backdrop-blur-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </>
            ) : (
              <>
                {/* OTP step */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-2xl mb-4">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
                  <p className="text-gray-300 text-sm">
                    We sent a 6-digit code to{' '}
                    <span className="font-medium text-white">{email}</span>
                  </p>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="000000"
                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 backdrop-blur-sm"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    disabled={loading}
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                  />
                  
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="flex items-center justify-center w-full py-3 text-gray-300 hover:text-white transition-colors duration-300 group"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                    Use a different email
                  </button>
                </div>
              </>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                otpSent ? 'Verify & Login' : 'Send Code'
              )}
            </button>

            {/* Message display */}
            {message && (
              <div className={`p-4 rounded-2xl text-center text-sm ${
                message.includes('Error') 
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                  : message.includes('successful')
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {message}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>Secure login powered by magic links</p>
        </div>
      </div>
    </div>
  )
}