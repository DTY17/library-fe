import { useEffect, useState } from "react";
import { getUserCount, getBookCount, getRecordCount } from "../service/api";
import "./library.css";

export default function Home() {
  const [counts, setCounts] = useState({ users: 0, books: 0, records: 0 });

  useEffect(() => {
    async function fetchCounts() {
      const users = await getUserCount();
      const books = await getBookCount();
      const records = await getRecordCount();
      setCounts({ users: users.data, books: books.data, records: records.data });
    }
    fetchCounts();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Overview</div>
          <h2 className="page-title">Home</h2>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card stat-users">
          <div className="stat-label">Users</div>
          <div className="stat-value">{counts.users}</div>
        </div>
        <div className="stat-card stat-books">
          <div className="stat-label">Books</div>
          <div className="stat-value">{counts.books}</div>
        </div>
        <div className="stat-card stat-records">
          <div className="stat-label">Borrowed Records</div>
          <div className="stat-value">{counts.records}</div>
        </div>
      </div>
    </div>
  );
}
