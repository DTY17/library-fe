import axios, { type AxiosResponse } from "axios";

// --- Types ---
export interface User {
  id: string;
  name: string;
  birthday: string;
  email: string;
  phoneNumber: string;
  role: string;
  password: string;
  image: string
}

export interface Book {
  id: string;
  name: string;
  author: string;
  stock: number;
  state: string;
}

export interface Record {
  id: string;
  userId: string;
  bookId: string;
  borrowedDate: Date;
  returnedDate?: Date;
  state: string;
}

export const api = axios.create({
  baseURL: "http://localhost:8081", 
});

export const getUserCount = (): Promise<AxiosResponse<number>> =>
  api.get("/api/users/count");

export const getBookCount = (): Promise<AxiosResponse<number>> =>
  api.get("/api/books/count");

export const getRecordCount = (): Promise<AxiosResponse<number>> =>
  api.get("/api/records/count");

export const getUsers = (): Promise<AxiosResponse<User[]>> =>
  api.get("/api/users");

export const addUser = (user: User): Promise<AxiosResponse<User>> =>
  api.post("/api/users", user);

export const updateUser = (id: string, user: User): Promise<AxiosResponse<User>> =>
  api.put(`/api/users/${id}`, user);

export const deleteUser = (id: string): Promise<AxiosResponse<void>> =>
  api.delete(`/api/users/${id}`);

export const getBooks = (): Promise<AxiosResponse<Book[]>> =>
  api.get("/api/books");

export const addBook = (book: Book): Promise<AxiosResponse<Book>> =>
  api.post("/api/books", book);

export const updateBook = (id: string, book: Book): Promise<AxiosResponse<Book>> =>
  api.put(`/api/books/${id}`, book);

export const deleteBook = (id: string): Promise<AxiosResponse<void>> =>
  api.delete(`/api/books/${id}`);

export const updateStock = (id: string, stock: number): Promise<AxiosResponse<Book>> =>
  api.patch(`/api/books/${id}/stock`, { stock });

export const getRecords = (): Promise<AxiosResponse<Record[]>> =>
  api.get("/api/records");

export const addRecord = (record: Record): Promise<AxiosResponse<Record>> =>
  api.post("/api/records", record);

export const updateRecord = (id: string, record: Record): Promise<AxiosResponse<Record>> =>
  api.put(`/api/records/${id}`, record);

export const deleteRecord = (id: string): Promise<AxiosResponse<void>> =>
  api.delete(`/api/records/${id}`);

export const markAsReturned = (id: string): Promise<AxiosResponse<Record>> =>
  api.patch(`/api/records/${id}/return`);
