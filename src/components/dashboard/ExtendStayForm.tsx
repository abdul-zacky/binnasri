"use client";

import { useState } from 'react';
import { useChecks } from '@/hooks/useChecks';
import { Check, Status } from '@/models/check';
import { X, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ExtendStayFormProps {
  check: Check;
  onClose: () => void;
  onComplete: () => void;
}

export default function ExtendStayForm({ check, onClose, onComplete }: ExtendStayFormProps) {
  const { extendCheckOutDate, updateCheckStatus } = useChecks();
  const [selectedDate, setSelectedDate] = useState<string>(
    check.checkOutDate.toISOString().split('T')[0]
  );
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const newDate = new Date(selectedDate);
    const currentCheckOut = new Date(check.checkOutDate);
    
    if (newDate <= currentCheckOut) {
      setError('New check-out date must be after the current check-out date');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await extendCheckOutDate(check.id, newDate);
      
      // Update status if needed
      const statusChange = (check.status === Status.Paid || check.status === Status.PartiallyPaid)
        ? Status.PartiallyPaid
        : Status.CheckIn;
        
      await updateCheckStatus(
        check.id,
        statusChange,
        check.lastDayPaid || check.checkDate,
        0
      );
      
      onComplete();
    } catch (err) {
      setError('Failed to extend stay. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Extend Stay</h2>
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
              <label className="block text-gray-700 mb-2">Current Check-out Date</label>
              <div className="input-field bg-gray-100 flex items-center">
                <Calendar size={20} className="text-gray-500 mr-2" />
                <span>{formatDate(check.checkOutDate)}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">New Check-out Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date(check.checkOutDate.getTime() + 86400000).toISOString().split('T')[0]}
                className="input-field"
              />
            </div>
            
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="button-primary w-full py-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Extend'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}