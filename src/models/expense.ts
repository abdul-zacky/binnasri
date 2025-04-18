export enum Category {
    Water = "water",
    Electricity = "electricity",
    Wage = "wage",
    Equipment = "equipment",
    Other = "other"
  }
  
  export const categoryIcons: Record<Category, string> = {
    [Category.Water]: "droplet",
    [Category.Electricity]: "zap",
    [Category.Wage]: "dollar-sign",
    [Category.Equipment]: "tool",
    [Category.Other]: "more-horizontal"
  };
  
  export interface Expense {
    id: string;
    title: string;
    amount: number;
    date: Date;
    category: Category;
  }
  