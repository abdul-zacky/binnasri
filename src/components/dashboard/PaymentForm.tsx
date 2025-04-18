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
      
      // Add to date flow
      await addDateFlow({
        date: new Date(),
        amount: paymentAmount,
        negAmount: 0
      });
      
      onComplete();
    } catch (err) {
      setError('Failed to process payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Payment</h2>
            <button onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Last Paid Date</label>
              <div className="input-field bg-gray-100 flex items-center">
                <Calendar size={20} className="text-gray-500 mr-2" />
                <span>{formatDate(check.lastDayPaid || check.checkDate)}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Pay Until Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date(lastPaidDate.getTime() + 86400000).toISOString().split('T')[0]}
                max={checkOutDate.toISOString().split('T')[0]}
                className="input-field"
              />
            </div>
            
            {daysBeingPaid > 0 && (
              <div className="card bg-blue-50 mt-4">
                <p className="text-center text-blue-800 font-medium">
                  Payment for {daysBeingPaid} days: {formatCurrency(paymentAmount)}
                </p>
              </div>
            )}
            
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="button-primary w-full py-3"
                disabled={isSubmitting || daysBeingPaid <= 0}
              >
                {isSubmitting ? 'Processing...' : `Pay ${formatCurrency(paymentAmount)}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}