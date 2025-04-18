"use client";

import { useState } from 'react';
import { useChecks } from '@/hooks/useChecks';
import { Status } from '@/models/check';
import { generateValidRooms } from '@/lib/utils';
import { X, Calendar, CreditCard, User, Home } from 'lucide-react';

interface CheckInFormProps {
  onClose: () => void;
}

export default function CheckInForm({ onClose }: CheckInFormProps) {
  const { checks, addCheck } = useChecks();
  const [guestName, setGuestName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validRooms = generateValidRooms();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedRoomNumber = parseInt(roomNumber);
    
    // Validate room number
    if (!parsedRoomNumber || !validRooms.includes(parsedRoomNumber)) {
      setError('Please enter a valid room number');
      return;
    }

    // Check if room is occupied
    const isRoomOccupied = checks.some(check => 
      check.roomNumber === parsedRoomNumber && 
      check.status !== Status.CheckOut
    );

    if (isRoomOccupied) {
      setError(`Room ${roomNumber} is already occupied`);
      return;
    }

    // Validate guest name
    if (!guestName.trim()) {
      setError('Please enter a guest name');
      return;
    }

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkOut <= checkIn) {
      setError('Check-out date must be after check-in date');
      return;
    }

    try {
      setIsSubmitting(true);
      await addCheck({
        roomNumber: parsedRoomNumber,
        guestName: guestName.toUpperCase(),
        status: Status.CheckIn,
        checkDate: checkIn,
        checkOutDate: checkOut,
        lastDayPaid: checkIn,
        totalPayment: 0,
        createdAt: new Date()
      });
      onClose();
    } catch (err) {
      setError('Failed to add check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">New Check In</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guest Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Enter guest name"
                    maxLength={50}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Home size={18} />
                  </span>
                  <input
                    type="number"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Enter room number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check In Date
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <Calendar size={18} />
                    </span>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check Out Date
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <Calendar size={18} />
                    </span>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="input-field pl-10"
                      min={checkInDate}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="button-secondary py-2 px-4"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="button-primary py-2 px-4 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                    Processing...
                  </>
                ) : (
                  'Save Check In'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}