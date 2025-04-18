import { useState, useEffect } from 'react';
import { collection, doc, getDocs, addDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Expense, Category } from '@/models/expense';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const expensesQuery = query(collection(db, 'expenses'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(expensesQuery);
      
      const fetchedExpenses = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          amount: data.amount,
          date: data.date.toDate ? data.date.toDate() : new Date(data.date),
          category: data.category as Category
        } as Expense;
      });
      
      setExpenses(fetchedExpenses);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (newExpense: Omit<Expense, 'id'>) => {
    try {
      const expenseData = {
        ...newExpense,
        date: Timestamp.fromDate(newExpense.date)
      };
      
      const docRef = await addDoc(collection(db, 'expenses'), expenseData);
      const addedExpense: Expense = {
        ...newExpense,
        id: docRef.id
      };
      
      setExpenses(prev => [addedExpense, ...prev]);
      return addedExpense;
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Failed to add expense');
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense');
      throw err;
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    addExpense,
    deleteExpense
  };
};
