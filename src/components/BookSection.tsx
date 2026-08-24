import { useEffect, useState } from "react";
import { getAll, addItem, updateItem, deleteItem } from "../service/localStore";
import type { Book } from "../service/library";
import "./library.css";

// NOTE: This section does not call the backend at all. All data lives in
// the browser's localStorage under BOOKS_KEY. The backend-connected
// `service/api.ts` (addBook, updateBook, deleteBook, updateStock, etc.) is
// left untouched elsewhere in the project — it's simply not used here.
const BOOKS_KEY = "library_books";

const badgeClassForState = (state: string) => {
  switch (state) {
    case "AVAILABLE":
      return "badge badge-available";
    case "BORROWED":
      return "badge badge-borrowed";
    case "UPDATED":
      return "badge badge-updated";
    default:
      return "badge badge-default";
  }
};

type BookFormData = {
  name: string;
  author: string;
  stock: number;
  state: string;
};

const emptyForm: BookFormData = {
  name: "",
  author: "",
  stock: 0,
  state: "AVAILABLE",
};

export default function BookSection() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState<string>("");

  const [formMode, setFormMode] = useState<"none" | "add" | "edit">("none");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    refreshBooks();
  }, []);

  const refreshBooks = () => {
    setBooks(getAll<Book>(BOOKS_KEY));
  };

  const handleOpenAdd = () => {
    setFormMode("add");
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleOpenEdit = (b: Book) => {
    setFormMode("edit");
    setEditingId(b.id);
    setFormData({
      name: b.name,
      author: b.author,
      stock: b.stock,
      state: b.state,
    });
  };

  const handleCancelForm = () => {
    setFormMode("none");
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleFieldChange = (field: keyof BookFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitForm = () => {
    if (!formData.name.trim() || !formData.author.trim()) {
      alert("Please enter both a name and an author.");
      return;
    }
    if (formData.stock < 0) {
      alert("Stock cannot be negative.");
      return;
    }

    setSubmitting(true);
    try {
      if (formMode === "add") {
        addItem<Book>(BOOKS_KEY, { ...formData });
      } else if (formMode === "edit" && editingId) {
        updateItem<Book>(BOOKS_KEY, editingId, { ...formData });
      }
      refreshBooks();
      handleCancelForm();
    } catch (err) {
      console.error(`${formMode === "add" ? "Add" : "Update"} book failed:`, err);
      alert(`Failed to ${formMode === "add" ? "add" : "update"} book. Check the console.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    try {
      deleteItem<Book>(BOOKS_KEY, id);
      refreshBooks();
    } catch (err) {
      console.error("Delete book failed:", err);
      alert("Failed to delete book. Check the console.");
    }
  };

  const handleStock = (b: Book) => {
    try {
      updateItem<Book>(BOOKS_KEY, b.id, { stock: b.stock + 1 });
      refreshBooks();
    } catch (err) {
      console.error("Update stock failed:", err);
      alert("Failed to update stock. Check the console.");
    }
  };

  const filtered = books.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Catalog · Local Storage</div>
          <h2 className="page-title">Books</h2>
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
          placeholder="Search books by title..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Author</th>
              <th>Stock</th>
              <th>State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.author}</td>
                <td className="cell-mono">{b.stock}</td>
                <td>
                  <span className={badgeClassForState(b.state)}>{b.state}</span>
                </td>
                <td>
                  <div className="cell-actions">
                    <button onClick={() => handleOpenEdit(b)} className="btn btn-update">
                      Update
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="btn btn-delete">
                      Delete
                    </button>
                    <button onClick={() => handleStock(b)} className="btn btn-stock">
                      Add Stock
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="table-empty">
                  <div className="table-empty-icon">📚</div>
                  <div className="table-empty-text">No books match your search.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formMode === "none" && (
        <button onClick={handleOpenAdd} className="btn btn-primary">
          Add Book
        </button>
      )}

      {formMode !== "none" && (
        <div className={`inline-form${formMode === "edit" ? " inline-form--edit" : ""}`}>
          <div className="inline-form-title">
            {formMode === "add" ? "New Book" : "Edit Book"}
          </div>
          <div className="inline-form-subtitle">
            {formMode === "add" ? "Adds a new title to the catalog" : `Editing book ${editingId}`}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="book-name">
                Name
              </label>
              <input
                id="book-name"
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="Book title"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="book-author">
                Author
              </label>
              <input
                id="book-author"
                type="text"
                className="form-input"
                value={formData.author}
                onChange={(e) => handleFieldChange("author", e.target.value)}
                placeholder="Author name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="book-stock">
                Stock
              </label>
              <input
                id="book-stock"
                type="number"
                min={0}
                className="form-input"
                value={formData.stock}
                onChange={(e) => handleFieldChange("stock", Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="book-state">
                State
              </label>
              <select
                id="book-state"
                className="form-select"
                value={formData.state}
                onChange={(e) => handleFieldChange("state", e.target.value)}
              >
                <option value="AVAILABLE">Available</option>
                <option value="BORROWED">Borrowed</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              onClick={handleSubmitForm}
              className="btn btn-primary"
              disabled={submitting}
              style={{ marginTop: 0 }}
            >
              {submitting ? "Saving..." : formMode === "add" ? "Save Book" : "Save Changes"}
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