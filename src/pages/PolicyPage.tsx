interface PolicyPageProps {
  type: 'privacy' | 'terms' | 'shipping' | 'returns';
  onNavigate?: (page: string) => void;
}

export function PolicyPage({ type }: PolicyPageProps) {
  const content = {
    privacy: {
      title: 'Privacy Policy',
      lastUpdated: 'October 31, 2026',
      body: (
        <div className="space-y-6 text-gray-700 text-sm sm:text-base leading-relaxed">
          <p>
            At <strong>ASTROS KULTURE</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;), accessible from{' '}
            <a href="https://astroskulture.in" className="text-red-600 underline">https://astroskulture.in</a>, we are dedicated to protecting your privacy and ensuring your personal information is collected and used strictly in accordance with India&apos;s Digital Personal Data Protection Act (DPDP) and international privacy standards.
          </p>
          <h2 className="text-lg font-bold text-gray-900 mt-6">1. Information We Collect</h2>
          <p>
            When you visit, browse, or purchase from Astros Kulture, we collect information including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Personal Contact Data:</strong> Name, shipping address, email address, and phone number for order fulfilment and courier updates.</li>
            <li><strong>Device & Usage Data:</strong> IP address, browser type, device identifiers, and pages visited collected via Google Analytics 4 (GA4) and Meta Pixel.</li>
            <li><strong>Transactional Records:</strong> Payment transaction references via our secure payment gateway partner, Razorpay. We do not store raw card numbers or CVV.</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-900 mt-6">2. Third-Party Analytics & Conversion Tracking</h2>
          <p>
            We use Google Analytics 4 and Meta Conversions API (CAPI) to analyze site performance and deliver relevant promotions. These tools use pseudonymized and SHA-256 hashed identifiers to protect your identity. You may reject or adjust cookie tracking at any time using our consent banner.
          </p>

          <h2 className="text-lg font-bold text-gray-900 mt-6">3. Data Retention & Your Rights</h2>
          <p>
            You have the right to request access to, correction of, or deletion of your personal data stored with us. For inquiries or data removal requests, contact our Data Grievance Officer at{' '}
            <a href="mailto:help.astroskulture@gmail.com" className="text-red-600 underline">help.astroskulture@gmail.com</a>.
          </p>
        </div>
      ),
    },
    terms: {
      title: 'Terms of Service',
      lastUpdated: 'October 31, 2026',
      body: (
        <div className="space-y-6 text-gray-700 text-sm sm:text-base leading-relaxed">
          <p>
            Welcome to <strong>ASTROS KULTURE</strong>. By accessing our website, browsing our collections, or placing an order, you agree to comply with and be bound by the following terms and conditions.
          </p>
          <h2 className="text-lg font-bold text-gray-900 mt-6">1. Product Quality & Sizing</h2>
          <p>
            All Astros Kulture streetwear items are crafted from heavyweight 240 GSM combed cotton. Because our fits are oversized and drop-shoulder by design, please consult our size charts before placing an order. Colors viewed on digital screens may vary marginally due to monitor color calibration.
          </p>
          <h2 className="text-lg font-bold text-gray-900 mt-6">2. Pricing & Payments</h2>
          <p>
            All prices are quoted in Indian Rupees (INR) and are inclusive of applicable GST unless explicitly noted otherwise. We reserve the right to correct any inadvertent typographical or system pricing errors prior to order dispatch.
          </p>
          <h2 className="text-lg font-bold text-gray-900 mt-6">3. Custom Design Studio</h2>
          <p>
            Users uploading graphics or artwork to our Custom Design Studio warrant that they possess lawful copyright or authorization for the submitted designs. We reserve the right to cancel orders containing defamatory or unlawful graphics.
          </p>
        </div>
      ),
    },
    shipping: {
      title: 'Shipping & Delivery Policy',
      lastUpdated: 'October 31, 2026',
      body: (
        <div className="space-y-6 text-gray-700 text-sm sm:text-base leading-relaxed">
          <p>
            We ship across all serviceable pin codes in India through trusted tier-1 logistics partners (Delhivery, Bluedart, Xpressbees).
          </p>
          <h2 className="text-lg font-bold text-gray-900 mt-6">1. Processing & Transit Times</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Standard Orders:</strong> Processed and dispatched within 24 to 48 hours of order confirmation.</li>
            <li><strong>Custom Designs:</strong> Printed on demand and dispatched within 2 to 4 business days.</li>
            <li><strong>Estimated Delivery:</strong> Metro cities: 3–5 business days. Rest of India: 4–7 business days.</li>
          </ul>
          <h2 className="text-lg font-bold text-gray-900 mt-6">2. Shipping Charges</h2>
          <p>
            <strong>Free Shipping</strong> is automatically applied to all prepaid and COD orders with a cart subtotal of ₹999 or above Pan-India. For orders below ₹999, a flat shipping fee of ₹99 is applied at checkout.
          </p>
          <h2 className="text-lg font-bold text-gray-900 mt-6">3. Order Tracking</h2>
          <p>
            Once dispatched, you will receive a tracking link via SMS, WhatsApp, and email to monitor your package in real time.
          </p>
        </div>
      ),
    },
    returns: {
      title: 'Return & Refund Policy',
      lastUpdated: 'October 31, 2026',
      body: (
        <div className="space-y-6 text-gray-700 text-sm sm:text-base leading-relaxed">
          <p>
            We want you to love your Astros Kulture fits. If you are not satisfied with your purchase, we offer a hassle-free 7-day return and exchange policy from the date of package delivery.
          </p>
          <h2 className="text-lg font-bold text-gray-900 mt-6">1. Eligibility Criteria</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Item must be unused, unwashed, and in original condition with brand tags and packaging intact.</li>
            <li>Size exchange requests are processed free of charge for your first exchange.</li>
            <li><strong>Custom Print T-Shirts:</strong> Bespoke custom designs printed specifically on user request are non-returnable unless received damaged or with manufacturing defects.</li>
          </ul>
          <h2 className="text-lg font-bold text-gray-900 mt-6">2. How to Initiate a Return</h2>
          <p>
            Send your order ID and photos of the item to{' '}
            <a href="mailto:help.astroskulture@gmail.com" className="text-red-600 underline">help.astroskulture@gmail.com</a>{' '}
            or WhatsApp our support team at <strong>+91 78716 58830</strong>.
          </p>
          <h2 className="text-lg font-bold text-gray-900 mt-6">3. Refund Timeline</h2>
          <p>
            Prepaid refunds are credited back to the original payment source (UPI/Card/Netbanking) within 5–7 banking days of reverse pickup verification. For COD orders, refund is issued via UPI or bank transfer.
          </p>
        </div>
      ),
    },
  };

  const current = content[type] || content.privacy;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6 sm:p-10 border border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">{current.title}</h1>
        <p className="text-xs text-gray-500 mb-8 pb-4 border-b border-gray-100">Last updated: {current.lastUpdated}</p>
        {current.body}
      </div>
    </div>
  );
}
