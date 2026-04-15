import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';

// Country codes with phone format validation
const COUNTRY_CODES = [
  { code: '+1', country: 'United States', pattern: /^\d{10}$/ },
  { code: '+44', country: 'United Kingdom', pattern: /^\d{10}$/ },
  { code: '+91', country: 'India', pattern: /^\d{10}$/ },
  { code: '+55', country: 'Brazil', pattern: /^\d{11}$/ },
  { code: '+86', country: 'China', pattern: /^\d{11}$/ },
  { code: '+81', country: 'Japan', pattern: /^\d{10}$/ },
  { code: '+33', country: 'France', pattern: /^\d{9}$/ },
  { code: '+49', country: 'Germany', pattern: /^\d{10}$/ },
  { code: '+39', country: 'Italy', pattern: /^\d{10}$/ },
  { code: '+34', country: 'Spain', pattern: /^\d{9}$/ },
];

export function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+91',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const contactMutation = trpc.contact.submitForm.useMutation();

  const validatePhone = (countryCode: string, phone: string): boolean => {
    const country = COUNTRY_CODES.find(c => c.code === countryCode);
    if (!country) return false;
    return country.pattern.test(phone);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.countryCode, formData.phone)) {
      const country = COUNTRY_CODES.find(c => c.code === formData.countryCode);
      newErrors.phone = `Invalid phone format for ${country?.country}`;
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit form without reCAPTCHA
      await contactMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: `${formData.countryCode}${formData.phone}`,
        message: formData.message,
      });

      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        countryCode: '+91',
        phone: '',
        message: '',
      });
      setErrors({});

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error: any) {
      console.error('Form submission error:', error);
      setErrors({ submit: error?.message || 'Failed to submit form. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
          <p className="text-lg text-gray-600">
            Have questions about our VIP travel services? Contact us today and let's plan your perfect journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
              
              {/* India Office */}
              <div>
                <h4 className="font-semibold text-red-600 mb-3 text-lg">Corporate Office (India)</h4>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium text-gray-900">Email:</span> <a href="mailto:cr@pikme.org" className="text-red-600 hover:text-red-700">cr@pikme.org</a>
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium text-gray-900">Web:</span> <a href="https://www.pikmeusa.com" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700">www.pikmeusa.com</a>
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium text-gray-900">Phone:</span>
                  </p>
                  <ul className="text-gray-700 space-y-1 ml-4">
                    <li><a href="tel:+919845991455" className="text-red-600 hover:text-red-700">+91 9845991455</a></li>
                    <li className="flex items-center gap-2">
                      <a href="https://wa.me/918088379983" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700">+91 8088379983</a>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">WhatsApp</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <a href="https://wa.me/917259696555" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700">+91 7259696555</a>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">WhatsApp</span>
                    </li>
                  </ul>
                  <p className="text-gray-700 mt-3">
                    <span className="font-medium text-gray-900">Address:</span> #740, 20th Main, 5th Block, Bashyam Circle, Rajajinagar, Bengaluru, Karnataka - 560010
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-lg border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Full Name *
                </label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Phone Number Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Phone Number *
                </label>
                <div className="flex gap-2">
                  <Select value={formData.countryCode} onValueChange={(value) => {
                    setFormData({ ...formData, countryCode: value });
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map((item) => (
                        <SelectItem key={item.code} value={item.code}>
                          {item.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="tel"
                    placeholder="1234567890"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    className={`flex-1 ${errors.phone ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Message *
                </label>
                <Textarea
                  placeholder="Tell us about your travel preferences..."
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    if (errors.message) setErrors({ ...errors, message: '' });
                  }}
                  className={`min-h-32 ${errors.message ? 'border-red-500' : ''}`}
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{errors.submit}</p>
                </div>
              )}

              {/* Success Message */}
              {submitSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold mb-1">Thank You!</p>
                  <p className="text-green-700 text-sm">
                    Your message has been sent successfully. We'll get back to you soon.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
