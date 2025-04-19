// src/hooks/useExpenses.ts
"use client";

import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Expense, Category } from '@/models/expense';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use onSnapshot for real-time updates
  useEffect(() => {
    setLoading(true);
    const expensesQuery = query(collection(db, 'expenses'), orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(expensesQuery, 
      (snapshot) => {
        try {
          const fetchedExpenses = snapshot.docs.map(doc => {
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
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error('Error processing expenses data:', err);
          setError('Failed to process expenses data');
          setLoading(false);
        }
      }, 
      (err) => {
        console.error('Error fetching expenses:', err);
        setError('Failed to fetch expenses');
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const addExpense = async (newExpense: Omit<Expense, 'id'>) => {
    try {
      const expenseData = {
        title: newExpense.title,
        amount: newExpense.amount,
        date: Timestamp.fromDate(newExpense.date),
        category: newExpense.category
      };
      
      // Add to Firestore - the real-time listener will update state
      const docRef = await addDoc(collection(db, 'expenses'), expenseData);
      
      // Return the new expense with its ID
      return { ...newExpense, id: docRef.id };
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Failed to add expense');
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
      // No need to update state manually - the real-time listener will handle it
      return true;
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense');
      throw err;
    }
  };

  // Get total expenses by category
  const getExpensesByCategory = () => {
    const categorySums: Record<Category, number> = {
      [Category.Water]: 0,
      [Category.Electricity]: 0,
      [Category.Wage]: 0,
      [Category.Equipment]: 0,
      [Category.Other]: 0
    };
    
    expenses.forEach(expense => {
      categorySums[expense.category] += expense.amount;
    });
    
    return categorySums;
  };

  // Get expenses for a specific date range
  const getExpensesInDateRange = (startDate: Date, endDate: Date) => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  };

  return {
    expenses,
    loading,
    error,
    addExpense,
    deleteExpense,
    getExpensesByCategory,
    getExpensesInDateRange
  };
};