import { MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface FloatingWhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
}

export function FloatingWhatsAppButton({
  phoneNumber = '918088379983', // Default WhatsApp number (India)
  message = 'Hi! I am interested in your VIP travel services. Can you help me?',
}: FloatingWhatsAppButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Button */}
      <button
        onClick={handleWhatsAppClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg transition-all duration-300 transform hover:scale-110 ${
          isHovered ? 'shadow-2xl' : 'shadow-lg'
        }`}
        title="Chat with us on WhatsApp"
        aria-label="Open WhatsApp chat"
      >
        <MessageCircle size={28} />
      </button>

      {/* Tooltip on hover */}
      {isHovered && (
        <div className="absolute bottom-20 right-0 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg animate-fade-in">
          Chat with us on WhatsApp
          <div className="absolute bottom-0 right-4 w-2 h-2 bg-gray-900 transform rotate-45 translate-y-1"></div>
        </div>
      )}
    </div>
  );
}
