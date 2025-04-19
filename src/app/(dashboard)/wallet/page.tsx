// src/app/wallet/page.tsx
"use client";

import { useState } from 'react';
import { useDateFlows } from '@/hooks/useDateFlows';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import WalletSummary from '@/components/wallet/WalletSummary';
import FlowChart from '@/components/wallet/FlowChart';

type TimePeriod = 'week' | 'month' | 'year';

export default function WalletPage() {
  const { dateFlows, walletSummary, loading, error } = useDateFlows();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const [periodOffset, setPeriodOffset] = useState(0);
  
  // Sort dateFlows in reverse chronological order for the list display
  const sortedFlows = [...dateFlows].reverse();
  
  const handlePrevPeriod = () => {
    setPeriodOffset(prev => prev + 1);
  };
  
  const handleNextPeriod = () => {
    if (periodOffset > 0) {
      setPeriodOffset(prev => prev - 1);
    }
  };
  
  const getPeriodLabel = (): string => {
    const now = new Date();
    
    if (timePeriod === 'week') {
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - (now.getDay() + 7 * periodOffset));
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    } else if (timePeriod === 'month') {
      const date = new Date(now);
      date.setMonth(now.getMonth() - periodOffset);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    } else {
      // Year view
      const year = now.getFullYear() - periodOffset;
      return year.toString();
    }
  };
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Wallet</h1>
        <p className="text-gray-600">Track your financial flows</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      ) : error ? (
        <div className="text-center text-red-600 my-4">{error}</div>
      ) : (
        <>
          {/* Wallet Summary Card */}
          <div className="mb-8">
            <WalletSummary walletSummary={walletSummary} />
          </div>

          {/* Chart with Period Controls */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-0">Financial Flow</h2>
              
              <div className="flex space-x-2">
                {/* Time period selector */}
                <div className="bg-gray-100 rounded-lg p-1 flex">
                  {(['week', 'month', 'year'] as TimePeriod[]).map((period) => (
                    <button
                      key={period}
                      onClick={() => {
                        setTimePeriod(period);
                        setPeriodOffset(0); // Reset offset when changing period
                      }}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        timePeriod === period
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
                
                {/* Navigation arrows */}
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={handlePrevPeriod}
                    className="p-1 rounded-md hover:bg-gray-200"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-medium px-2">
                    {getPeriodLabel()}
                  </span>
                  <button
                    onClick={handleNextPeriod}
                    className={`p-1 rounded-md ${
                      periodOffset > 0
                        ? 'hover:bg-gray-200'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={periodOffset === 0}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="h-64">
              <FlowChart 
                dateFlows={dateFlows} 
                timePeriod={timePeriod}
                periodOffset={periodOffset}
              />
            </div>
          </div>

          {/* Transaction List */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Transactions</h2>
            
            {sortedFlows.length === 0 ? (
              <div className="text-center my-8 text-gray-500">
                No transactions to display
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedFlows.map((flow) => (
                      <tr key={flow.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(flow.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {flow.amount > 0 ? formatCurrency(flow.amount) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {flow.negAmount > 0 ? formatCurrency(flow.negAmount) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={flow.amount - flow.negAmount >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(flow.amount - flow.negAmount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}