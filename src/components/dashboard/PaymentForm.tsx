// src/components/dashboard/PaymentForm.tsx
"use client";

import { useState } from 'react';
import { useChecks } from '@/hooks/useChecks';
import { useDateFlows } from '@/hooks/useDateFlows';
import { Check, listOfPrices } from '@/models/check';
import { X, Calendar } from 'lucide-react';
import { formatDate, formatCurrency, calculateStatusFromPayment } from '@/lib/utils';

interface PaymentFormProps {
  check: Check;
  onClose: () => void;
  onComplete: () => void;
}

export default function PaymentForm({ check, onClose, onComplete }: PaymentFormProps) {
  const { updateCheckStatus } = useChecks();
  const { addDateFlow } = useDateFlows();
  
  const [selectedDate, setSelectedDate] = useState<string>(
    (check.lastDayPaid || check.checkDate).toISOString().split('T')[0]
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculate the number of days to be paid
  const lastPaidDate = new Date(check.lastDayPaid || check.checkDate);
  const newPaidDate = new Date(selectedDate);
  const checkOutDate = new Date(check.checkOutDate);
  
  const daysBeingPaid = Math.max(
    0,
    Math.floor((newPaidDate.getTime() - lastPaidDate.getTime()) / (86400000))
  );
  
  const paymentAmount = (listOfPrices[check.roomNumber] || 0) * daysBeingPaid;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (newPaidDate <= lastPaidDate) {
      setError('New payment date must be after the last paid date');
      return;
    }
    
    if (newPaidDate > checkOutDate) {
      setError('Payment date cannot be after check-out date');
      return;
    }
    
    if (daysBeingPaid <= 0 || paymentAmount <= 0) {
      setError('Invalid payment amount');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update check status
      const newStatus = calculateStatusFromPayment({
        ...check,
        lastDayPaid: newPaidDate
      });
      
      await updateCheckStatus(
        check.id,
        newStatus,
        newPaidDate,
        paymentAmount
      );
      
      // Add to date flow - wrapped in try/catch for better error handling
      try {
        await addDateFlow({
          date: new Date(),
          amount: paymentAmount,
          negAmount: 0
        });
      } catch (flowError) {
        console.error('Error adding date flow:', flowError);
        // Continue even if date flow has an error - the payment still worked
      }
      
      // Show success message
      setSuccess(true);
      
      // Close after a short delay
      setTimeout(() => {
        onComplete();
      }, 1500);
      
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Failed to process payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Payment</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 rounded-full p-1 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              Payment processed successfully!
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Paid Date</label>
              <div className="input-field bg-gray-100 flex items-center px-3 py-2 rounded-lg">
                <Calendar size={20} className="text-gray-500 mr-2" />
                <span>{formatDate(check.lastDayPaid || check.checkDate)}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pay Until Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar size={20} className="text-gray-500" />
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date(lastPaidDate.getTime() + 86400000).toISOString().split('T')[0]}
                  max={checkOutDate.toISOString().split('T')[0]}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {daysBeingPaid > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Payment for</p>
                    <p className="font-medium text-gray-900">{daysBeingPaid} days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-bold text-blue-700">{formatCurrency(paymentAmount)}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                disabled={isSubmitting || daysBeingPaid <= 0}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  `Pay ${formatCurrency(paymentAmount)}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}