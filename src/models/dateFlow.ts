export interface DateFlow {
    id: string;
    date: Date;
    amount: number;  // Income
    negAmount: number;  // Expense
  }
  
  export interface WalletSummary {
    walletAmount: number;
    totalIncome: number;
    totalExpense: number;
  }