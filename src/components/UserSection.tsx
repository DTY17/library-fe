import { useEffect, useState } from "react";
import { getAll, addItem, updateItem, deleteItem, readFileAsDataUrl } from "../service/localStore";
import type { User } from "../service/library";
import "./library.css";

// NOTE: This section does not call the backend at all. All data lives in
// the browser's localStorage under USERS_KEY, and the uploaded photo/ID
// document is stored as a base64 data URL directly on the record (there's
// no backend to upload it to). The backend-connected `service/api.ts`
// (getUsers, addUser, updateUser, deleteUser, the /upload endpoint, etc.)
// is left untouched elsewhere in the project — it's simply not used here.
const USERS_KEY = "library_users";

const badgeClassForRole = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "badge badge-updated";
    case "MEMBER":
      return "badge badge-available";
    default:
      return "badge badge-default";
  }
};

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

type UserFormData = {
  name: string;
  birthday: string;
  email: string;
  phoneNumber: string;
  role: string;
  password: string;
  image: string; // base64 data URL, empty if none set
};

const emptyForm: UserFormData = {
  name: "",
  birthday: "",
  email: "",
  phoneNumber: "",
  role: "MEMBER",
  password: "",
  image: "",
};

export default function UserSection(): any {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>("");

  const [formMode, setFormMode] = useState<"none" | "add" | "edit">("none");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    refreshUsers();
  }, []);

  const refreshUsers = () => {
    setUsers(getAll<User>(USERS_KEY));
  };

  const handleOpenAdd = () => {
    setFormMode("add");
    setEditingId(null);
    setFormData(emptyForm);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleOpenEdit = (u: User) => {
    setFormMode("edit");
    setEditingId(u.id);
    setFormData({
      name: u.name,
      birthday: u.birthday ?? "",
      email: u.email,
      phoneNumber: u.phoneNumber ?? "",
      role: u.role,
      password: u.password ?? "",
      image: u.image ?? "",
    });
    setPhotoFile(null);
    setPhotoPreview(u.image ?? null);
  };

  const handleCancelForm = () => {
    setFormMode("none");
    setEditingId(null);
    setFormData(emptyForm);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleFieldChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (!file) {
      setPhotoPreview(formData.image || null);
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPhotoPreview(dataUrl);
    } catch (err) {
      console.error("Failed to read image file:", err);
      alert("Could not read that image file.");
    }
  };

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleSubmitForm = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      alert("Please enter both a name and an email.");
      return;
    }
    if (!isValidEmail(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (formMode === "add" && !formData.password.trim()) {
      alert("Please enter a password for the new user.");
      return;
    }

    setSubmitting(true);
    try {
      // Convert any newly selected file to a base64 data URL to store
      // in place of the backend's returned image filename.
      const image = photoFile ? await readFileAsDataUrl(photoFile) : formData.image;

      if (formMode === "add") {
        addItem<User>(USERS_KEY, { ...formData, image });
      } else if (formMode === "edit" && editingId) {
        updateItem<User>(USERS_KEY, editingId, { ...formData, image });
      }

      refreshUsers();
      handleCancelForm();
    } catch (err) {
      console.error(`${formMode === "add" ? "Add" : "Update"} user failed:`, err);
      alert(`Failed to ${formMode === "add" ? "add" : "update"} user. Check the console.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    try {
      deleteItem<User>(USERS_KEY, id);
      refreshUsers();
    } catch (err) {
      console.error("Delete user failed:", err);
      alert("Failed to delete user. Check the console.");
    }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Members · Local Storage</div>
          <h2 className="page-title">Users</h2>
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
          placeholder="Search users by name..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.image ? (
                    <img src={u.image} alt={u.name} className="avatar-thumb" />
                  ) : (
                    <div className="avatar-placeholder">{initials(u.name)}</div>
                  )}
                </td>
                <td>{u.name}</td>
                <td className="cell-mono">{u.email}</td>
                <td>
                  <span className={badgeClassForRole(u.role)}>{u.role}</span>
                </td>
                <td>
                  <div className="cell-actions">
                    <button onClick={() => handleOpenEdit(u)} className="btn btn-update">
                      Update
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="btn btn-delete">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="table-empty">
                  <div className="table-empty-icon">👤</div>
                  <div className="table-empty-text">No users match your search.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formMode === "none" && (
        <button onClick={handleOpenAdd} className="btn btn-primary">
          Add User
        </button>
      )}

      {formMode !== "none" && (
        <div className={`inline-form${formMode === "edit" ? " inline-form--edit" : ""}`}>
          <div className="inline-form-title">
            {formMode === "add" ? "New User" : "Edit User"}
          </div>
          <div className="inline-form-subtitle">
            {formMode === "add" ? "Creates a new member account" : `Editing user ${editingId}`}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="user-name">
                Name
              </label>
              <input
                id="user-name"
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="Full name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-email">
                Email
              </label>
              <input
                id="user-email"
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="user-birthday">
                Birthday
              </label>
              <input
                id="user-birthday"
                type="date"
                className="form-input"
                value={formData.birthday}
                onChange={(e) => handleFieldChange("birthday", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-phone">
                Phone Number
              </label>
              <input
                id="user-phone"
                type="tel"
                className="form-input"
                value={formData.phoneNumber}
                onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
                placeholder="1234567890"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="user-role">
                Role
              </label>
              <select
                id="user-role"
                className="form-select"
                value={formData.role}
                onChange={(e) => handleFieldChange("role", e.target.value)}
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-password">
                Password
              </label>
              <input
                id="user-password"
                type="password"
                className="form-input"
                value={formData.password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                placeholder={formMode === "add" ? "Set a password" : "Update password"}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label" htmlFor="user-photo">
                Photo / ID Document
              </label>
              <div className="photo-field">
                <div className="photo-preview-wrap">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" />
                  ) : (
                    <div className="avatar-placeholder">
                      {formData.name ? initials(formData.name) : "?"}
                    </div>
                  )}
                </div>
                <input
                  id="user-photo"
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              onClick={handleSubmitForm}
              className="btn btn-primary"
              disabled={submitting}
              style={{ marginTop: 0 }}
            >
              {submitting ? "Saving..." : formMode === "add" ? "Save User" : "Save Changes"}
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