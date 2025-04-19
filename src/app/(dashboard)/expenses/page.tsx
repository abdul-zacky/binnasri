"use client";

import { useState } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { useDateFlows } from '@/hooks/useDateFlows';
import Sidebar from '@/components/layout/Sidebar';
import { Category, categoryIcons } from '@/models/expense';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Loader2, Plus } from 'lucide-react';
import ExpenseForm from '@/components/expenses/ExpenseForm';

export default function ExpensesPage() {
  const { expenses, loading, error } = useExpenses();
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* <div className="hidden md:flex md:w-64 md:flex-col">
        <Sidebar />
      </div> */}
      <h1 className="text-2xl font-bold mb-6">Expenses</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-blue-800" />
        </div>
      ) : error ? (
        <div className="text-center text-red-600 my-4">{error}</div>
      ) : expenses.length === 0 ? (
        <div className="text-center my-12">
          <p className="text-xl text-gray-700 font-bold">
            No Expenses<br />Try adding some!
          </p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="card flex justify-between items-center"
            >
              <div className="flex items-center">
                <div className="gradient-primary w-12 h-12 rounded-full flex items-center justify-center mr-5">
                  <span className="text-white">
                    {/* Use appropriate icon based on category */}
                    {categoryIcons[expense.category] === 'droplet' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                      </svg>
                    )}
                    {categoryIcons[expense.category] === 'zap' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                    )}
                    {categoryIcons[expense.category] === 'dollar-sign' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                    )}
                    {categoryIcons[expense.category] === 'tool' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                      </svg>
                    )}
                    {categoryIcons[expense.category] === 'more-horizontal' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                      </svg>
                    )}
                  </span>
                </div>
                <span className="font-semibold">{expense.title}</span>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(expense.amount)}</p>
                <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={() => setShowExpenseForm(true)}
          className="button-primary flex items-center justify-center gap-2 w-40 py-4"
        >
          <Plus size={18} />
          ADD EXPENSE
        </button>
      </div>

      {/* Add Expense Modal */}
      {showExpenseForm && (
        <ExpenseForm
          onClose={() => setShowExpenseForm(false)}
        />
      )}
    </div>
  );
}
