import { PublicLayout } from "@/components/PublicLayout";

export default function AdditionalInfo() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-white">
        {/* Page Header */}
        <div className="border-b border-gray-200">
          <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Additional Information
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Information</h2>
                <p className="leading-relaxed">
                  The following additional terms apply to all tours, packages, and services booked through PIKME <strong>(www.pikme.org)</strong>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">General Conditions</h2>
                <p className="leading-relaxed mb-4">
                  PIKME reserves the right, at its sole discretion, to:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Reschedule or modify itineraries or routes</li>
                  <li>Adjust pricing</li>
                  <li>Cancel or withdraw any tour</li>
                </ul>
                <p className="leading-relaxed">
                  This may be done in the interest of guest safety, operational requirements, supplier constraints, or unforeseen circumstances.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Pricing & Validity</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Rates are based on a <strong>minimum of 6 passengers (Triple Sharing Basis)</strong></li>
                  <li>Prices may vary if the group size is reduced below 6 passengers</li>
                  <li>Rates are <strong>not valid during blackout dates</strong>, long weekends, festivals, Christmas, or New Year</li>
                  <li>All prices are subject to availability and supplier confirmation</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Bookings & Payments</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>100% advance payment</strong> is required for booking confirmation</li>
                  <li>Booking confirmation status will be shared within <strong>72 hours</strong> of successful payment</li>
                  <li>All tour packages are subject to availability from hotels, transporters, and vendors</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tour Inclusions & Services</h2>
                <p className="leading-relaxed mb-4">
                  Tour packages include <strong>standard offerings only</strong>, such as:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Hotel accommodation with <strong>CP (Room + Breakfast)</strong></li>
                  <li>Transfers and land transportation as per itinerary</li>
                  <li>Vehicles are provided strictly on a <strong>point-to-point basis</strong>, as mentioned in the tour plan</li>
                  <li>There will be <strong>no refund for unused services</strong>, transportation, meals, or inclusions</li>
                  <li>Unused inclusions in any package are <strong>non-refundable</strong></li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Hotel Policies</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Early check-in and late check-out are <strong>subject to hotel discretion and availability</strong></li>
                  <li>Hotels will not provide any adjustment or complimentary <strong>Half Board / Full Board</strong> if not utilised</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No-Show & Delays</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Guests failing to report on time at the designated pickup point will be treated as a <strong>No-Show</strong></li>
                  <li>No refund will be applicable in case of No-Show</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Taxes, Fees & Permits</h2>
                <p className="leading-relaxed mb-4">
                  Tourism fees, green tax, permits, or entry fees (if applicable) are to be <strong>borne by the guest</strong>.
                </p>
                <p className="leading-relaxed mb-4">
                  For international tours:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Visa charges</li>
                  <li>Tourism fees</li>
                  <li>Stamping fees</li>
                  <li>On-arrival charges</li>
                </ul>
                <p className="leading-relaxed">
                  are <strong>not included</strong> unless explicitly mentioned.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Force Majeure & Liability Disclaimer</h2>
                <p className="leading-relaxed mb-4">
                  PIKME shall not be held responsible or liable for any loss, delay, injury, or inconvenience caused due to:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Acts of God</li>
                  <li>Natural disasters</li>
                  <li>Political unrest</li>
                  <li>Strikes</li>
                  <li>Weather conditions</li>
                  <li>Airline or transport delays or failures</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Personal Belongings & Health</h2>
                <p className="leading-relaxed mb-4">
                  PIKME does <strong>not take responsibility</strong> for:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Loss or theft of valuables, luggage, cash, or cards</li>
                  <li>Ill health, medical emergencies, or accidents during the tour</li>
                  <li>Hotel check-in issues beyond supplier policies</li>
                </ul>
                <p className="leading-relaxed">
                  Guests are advised to:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Take adequate travel insurance</li>
                  <li>Follow all safety instructions</li>
                  <li>Review <strong>Terms & Conditions</strong> mentioned on www.pikme.org</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Gift Coupons</h2>
                <p className="leading-relaxed">
                  For gift coupon redemption, please contact customer support at: 📧 <strong>cr@pikme.org</strong>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Travel Assistance</h2>
                <p className="leading-relaxed">
                  For your safety and better planning, we recommend consulting our travel advisors before finalising your booking: 📧 <strong>cr@pikme.org</strong>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Details</h2>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Website: <strong>https://pikme.org</strong></li>
                  <li>Address: <strong>740, 5th Block, 20th Cross, Bashyam Circle, Rajajinagar, Bangalore – 560010</strong></li>
                  <li>Email: <strong>tours@pikme.org</strong></li>
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
