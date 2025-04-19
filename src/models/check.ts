export enum Status {
    CheckIn = "checkIn",
    PartiallyPaid = "partiallyPaid",
    Paid = "paid",
    CheckOut = "checkOut"
  }
  
  export const statusColor = {
    [Status.CheckIn]: "#C81306",
    [Status.PartiallyPaid]: "#C8AB06",
    [Status.Paid]: "#00639D",
    [Status.CheckOut]: "#808080"
  };
  
  export const listOfPrices: Record<number, number> = {
    105: 200000, 106: 200000, 107: 200000, 108: 200000,
    201: 200000, 202: 200000, 203: 180000, 204: 180000,
    205: 180000, 206: 180000, 207: 180000, 208: 180000,
    301: 200000, 302: 200000, 303: 180000, 304: 180000,
    305: 180000, 306: 180000, 307: 180000, 308: 180000,
    403: 180000, 404: 200000, 405: 200000, 406: 200000,
    407: 200000, 408: 180000,
  };
  
  export interface Check {
    [x: string]: any;
    id: string;
    roomNumber: number;
    guestName: string;
    status: Status;
    checkDate: Date;
    checkOutDate: Date;
    lastDayPaid?: Date;
    totalPayment: number;
    createdAt: Date;
  }