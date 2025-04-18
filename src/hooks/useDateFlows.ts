import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DateFlow, WalletSummary } from '@/models/dateFlow';

export const useDateFlows = () => {
  const [dateFlows, setDateFlows] = useState<DateFlow[]>([]);
  const [walletSummary, setWalletSummary] = useState<WalletSummary>({
    walletAmount: 0,
    totalIncome: 0,
    totalExpense: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateWalletSummary = useCallback((flows: DateFlow[]) => {
    let totalIncome = 0;
    let totalExpense = 0;
    
    flows.forEach(flow => {
      totalIncome += flow.amount;
      totalExpense += flow.negAmount;
    });
    
    setWalletSummary({
      walletAmount: totalIncome - totalExpense,
      totalIncome,
      totalExpense
    });
  }, []);

  const fetchDateFlows = async () => {
    try {
      setLoading(true);
      const dateFlowsQuery = query(collection(db, 'dateFlows'), orderBy('date', 'asc'));
      const querySnapshot = await getDocs(dateFlowsQuery);
      
      const fetchedDateFlows = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date.toDate ? data.date.toDate() : new Date(data.date),
          amount: data.amount,
          negAmount: data.negAmount
        } as DateFlow;
      });
      
      setDateFlows(fetchedDateFlows);
      calculateWalletSummary(fetchedDateFlows);
    } catch (err) {
      console.error('Error fetching date flows:', err);
      setError('Failed to fetch date flows');
    } finally {
      setLoading(false);
    }
  };

  const addDateFlow = async (newFlow: Omit<DateFlow, 'id'>) => {
    try {
      // Strip time from date to compare dates by day only
      const stripTime = (date: Date) => {
        const newDate = new Date(date);
        newDate.setHours(0, 0, 0, 0);
        return newDate;
      };
      
      const newFlowDate = stripTime(newFlow.date);
      
      // Check if there's an existing flow for this date
      let existingFlow = false;
      let updatedFlows = [...dateFlows];
      
      for (let i = 0; i < dateFlows.length; i++) {
        const flowDate = stripTime(dateFlows[i].date);
        if (flowDate.getTime() === newFlowDate.getTime()) {
          existingFlow = true;
          
          // Update existing flow
          const updatedFlow = {
            ...dateFlows[i],
            amount: dateFlows[i].amount + newFlow.amount,
            negAmount: dateFlows[i].negAmount + newFlow.negAmount
          };
          
          updatedFlows[i] = updatedFlow;
          break;
        }
      }
      
      if (!existingFlow) {
        // Add new flow to Firestore
        const flowData = {
          date: Timestamp.fromDate(newFlow.date),
          amount: newFlow.amount,
          negAmount: newFlow.negAmount
        };
        
        const docRef = await addDoc(collection(db, 'dateFlows'), flowData);
        const addedFlow: DateFlow = {
          ...newFlow,
          id: docRef.id
        };
        
        updatedFlows = [...updatedFlows, addedFlow];
      }
      
      setDateFlows(updatedFlows);
      calculateWalletSummary(updatedFlows);
      return updatedFlows;
    } catch (err) {
      console.error('Error adding date flow:', err);
      setError('Failed to add date flow');
      throw err;
    }
  };

  useEffect(() => {
    fetchDateFlows();
  }, []);

  return {
    dateFlows,
    walletSummary,
    loading,
    error,
    fetchDateFlows,
    addDateFlow
  };
};
