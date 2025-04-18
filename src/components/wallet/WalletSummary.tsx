"use client";

import { formatCurrency } from '@/lib/utils';
import { WalletSummary as WalletSummaryType } from '@/models/dateFlow';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface WalletSummaryProps {
  walletSummary: WalletSummaryType;
}

export default function WalletSummary({ walletSummary }: WalletSummaryProps) {
  const { walletAmount, totalIncome, totalExpense } = walletSummary;
  
  return (
    <div className="gradient-primary rounded-2xl shadow-md overflow-hidden">
      <div className="p-6 text-white">
        <p className="text-center text-lg opacity-85 mb-2">Total Balance</p>
        <p className="text-center text-4xl font-bold mb-6">
          {formatCurrency(walletAmount)}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 w-8 h-8 rounded-full flex items-center justify-center mr-2">
              <ArrowDownCircle size={18} className="text-green-300" />
            </div>
            <div>
              <p className="text-sm opacity-85">Income</p>
              <p className="font-semibold">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 w-8 h-8 rounded-full flex items-center justify-center mr-2">
              <ArrowUpCircle size={18} className="text-red-300" />
            </div>
            <div>
              <p className="text-sm opacity-85">Expenses</p>
              <p className="font-semibold">{formatCurrency(totalExpense)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}