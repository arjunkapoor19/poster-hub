'use client';

import { useState } from 'react';
import { ChevronDownIcon, SearchIcon, MailIcon } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    title: "Orders & Purchasing",
    items: [
      {
        question: "How do I place an order?",
        answer: "Simply browse our collections, select your desired poster, choose your size and quantity, then add it to your cart. Proceed to checkout where you'll enter your shipping information and payment details to complete your order."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and other secure payment methods. All transactions are processed securely through encrypted payment gateways."
      },
      {
        question: "Can I cancel or modify my order?",
        answer: "An order once places cannot be modified or ordered as they enter our production queue."
      }
    ]
  },
  {
    title: "Shipping & Delivery",
    items: [
      {
        question: "How long does shipping take?",
        answer: "Shipping takes about 3-4 business days after order."
      },
      {
        question: "How can I track my order?",
        answer: "You can track your orders on the orders page withing our website."
      }
    ]
  },
  {
    title: "Product Quality & Sizing",
    items: [
      {
        question: "What materials are your posters printed on?",
        answer: "Our posters are printed on high-quality 250gsm matte paper using professional-grade inks that resist fading."
      },
      {
        question: "What sizes are available?",
        answer: "We offer A4 prints. Custom sizes may be available upon request."
      },
      {
        question: "Are your prints ready to hang?",
        answer: "Standard prints come unframed and ready for framing. "
      }
    ]
  },
  {
    title: "Returns & Exchanges",
    items: [
      {
        question: "What if my poster arrives damaged?",
        answer: "We take great care in packaging, but if your poster arrives damaged, please contact us within 48 hours with photos of the damage and a video recording of the unboxing. We'll send a replacement at no additional cost."
      },
    ]
  }
];

const FAQAccordion: React.FC<{ item: FAQItem; isOpen: boolean; onToggle: () => void }> = ({ 
  item, 
  isOpen, 
  onToggle 
}) => {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full text-left p-6 hover:bg-blue-50 transition-all duration-300 flex justify-between items-center group"
      >
        <span className="font-semibold text-gray-800 text-lg pr-4 group-hover:text-blue-600">
          {item.question}
        </span>
        <ChevronDownIcon 
          className={`w-5 h-5 text-blue-600 transition-transform duration-300 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="p-6 pt-0 text-gray-600 leading-relaxed bg-blue-50/50">
          {item.answer}
        </div>
      </div>
    </div>
  );
};

const FAQCategory: React.FC<{ category: FAQCategory; searchTerm: string }> = ({ 
  category, 
  searchTerm 
}) => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  
  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const filteredItems = category.items.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredItems.length === 0) return null;

  return (
    <div className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h3 className="text-xl font-bold uppercase tracking-wide">{category.title}</h3>
      </div>
      <div>
        {filteredItems.map((item, index) => (
          <FAQAccordion
            key={index}
            item={item}
            isOpen={openItems.has(index)}
            onToggle={() => toggleItem(index)}
          />
        ))}
      </div>
    </div>
  );
};

const FAQPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Find answers to common questions about WallStreet Posters
          </p>
        </div>

        {/* Search Box */}
        <div className="mb-12 relative">
          <div className="relative max-w-2xl mx-auto">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-full bg-white/20 backdrop-blur-md text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 text-lg"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqData.map((category, index) => (
            <FAQCategory 
              key={index} 
              category={category} 
              searchTerm={searchTerm}
            />
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
            <MailIcon className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
            <p className="text-blue-100 text-lg mb-6">
              Our customer service team is here to help!
            </p>
            <a
              href="mailto:biz.poster.plug@gmail.com"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;