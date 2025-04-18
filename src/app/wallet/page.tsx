"use client";

import { useDateFlows } from '@/hooks/useDateFlows';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import WalletSummary from '@/components/wallet/WalletSummary';
import FlowChart from '@/components/wallet/FlowChart';

export default function WalletPage() {
  const { dateFlows, walletSummary, loading, error } = useDateFlows();
  
  // Sort dateFlows in reverse chronological order for the list display
  const sortedFlows = [...dateFlows].reverse();
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Wallet</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-blue-800" />
        </div>
      ) : error ? (
        <div className="text-center text-red-600 my-4">{error}</div>
      ) : (
        <>
          {/* Wallet Summary Card */}
          <WalletSummary walletSummary={walletSummary} />

          {/* Chart */}
          <div className="my-6 h-64">
            <FlowChart dateFlows={dateFlows} />
          </div>

          {/* Transaction List */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Transactions</h2>
            
            {sortedFlows.length === 0 ? (
              <div className="text-center my-8 text-gray-500">
                No transactions to display
              </div>
            ) : (
              <div className="space-y-4">
                {sortedFlows.map((flow) => (
                  <div key={flow.id} className="card flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-xl font-bold text-blue-600">
                          {new Date(flow.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          {formatDate(flow.date)}
                        </p>
                      </div>
                    </div>
                    <div>
                      {flow.amount > 0 && (
                        <p className="text-green-600">
                          +{formatCurrency(flow.amount)}
                        </p>
                      )}
                      {flow.negAmount > 0 && (
                        <p className="text-red-600">
                          -{formatCurrency(flow.negAmount)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}