// src/hooks/useDateFlows.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc,
  addDoc, 
  updateDoc,
  query, 
  orderBy, 
  Timestamp,
  onSnapshot,
  where,
  getDocs,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DateFlow, WalletSummary } from '@/models/dateFlow';
import { v4 as uuidv4 } from 'uuid';

export const useDateFlows = () => {
  const [dateFlows, setDateFlows] = useState<DateFlow[]>([]);
  const [walletSummary, setWalletSummary] = useState<WalletSummary>({
    walletAmount: 0,
    totalIncome: 0,
    totalExpense: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate wallet summary based on flows
  const calculateWalletSummary = useCallback((flows: DateFlow[]) => {
    let totalIncome = 0;
    let totalExpense = 0;
    
    flows.forEach(flow => {
      totalIncome += flow.amount || 0;
      totalExpense += flow.negAmount || 0;
    });
    
    setWalletSummary({
      walletAmount: totalIncome - totalExpense,
      totalIncome,
      totalExpense
    });
  }, []);

  // Strip time from date to compare dates by day only
  const stripTime = useCallback((date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }, []);

  // Use onSnapshot for real-time updates
  useEffect(() => {
    if (!db) {
      console.error("Firestore not initialized");
      setError("Database connection failed");
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    let unsubscribe = () => {};
    
    try {
      const dateFlowsRef = collection(db, 'dateFlows');
      const dateFlowsQuery = query(dateFlowsRef, orderBy('date', 'asc'));
      
      unsubscribe = onSnapshot(
        dateFlowsQuery, 
        (snapshot) => {
          try {
            const fetchedDateFlows = snapshot.docs.map(doc => {
              const data = doc.data();
              // Handle different date formats
              let flowDate: Date;
              if (data.date instanceof Timestamp) {
                flowDate = data.date.toDate();
              } else if (data.date?.toDate) {
                flowDate = data.date.toDate();
              } else if (typeof data.date === 'string') {
                flowDate = new Date(data.date);
              } else {
                // Fallback to current date if format is unknown
                flowDate = new Date();
                console.warn('Unknown date format for flow', doc.id);
              }
              
              return {
                id: doc.id,
                date: flowDate,
                amount: Number(data.amount) || 0,
                negAmount: Number(data.negAmount) || 0
              } as DateFlow;
            });
            
            setDateFlows(fetchedDateFlows);
            calculateWalletSummary(fetchedDateFlows);
            setError(null);
          } catch (err) {
            console.error('Error processing date flows data:', err);
            setError('Failed to process date flows data');
          } finally {
            setLoading(false);
          }
        }, 
        (err) => {
          console.error('Error fetching date flows:', err);
          setError(`Failed to fetch date flows: ${err.message}`);
          setLoading(false);
        }
      );
    } catch (err: any) {
      console.error('Error setting up date flows listener:', err);
      setError(`Failed to initialize date flows: ${err.message}`);
      setLoading(false);
    }
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [calculateWalletSummary]);

  const addDateFlow = async (newFlow: Omit<DateFlow, 'id'>) => {
    if (!db) {
      throw new Error("Database not initialized");
    }
    
    try {
      const flowDate = stripTime(newFlow.date);
      
      // Check if there's an existing flow for this date
      const dateFlowsRef = collection(db, 'dateFlows');
      const startOfDay = Timestamp.fromDate(flowDate);
      const endOfDay = Timestamp.fromDate(new Date(flowDate.getTime() + 86400000 - 1000)); // End of the day
      
      const existingFlowQuery = query(
        dateFlowsRef,
        where('date', '>=', startOfDay),
        where('date', '<=', endOfDay)
      );
      
      const querySnapshot = await getDocs(existingFlowQuery);
      
      if (!querySnapshot.empty) {
        // Update existing flow
        const docSnapshot = querySnapshot.docs[0];
        const existingData = docSnapshot.data();
        const docRef = doc(db, 'dateFlows', docSnapshot.id);
        
        const updatedAmount = (existingData.amount || 0) + (newFlow.amount || 0);
        const updatedNegAmount = (existingData.negAmount || 0) + (newFlow.negAmount || 0);
        
        await updateDoc(docRef, {
          amount: updatedAmount,
          negAmount: updatedNegAmount
        });
        
        // Return updated flow
        return {
          id: docSnapshot.id,
          date: flowDate,
          amount: updatedAmount,
          negAmount: updatedNegAmount
        };
      } else {
        // Create new flow
        const newFlowData = {
          date: Timestamp.fromDate(flowDate),
          amount: newFlow.amount || 0,
          negAmount: newFlow.negAmount || 0
        };
        
        const docRef = await addDoc(dateFlowsRef, newFlowData);
        
        // Return new flow
        return {
          id: docRef.id,
          date: flowDate,
          amount: newFlow.amount || 0,
          negAmount: newFlow.negAmount || 0
        };
      }
    } catch (err: any) {
      console.error('Error adding date flow:', err);
      throw new Error(`Failed to add date flow: ${err.message}`);
    }
  };

  // Get flows for a specific time period
  const getFlowsForTimePeriod = useCallback((period: 'week' | 'month' | 'year', offset: number = 0) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    
    if (period === 'week') {
      // Start of week (Sunday)
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay() - (7 * offset));
      startDate.setHours(0, 0, 0, 0);
      
      // End of week (Saturday)
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } 
    else if (period === 'month') {
      // Start of month
      startDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      
      // End of month
      endDate = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }
    else {
      // Start of year
      startDate = new Date(now.getFullYear() - offset, 0, 1);
      
      // End of year
      endDate = new Date(now.getFullYear() - offset, 11, 31);
      endDate.setHours(23, 59, 59, 999);
    }
    
    return dateFlows.filter(flow => {
      const flowDate = new Date(flow.date);
      return flowDate >= startDate && flowDate <= endDate;
    });
  }, [dateFlows]);

  // Get summary for a specific time period
  const getSummaryForTimePeriod = useCallback((period: 'week' | 'month' | 'year', offset: number = 0) => {
    const flows = getFlowsForTimePeriod(period, offset);
    
    let totalIncome = 0;
    let totalExpense = 0;
    
    flows.forEach(flow => {
      totalIncome += flow.amount || 0;
      totalExpense += flow.negAmount || 0;
    });
    
    return {
      totalIncome,
      totalExpense,
      net: totalIncome - totalExpense
    };
  }, [getFlowsForTimePeriod]);

  // Get data formatted for charts based on period
  const getChartData = useCallback((period: 'week' | 'month' | 'year', offset: number = 0) => {
    const flows = getFlowsForTimePeriod(period, offset);
    const now = new Date();
    
    if (period === 'week') {
      // Group by day of week
      const weekData: Record<string, { date: Date, income: number, expense: number }> = {};
      
      // Initialize all days of the week
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay() - (7 * offset));
      
      for (let i = 0; i < 7; i++) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        const dayStr = day.toISOString().split('T')[0];
        weekData[dayStr] = { date: day, income: 0, expense: 0 };
      }
      
      // Fill in actual data
      flows.forEach(flow => {
        const dayStr = flow.date.toISOString().split('T')[0];
        if (weekData[dayStr]) {
          weekData[dayStr].income += flow.amount || 0;
          weekData[dayStr].expense += flow.negAmount || 0;
        }
      });
      
      return Object.values(weekData).map(day => ({
        date: day.date.toLocaleDateString('en-US', { weekday: 'short' }),
        income: day.income,
        expense: day.expense,
        net: day.income - day.expense
      }));
    } 
    else if (period === 'month') {
      // Group by week of month
      const weeks: Record<number, { income: number, expense: number }> = {
        1: { income: 0, expense: 0 },
        2: { income: 0, expense: 0 },
        3: { income: 0, expense: 0 },
        4: { income: 0, expense: 0 },
        5: { income: 0, expense: 0 }
      };
      
      flows.forEach(flow => {
        const date = new Date(flow.date);
        const weekOfMonth = Math.ceil(date.getDate() / 7);
        if (weeks[weekOfMonth]) {
          weeks[weekOfMonth].income += flow.amount || 0;
          weeks[weekOfMonth].expense += flow.negAmount || 0;
        }
      });
      
      return Object.entries(weeks).map(([week, data]) => ({
        date: `Week ${week}`,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense
      }));
    }
    else {
      // Group by month
      const months: Record<number, { income: number, expense: number }> = {};
      
      // Initialize all months
      for (let i = 0; i < 12; i++) {
        months[i] = { income: 0, expense: 0 };
      }
      
      flows.forEach(flow => {
        const date = new Date(flow.date);
        const month = date.getMonth();
        if (months[month]) {
          months[month].income += flow.amount || 0;
          months[month].expense += flow.negAmount || 0;
        }
      });
      
      return Object.entries(months).map(([month, data]) => {
        const monthName = new Date(2000, parseInt(month), 1).toLocaleDateString('en-US', { month: 'short' });
        return {
          date: monthName,
          income: data.income,
          expense: data.expense,
          net: data.income - data.expense
        };
      });
    }
  }, [getFlowsForTimePeriod]);
  
  // Handle offline mode with local storage backup
  const addOfflineTransaction = useCallback(async (newFlow: Omit<DateFlow, 'id'>) => {
    try {
      // Try to add to Firestore first
      return await addDateFlow(newFlow);
    } catch (err) {
      console.warn('Failed to add transaction online, saving locally:', err);
      
      // Store in local state
      const newId = uuidv4();
      const newFlowWithId = { 
        ...newFlow, 
        id: newId,
        pendingSync: true 
      };
      
      setDateFlows(prev => [...prev, newFlowWithId as DateFlow]);
      
      // Also store in localStorage for persistence
      try {
        const pendingTransactions = JSON.parse(
          localStorage.getItem('pendingTransactions') || '[]'
        );
        pendingTransactions.push({
          ...newFlow,
          id: newId,
          date: newFlow.date.toISOString()
        });
        localStorage.setItem('pendingTransactions', JSON.stringify(pendingTransactions));
      } catch (storageErr) {
        console.error('Failed to store transaction in localStorage:', storageErr);
      }
      
      return newFlowWithId;
    }
  }, [addDateFlow]);

  return {
    dateFlows,
    walletSummary,
    loading,
    error,
    addDateFlow,
    getFlowsForTimePeriod,
    getSummaryForTimePeriod,
    getChartData,
    addOfflineTransaction
  };
};