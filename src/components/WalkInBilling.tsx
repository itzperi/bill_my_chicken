import React, { useState, useEffect } from 'react';
import { Phone, User, Check, X, MessageCircle, Smartphone, Printer } from 'lucide-react';

interface BillItem {
  no: number;
  item: string;
  weight: string;
  rate: string;
  amount: number;
}

interface WalkInBillingProps {
  onPhoneUpdate: (phone: string) => void;
  selectedCustomerPhone: string;
  selectedCustomer: string;
  onCustomerUpdate: (customer: string) => void;
  previousBalance: number;
  billItems: BillItem[];
  totalAmount: number;
  onSendWhatsApp: (phone: string, billData: any) => void;
  shopDetails?: {
    shopName: string;
    address: string;
    gstNumber: string;
  };
}

const WalkInBilling: React.FC<WalkInBillingProps> = ({
  onPhoneUpdate,
  selectedCustomerPhone,
  selectedCustomer,
  onCustomerUpdate,
  previousBalance,
  billItems,
  totalAmount,
  onSendWhatsApp,
  shopDetails
}) => {
  const [phoneNumber, setPhoneNumber] = useState(selectedCustomerPhone);
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [showWhatsAppPreview, setShowWhatsAppPreview] = useState(false);

  useEffect(() => {
    setPhoneNumber(selectedCustomerPhone);
  }, [selectedCustomerPhone]);

  useEffect(() => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    setIsValidPhone(cleanPhone.length === 10);
    
    if (cleanPhone.length === 10) {
      onPhoneUpdate(phoneNumber);
    }
  }, [phoneNumber, onPhoneUpdate]);

  const formatPhoneDisplay = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return cleaned.replace(/(\d{5})(\d{5})/, '$1 $2');
    }
    return phone;
  };

  const generateBillContent = () => {
    const validItems = billItems.filter(item => item.item && item.weight && item.rate);
    const itemsTotal = validItems.reduce((sum, item) => sum + item.amount, 0);
    // For walk-in customers, no previous balance is used
    const newBalance = itemsTotal; // Walk-in bills don't carry forward balances

    return `
🏪 ${shopDetails?.shopName || 'BILLING SYSTEM'}
📍 ${shopDetails?.address || ''}
📞 Phone: ${selectedCustomerPhone}
${shopDetails?.gstNumber ? `🧾 GST: ${shopDetails.gstNumber}` : ''}

📋 BILL DETAILS
════════════════
👤 Customer: Walk-in Customer
📱 Phone: ${formatPhoneDisplay(selectedCustomerPhone)}
📅 Date: ${new Date().toLocaleDateString('en-IN')}
⏰ Time: ${new Date().toLocaleTimeString('en-IN', { hour12: true })}

🛒 ITEMS:
${validItems.map(item => 
  `• ${item.item} - ${item.weight}kg @ ₹${item.rate}/kg = ₹${item.amount.toFixed(2)}`
).join('\n')}

💰 BILL SUMMARY:
────────────────
Current Items: ₹${itemsTotal.toFixed(2)}
Total Amount: ₹${newBalance.toFixed(2)}

Thank you for your business! 🙏
    `.trim();
  };

  const handleSendWhatsApp = () => {
    if (!isValidPhone) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    const billContent = generateBillContent();
    const encodedMessage = encodeURIComponent(billContent);
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    setShowWhatsAppPreview(false);
  };

  const handleSmsShare = () => {
    if (!isValidPhone) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    const billContent = generateBillContent();
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(billContent)}`;
    
    const link = document.createElement('a');
    link.href = smsUrl;
    link.click();
    
    setShowWhatsAppPreview(false);
  };

  const handlePrint = () => {
    const billContent = generateBillContent();
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Walk-in Bill - ${new Date().toLocaleDateString()}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.4;
                margin: 20px;
                color: #000;
              }
              .bill-header {
                text-align: center;
                border-bottom: 2px solid #000;
                padding-bottom: 10px;
                margin-bottom: 15px;
              }
              .bill-content {
                white-space: pre-wrap;
                font-family: 'Courier New', monospace;
              }
              @media print {
                body { margin: 0; }
                .bill-header { page-break-after: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="bill-header">
              <h2>WALK-IN CUSTOMER BILL</h2>
              <p>Date: ${new Date().toLocaleDateString('en-IN')}</p>
            </div>
            <div class="bill-content">${billContent}</div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
    
    setShowWhatsAppPreview(false);
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-3">
        <User className="h-5 w-5 text-green-600 mr-2" />
        <h3 className="text-lg font-semibold text-green-800">Walk-in Customer</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Phone Number *
          </label>
          <div className="relative">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-green-500 transition-colors ${
                phoneNumber && !isValidPhone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter 10-digit phone number"
              maxLength={10}
            />
            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            {phoneNumber && (
              <div className="absolute right-3 top-3">
                {isValidPhone ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="h-5 w-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          {phoneNumber && !isValidPhone && (
            <p className="text-red-500 text-sm mt-1">Enter a valid 10-digit phone number</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name (Auto-filled if exists)
          </label>
          <input
            type="text"
            value={selectedCustomer || 'Walk-in Customer '}
            onChange={(e) => onCustomerUpdate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-gray-50"
            placeholder="Walk-in Customer "
            readOnly={!!selectedCustomer}
          />
        </div>
      </div>

      {isValidPhone && totalAmount > 0 && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setShowWhatsAppPreview(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Share Bill
          </button>
        </div>
      )}

      {/* WhatsApp Preview Modal */}
      {showWhatsAppPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share Bill</h3>
              <button
                onClick={() => setShowWhatsAppPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                Send bill to {selectedCustomer || 'Walk-in Customer'} ({formatPhoneDisplay(phoneNumber)})
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <button
                onClick={handleSendWhatsApp}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleSmsShare}
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Smartphone className="h-5 w-5" />
                <span>SMS</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Printer className="h-5 w-5" />
                <span>Print</span>
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-2">Bill Preview:</p>
              <div className="bg-white border border-gray-200 rounded p-3 max-h-32 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap font-mono text-gray-700">
                  {generateBillContent()}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalkInBilling;