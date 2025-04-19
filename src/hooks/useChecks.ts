// src/hooks/useChecks.ts
"use client";

import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  Timestamp, 
  increment,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Check, Status } from '@/models/check';

export const useChecks = () => {
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use onSnapshot for real-time updates
  useEffect(() => {
    setLoading(true);
    const checksQuery = query(collection(db, 'checks'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(checksQuery, 
      (snapshot) => {
        try {
          const fetchedChecks = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              roomNumber: data.roomNumber,
              guestName: data.guestName,
              status: data.status,
              checkDate: data.checkDate.toDate ? data.checkDate.toDate() : new Date(data.checkDate),
              checkOutDate: data.checkOutDate.toDate ? data.checkOutDate.toDate() : new Date(data.checkOutDate),
              lastDayPaid: data.lastDayPaid?.toDate ? data.lastDayPaid.toDate() : new Date(data.lastDayPaid),
              totalPayment: data.totalPayment,
              createdAt: data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
            } as Check;
          });
          
          setChecks(fetchedChecks);
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error('Error processing checks data:', err);
          setError('Failed to process checks data');
          setLoading(false);
        }
      }, 
      (err) => {
        console.error('Error fetching checks:', err);
        setError('Failed to fetch checks');
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const addCheck = async (newCheck: Omit<Check, 'id'>) => {
    try {
      const checkData = {
        ...newCheck,
        checkDate: Timestamp.fromDate(newCheck.checkDate),
        checkOutDate: Timestamp.fromDate(newCheck.checkOutDate),
        lastDayPaid: Timestamp.fromDate(newCheck.lastDayPaid || newCheck.checkDate),
        createdAt: Timestamp.fromDate(newCheck.createdAt),
      };
      
      // Add to Firestore - the real-time listener will update state
      const docRef = await addDoc(collection(db, 'checks'), checkData);
      return { ...newCheck, id: docRef.id };
    } catch (err) {
      console.error('Error adding check:', err);
      setError('Failed to add check');
      throw err;
    }
  };

  const updateCheckStatus = async (id: string, newStatus: Status, lastDayPaid: Date, addedPaymentAmount: number) => {
    try {
      const checkRef = doc(db, 'checks', id);
      await updateDoc(checkRef, {
        status: newStatus,
        lastDayPaid: Timestamp.fromDate(lastDayPaid),
        totalPayment: increment(addedPaymentAmount)
      });
      
      // No need to update state manually - the real-time listener will handle it
      return true;
    } catch (err) {
      console.error('Error updating check status:', err);
      setError('Failed to update check status');
      throw err;
    }
  };

  const extendCheckOutDate = async (id: string, extendDate: Date) => {
    try {
      const checkRef = doc(db, 'checks', id);
      await updateDoc(checkRef, {
        checkOutDate: Timestamp.fromDate(extendDate)
      });
      
      // No need to update state manually - the real-time listener will handle it
      return true;
    } catch (err) {
      console.error('Error extending check-out date:', err);
      setError('Failed to extend check-out date');
      throw err;
    }
  };

  const deleteCheck = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'checks', id));
      // No need to update state manually - the real-time listener will handle it
      return true;
    } catch (err) {
      console.error('Error deleting check:', err);
      setError('Failed to delete check');
      throw err;
    }
  };

  return {
    checks,
    loading,
    error,
    addCheck,
    updateCheckStatus,
    extendCheckOutDate,
    deleteCheck
  };
};