"use client";

import { useChecks } from '@/hooks/useChecks';
import { Status, statusColor } from '@/models/check';
import { generateValidRooms } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface RoomGridProps {
  onRoomSelect: (checkId: string) => void;
  onEmptyRoomSelect: (roomNumber: number) => void; // New prop for empty room selection
  loading: boolean;
  error: string | null;
}

export default function RoomGrid({ onRoomSelect, onEmptyRoomSelect, loading, error }: RoomGridProps) {
  const { checks } = useChecks();
  const validRooms = generateValidRooms();

  // Group rooms by floor
  const roomsByFloor = validRooms.reduce((acc, room) => {
    const floor = Math.floor(room / 100);
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {} as Record<number, number[]>);

  // Create a map of room statuses
  const roomStatuses = new Map();
  validRooms.forEach(room => {
    roomStatuses.set(room, {
      status: Status.CheckOut,
      guestName: 'Empty',
      checkId: ''
    });
  });

  // Update with actual check data
  checks.forEach(check => {
    if (check.status !== Status.CheckOut) {
      roomStatuses.set(check.roomNumber, {
        status: check.status,
        guestName: check.guestName,
        checkId: check.id
      });
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading room data
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(roomsByFloor).map(([floor, rooms]) => (
        <div key={floor} className="space-y-2">
          <h3 className="text-md font-medium text-gray-700">Floor {floor}</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
            {rooms.map(roomNumber => {
              const roomData = roomStatuses.get(roomNumber);
              const isOccupied = roomData.status !== Status.CheckOut;
              const displayColor = isOccupied
                ? (statusColor[roomData.status as keyof typeof statusColor] || '#ffffff')
                : '#ffffff';

              return (
                <div
                  key={roomNumber}
                  onClick={() => isOccupied 
                    ? onRoomSelect(roomData.checkId) 
                    : onEmptyRoomSelect(roomNumber)
                  }
                  className={`rounded-lg py-3 px-2 text-center cursor-pointer transition-shadow hover:shadow-md ${
                    isOccupied ? '' : 'border border-gray-200 hover:border-blue-400'
                  }`}
                  style={{
                    backgroundColor: isOccupied
                      ? `${displayColor}22`
                      : '#ffffff',
                    borderColor: isOccupied ? displayColor : ''
                  }}
                >
                  <p
                    className="text-lg font-bold"
                    style={{ color: isOccupied ? displayColor : '#6B7280' }}
                  >
                    {roomNumber}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: isOccupied ? displayColor : '#9CA3AF' }}
                  >
                    {roomData.guestName}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}