// src/app/return-policy/page.tsx

import Footer from "@/components/footer";
import Header from "@/components/header";
import Link from "next/link";

export default function ReturnPolicyPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-8">
          <h1 className="text-3xl font-bold tracking-tight">Return Policy</h1>
          <div className="prose prose-lg max-w-none">
            <p>Our policy regarding returns and cancellations is detailed in our comprehensive Refund and Cancellation Policy.</p>
            <p>Please refer to the full policy for information on eligibility, timeframes, and the process for requesting a refund or return.</p>
            <p>You can view the full policy here: <Link href="/refund-policy" className="text-blue-600 underline">Refund and Cancellation Policy</Link>.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}