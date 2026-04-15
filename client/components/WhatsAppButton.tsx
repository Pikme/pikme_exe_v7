import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
}

export function WhatsAppButton({
  phoneNumber = '+917259696555',
  message = 'Hi! I am interested in your tour packages. Can you provide more information?'
}: WhatsAppButtonProps) {
  const handleWhatsAppClick = () => {
    // Remove any non-digit characters from phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Encode the message
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
      title="Chat with us on WhatsApp"
      aria-label="WhatsApp chat button"
    >
      <MessageCircle size={24} />
    </button>
  );
}
