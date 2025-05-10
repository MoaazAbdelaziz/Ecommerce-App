document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const sidebar = document.getElementById("sidebar");
  const toggleSidebarBtn = document.getElementById("toggle-sidebar");
  const mobileSidebarToggle = document.getElementById("mobile-sidebar-toggle");
  const logoutBtn = document.getElementById("logout-btn");
  const dashboardContainer = document.querySelector(".dashboard-container");
  const usersContainer = document.getElementById("users-container");
  const emptyState = document.getElementById("empty-state");
  const resetFiltersBtn = document.getElementById("reset-filters");
  const roleFilter = document.getElementById("role-filter");
  const sortFilter = document.getElementById("sort-filter");
  const userSearch = document.getElementById("user-search");
  const refreshBtn = document.getElementById("refresh-btn");
  const exportBtn = document.getElementById("export-btn");
  const addUserBtn = document.getElementById("add-user-btn");
  const userModal = document.getElementById("user-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const userForm = document.getElementById("user-form");
  const modalTitle = document.getElementById("modal-title");
  const saveBtn = document.getElementById("save-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const confirmationModal = document.getElementById("confirmation-modal");
  const closeConfirmationBtn = document.getElementById("close-confirmation");
  const confirmationTitle = document.getElementById("confirmation-title");
  const confirmationMessage = document.getElementById("confirmation-message");
  const cancelConfirmationBtn = document.getElementById("cancel-confirmation");
  const confirmActionBtn = document.getElementById("confirm-action");
  const prevPageBtn = document.getElementById("prev-page");
  const nextPageBtn = document.getElementById("next-page");
  const currentPageEl = document.getElementById("current-page");
  const totalPagesEl = document.getElementById("total-pages");
  const toastContainer = document.getElementById("toast-container");
  const userNameElement = document.getElementById("user-name");
  const userEmailElement = document.getElementById("user-email");
  const userAvatarElement = document.getElementById("user-avatar");
  const headerAvatarElement = document.getElementById("header-avatar");
  const togglePasswordBtn = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("password");

  // Stats counters
  const totalCountEl = document.getElementById("total-count");
  const adminCountEl = document.getElementById("admin-count");
  const sellerCountEl = document.getElementById("seller-count");
  const customerCountEl = document.getElementById("customer-count");

  // API URL - change this to your JSON server URL
  const API_URL = "http://localhost:3000";

  // State
  let users = [];
  let filteredUsers = [];
  let currentPage = 1;
  let itemsPerPage = 6;
  let totalPages = 1;
  let currentAction = null;
  let selectedUserId = null;
  let currentUser = null;

  // Check if user is logged in
  const checkAuth = () => {
    const userAdmin = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null;

    if (!userAdmin) {
      window.location.href = "../../auth/auth.html";
      return false;
    } else if (userAdmin.role === "customer") {
      window.location.href = "../../home/home.html";
      return false;
    } else if (userAdmin.role === "seller") {
      window.location.href = "../../seller-dashboard/seller-dashboard.html";
      return false;
    }

    currentUser = userAdmin;

    // Update user info in the UI
    if (userAdmin.name && userNameElement) {
      userNameElement.textContent = userAdmin.name;

      // Set avatar with first letter of name
      const firstLetter = userAdmin.name.charAt(0).toUpperCase();
      if (userAvatarElement) userAvatarElement.textContent = firstLetter;
      if (headerAvatarElement) headerAvatarElement.textContent = firstLetter;
    }

    if (userAdmin.email && userEmailElement) {
      userEmailElement.textContent = userAdmin.email;
    }

    return true;
  };

  // Toggle sidebar on desktop
  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      dashboardContainer.classList.toggle("sidebar-collapsed");
    });
  }

  // Toggle sidebar on mobile
  if (mobileSidebarToggle) {
    mobileSidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });
  }

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (event) => {
    const isClickInsideSidebar = sidebar && sidebar.contains(event.target);
    const isClickOnMobileToggle =
      mobileSidebarToggle && mobileSidebarToggle.contains(event.target);

    if (
      sidebar &&
      !isClickInsideSidebar &&
      !isClickOnMobileToggle &&
      window.innerWidth <= 992
    ) {
      sidebar.classList.remove("active");
    }
  });

  // Logout functionality
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "../../auth/auth.html";
    });
  }

  // Toggle password visibility
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener("click", () => {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      togglePasswordBtn.innerHTML =
        type === "password"
          ? '<i class="fa-solid fa-eye"></i>'
          : '<i class="fa-solid fa-eye-slash"></i>';
    });
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Get user avatar background class based on role
  const getUserAvatarClass = (role) => {
    switch (role) {
      case "admin":
        return "admin-bg";
      case "seller":
        return "seller-bg";
      case "customer":
        return "customer-bg";
      default:
        return "admin-bg";
    }
  };

  // Get user role badge class
  const getUserRoleBadgeClass = (role) => {
    switch (role) {
      case "admin":
        return "role-admin";
      case "seller":
        return "role-seller";
      case "customer":
        return "role-customer";
      default:
        return "role-customer";
    }
  };

  // Render users
  const renderUsers = () => {
    if (!usersContainer) return; // Guard clause to prevent errors

    if (filteredUsers.length === 0) {
      usersContainer.style.display = "none";
      if (emptyState) emptyState.style.display = "flex";
      return;
    }

    usersContainer.style.display = "grid";
    if (emptyState) emptyState.style.display = "none";

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Update pagination UI
    if (totalPagesEl && currentPageEl) {
      totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
      currentPageEl.textContent = currentPage;
      totalPagesEl.textContent = totalPages;
      if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
      if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages;
    }

    // Clear container
    usersContainer.innerHTML = "";

    // Render users
    paginatedUsers.forEach((user) => {
      const userCard = document.createElement("div");
      userCard.className = "user-card";

      // Get first letter of name for avatar
      const firstLetter = user.name.charAt(0).toUpperCase();

      userCard.innerHTML = `
                  <div class="user-card-header">
                      <div class="user-card-avatar ${getUserAvatarClass(
                        user.role
                      )}">
                          ${firstLetter}
                      </div>
                      <div class="user-card-info">
                          <h3 class="user-card-name">${user.name}</h3>
                          <p class="user-card-email">${user.email}</p>
                      </div>
                  </div>
                  <div class="user-card-role ${getUserRoleBadgeClass(
                    user.role
                  )}">
                      ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </div>
                  <div class="user-card-actions">
                      <button class="btn-edit" data-id="${user.id}">
                          <i class="fa-solid fa-edit"></i> Edit
                      </button>
                      <button class="btn-delete" data-id="${user.id}">
                          <i class="fa-solid fa-trash"></i> Delete
                      </button>
                  </div>
              `;
      usersContainer.appendChild(userCard);
    });

    // Attach event listeners to buttons
    attachUserActionListeners();
  };

  // Attach event listeners to user action buttons
  const attachUserActionListeners = () => {
    // Edit buttons
    const editButtons = document.querySelectorAll(".btn-edit");
    editButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const userId = btn.getAttribute("data-id");
        openUserModal("edit", userId);
      });
    });

    // Delete buttons
    const deleteButtons = document.querySelectorAll(".btn-delete");
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const userId = btn.getAttribute("data-id");
        openConfirmationModal("delete", userId);
      });
    });
  };

  // Open user modal
  const openUserModal = (action, userId = null) => {
    if (!userForm || !userModal) return; // Guard clause

    // Reset form
    userForm.reset();

    if (action === "add") {
      modalTitle.textContent = "Add New User";
      saveBtn.textContent = "Add User";
    } else {
      modalTitle.textContent = "Edit User";
      saveBtn.textContent = "Update User";

      // Fill form with user data
      const user = users.find((u) => u.id.toString() === userId.toString());
      if (user) {
        userForm.elements.name.value = user.name;
        userForm.elements.email.value = user.email;
        userForm.elements.password.value = user.password;
        userForm.elements.role.value = user.role;
      }
    }

    // Store current action and user ID
    currentAction = action;
    selectedUserId = userId;

    // Show modal
    userModal.classList.add("active");
  };

  // Open confirmation modal
  const openConfirmationModal = (action, userId) => {
    if (!confirmationModal) return; // Guard clause

    const user = users.find((u) => u.id.toString() === userId.toString());
    if (!user) return;

    // Don't allow deleting yourself
    if (action === "delete" && user.id === currentUser.id) {
      showToast("error", "Error", "You cannot delete your own account");
      return;
    }

    currentAction = action;
    selectedUserId = userId;

    if (action === "delete") {
      confirmationTitle.textContent = "Confirm Delete";
      confirmationMessage.textContent = `Are you sure you want to delete the user "${truncateText(
        user.name,
        30
      )}"? This will also delete all related data.`;
      confirmActionBtn.textContent = "Delete";
      confirmActionBtn.className = "btn-danger";
    }

    confirmationModal.classList.add("active");
  };

  // Close modal
  if (closeModalBtn && userModal) {
    closeModalBtn.addEventListener("click", () => {
      userModal.classList.remove("active");
    });
  }

  // Close confirmation modal
  if (closeConfirmationBtn && confirmationModal) {
    closeConfirmationBtn.addEventListener("click", () => {
      confirmationModal.classList.remove("active");
    });
  }

  // Cancel button in user modal
  if (cancelBtn && userModal) {
    cancelBtn.addEventListener("click", () => {
      userModal.classList.remove("active");
    });
  }

  // Cancel button in confirmation modal
  if (cancelConfirmationBtn && confirmationModal) {
    cancelConfirmationBtn.addEventListener("click", () => {
      confirmationModal.classList.remove("active");
    });
  }

  // Close modals when clicking outside
  if (userModal) {
    userModal.addEventListener("click", (event) => {
      if (event.target === userModal) {
        userModal.classList.remove("active");
      }
    });
  }

  if (confirmationModal) {
    confirmationModal.addEventListener("click", (event) => {
      if (event.target === confirmationModal) {
        confirmationModal.classList.remove("active");
      }
    });
  }

  // Confirm action button
  if (confirmActionBtn) {
    confirmActionBtn.addEventListener("click", async () => {
      try {
        if (currentAction === "delete") {
          await deleteUser(selectedUserId);
          showToast(
            "success",
            "User Deleted",
            "The user and related data have been deleted successfully"
          );
        }

        // Refresh users
        await fetchUsers();

        // Close modal
        if (confirmationModal) {
          confirmationModal.classList.remove("active");
        }
      } catch (error) {
        console.error("Error performing action:", error);
        showToast(
          "error",
          "Error",
          "An error occurred while performing the action"
        );
      }
    });
  }

  // User form submission
  if (userForm) {
    userForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        const userData = {
          name: userForm.elements.name.value,
          email: userForm.elements.email.value,
          password: userForm.elements.password.value,
          role: userForm.elements.role.value,
        };

        // Validate form
        if (!validateForm(userData)) {
          return;
        }

        // Check if email is unique
        if (!(await checkEmailUnique(userData.email, selectedUserId))) {
          showToast(
            "error",
            "Validation Error",
            "This email is already in use by another user"
          );
          return;
        }

        if (currentAction === "add") {
          await addUser(userData);
          showToast(
            "success",
            "User Added",
            "The user has been added successfully"
          );
        } else if (currentAction === "edit") {
          await updateUser(selectedUserId, userData);
          showToast(
            "success",
            "User Updated",
            "The user has been updated successfully"
          );
        }

        // Refresh users
        await fetchUsers();

        // Close modal
        if (userModal) {
          userModal.classList.remove("active");
        }
      } catch (error) {
        console.error("Error saving user:", error);
        showToast("error", "Error", "An error occurred while saving the user");
      }
    });
  }

  // Validate form
  const validateForm = (userData) => {
    const { name, email, password, role } = userData;

    if (!name || !email || !password || !role) {
      showToast("error", "Validation Error", "Please fill in all fields");
      return false;
    }

    if (name.length < 3) {
      showToast(
        "error",
        "Validation Error",
        "Name must be at least 3 characters long"
      );
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      showToast(
        "error",
        "Validation Error",
        "Please enter a valid email address"
      );
      return false;
    }

    if (password.length < 6) {
      showToast(
        "error",
        "Validation Error",
        "Password must be at least 6 characters long"
      );
      return false;
    }

    return true;
  };

  // Check if email is unique
  const checkEmailUnique = async (email, userId) => {
    try {
      // If editing, exclude the current user
      const otherUsers = users.filter(
        (u) => u.id.toString() !== userId?.toString()
      );
      const existingUser = otherUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      return !existingUser;
    } catch (error) {
      console.error("Error checking email uniqueness:", error);
      return false;
    }
  };

  // Add user
  const addUser = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Failed to add user");
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    }
  };

  // Update user
  const updateUser = async (userId, userData) => {
    try {
      // Get the current user to check role change
      const currentUserData = users.find(
        (u) => u.id.toString() === userId.toString()
      );
      const isRoleChanged = currentUserData.role !== userData.role;

      // Update the user
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      // If role changed, handle related data
      if (isRoleChanged) {
        await handleRoleChange(userId, currentUserData.role, userData.role);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  // Handle role change
  const handleRoleChange = async (userId, oldRole, newRole) => {
    try {
      // If changing from seller to customer, delete products
      if (oldRole === "seller" && newRole === "customer") {
        const productsResponse = await fetch(
          `${API_URL}/products?seller.id=${userId}`
        );
        const products = await productsResponse.json();

        for (const product of products) {
          await fetch(`${API_URL}/products/${product.id}`, {
            method: "DELETE",
          });
        }
      }

      // If changing from customer to seller, delete cart
      if (oldRole === "customer" && newRole === "seller") {
        const cartResponse = await fetch(`${API_URL}/cart`);
        const carts = await cartResponse.json();
        const userCart = carts.find(
          (cart) => cart.user && cart.user.id === userId
        );

        if (userCart) {
          await fetch(`${API_URL}/cart/${userCart.id}`, {
            method: "DELETE",
          });
        }
      }
    } catch (error) {
      console.error("Error handling role change:", error);
      throw error;
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    try {
      // Delete the user
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // Delete related data
      await deleteRelatedData(userId);

      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  // Delete related data
  const deleteRelatedData = async (userId) => {
    try {
      // Delete user's cart
      const cartResponse = await fetch(`${API_URL}/cart`);
      const carts = await cartResponse.json();
      const userCart = carts.find(
        (cart) => cart.user && cart.user.id === userId
      );

      if (userCart) {
        await fetch(`${API_URL}/cart/${userCart.id}`, {
          method: "DELETE",
        });
      }

      // Delete user's orders
      const ordersResponse = await fetch(`${API_URL}/orders`);
      const orders = await ordersResponse.json();
      const userOrders = orders.filter(
        (order) => order.user && order.user.id === userId
      );

      for (const order of userOrders) {
        await fetch(`${API_URL}/orders/${order.id}`, {
          method: "DELETE",
        });
      }

      // Delete user's products (if seller)
      const productsResponse = await fetch(`${API_URL}/products`);
      const products = await productsResponse.json();
      const userProducts = products.filter(
        (product) => product.seller && product.seller.id === userId
      );

      for (const product of userProducts) {
        await fetch(`${API_URL}/products/${product.id}`, {
          method: "DELETE",
        });
      }

      // Delete user's reviews
      const reviewsResponse = await fetch(`${API_URL}/reviews`);
      const reviews = await reviewsResponse.json();
      const userReviews = reviews.filter(
        (review) => review.user && review.user.id === userId
      );

      for (const review of userReviews) {
        await fetch(`${API_URL}/reviews/${review.id}`, {
          method: "DELETE",
        });
      }
    } catch (error) {
      console.error("Error deleting related data:", error);
      throw error;
    }
  };

  // Show toast notification
  const showToast = (type, title, message) => {
    if (!toastContainer) return; // Guard clause

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
              <div class="toast-icon ${type}">
                  <i class="fa-solid ${
                    type === "success"
                      ? "fa-check"
                      : type === "error"
                      ? "fa-times"
                      : type === "warning"
                      ? "fa-exclamation"
                      : "fa-info"
                  }"></i>
              </div>
              <div class="toast-content">
                  <div class="toast-title">${title}</div>
                  <div class="toast-message">${message}</div>
              </div>
              <button class="toast-close">
                  <i class="fa-solid fa-times"></i>
              </button>
          `;

    toastContainer.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.style.animation = "slideOut 0.3s ease forwards";
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 5000);

    // Close button
    const closeBtn = toast.querySelector(".toast-close");
    closeBtn.addEventListener("click", () => {
      toast.style.animation = "slideOut 0.3s ease forwards";
      setTimeout(() => {
        toast.remove();
      }, 300);
    });
  };

  // Apply filters
  const applyFilters = () => {
    if (!roleFilter || !sortFilter || !userSearch) return; // Guard clause

    const role = roleFilter.value;
    const sort = sortFilter.value;
    const search = userSearch.value.toLowerCase();

    // Filter by role
    filteredUsers = users.filter((user) => {
      // Exclude current user
      if (user.id === currentUser.id) {
        return false;
      }

      if (role === "all") return true;
      return user.role === role;
    });

    // Filter by search
    if (search) {
      filteredUsers = filteredUsers.filter((user) => {
        return (
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
        );
      });
    }

    // Sort users
    filteredUsers.sort((a, b) => {
      if (sort === "name-asc") {
        return a.name.localeCompare(b.name);
      } else if (sort === "name-desc") {
        return b.name.localeCompare(a.name);
      } else if (sort === "role") {
        return a.role.localeCompare(b.role);
      } else if (sort === "recent") {
        // Sort by ID (assuming newer users have higher IDs)
        return b.id.localeCompare(a.id);
      }
      return 0;
    });

    // Reset to first page
    currentPage = 1;

    // Update stats
    updateStats();

    // Render users
    renderUsers();
  };

  // Update user stats
  const updateStats = () => {
    if (!totalCountEl || !adminCountEl || !sellerCountEl || !customerCountEl)
      return; // Guard clause

    const totalCount = users.length - 1; // Exclude current user
    const adminCount = users.filter(
      (u) => u.role === "admin" && u.id !== currentUser.id
    ).length;
    const sellerCount = users.filter((u) => u.role === "seller").length;
    const customerCount = users.filter((u) => u.role === "customer").length;

    totalCountEl.textContent = totalCount;
    adminCountEl.textContent = adminCount;
    sellerCountEl.textContent = sellerCount;
    customerCountEl.textContent = customerCount;
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      if (usersContainer) {
        usersContainer.innerHTML = `
                  <div class="loading-container">
                      <div class="loading-spinner"></div>
                      <p>Loading users...</p>
                  </div>
              `;
      }

      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      users = await response.json();

      // Apply filters
      applyFilters();
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast("error", "Error", "Failed to load users");

      if (usersContainer) {
        usersContainer.innerHTML = `
                  <div class="empty-state">
                      <div class="empty-icon">
                          <i class="fa-solid fa-exclamation-triangle"></i>
                      </div>
                      <h3>Error Loading Users</h3>
                      <p>There was an error loading the users. Please try again later.</p>
                      <button id="retry-btn" class="btn-primary">Retry</button>
                  </div>
              `;

        const retryBtn = document.getElementById("retry-btn");
        if (retryBtn) {
          retryBtn.addEventListener("click", fetchUsers);
        }
      }
    }
  };

  // Event listeners for filters
  if (roleFilter) {
    roleFilter.addEventListener("change", applyFilters);
  }

  if (sortFilter) {
    sortFilter.addEventListener("change", applyFilters);
  }

  if (userSearch) {
    userSearch.addEventListener("input", applyFilters);
  }

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
      roleFilter.value = "all";
      sortFilter.value = "name-asc";
      userSearch.value = "";
      applyFilters();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      await fetchUsers();
      showToast("info", "Refreshed", "User list has been refreshed");
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "ID,Name,Email,Role\n";

      filteredUsers.forEach((user) => {
        const row = [
          user.id,
          `"${user.name.replace(/"/g, '""')}"`,
          `"${user.email}"`,
          user.role,
        ];
        csvContent += row.join(",") + "\n";
      });

      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `users_export_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);

      // Trigger download
      link.click();
      document.body.removeChild(link);

      showToast(
        "success",
        "Export Complete",
        "Users have been exported to CSV"
      );
    });
  }

  if (addUserBtn) {
    addUserBtn.addEventListener("click", () => {
      openUserModal("add");
    });
  }

  // Pagination
  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderUsers();
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderUsers();
      }
    });
  }

  // Initialize
  if (checkAuth()) {
    fetchUsers();
  }
});

// For compatibility with the old HTML structure
window.addEventListener("load", async function () {
  const userAdmin = JSON.parse(localStorage.getItem("user"));
  if (!userAdmin || userAdmin.role === "customer") {
    window.location.href = "./../../home/home.html";
  } else if (userAdmin.role === "seller") {
    window.location.href = "./../../seller-dashboard/seller-dashboard.html";
  }

  // Handle logout for old HTML structure
  const logOut = document.querySelector("#logout-btn");
  if (logOut) {
    logOut.addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "./../../auth/auth.html";
    });
  }

  // Handle old add user button if it exists
  const oldAddUserBtn = document.querySelector(".add-user-btn");
  if (oldAddUserBtn) {
    const formModal = document.getElementById("add-update-modal");
    if (formModal) {
      oldAddUserBtn.addEventListener("click", function () {
        const userManagmentContainer = document.querySelector(
          ".user-management-container"
        );
        if (userManagmentContainer)
          userManagmentContainer.style.display = "none";
        formModal.style.display = "block";

        // Reset form
        const form = document.getElementById("add-update-form");
        if (form) form.reset();

        // Update title and button
        const title = formModal.querySelector(".title");
        if (title) title.textContent = "Add New User";

        const submitBtn = document.getElementById("submit");
        if (submitBtn) submitBtn.value = "Add";
      });
    }
  }

  // Handle old form close button
  const formClose = document.querySelector(".close");
  if (formClose) {
    formClose.addEventListener("click", function () {
      const formModal = document.getElementById("add-update-modal");
      const userManagmentContainer = document.querySelector(
        ".user-management-container"
      );

      if (formModal) formModal.style.display = "none";
      if (userManagmentContainer)
        userManagmentContainer.style.display = "block";
    });
  }
});
