"use client";

import { useChecks } from '@/hooks/useChecks';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Status, statusColor } from '@/models/check';
import { Loader2 } from 'lucide-react';

interface RecentChecksProps {
  onCheckSelect: (checkId: string) => void;
  loading: boolean;
  error: string | null;
}

export default function RecentChecks({ onCheckSelect, loading, error }: RecentChecksProps) {
  const { checks } = useChecks();
  
  // Get recent checks (not checked out)
  const recentChecks = checks
    .filter(check => check.status !== Status.CheckOut)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading checks data
      </div>
    );
  }

  if (recentChecks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent check-ins to display
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {recentChecks.map((check) => (
            <tr 
              key={check.id}
              onClick={() => onCheckSelect(check.id)}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{check.roomNumber}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{check.guestName}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span 
                  className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  style={{ 
                    backgroundColor: `${statusColor[check.status]}22`,
                    color: statusColor[check.status] 
                  }}
                >
                  {/* {Status[check.status]} */}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(check.checkDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(check.checkOutDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatCurrency(check.totalPayment)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
