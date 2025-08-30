import type { Metadata } from 'next'
import { Questrial, Montserrat } from "next/font/google";
import './globals.css'

const questrial = Questrial({
    weight: "400",
    subsets: ["latin"],
  });

const montserrat = Montserrat({
    weight: "400",
    subsets: ["latin"],
  });

export const metadata: Metadata = {
  title: 'TheWallStreet',
  description: 'Discover stunning, high-quality posters at unbeatable prices! 🌟 Elevate your space with our vast collection of aesthetic, vintage, motivational, and custom posters. Shop now for fast shipping, exclusive designs, and budget-friendly deals!',
  generator: 'Arjun Kapoor',
  icons:{
    icon:"/skull_favicon.png"
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${questrial.className}`}>{children}</body>
    </html>
  )
}
