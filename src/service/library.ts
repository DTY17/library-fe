// Local-only type definitions used by the localStorage versions of the
// Book / User / Record sections. These are intentionally separate from
// whatever types your backend-connected `service/api.ts` exports, so this
// file has no dependency on the backend at all.

export interface Book {
  id: string;
  name: string;
  author: string;
  stock: number;
  state: string; // "AVAILABLE" | "BORROWED"
}

export interface User {
  id: string;
  name: string;
  birthday: string;
  email: string;
  phoneNumber: string;
  role: string; // "MEMBER" | "ADMIN"
  password: string;
  image?: string; // base64 data URL of the uploaded photo/ID document
}

export interface BorrowRecord {
  id: string;
  userId: string;
  bookId: string;
  borrowedDate: string; // ISO date string
  returnedDate?: string; // ISO date string, present once returned
  state: string; // "BORROWED" | "RETURNED" | "UPDATED"
}