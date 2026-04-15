import { PublicLayout } from "@/components/PublicLayout";

export default function RefundPolicy() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-white">
        {/* Page Header */}
        <div className="border-b border-gray-200">
          <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Refund Policy
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Last updated: March 24, 2026
            </p>
          </div>
        </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl prose prose-lg">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Refund Eligibility</h2>
              <p className="text-gray-600 leading-relaxed">
                Refunds are available for bookings cancelled within the specified timeframe before your travel date. The refund eligibility depends on the type of service booked and the cancellation policy of the service provider.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Refund Timeline</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Refund timelines vary based on the service provider and payment method:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Credit/Debit Card: 5-7 business days</li>
                <li>Bank Transfer: 7-10 business days</li>
                <li>Digital Wallets: 2-3 business days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Refund Process</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To request a refund, please follow these steps:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Log in to your Pikme account</li>
                <li>Navigate to your bookings</li>
                <li>Select the booking you wish to cancel</li>
                <li>Click on "Request Refund"</li>
                <li>Follow the prompts to complete the refund request</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Refund Deductions</h2>
              <p className="text-gray-600 leading-relaxed">
                The following may be deducted from your refund:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Service charges (if applicable)</li>
                <li>Processing fees</li>
                <li>Taxes and surcharges (if non-refundable)</li>
                <li>Any penalties as per the service provider's policy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Non-Refundable Items</h2>
              <p className="text-gray-600 leading-relaxed">
                The following items are generally non-refundable:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Non-refundable hotel rates</li>
                <li>Certain tour packages marked as non-refundable</li>
                <li>Activity tickets with no cancellation policy</li>
                <li>Insurance premiums</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact for Refund Inquiries</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have questions about your refund status, please contact our support team at refunds@pikme.com or call our customer service line.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
    </PublicLayout>
  );
}
