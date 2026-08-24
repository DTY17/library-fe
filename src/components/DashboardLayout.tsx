import { Link, Routes, Route, useLocation } from "react-router-dom";
import Home from "./Home";
import UserSection from "./UserSection";
import BookSection from "./BookSection";
import RecordSection from "./RecordSection";
import "./library.css";

export default function DashboardLayout(): any {
  const location = useLocation();

  const navItem = (to: string, label: string) => (
    <Link
      to={to}
      className={`sidebar-link${location.pathname === to ? " active" : ""}`}
    >
      {label}
    </Link>
  );

  return (
    <div className="dashboard-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">Library</div>
        <div className="sidebar-tagline">Admin Dashboard</div>
        <nav className="sidebar-nav">
          {navItem("/dashboard/home", "Home")}
          {navItem("/dashboard/users", "Users")}
          {navItem("/dashboard/books", "Books")}
          {navItem("/dashboard/records", "Records")}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Routes>
          <Route path="home" element={<Home />} />
          <Route path="users" element={<UserSection />} />
          <Route path="books" element={<BookSection />} />
          <Route path="records" element={<RecordSection />} />
        </Routes>
      </main>
    </div>
  );
}
