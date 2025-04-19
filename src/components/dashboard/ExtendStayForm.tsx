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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Extend Stay</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 rounded-full p-1 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Check-out Date</label>
              <div className="input-field bg-gray-100 flex items-center px-3 py-2 rounded-lg">
                <Calendar size={20} className="text-gray-500 mr-2" />
                <span>{formatDate(check.checkOutDate)}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Check-out Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar size={20} className="text-gray-500" />
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date(check.checkOutDate.getTime() + 86400000).toISOString().split('T')[0]}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Extend'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}