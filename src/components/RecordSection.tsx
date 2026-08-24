import { useEffect, useState } from "react";
import { getAll, addItem, updateItem, deleteItem } from "../service/localStore";
import type { BorrowRecord, User, Book } from "../service/library";
import "./library.css";

// NOTE: This section does not call the backend at all. All data lives in
// the browser's localStorage under RECORDS_KEY, and the User/Book
// dropdowns are populated from the same localStorage-backed Users/Books
// sections (USERS_KEY / BOOKS_KEY). The backend-connected `service/api.ts`
// (getRecords, addRecord, updateRecord, deleteRecord, markAsReturned, etc.)
// is left untouched elsewhere in the project — it's simply not used here.
const RECORDS_KEY = "library_records";
const USERS_KEY = "library_users";
const BOOKS_KEY = "library_books";

const badgeClassForState = (state: string) => {
  switch (state) {
    case "BORROWED":
      return "badge badge-borrowed";
    case "RETURNED":
      return "badge badge-returned";
    case "UPDATED":
      return "badge badge-updated";
    default:
      return "badge badge-default";
  }
};

const todayISO = () => new Date().toISOString().slice(0, 10);

type RecordFormData = {
  userId: string;
  bookId: string;
  borrowedDate: string;
  state: string;
};

const emptyForm: RecordFormData = {
  userId: "",
  bookId: "",
  borrowedDate: todayISO(),
  state: "BORROWED",
};

export default function RecordSection(): any {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [search, setSearch] = useState<string>("");

  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);

  const [formMode, setFormMode] = useState<"none" | "add" | "edit">("none");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RecordFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [returningId, setReturningId] = useState<string | null>(null);

  useEffect(() => {
    refreshRecords();
  }, []);

  const refreshRecords = () => {
    setRecords(getAll<BorrowRecord>(RECORDS_KEY));
  };

  const refreshOptions = () => {
    setUsers(getAll<User>(USERS_KEY));
    setBooks(getAll<Book>(BOOKS_KEY));
  };

  const handleOpenAdd = () => {
    setFormMode("add");
    setEditingId(null);
    setFormData(emptyForm);
    refreshOptions();
  };

  const handleOpenEdit = (r: BorrowRecord) => {
    setFormMode("edit");
    setEditingId(r.id);
    setFormData({
      userId: r.userId,
      bookId: r.bookId,
      borrowedDate: r.borrowedDate ?? todayISO(),
      state: r.state,
    });
    refreshOptions();
  };

  const handleCancelForm = () => {
    setFormMode("none");
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleFieldChange = (field: keyof RecordFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitForm = () => {
    if (!formData.userId || !formData.bookId) {
      alert("Please select both a user and a book.");
      return;
    }

    setSubmitting(true);
    try {
      if (formMode === "add") {
        addItem<BorrowRecord>(RECORDS_KEY, {
          userId: formData.userId,
          bookId: formData.bookId,
          borrowedDate: formData.borrowedDate,
          state: "BORROWED",
        });
      } else if (formMode === "edit" && editingId) {
        updateItem<BorrowRecord>(RECORDS_KEY, editingId, {
          userId: formData.userId,
          bookId: formData.bookId,
          borrowedDate: formData.borrowedDate,
          state: formData.state,
        });
      }
      refreshRecords();
      handleCancelForm();
    } catch (err) {
      console.error(`${formMode === "add" ? "Add" : "Update"} record failed:`, err);
      alert(`Failed to ${formMode === "add" ? "add" : "update"} record. Check the console.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    try {
      deleteItem<BorrowRecord>(RECORDS_KEY, id);
      refreshRecords();
    } catch (err) {
      console.error("Delete record failed:", err);
      alert("Failed to delete record. Check the console.");
    }
  };

  const handleReturn = (r: BorrowRecord) => {
    if (r.state === "RETURNED") return;
    const confirmed = window.confirm(
      `Mark this record (user: ${r.userId}, book: ${r.bookId}) as returned?`
    );
    if (!confirmed) return;

    setReturningId(r.id);
    try {
      updateItem<BorrowRecord>(RECORDS_KEY, r.id, {
        state: "RETURNED",
        returnedDate: todayISO(),
      });
      refreshRecords();
    } catch (err) {
      console.error("Mark returned failed:", err);
      alert("Failed to mark as returned. Check the console.");
    } finally {
      setReturningId(null);
    }
  };

  const userLabel = (id: string) => {
    const match = users.find((u) => u.id === id);
    return match ? `${match.name} (${match.email})` : id;
  };

  const bookLabel = (id: string) => {
    const match = books.find((b) => b.id === id);
    return match ? `${match.name} — ${match.author}` : id;
  };

  const filtered = records.filter((r) =>
    r.userId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Circulation · Local Storage</div>
          <h2 className="page-title">Borrowed Records</h2>
        </div>
      </div>

      <div className="search-bar">
        <span className="search-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search records by user ID..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Book ID</th>
              <th>Borrowed</th>
              <th>Returned</th>
              <th>State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="cell-mono">{r.userId}</td>
                <td className="cell-mono">{r.bookId}</td>
                <td>
                  {r.borrowedDate ? new Date(r.borrowedDate).toLocaleDateString() : "-"}
                </td>
                <td>
                  {r.returnedDate ? new Date(r.returnedDate).toLocaleDateString() : "-"}
                </td>
                <td>
                  <span className={badgeClassForState(r.state)}>{r.state}</span>
                </td>
                <td>
                  <div className="cell-actions">
                    <button onClick={() => handleOpenEdit(r)} className="btn btn-update">
                      Update
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="btn btn-delete">
                      Delete
                    </button>
                    <button
                      onClick={() => handleReturn(r)}
                      className="btn btn-return"
                      disabled={r.state === "RETURNED" || returningId === r.id}
                    >
                      {returningId === r.id
                        ? "Returning..."
                        : r.state === "RETURNED"
                        ? "Returned"
                        : "Mark Returned"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="table-empty">
                  <div className="table-empty-icon">📖</div>
                  <div className="table-empty-text">No records match your search.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formMode === "none" && (
        <button onClick={handleOpenAdd} className="btn btn-primary">
          Add Record
        </button>
      )}

      {formMode !== "none" && (
        <div className={`inline-form${formMode === "edit" ? " inline-form--edit" : ""}`}>
          <div className="inline-form-title">
            {formMode === "add" ? "New Borrow Record" : "Edit Record"}
          </div>
          <div className="inline-form-subtitle">
            {formMode === "add" ? "Creates a new borrow entry" : `Editing record ${editingId}`}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="record-user">
                User
              </label>
              <select
                id="record-user"
                className="form-select"
                value={formData.userId}
                onChange={(e) => handleFieldChange("userId", e.target.value)}
              >
                <option value="">Select a user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
                {formMode === "edit" &&
                  formData.userId &&
                  !users.some((u) => u.id === formData.userId) && (
                    <option value={formData.userId}>{userLabel(formData.userId)}</option>
                  )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="record-book">
                Book
              </label>
              <select
                id="record-book"
                className="form-select"
                value={formData.bookId}
                onChange={(e) => handleFieldChange("bookId", e.target.value)}
              >
                <option value="">Select a book...</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.author}
                  </option>
                ))}
                {formMode === "edit" &&
                  formData.bookId &&
                  !books.some((b) => b.id === formData.bookId) && (
                    <option value={formData.bookId}>{bookLabel(formData.bookId)}</option>
                  )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="record-date">
                Borrowed Date
              </label>
              <input
                id="record-date"
                type="date"
                className="form-input"
                value={formData.borrowedDate}
                onChange={(e) => handleFieldChange("borrowedDate", e.target.value)}
              />
            </div>

            {formMode === "edit" && (
              <div className="form-group">
                <label className="form-label" htmlFor="record-state">
                  State
                </label>
                <select
                  id="record-state"
                  className="form-select"
                  value={formData.state}
                  onChange={(e) => handleFieldChange("state", e.target.value)}
                >
                  <option value="BORROWED">Borrowed</option>
                  <option value="RETURNED">Returned</option>
                  <option value="UPDATED">Updated</option>
                </select>
              </div>
            )}
          </div>

          {users.length === 0 && (
            <div className="form-hint">No users found — add a user first.</div>
          )}
          {books.length === 0 && (
            <div className="form-hint">No books found — add a book first.</div>
          )}

          <div className="form-actions">
            <button
              onClick={handleSubmitForm}
              className="btn btn-primary"
              disabled={submitting}
              style={{ marginTop: 0 }}
            >
              {submitting
                ? "Saving..."
                : formMode === "add"
                ? "Save Record"
                : "Save Changes"}
            </button>
            <button
              onClick={handleCancelForm}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}