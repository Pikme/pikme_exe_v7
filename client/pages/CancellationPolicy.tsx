import { PublicLayout } from "@/components/PublicLayout";

export default function CancellationPolicy() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-white">
        {/* Page Header */}
        <div className="border-b border-gray-200">
          <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Cancellation Policy
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Last Updated: 25 December 2025
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl prose prose-lg">
            <div className="space-y-8 text-gray-600">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Cancellation & Rescheduling Policy</h2>
                <p className="leading-relaxed">
                  The following policy applies to all tour packages booked through PIKME <strong>(www.pikme.org)</strong>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Rescheduling / Amendment Policy</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Any change or rescheduling request after booking confirmation will attract a <strong>rescheduling charge of ₹4,000 per person</strong></li>
                  <li>All rescheduling requests are <strong>subject to flight, hotel, and supplier availability</strong></li>
                  <li>Additional charges levied by airlines, hotels, or vendors (if any) will be applicable over and above the rescheduling fee</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tour Package Cancellation Charges</h2>
                <p className="leading-relaxed mb-4">
                  (Based on number of days prior to departure date; departure date excluded)
                </p>
                <div className="overflow-x-auto mb-4">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Cancellation Timeline</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Deduction</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Prior to 41 days</td>
                        <td className="border border-gray-300 px-4 py-2">20% of total package cost</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">31 days</td>
                        <td className="border border-gray-300 px-4 py-2">30% of total package cost</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">21 to 15 days</td>
                        <td className="border border-gray-300 px-4 py-2">65% of total package cost</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">14 to 8 days</td>
                        <td className="border border-gray-300 px-4 py-2">80% of package cost</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Less than 8 days / No-Show</td>
                        <td className="border border-gray-300 px-4 py-2">100% (No Refund)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Important Terms</h2>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Cancellation charges are calculated on the <strong>total package cost</strong></li>
                  <li>No refunds will be provided for:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>No-shows</li>
                      <li>Partially utilised services</li>
                      <li>Early check-outs or missed activities</li>
                    </ul>
                  </li>
                  <li>Refunds, if applicable, will be processed only after receiving funds from suppliers</li>
                  <li>All refunds will be credited to the <strong>original mode of payment</strong></li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Force Majeure</h2>
                <p className="leading-relaxed mb-4">
                  No refunds will be applicable for cancellations due to events beyond our control, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Natural disasters</li>
                  <li>Government restrictions</li>
                  <li>Political unrest</li>
                  <li>Pandemics</li>
                  <li>Airline or supplier shutdowns</li>
                </ul>
                <p className="leading-relaxed">
                  Refunds (if any) will be subject to supplier policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact for Cancellations</h2>
                <p className="leading-relaxed mb-4">
                  <strong>Contact Details:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Website: <strong>https://pikme.org</strong></li>
                  <li>Address: <strong>740, 5th Block, 20th Cross, Bashyam Circle, Rajajinagar, Bangalore – 560010</strong></li>
                  <li>Phone: <strong>+91 80883 79983 | +91 98459 91455</strong></li>
                </ul>
              </section>

              <section className="mt-12 pt-8 border-t border-gray-200">
                <p className="leading-relaxed">
                  © 2026 <strong>PIKME. All Rights Reserved</strong><br />
                  Owned & Operated by <strong>CEKAV</strong>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
