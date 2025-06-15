// src/app/privacy-policy/page.tsx

import Footer from "@/components/footer";
import Header from "@/components/header";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-8">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: June 18, 2024</p>
          
          <div className="prose prose-lg max-w-none">
            <h2>Introduction</h2>
            <p>This Privacy Policy describes how WallStreet and its affiliates... collect, use, share, protect or otherwise process your information/ personal data through our website <strong>https://wall-street-ind.vercel.app</strong> (hereinafter referred to as Platform)...</p>
            
            <h2>Collection</h2>
            <p>We collect your personal data when you use our Platform, services or otherwise interact with us during the course of our relationship... such as name, date of birth, address, telephone/mobile number, email IDand/or any such information shared as proof of identity or address...</p>
            
            <h2>Usage</h2>
            <p>We use personal data to provide the services you request. To the extent we use your personal data to market to you, we will provide you the ability to opt-out of such uses. We use your personal data to assist sellers and business partners in handling and fulfilling orders; enhancing customer experience; to resolve disputes; troubleshoot problems...</p>

            <h2>Sharing</h2>
            <p>We may share your personal data internally within our group entities... We may disclose personal data to third parties such as sellers, business partners, third party service providers including logistics partners, prepaid payment instrument issuers, third-party reward programs and other payment opted by you...</p>

            <h2>Security Precautions</h2>
            <p>To protect your personal data from unauthorised access or disclosure, loss or misuse we adopt reasonable security practices and procedures... we adhere to our security guidelines to protect it against unauthorised access and offer the use of a secure server...</p>

            <h2>Data Deletion and Retention</h2>
            <p>You have an option to delete your account by visiting your profile and settings on our Platform... We retain your personal data information for a period no longer than is required for the purpose for which it was collected or as required under any applicable law...</p>
            
            <h2>Your Rights</h2>
            <p>You may access, rectify, and update your personal data directly through the functionalities provided on the Platform.</p>
            
            <h2>Consent</h2>
            <p>By visiting our Platform or by providing your information, you consent to the collection, use, storage, disclosure and otherwise processing of your information on the Platform in accordance with this Privacy Policy...</p>

            <h2>Changes to this Privacy Policy</h2>
            <p>Please check our Privacy Policy periodically for changes. We may update this Privacy Policy to reflect changes to our information practices...</p>

            <h2>Grievance Officer</h2>
            <p>In accordance with Information Technology Act 2000 and rules made there under, the name and contact details of the Grievance Officer are provided below. As a sole proprietor, you are the grievance officer.</p>
            <address className="not-italic">
              <strong>Name:</strong> Arjun Kapoor<br />
              <strong>Designation:</strong> Proprietor<br />
              <strong>Email:</strong> biz.poster.plug@gmail.com<br />
              <strong>Address:</strong> Ramprastha Colony, Ghaziabad, India
            </address>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}