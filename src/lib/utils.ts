// src/lib/utils.ts
import { Check, Status, listOfPrices } from '@/models/check';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const stripTime = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const calculatePaymentStatus = (check: Check): string => {
  const lastPaidDate = stripTime(check.lastDayPaid || check.checkDate);
  const checkDateOnly = stripTime(check.checkDate);
  const checkOutDateOnly = stripTime(check.checkOutDate);
  
  const paidDays = Math.floor((lastPaidDate.getTime() - checkDateOnly.getTime()) / (1000 * 60 * 60 * 24));
  const unPaidDays = Math.floor((checkOutDateOnly.getTime() - lastPaidDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (lastPaidDate.getTime() === checkDateOnly.getTime()) {
    return `Not Paid, ${unPaidDays} days`;
  } else if (lastPaidDate.getTime() !== checkOutDateOnly.getTime()) {
    return `${paidDays} days`;
  } else {
    return "Paid";
  }
};

export const calculateStatusFromPayment = (check: Check): Status => {
  const lastPaidDate = stripTime(check.lastDayPaid || check.checkDate);
  const checkDateOnly = stripTime(check.checkDate);
  const checkOutDateOnly = stripTime(check.checkOutDate);
  
  if (lastPaidDate.getTime() === checkDateOnly.getTime()) {
    return Status.CheckIn;
  } else if (lastPaidDate.getTime() !== checkOutDateOnly.getTime()) {
    return Status.PartiallyPaid;
  } else {
    return Status.Paid;
  }
};

export const calculateTotalBill = (check: Check): number => {
  const lastPaidDate = stripTime(check.lastDayPaid || check.checkDate);
  const checkOutDateOnly = stripTime(check.checkOutDate);
  const roomPrice = listOfPrices[check.roomNumber] || 0;
  
  const unPaidDays = Math.floor((checkOutDateOnly.getTime() - lastPaidDate.getTime()) / (1000 * 60 * 60 * 24));
  return roomPrice * unPaidDays;
};

export const generateValidRooms = (): number[] => {
  return [
    // 1st Floor
    105, 106, 107, 108,
    // 2nd Floor
    201, 202, 203, 204, 205, 206, 207, 208,
    // 3rd Floor
    301, 302, 303, 304, 305, 306, 307, 308,
    // 4th Floor
    403, 404, 405, 406, 407, 408
  ];
};