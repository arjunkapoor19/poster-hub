// src/app/refund-policy/page.tsx

import Footer from "@/components/footer";
import Header from "@/components/header";

export default function RefundPolicyPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-8">
          <h1 className="text-3xl font-bold tracking-tight">Refund and Cancellation Policy</h1>
          <div className="prose prose-lg max-w-none">
            <p>This refund and cancellation policy outlines how you can cancel or seek a refund for a product / service that you have purchased through the Platform. Under this policy:</p>
            <ol className="list-decimal pl-6">
              <li>Cancellations will only be considered if the request is made within 7 days of placing the order. However, cancellation requests may not be entertained if the orders have been communicated to us and we have initiated the process of shipping them, or the product is out for delivery.</li>
              <li>WallStreet does not accept cancellation requests for perishable items like flowers, eatables, etc. This is not applicable to our poster business.</li>
              <li>In case of receipt of damaged or defective items, please report to our customer service team. This should be reported within 7 days of receipt of products.</li>
              <li>In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within 7 days of receiving the product. The customer service team after looking into your complaint will take an appropriate decision.</li>
              <li>In case of any refunds approved by WallStreet, it will take 7 days for the refund to be processed to you.</li>
            </ol>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}