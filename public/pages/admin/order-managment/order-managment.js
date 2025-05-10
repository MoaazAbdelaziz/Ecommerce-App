document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const sidebar = document.getElementById("sidebar");
  const toggleSidebarBtn = document.getElementById("toggle-sidebar");
  const mobileSidebarToggle = document.getElementById("mobile-sidebar-toggle");
  const logoutBtn = document.getElementById("logout-btn");
  const dashboardContainer = document.querySelector(".dashboard-container");
  const ordersContainer = document.getElementById("orders-container");
  const emptyState = document.getElementById("empty-state");
  const resetFiltersBtn = document.getElementById("reset-filters");
  const statusFilter = document.getElementById("status-filter");
  const dateFilter = document.getElementById("date-filter");
  const sortFilter = document.getElementById("sort-filter");
  const orderSearch = document.getElementById("order-search");
  const refreshBtn = document.getElementById("refresh-btn");
  const exportBtn = document.getElementById("export-btn");
  const notificationsBtn = document.getElementById("notifications-btn");
  const notificationsDropdown = document.getElementById(
    "notifications-dropdown"
  );
  const orderDetailsModal = document.getElementById("order-details-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const orderDetailsContent = document.getElementById("order-details-content");
  const prevPageBtn = document.getElementById("prev-page");
  const nextPageBtn = document.getElementById("next-page");
  const currentPageEl = document.getElementById("current-page");
  const totalPagesEl = document.getElementById("total-pages");
  const toastContainer = document.getElementById("toast-container");
  const userNameElement = document.getElementById("user-name");
  const userEmailElement = document.getElementById("user-email");
  const userAvatarElement = document.getElementById("user-avatar");
  const headerAvatarElement = document.getElementById("header-avatar");

  // Stats counters
  const pendingCountEl = document.getElementById("pending-count");
  const processingCountEl = document.getElementById("processing-count");
  const shippedCountEl = document.getElementById("shipped-count");
  const deliveredCountEl = document.getElementById("delivered-count");
  const cancelledCountEl = document.getElementById("cancelled-count");

  // State
  let orders = [];
  let filteredOrders = [];
  let currentPage = 1;
  let itemsPerPage = 5;
  let totalPages = 1;

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

    // Update user info in the UI
    if (userAdmin.name) {
      userNameElement.textContent = userAdmin.name;

      // Set avatar with first letter of name
      const firstLetter = userAdmin.name.charAt(0).toUpperCase();
      userAvatarElement.textContent = firstLetter;
      headerAvatarElement.textContent = firstLetter;
    }

    if (userAdmin.email) {
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

  // Toggle notifications dropdown
  if (notificationsBtn) {
    notificationsBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      notificationsDropdown.classList.toggle("active");
    });
  }

  // Close notifications dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (
      notificationsDropdown &&
      notificationsBtn &&
      !notificationsBtn.contains(event.target)
    ) {
      notificationsDropdown.classList.remove("active");
    }
  });

  // Logout functionality
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "../../auth/auth.html";
    });
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time
  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get status class
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "status-pending";
      case "processing":
        return "status-processing";
      case "shipped":
        return "status-shipped";
      case "delivered":
        return "status-delivered";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  // Render orders
  const renderOrders = () => {
    if (filteredOrders.length === 0) {
      ordersContainer.style.display = "none";
      emptyState.style.display = "flex";
      return;
    }

    ordersContainer.style.display = "block";
    emptyState.style.display = "none";

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    // Update pagination UI
    totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    currentPageEl.textContent = currentPage;
    totalPagesEl.textContent = totalPages;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    // Clear container
    ordersContainer.innerHTML = "";

    // Render orders
    paginatedOrders.forEach((order) => {
      const orderCard = document.createElement("div");
      orderCard.className = "order-card";
      orderCard.innerHTML = `
              <div class="order-header">
                  <div class="order-id">Order #${order.id}</div>
                  <div class="order-date">${formatDate(
                    order.date || new Date()
                  )}</div>
              </div>
              <div class="order-info">
                  <div class="info-group">
                      <div class="info-label">Status</div>
                      <div class="info-value">
                          <span class="order-status ${getStatusClass(
                            order.status
                          )}">${order.status}</span>
                      </div>
                  </div>
                  <div class="info-group">
                      <div class="info-label">Total Amount</div>
                      <div class="info-value">${formatCurrency(
                        order.total
                      )}</div>
                  </div>
                  <div class="info-group">
                      <div class="info-label">Payment Method</div>
                      <div class="info-value">${
                        order.paymentMethod || "Credit Card"
                      }</div>
                  </div>
              </div>
              <div class="customer-info">
                  <div class="info-group">
                      <div class="info-label">Customer</div>
                      <div class="info-value">${order.user.name}</div>
                  </div>
                  <div class="info-group">
                      <div class="info-label">Email</div>
                      <div class="info-value">${order.user.email}</div>
                  </div>
                  <div class="info-group">
                      <div class="info-label">Phone</div>
                      <div class="info-value">${order.user.phone || "N/A"}</div>
                  </div>
              </div>
              <div class="order-actions">
                  <button class="btn-outline view-details-btn" data-id="${
                    order.id
                  }">
                      <i class="fa-solid fa-eye"></i> View Details
                  </button>
                  ${
                    order.status.toLowerCase() === "pending"
                      ? `
                      <button class="btn-primary process-btn" data-id="${order.id}">
                          <i class="fa-solid fa-check"></i> Process
                      </button>
                  `
                      : ""
                  }
                  ${
                    order.status.toLowerCase() === "processing"
                      ? `
                      <button class="btn-warning ship-btn" data-id="${order.id}">
                          <i class="fa-solid fa-truck"></i> Ship
                      </button>
                  `
                      : ""
                  }
                  ${
                    order.status.toLowerCase() === "shipped"
                      ? `
                      <button class="btn-success deliver-btn" data-id="${order.id}">
                          <i class="fa-solid fa-check-circle"></i> Mark Delivered
                      </button>
                  `
                      : ""
                  }
                  ${
                    ["pending", "processing"].includes(
                      order.status.toLowerCase()
                    )
                      ? `
                      <button class="btn-danger cancel-btn" data-id="${order.id}">
                          <i class="fa-solid fa-ban"></i> Cancel
                      </button>
                  `
                      : ""
                  }
              </div>
          `;
      ordersContainer.appendChild(orderCard);
    });

    // Attach event listeners to buttons
    attachOrderActionListeners();
  };

  // Attach event listeners to order action buttons
  const attachOrderActionListeners = () => {
    // View details buttons
    const viewDetailsButtons = document.querySelectorAll(".view-details-btn");
    viewDetailsButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const orderId = btn.getAttribute("data-id");
        openOrderDetailsModal(orderId);
      });
    });

    // Process buttons
    const processButtons = document.querySelectorAll(".process-btn");
    processButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const orderId = btn.getAttribute("data-id");
        updateOrderStatus(orderId, "processing");
      });
    });

    // Ship buttons
    const shipButtons = document.querySelectorAll(".ship-btn");
    shipButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const orderId = btn.getAttribute("data-id");
        updateOrderStatus(orderId, "shipped");
      });
    });

    // Deliver buttons
    const deliverButtons = document.querySelectorAll(".deliver-btn");
    deliverButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const orderId = btn.getAttribute("data-id");
        updateOrderStatus(orderId, "delivered");
      });
    });

    // Cancel buttons
    const cancelButtons = document.querySelectorAll(".cancel-btn");
    cancelButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const orderId = btn.getAttribute("data-id");
        confirmCancelOrder(orderId);
      });
    });
  };

  // Open order details modal
  const openOrderDetailsModal = (orderId) => {
    const order = orders.find((o) => o.id.toString() === orderId.toString());
    if (!order) return;

    // Generate order details HTML
    orderDetailsContent.innerHTML = `
          <div class="order-details-section">
              <h3 class="section-title">Order Information</h3>
              <div class="details-grid">
                  <div class="detail-item">
                      <div class="detail-label">Order ID</div>
                      <div class="detail-value">#${order.id}</div>
                  </div>
                  <div class="detail-item">
                      <div class="detail-label">Date</div>
                      <div class="detail-value">${formatDate(
                        order.date || new Date()
                      )}</div>
                  </div>
                  <div class="detail-item">
                      <div class="detail-label">Status</div>
                      <div class="detail-value">
                          <span class="order-status ${getStatusClass(
                            order.status
                          )}">${order.status}</span>
                      </div>
                  </div>
                  <div class="detail-item">
                      <div class="detail-label">Payment Method</div>
                      <div class="detail-value">${
                        order.paymentMethod || "Credit Card"
                      }</div>
                  </div>
              </div>
          </div>

          <div class="order-details-section">
              <h3 class="section-title">Customer Information</h3>
              <div class="details-grid">
                  <div class="detail-item">
                      <div class="detail-label">Name</div>
                      <div class="detail-value">${order.user.name}</div>
                  </div>
                  <div class="detail-item">
                      <div class="detail-label">Email</div>
                      <div class="detail-value">${order.user.email}</div>
                  </div>
                  <div class="detail-item">
                      <div class="detail-label">Phone</div>
                      <div class="detail-value">${
                        order.user.phone || "N/A"
                      }</div>
                  </div>
                  <div class="detail-item">
                      <div class="detail-label">Address</div>
                      <div class="detail-value">${
                        order.user.address || "123 Main St, City, Country"
                      }</div>
                  </div>
              </div>
          </div>

          <div class="order-details-section">
              <h3 class="section-title">Order Items</h3>
              <table class="products-table">
                  <thead>
                      <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${
                        order.items
                          ? order.items
                              .map(
                                (item) => `
                          <tr>
                              <td>
                                  <div class="product-info">
                                      <img src="${
                                        item.image ||
                                        "/placeholder.svg?height=50&width=50"
                                      }" alt="${
                                  item.name
                                }" class="product-image">
                                      <span class="product-name">${
                                        item.name
                                      }</span>
                                  </div>
                              </td>
                              <td>${item.quantity}</td>
                              <td>${formatCurrency(item.price)}</td>
                              <td>${formatCurrency(
                                item.price * item.quantity
                              )}</td>
                          </tr>
                      `
                              )
                              .join("")
                          : `
                          <tr>
                              <td colspan="4">No items found</td>
                          </tr>
                      `
                      }
                  </tbody>
              </table>

              <div class="order-summary">
                  <div class="summary-item">
                      <span class="summary-label">Subtotal:</span>
                      <span class="summary-value">${formatCurrency(
                        order.subtotal || order.total * 0.9
                      )}</span>
                  </div>
                  <div class="summary-item">
                      <span class="summary-label">Shipping:</span>
                      <span class="summary-value">${formatCurrency(
                        order.shipping || 10
                      )}</span>
                  </div>
                  <div class="summary-item">
                      <span class="summary-label">Tax:</span>
                      <span class="summary-value">${formatCurrency(
                        order.tax || order.total * 0.1
                      )}</span>
                  </div>
                  <div class="summary-item">
                      <span class="summary-label summary-total">Total:</span>
                      <span class="summary-value summary-total">${formatCurrency(
                        order.total
                      )}</span>
                  </div>
              </div>
          </div>

          <div class="order-details-section">
              <h3 class="section-title">Order Timeline</h3>
              <div class="status-timeline">
                  <div class="timeline-line"></div>
                  <div class="timeline-item">
                      <div class="timeline-dot active"></div>
                      <div class="timeline-content">
                          <div class="timeline-date">${formatDate(
                            order.date || new Date()
                          )} at ${formatTime(order.date || new Date())}</div>
                          <div class="timeline-title">Order Placed</div>
                          <div class="timeline-description">Order was placed by customer</div>
                      </div>
                  </div>
                  <div class="timeline-item">
                      <div class="timeline-dot ${
                        order.status === "processing" ||
                        order.status === "shipped" ||
                        order.status === "delivered"
                          ? "active"
                          : "pending"
                      }"></div>
                      <div class="timeline-content">
                          <div class="timeline-date">${
                            order.processingDate
                              ? formatDate(order.processingDate) +
                                " at " +
                                formatTime(order.processingDate)
                              : "Pending"
                          }</div>
                          <div class="timeline-title">Processing</div>
                          <div class="timeline-description">Order is being processed</div>
                      </div>
                  </div>
                  <div class="timeline-item">
                      <div class="timeline-dot ${
                        order.status === "shipped" ||
                        order.status === "delivered"
                          ? "active"
                          : "pending"
                      }"></div>
                      <div class="timeline-content">
                          <div class="timeline-date">${
                            order.shippedDate
                              ? formatDate(order.shippedDate) +
                                " at " +
                                formatTime(order.shippedDate)
                              : "Pending"
                          }</div>
                          <div class="timeline-title">Shipped</div>
                          <div class="timeline-description">Order has been shipped</div>
                      </div>
                  </div>
                  <div class="timeline-item">
                      <div class="timeline-dot ${
                        order.status === "delivered" ? "active" : "pending"
                      }"></div>
                      <div class="timeline-content">
                          <div class="timeline-date">${
                            order.deliveredDate
                              ? formatDate(order.deliveredDate) +
                                " at " +
                                formatTime(order.deliveredDate)
                              : "Pending"
                          }</div>
                          <div class="timeline-title">Delivered</div>
                          <div class="timeline-description">Order has been delivered</div>
                      </div>
                  </div>
              </div>
          </div>

          <div class="modal-actions">
              ${
                order.status.toLowerCase() === "pending"
                  ? `
                  <button class="btn-primary process-modal-btn" data-id="${order.id}">
                      <i class="fa-solid fa-check"></i> Process Order
                  </button>
              `
                  : ""
              }
              ${
                order.status.toLowerCase() === "processing"
                  ? `
                  <button class="btn-warning ship-modal-btn" data-id="${order.id}">
                      <i class="fa-solid fa-truck"></i> Ship Order
                  </button>
              `
                  : ""
              }
              ${
                order.status.toLowerCase() === "shipped"
                  ? `
                  <button class="btn-success deliver-modal-btn" data-id="${order.id}">
                      <i class="fa-solid fa-check-circle"></i> Mark as Delivered
                  </button>
              `
                  : ""
              }
              ${
                ["pending", "processing"].includes(order.status.toLowerCase())
                  ? `
                  <button class="btn-danger cancel-modal-btn" data-id="${order.id}">
                      <i class="fa-solid fa-ban"></i> Cancel Order
                  </button>
              `
                  : ""
              }
          </div>
      `;

    // Show modal
    orderDetailsModal.classList.add("active");

    // Attach event listeners to modal buttons
    const processModalBtn =
      orderDetailsContent.querySelector(".process-modal-btn");
    if (processModalBtn) {
      processModalBtn.addEventListener("click", () => {
        const orderId = processModalBtn.getAttribute("data-id");
        updateOrderStatus(orderId, "processing");
        orderDetailsModal.classList.remove("active");
      });
    }

    const shipModalBtn = orderDetailsContent.querySelector(".ship-modal-btn");
    if (shipModalBtn) {
      shipModalBtn.addEventListener("click", () => {
        const orderId = shipModalBtn.getAttribute("data-id");
        updateOrderStatus(orderId, "shipped");
        orderDetailsModal.classList.remove("active");
      });
    }

    const deliverModalBtn =
      orderDetailsContent.querySelector(".deliver-modal-btn");
    if (deliverModalBtn) {
      deliverModalBtn.addEventListener("click", () => {
        const orderId = deliverModalBtn.getAttribute("data-id");
        updateOrderStatus(orderId, "delivered");
        orderDetailsModal.classList.remove("active");
      });
    }

    const cancelModalBtn =
      orderDetailsContent.querySelector(".cancel-modal-btn");
    if (cancelModalBtn) {
      cancelModalBtn.addEventListener("click", () => {
        const orderId = cancelModalBtn.getAttribute("data-id");
        confirmCancelOrder(orderId);
        orderDetailsModal.classList.remove("active");
      });
    }
  };

  // Close modal
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      orderDetailsModal.classList.remove("active");
    });
  }

  // Close modal when clicking outside
  orderDetailsModal.addEventListener("click", (event) => {
    if (event.target === orderDetailsModal) {
      orderDetailsModal.classList.remove("active");
    }
  });

  // Confirm cancel order
  const confirmCancelOrder = (orderId) => {
    // SweetAlert confirmation
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        updateOrderStatus(orderId, "cancelled");
      }
    });
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // In a real app, you would make an API call here
      // For demo purposes, we'll just update the local data
      const orderIndex = orders.findIndex(
        (o) => o.id.toString() === orderId.toString()
      );
      if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;

        // Add timestamp for status change
        const now = new Date();
        if (newStatus === "processing") {
          orders[orderIndex].processingDate = now;
        } else if (newStatus === "shipped") {
          orders[orderIndex].shippedDate = now;
        } else if (newStatus === "delivered") {
          orders[orderIndex].deliveredDate = now;
        }

        // Update local storage for demo purposes
        localStorage.setItem("orders", JSON.stringify(orders));

        // Apply filters and render
        applyFilters();

        // Show success toast
        showToast(
          "success",
          "Status Updated",
          `Order #${orderId} has been ${newStatus}`
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      showToast("error", "Error", "Failed to update order status");
    }
  };

  // Delete order (for cancel functionality)
  const deleteOrder = async (orderId) => {
    try {
      // In a real app, you would make an API call here
      // For demo purposes, we'll just update the local data
      const orderIndex = orders.findIndex(
        (o) => o.id.toString() === orderId.toString()
      );
      if (orderIndex !== -1) {
        orders[orderIndex].status = "cancelled";

        // Update local storage for demo purposes
        localStorage.setItem("orders", JSON.stringify(orders));

        // Apply filters and render
        applyFilters();

        // Show success toast
        showToast(
          "success",
          "Order Cancelled",
          `Order #${orderId} has been cancelled`
        );
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      showToast("error", "Error", "Failed to cancel order");
    }
  };

  // Show toast notification
  const showToast = (type, title, message) => {
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
    const status = statusFilter.value;
    const date = dateFilter.value;
    const sort = sortFilter.value;
    const search = orderSearch.value.toLowerCase();

    // Filter by status
    filteredOrders = orders.filter((order) => {
      if (status === "all") return true;
      return order.status.toLowerCase() === status;
    });

    // Filter by date
    if (date !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisYearStart = new Date(now.getFullYear(), 0, 1);

      filteredOrders = filteredOrders.filter((order) => {
        const orderDate = new Date(order.date || new Date());
        if (date === "today") {
          return orderDate >= today;
        } else if (date === "week") {
          return orderDate >= thisWeekStart;
        } else if (date === "month") {
          return orderDate >= thisMonthStart;
        } else if (date === "year") {
          return orderDate >= thisYearStart;
        }
        return true;
      });
    }

    // Filter by search
    if (search) {
      filteredOrders = filteredOrders.filter((order) => {
        return (
          order.id.toString().includes(search) ||
          order.user.name.toLowerCase().includes(search) ||
          order.user.email.toLowerCase().includes(search) ||
          (order.user.phone && order.user.phone.toLowerCase().includes(search))
        );
      });
    }

    // Sort orders
    filteredOrders.sort((a, b) => {
      if (sort === "date-desc") {
        return new Date(b.date || 0) - new Date(a.date || 0);
      } else if (sort === "date-asc") {
        return new Date(a.date || 0) - new Date(b.date || 0);
      } else if (sort === "total-desc") {
        return b.total - a.total;
      } else if (sort === "total-asc") {
        return a.total - b.total;
      }
      return 0;
    });

    // Reset to first page
    currentPage = 1;

    // Update stats
    updateStats();

    // Render orders
    renderOrders();
  };

  // Update order stats
  const updateStats = () => {
    const pendingCount = orders.filter(
      (o) => o.status.toLowerCase() === "pending"
    ).length;
    const processingCount = orders.filter(
      (o) => o.status.toLowerCase() === "processing"
    ).length;
    const shippedCount = orders.filter(
      (o) => o.status.toLowerCase() === "shipped"
    ).length;
    const deliveredCount = orders.filter(
      (o) => o.status.toLowerCase() === "delivered"
    ).length;
    const cancelledCount = orders.filter(
      (o) => o.status.toLowerCase() === "cancelled"
    ).length;

    pendingCountEl.textContent = pendingCount;
    processingCountEl.textContent = processingCount;
    shippedCountEl.textContent = shippedCount;
    deliveredCountEl.textContent = deliveredCount;
    cancelledCountEl.textContent = cancelledCount;
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      // In a real app, you would fetch from an API
      // For demo purposes, we'll use localStorage or create sample data
      let storedOrders = localStorage.getItem("orders");

      if (!storedOrders) {
        // Create sample orders
        const sampleOrders = [
          {
            id: 1001,
            date: new Date(2023, 4, 15),
            status: "pending",
            total: 129.99,
            paymentMethod: "Credit Card",
            user: {
              name: "John Doe",
              email: "john@example.com",
              phone: "555-123-4567",
              address: "123 Main St, New York, NY 10001",
            },
            items: [
              {
                name: "Wireless Headphones",
                price: 79.99,
                quantity: 1,
                image: "/placeholder.svg?height=50&width=50",
              },
              {
                name: "Phone Case",
                price: 24.99,
                quantity: 2,
                image: "/placeholder.svg?height=50&width=50",
              },
            ],
          },
          {
            id: 1002,
            date: new Date(2023, 4, 14),
            status: "processing",
            processingDate: new Date(2023, 4, 14, 15, 30),
            total: 349.95,
            paymentMethod: "PayPal",
            user: {
              name: "Jane Smith",
              email: "jane@example.com",
              phone: "555-987-6543",
              address: "456 Oak Ave, Los Angeles, CA 90001",
            },
            items: [
              {
                name: "Smart Watch",
                price: 249.99,
                quantity: 1,
                image: "/placeholder.svg?height=50&width=50",
              },
              {
                name: "Watch Band",
                price: 49.99,
                quantity: 2,
                image: "/placeholder.svg?height=50&width=50",
              },
            ],
          },
          {
            id: 1003,
            date: new Date(2023, 4, 13),
            status: "shipped",
            processingDate: new Date(2023, 4, 13, 10, 15),
            shippedDate: new Date(2023, 4, 14, 9, 30),
            total: 599.99,
            paymentMethod: "Credit Card",
            user: {
              name: "Robert Johnson",
              email: "robert@example.com",
              phone: "555-456-7890",
              address: "789 Pine St, Chicago, IL 60007",
            },
            items: [
              {
                name: "Laptop",
                price: 599.99,
                quantity: 1,
                image: "/placeholder.svg?height=50&width=50",
              },
            ],
          },
          {
            id: 1004,
            date: new Date(2023, 4, 10),
            status: "delivered",
            processingDate: new Date(2023, 4, 10, 14, 20),
            shippedDate: new Date(2023, 4, 11, 9, 0),
            deliveredDate: new Date(2023, 4, 13, 15, 45),
            total: 49.99,
            paymentMethod: "PayPal",
            user: {
              name: "Emily Davis",
              email: "emily@example.com",
              phone: "555-789-0123",
              address: "321 Maple Rd, Houston, TX 77001",
            },
            items: [
              {
                name: "Bluetooth Speaker",
                price: 49.99,
                quantity: 1,
                image: "/placeholder.svg?height=50&width=50",
              },
            ],
          },
          {
            id: 1005,
            date: new Date(2023, 4, 9),
            status: "cancelled",
            total: 129.97,
            paymentMethod: "Credit Card",
            user: {
              name: "Michael Wilson",
              email: "michael@example.com",
              phone: "555-321-6547",
              address: "654 Elm St, Miami, FL 33101",
            },
            items: [
              {
                name: "Wireless Mouse",
                price: 29.99,
                quantity: 1,
                image: "/placeholder.svg?height=50&width=50",
              },
              {
                name: "Keyboard",
                price: 49.99,
                quantity: 2,
                image: "/placeholder.svg?height=50&width=50",
              },
            ],
          },
        ];

        // Save to localStorage
        localStorage.setItem("orders", JSON.stringify(sampleOrders));
        orders = sampleOrders;
      } else {
        orders = JSON.parse(storedOrders);
      }

      // Apply filters
      applyFilters();
    } catch (error) {
      console.error("Error fetching orders:", error);
      showToast("error", "Error", "Failed to load orders");
    }
  };

  // Event listeners for filters
  if (statusFilter) {
    statusFilter.addEventListener("change", applyFilters);
  }

  if (dateFilter) {
    dateFilter.addEventListener("change", applyFilters);
  }

  if (sortFilter) {
    sortFilter.addEventListener("change", applyFilters);
  }

  if (orderSearch) {
    orderSearch.addEventListener("input", applyFilters);
  }

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
      statusFilter.value = "all";
      dateFilter.value = "all";
      sortFilter.value = "date-desc";
      orderSearch.value = "";
      applyFilters();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      fetchOrders();
      showToast("info", "Refreshed", "Order list has been refreshed");
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      // In a real app, you would generate a CSV or PDF
      showToast("info", "Export", "Orders exported successfully");
    });
  }

  // Pagination
  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderOrders();
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderOrders();
      }
    });
  }

  // Initialize
  if (checkAuth()) {
    fetchOrders();
  }
});
