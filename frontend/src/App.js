import "./App.css";
import { useState, useEffect } from "react";
import dotenv from "dotenv";

dotenv.config();
const API_URL = process.env.API_URL || "http://localhost:5000";
const USERS_PER_PAGE = 5;

function App() {
  const [userDetail, setUserDetail] = useState({
    username: "",
    name: "",
    age: "",
    email: "",
    address: "",
    married: false,
    _id: null,
  });
  const [allUsers, setAllUsers] = useState([]);
  const [isAddUserDialogVisible, setIsAddUserDialogVisible] = useState(false);
  const [isEditUserDialogVisible, setIsEditUserDialogVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page) => {
    setIsLoading(true);
    setSubmitError("");
    try {
      const response = await fetch(
        `${API_URL}/users?page=${page}&limit=${USERS_PER_PAGE}`,
        { method: "GET", headers: { "Content-Type": "application/json" } },
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setAllUsers(data.Users || []);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalUsers(data.totalUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setAllUsers([]);
      setTotalPages(0);
      setTotalUsers(0);
      setSubmitError("Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetFormAndCloseDialog = () => {
    setUserDetail({
      username: "",
      name: "",
      age: "",
      email: "",
      address: "",
      married: false,
      _id: null,
    });
    setIsAddUserDialogVisible(false);
    setIsEditUserDialogVisible(false);
    setSubmitError("");
  };

  const deleteUser = async (id) => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }
      const newTotalUsers = totalUsers - 1;
      if (allUsers.length === 1 && currentPage > 1 && newTotalUsers > 0) {
        setCurrentPage((prevPage) => prevPage - 1);
      } else if (newTotalUsers === 0) {
        setAllUsers([]);
        setTotalPages(0);
        setTotalUsers(0);
        setCurrentPage(1);
      } else {
        fetchUsers(currentPage);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setSubmitError(`Error deleting user: ${error.message}`);
    }
  };

  const preparePayload = () => ({
    ...userDetail,
    age: userDetail.age === "" ? 0 : Number(userDetail.age),
  });

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    const payload = preparePayload();
    if (!payload.username || !payload.name || !payload.email) {
      setSubmitError("Username, Name, and Email are required.");
      return;
    }
    if (userDetail.age === "" || isNaN(payload.age) || payload.age < 0) {
      setSubmitError("Age is required and must be a non-negative number.");
      return;
    }
    const action = isAddUserDialogVisible ? addUser : editUser;
    await action(payload);
  };

  const addUser = async (payload) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }
      resetFormAndCloseDialog();
      setCurrentPage(1);
    } catch (error) {
      console.error("Error adding user:", error);
      setSubmitError(`Error adding user: ${error.message}`);
    }
  };

  const editUser = async (payload) => {
    try {
      const response = await fetch(`${API_URL}/users/${payload._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }
      resetFormAndCloseDialog();
      fetchUsers(currentPage);
    } catch (error) {
      console.error("Error editing user:", error);
      setSubmitError(`Error editing user: ${error.message}`);
    }
  };

  const handleEditClick = (userToEdit) => {
    setUserDetail({
      ...userToEdit,
      age:
        userToEdit.age !== null && userToEdit.age !== undefined
          ? String(userToEdit.age)
          : "",
    });
    setIsEditUserDialogVisible(true);
    setSubmitError("");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserDetail((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOpenAddDialog = () => {
    resetFormAndCloseDialog();
    setIsAddUserDialogVisible(true);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage)
      setCurrentPage(newPage);
  };

  const PaginationControls = () => {
    if (totalPages <= 1 || isLoading) return null;
    const pageNumbers = [];
    const maxPagesToShow = 3;
    let startPage, endPage;
    if (totalPages <= maxPagesToShow + 2) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= Math.ceil(maxPagesToShow / 2) + 1) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + Math.floor(maxPagesToShow / 2) >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - Math.floor(maxPagesToShow / 2);
        endPage = currentPage + Math.floor(maxPagesToShow / 2);
      }
    }
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

    return (
      <nav className="pagination-controls" aria-label="User list navigation">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button prev-next-button"
        >
          Previous
        </button>
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="pagination-button"
            >
              1
            </button>
            {startPage > 2 && <span className="pagination-ellipsis">...</span>}
          </>
        )}
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`pagination-button ${currentPage === number ? "active" : ""}`}
            aria-current={currentPage === number ? "page" : undefined}
          >
            {number}
          </button>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="pagination-ellipsis">...</span>
            )}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="pagination-button"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="pagination-button prev-next-button"
        >
          Next
        </button>
      </nav>
    );
  };

  const UserCountDisplay = () => {
    if (isLoading || totalUsers === 0)
      return <div className="user-count-display loading-placeholder"> </div>;
    const startUser = (currentPage - 1) * USERS_PER_PAGE + 1;
    const endUser = Math.min(currentPage * USERS_PER_PAGE, totalUsers);
    return (
      <div className="user-count-display">
        Showing {startUser} - {endUser} of {totalUsers} users
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">User Management Dashboard</h1>
        <button
          className="add-user-button primary-action-button"
          onClick={handleOpenAddDialog}
        >
          {" "}
          Add New User{" "}
        </button>
      </header>
      <UserCountDisplay />
      {isLoading && (
        <div className="loading-spinner-container">
          {" "}
          <div className="loading-spinner"></div> <p>Loading Users...</p>{" "}
        </div>
      )}
      {!isLoading && allUsers && allUsers.length > 0 ? (
        <ul className="user-list">
          {allUsers.map((user) => (
            <li key={user._id} className="user-item">
              <div className="user-details">
                <span className="user-name-display">
                  {user.name}{" "}
                  <span className="username-tag">@{user.username}</span>
                </span>
                <span className="user-meta-info">
                  {user.email} • Age: {user.age} • Married:{" "}
                  {user.married ? "Yes" : "No"}
                </span>
                {user.address && (
                  <span className="user-address-info">
                    Address: {user.address}
                  </span>
                )}
              </div>
              <div className="user-actions">
                <button
                  className="edit-button action-button"
                  onClick={() => handleEditClick(user)}
                >
                  Edit
                </button>
                <button
                  className="delete-button action-button"
                  onClick={() => deleteUser(user._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        !isLoading && (
          <div className="no-users-message">
            <p>
              {totalUsers === 0
                ? "No users found in the system."
                : "No users on this page."}
            </p>
            {totalUsers === 0 && <p>Click "Add New User" to get started.</p>}
          </div>
        )
      )}
      <PaginationControls />
      {(isAddUserDialogVisible || isEditUserDialogVisible) && (
        <div className="dialog-overlay">
          <div className="user-form-dialog">
            <h2 className="dialog-title">
              {isAddUserDialogVisible ? "Add New User" : "Edit User Details"}
            </h2>
            {submitError && <p className="form-error-message">{submitError}</p>}
            <form onSubmit={handleFormSubmit} className="user-form-content">
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="username-input">Username:</label>
                  <input
                    id="username-input"
                    type="text"
                    name="username"
                    value={userDetail.username}
                    onChange={handleInputChange}
                    required
                    disabled={isEditUserDialogVisible}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="name-input">Full Name:</label>
                  <input
                    id="name-input"
                    type="text"
                    name="name"
                    value={userDetail.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="email-input">Email:</label>
                  <input
                    id="email-input"
                    type="email"
                    name="email"
                    value={userDetail.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="age-input">Age:</label>
                  <input
                    id="age-input"
                    type="number"
                    name="age"
                    value={userDetail.age}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
                <div className="form-field form-field-full-width">
                  <label htmlFor="address-input">Address:</label>
                  <input
                    id="address-input"
                    type="text"
                    name="address"
                    value={userDetail.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-field checkbox-field form-field-full-width">
                  <input
                    id="married-checkbox"
                    type="checkbox"
                    name="married"
                    checked={userDetail.married}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="married-checkbox">Married</label>
                </div>
              </div>
              <div className="dialog-actions">
                <button
                  type="button"
                  className="close-button secondary-action-button"
                  onClick={resetFormAndCloseDialog}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button primary-action-button"
                >
                  {" "}
                  {isAddUserDialogVisible ? "Add User" : "Save Changes"}{" "}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
