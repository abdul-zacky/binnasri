"use client";

import { useState } from 'react';
import { useChecks } from '@/hooks/useChecks';
import { Status } from '@/models/check';
import { Plus } from 'lucide-react';
import ActivitySummary from '@/components/dashboard/ActivitySummary';
import RecentChecks from '@/components/dashboard/RecentChecks';
import RoomGrid from '@/components/dashboard/RoomGrid';
import CheckInForm from '@/components/dashboard/CheckInForm';
import CheckDetails from '@/components/dashboard/CheckDetails';

export default function DashboardPage() {
  const { checks, loading, error } = useChecks();
  const [selectedCheckId, setSelectedCheckId] = useState<string | null>(null);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<number | undefined>(undefined);
  
  const selectedCheck = selectedCheckId ? checks.find(check => check.id === selectedCheckId) : null;
  
  const occupiedRoomsCount = checks.filter(check => check.status !== Status.CheckOut).length;
  const totalRooms = 26; // This should match your actual room count
  const occupancyRate = Math.round((occupiedRoomsCount / totalRooms) * 100);
  
  const todayCheckins = checks.filter(check => {
    const today = new Date();
    const checkDate = new Date(check.checkDate);
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  }).length;
  
  const todayCheckouts = checks.filter(check => {
    const today = new Date();
    const checkOutDate = new Date(check.checkOutDate);
    return (
      checkOutDate.getDate() === today.getDate() &&
      checkOutDate.getMonth() === today.getMonth() &&
      checkOutDate.getFullYear() === today.getFullYear() &&
      check.status !== Status.CheckOut
    );
  }).length;

  const handleNewCheckIn = (roomNumber?: number) => {
    setSelectedRoomNumber(roomNumber);
    setShowCheckInForm(true);
  };

  const handleCloseCheckInForm = () => {
    setShowCheckInForm(false);
    setSelectedRoomNumber(undefined);
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome to the Wisma Management System</p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ActivitySummary 
          occupancyRate={occupancyRate} 
          occupiedRooms={occupiedRoomsCount} 
          totalRooms={totalRooms} 
          checkIns={todayCheckins}
          checkOuts={todayCheckouts}
        />
      </div>
      
      {/* Room Grid */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Room Status</h2>
          <button 
            onClick={() => handleNewCheckIn()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            <span>Check In</span>
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <RoomGrid 
            onRoomSelect={(checkId) => setSelectedCheckId(checkId)}
            onEmptyRoomSelect={(roomNumber) => handleNewCheckIn(roomNumber)}
            loading={loading}
            error={error}
          />
        </div>
      </div>
      
      {/* Recent Check-ins */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Activities</h2>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <RecentChecks 
            onCheckSelect={(checkId) => setSelectedCheckId(checkId)}
            loading={loading}
            error={error}
          />
        </div>
      </div>
      
      {/* Modals */}
      {selectedCheck && (
        <CheckDetails
          check={selectedCheck}
          onClose={() => setSelectedCheckId(null)}
        />
      )}
      
      {showCheckInForm && (
        <CheckInForm
          onClose={handleCloseCheckInForm}
          initialRoomNumber={selectedRoomNumber}
        />
      )}
    </div>
  );
}