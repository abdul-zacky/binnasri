"use client";

import { useChecks } from '@/hooks/useChecks';
import { Status, statusColor } from '@/models/check';
import { generateValidRooms } from '@/lib/utils';
import { X } from 'lucide-react';

interface RoomListProps {
  onClose: () => void;
}

export default function RoomList({ onClose }: RoomListProps) {
  const { checks } = useChecks();
  const validRooms = generateValidRooms();

  // Create a map of room statuses
  const roomStatuses = new Map();
  validRooms.forEach(room => {
    roomStatuses.set(room, { status: Status.CheckOut, guestName: 'Empty' });
  });

  // Update with actual check data
  checks.forEach(check => {
    if (check.status !== Status.CheckOut) {
      roomStatuses.set(check.roomNumber, {
        status: check.status,
        guestName: check.guestName
      });
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full max-h-[80%] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Room List</h2>
            <button onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {validRooms.map(roomNumber => {
              const roomData = roomStatuses.get(roomNumber);
              const isOccupied = roomData.status !== Status.CheckOut;
              // In the same file (RoomList.tsx)
              const displayColor = isOccupied && roomData &&
                (statusColor[roomData.status as keyof typeof statusColor] || '#ffffff');

              return (
                <div
                  key={roomNumber}
                  className={`rounded-xl p-3 text-center ${isOccupied ? 'shadow-md' : 'border border-gray-200'
                    }`}
                  style={{
                    background: isOccupied
                      ? `linear-gradient(135deg, ${displayColor}, ${displayColor}aa)`
                      : '#ffffff'
                  }}
                >
                  <p
                    className={`text-lg font-bold ${isOccupied ? 'text-white' : 'text-gray-600'}`}
                  >
                    {roomNumber}
                  </p>
                  <p
                    className={`text-xs truncate ${isOccupied ? 'text-white' : 'text-gray-400'}`}
                  >
                    {roomData.guestName}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}