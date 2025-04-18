"use client";

import { useState } from 'react';
import { useChecks } from '@/hooks/useChecks';
import { Check, Status, statusColor } from '@/models/check';
import { formatCurrency, formatDate, calculatePaymentStatus, calculateTotalBill } from '@/lib/utils';
import { X, Calendar, Clock, CreditCard, User } from 'lucide-react';
import ExtendStayForm from './ExtendStayForm';
import PaymentForm from './PaymentForm';

interface CheckDetailsProps {
  check: Check;
  onClose: () => void;
}

export default function CheckDetails({ check, onClose }: CheckDetailsProps) {
  const { updateCheckStatus } = useChecks();
  const [showExtendForm, setShowExtendForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handleCheckOut = async () => {
    if (check.status === Status.Paid) {
      try {
        await updateCheckStatus(
          check.id, 
          Status.CheckOut, 
          check.lastDayPaid || check.checkDate, 
          0
        );
        onClose();
      } catch (error) {
        console.error('Failed to check out:', error);
      }
    }
  };

  // Truncate guest name if too long
  const displayName = check.guestName.length > 20
    ? `${check.guestName.substring(0, 20)}...` 
    : check.guestName;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Room Details</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div 
              className="w-full md:w-1/3 h-32 md:h-auto rounded-xl flex items-center justify-center"
              style={{ 
                backgroundColor: `${statusColor[check.status]}22`
              }}
            >
              <div className="text-center">
                <span 
                  className="text-5xl font-bold"
                  style={{ color: statusColor[check.status] }}
                >
                  {check.roomNumber}
                </span>
                <div 
                  className="mt-2 text-xs font-medium px-2 py-1 rounded-full inline-block"
                  style={{ 
                    backgroundColor: `${statusColor[check.status]}33`,
                    color: statusColor[check.status]
                  }}
                >
                  {Status[check.status]}
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="space-y-4">
                <div className="flex items-start">
                  <User size={20} className="mt-1 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Guest</p>
                    <h3 className="text-lg font-semibold text-gray-800">{displayName}</h3>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar size={20} className="mt-1 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Stay Period</p>
                    <p className="font-medium">
                      {formatDate(check.checkDate)} - {formatDate(check.checkOutDate)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock size={20} className="mt-1 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <p className="font-medium">{calculatePaymentStatus(check)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CreditCard size={20} className="mt-1 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Total Payment</p>
                    <p className="font-medium">{formatCurrency(check.totalPayment)}</p>
                    {check.status !== Status.Paid && check.status !== Status.CheckOut && (
                      <p className="text-sm text-gray-500">
                        Remaining: {formatCurrency(calculateTotalBill(check))}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowExtendForm(true)}
              className="flex-1 py-3 px-4 rounded-lg text-center border transition-colors"
              style={{ 
                borderColor: statusColor[check.status],
                color: statusColor[check.status],
              }}
            >
              Extend Stay
            </button>
            
            {check.status !== Status.Paid ? (
              <button
                onClick={() => setShowPaymentForm(true)}
                className="flex-1 py-3 px-4 rounded-lg text-center text-white"
                style={{ backgroundColor: statusColor[check.status] }}
              >
                Process Payment
              </button>
            ) : (
              <button
                onClick={handleCheckOut}
                className="flex-1 py-3 px-4 rounded-lg text-center text-white"
                style={{ backgroundColor: statusColor[check.status] }}
              >
                Check Out
              </button>
            )}
          </div>
        </div>
      </div>

      {showExtendForm && (
        <ExtendStayForm
          check={check}
          onClose={() => setShowExtendForm(false)}
          onComplete={onClose}
        />
      )}

      {showPaymentForm && (
        <PaymentForm
          check={check}
          onClose={() => setShowPaymentForm(false)}
          onComplete={onClose}
        />
      )}
    </div>
  );
}