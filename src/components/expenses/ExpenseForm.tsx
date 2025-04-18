"use client";

import { useState } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { useDateFlows } from '@/hooks/useDateFlows';
import { Category } from '@/models/expense';
import { X } from 'lucide-react';

interface ExpenseFormProps {
  onClose: () => void;
}

export default function ExpenseForm({ onClose }: ExpenseFormProps) {
  const { addExpense } = useExpenses();
  const { addDateFlow } = useDateFlows();
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<Category>(Category.Other);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const parsedAmount = parseInt(amount);
    
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Add expense
      await addExpense({
        title,
        amount: parsedAmount,
        date: new Date(date),
        category
      });
      
      // Add to date flow as a negative amount
      await addDateFlow({
        date: new Date(),
        amount: 0,
        negAmount: parsedAmount
      });
      
      onClose();
    } catch (err) {
      setError('Failed to add expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full max-h-[80%] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Add Expense</h2>
            <button onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="Enter expense title"
                maxLength={50}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">Rp</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-field pl-10"
                    placeholder="0"
                    min="1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="input-field"
              >
                {Object.values(Category).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-between pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="button-secondary"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="button-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}