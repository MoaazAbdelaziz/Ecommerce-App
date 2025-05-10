document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const sidebar = document.getElementById("sidebar");
  const toggleSidebarBtn = document.getElementById("toggle-sidebar");
  const mobileSidebarToggle = document.getElementById("mobile-sidebar-toggle");
  const logoutBtn = document.getElementById("logout-btn");
  const dashboardContainer = document.querySelector(".dashboard-container");
  const productsContainer = document.getElementById("products-container");
  const emptyState = document.getElementById("empty-state");
  const resetFiltersBtn = document.getElementById("reset-filters");
  const statusFilter = document.getElementById("status-filter");
  const categoryFilter = document.getElementById("category-filter");
  const sellerFilter = document.getElementById("seller-filter");
  const sortFilter = document.getElementById("sort-filter");
  const productSearch = document.getElementById("product-search");
  const refreshBtn = document.getElementById("refresh-btn");
  const exportBtn = document.getElementById("export-btn");
  const addProductBtn = document.getElementById("add-product-btn");
  const notificationsBtn = document.getElementById("notifications-btn");
  const notificationsDropdown = document.getElementById(
    "notifications-dropdown"
  );
  const productDetailsModal = document.getElementById("product-details-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const productForm = document.getElementById("product-form");
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
  const viewButtons = document.querySelectorAll(".view-btn");
  const userNameElement = document.getElementById("user-name");
  const userEmailElement = document.getElementById("user-email");
  const userAvatarElement = document.getElementById("user-avatar");
  const headerAvatarElement = document.getElementById("header-avatar");
  const imagePreview = document.getElementById("image-preview");
  const productImageInput = document.getElementById("product-image");

  // Stats counters
  const totalCountEl = document.getElementById("total-count");
  const approvedCountEl = document.getElementById("approved-count");
  const pendingCountEl = document.getElementById("pending-count");
  const lowStockCountEl = document.getElementById("low-stock-count");

  // API URL - change this to your JSON server URL
  const API_URL = "http://localhost:3000";

  // State
  let products = [];
  let sellers = [];
  let filteredProducts = [];
  let currentPage = 1;
  let itemsPerPage = 8;
  let totalPages = 1;
  let currentAction = null;
  let selectedProductId = null;
  let viewMode = "grid";
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

  // Toggle view mode
  if (viewButtons) {
    viewButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.getAttribute("data-view");
        viewMode = mode;

        // Update active button
        viewButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        // Update container class
        productsContainer.className = `products-container ${mode}-view`;

        // Re-render products
        renderProducts();
      });
    });
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

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

  // Render products
  const renderProducts = () => {
    if (filteredProducts.length === 0) {
      productsContainer.style.display = "none";
      emptyState.style.display = "flex";
      return;
    }

    productsContainer.style.display = viewMode === "grid" ? "grid" : "flex";
    emptyState.style.display = "none";

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Update pagination UI
    totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    currentPageEl.textContent = currentPage;
    totalPagesEl.textContent = totalPages;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    // Clear container
    productsContainer.innerHTML = "";

    // Render products
    paginatedProducts.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = "product-card";
      productCard.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.imageUrl}" alt="${
        product.title
      }" class="product-image">
                    <span class="product-status ${
                      product.approved ? "status-approved" : "status-pending"
                    }">
                        ${product.approved ? "Approved" : "Pending"}
                    </span>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${truncateText(
                      product.title,
                      50
                    )}</h3>
                    <p class="product-category">${product.category}</p>
                    <p class="product-price">${formatCurrency(
                      product.price
                    )}</p>
                    <div class="product-meta">
                        <span class="product-quantity ${
                          product.quantity < 10 ? "quantity-low" : ""
                        }">
                            <i class="fa-solid fa-cubes"></i> ${
                              product.quantity
                            } in stock
                        </span>
                        <span>ID: #${product.id}</span>
                    </div>
                    <p class="product-seller">
                        <i class="fa-solid fa-user"></i> ${
                          product.seller
                            ? product.seller.name
                            : "Unknown Seller"
                        }
                    </p>
                    <p class="product-description">${truncateText(
                      product.description,
                      100
                    )}</p>
                    <div class="product-actions">
                        <button class="btn-edit" data-id="${product.id}">
                            <i class="fa-solid fa-edit"></i> Edit
                        </button>
                        <button class="btn-delete" data-id="${product.id}">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                        ${
                          !product.approved
                            ? `<button class="btn-approve" data-id="${product.id}">
                                <i class="fa-solid fa-check"></i> Approve
                            </button>`
                            : `<button class="btn-reject" data-id="${product.id}">
                                <i class="fa-solid fa-ban"></i> Reject
                            </button>`
                        }
                    </div>
                </div>
            `;
      productsContainer.appendChild(productCard);
    });

    // Attach event listeners to buttons
    attachProductActionListeners();
  };

  // Attach event listeners to product action buttons
  const attachProductActionListeners = () => {
    // Edit buttons
    const editButtons = document.querySelectorAll(".btn-edit");
    editButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.getAttribute("data-id");
        openProductModal("edit", productId);
      });
    });

    // Delete buttons
    const deleteButtons = document.querySelectorAll(".btn-delete");
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.getAttribute("data-id");
        openConfirmationModal("delete", productId);
      });
    });

    // Approve buttons
    const approveButtons = document.querySelectorAll(".btn-approve");
    approveButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.getAttribute("data-id");
        openConfirmationModal("approve", productId);
      });
    });

    // Reject buttons
    const rejectButtons = document.querySelectorAll(".btn-reject");
    rejectButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.getAttribute("data-id");
        openConfirmationModal("reject", productId);
      });
    });
  };

  // Open product modal
  const openProductModal = (action, productId = null) => {
    // Reset form
    productForm.reset();
    imagePreview.src = "./placeholder200x150.svg";

    if (action === "add") {
      modalTitle.textContent = "Add New Product";
      saveBtn.textContent = "Add Product";
    } else {
      modalTitle.textContent = "Edit Product";
      saveBtn.textContent = "Update Product";

      // Fill form with product data
      const product = products.find(
        (p) => p.id.toString() === productId.toString()
      );
      if (product) {
        productForm.elements.title.value = product.title;
        productForm.elements.category.value = product.category;
        productForm.elements.price.value = product.price;
        productForm.elements.quantity.value = product.quantity;
        productForm.elements.description.value = product.description;
        productForm.elements.imageUrl.value = product.imageUrl;
        productForm.elements.approved.value = product.approved.toString();
        imagePreview.src = product.imageUrl;
      }
    }

    // Store current action and product ID
    currentAction = action;
    selectedProductId = productId;

    // Show modal
    productDetailsModal.classList.add("active");
  };

  // Open confirmation modal
  const openConfirmationModal = (action, productId) => {
    const product = products.find(
      (p) => p.id.toString() === productId.toString()
    );
    if (!product) return;

    currentAction = action;
    selectedProductId = productId;

    if (action === "delete") {
      confirmationTitle.textContent = "Confirm Delete";
      confirmationMessage.textContent = `Are you sure you want to delete the product "${truncateText(
        product.title,
        30
      )}"?`;
      confirmActionBtn.textContent = "Delete";
      confirmActionBtn.className = "btn-danger";
    } else if (action === "approve") {
      confirmationTitle.textContent = "Confirm Approval";
      confirmationMessage.textContent = `Are you sure you want to approve the product "${truncateText(
        product.title,
        30
      )}"?`;
      confirmActionBtn.textContent = "Approve";
      confirmActionBtn.className = "btn-primary";
    } else if (action === "reject") {
      confirmationTitle.textContent = "Confirm Rejection";
      confirmationMessage.textContent = `Are you sure you want to reject the product "${truncateText(
        product.title,
        30
      )}"?`;
      confirmActionBtn.textContent = "Reject";
      confirmActionBtn.className = "btn-danger";
    }

    confirmationModal.classList.add("active");
  };

  // Close modal
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      productDetailsModal.classList.remove("active");
    });
  }

  // Close confirmation modal
  if (closeConfirmationBtn) {
    closeConfirmationBtn.addEventListener("click", () => {
      confirmationModal.classList.remove("active");
    });
  }

  // Cancel button in product modal
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      productDetailsModal.classList.remove("active");
    });
  }

  // Cancel button in confirmation modal
  if (cancelConfirmationBtn) {
    cancelConfirmationBtn.addEventListener("click", () => {
      confirmationModal.classList.remove("active");
    });
  }

  // Close modals when clicking outside
  productDetailsModal.addEventListener("click", (event) => {
    if (event.target === productDetailsModal) {
      productDetailsModal.classList.remove("active");
    }
  });

  confirmationModal.addEventListener("click", (event) => {
    if (event.target === confirmationModal) {
      confirmationModal.classList.remove("active");
    }
  });

  // Confirm action button
  if (confirmActionBtn) {
    confirmActionBtn.addEventListener("click", async () => {
      try {
        if (currentAction === "delete") {
          await deleteProduct(selectedProductId);
          showToast(
            "success",
            "Product Deleted",
            "The product has been deleted successfully"
          );
        } else if (currentAction === "approve") {
          await updateProductStatus(selectedProductId, true);
          showToast(
            "success",
            "Product Approved",
            "The product has been approved successfully"
          );
        } else if (currentAction === "reject") {
          await updateProductStatus(selectedProductId, false);
          showToast(
            "success",
            "Product Rejected",
            "The product has been rejected successfully"
          );
        }

        // Refresh products
        await fetchProducts();

        // Close modal
        confirmationModal.classList.remove("active");
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

  // Product form submission
  if (productForm) {
    productForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        const productData = {
          title: productForm.elements.title.value,
          category: productForm.elements.category.value,
          price: productForm.elements.price.value,
          description: productForm.elements.description.value,
          imageUrl: productForm.elements.imageUrl.value,
          quantity: productForm.elements.quantity.value,
          approved: productForm.elements.approved.value === "true",
        };

        if (currentAction === "add") {
          // Add seller information
          productData.seller = {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
          };

          await addProduct(productData);
          showToast(
            "success",
            "Product Added",
            "The product has been added successfully"
          );
        } else if (currentAction === "edit") {
          await updateProduct(selectedProductId, productData);
          showToast(
            "success",
            "Product Updated",
            "The product has been updated successfully"
          );
        }

        // Refresh products
        await fetchProducts();

        // Close modal
        productDetailsModal.classList.remove("active");
      } catch (error) {
        console.error("Error saving product:", error);
        showToast(
          "error",
          "Error",
          "An error occurred while saving the product"
        );
      }
    });
  }

  // Image URL preview
  if (productImageInput) {
    productImageInput.addEventListener("input", () => {
      const url = productImageInput.value;
      if (url) {
        imagePreview.src = url;
      } else {
        imagePreview.src = "./placeholder200x150.svg";
      }
    });

    // Handle image load error
    imagePreview.addEventListener("error", () => {
      imagePreview.src = "./placeholder200x150.svg";
    });
  }

  // Add product
  const addProduct = async (productData) => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  };

  // Update product
  const updateProduct = async (productId, productData) => {
    try {
      // Get the current product to preserve seller info
      const currentProduct = products.find(
        (p) => p.id.toString() === productId.toString()
      );
      if (!currentProduct) {
        throw new Error("Product not found");
      }

      // Merge the updated data with the current product
      const updatedProduct = {
        ...currentProduct,
        ...productData,
      };

      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  };

  // Delete product
  const deleteProduct = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      // Also delete any reviews for this product
      const reviewsResponse = await fetch(
        `${API_URL}/reviews?productId=${productId}`
      );
      const reviews = await reviewsResponse.json();

      for (const review of reviews) {
        await fetch(`${API_URL}/reviews/${review.id}`, {
          method: "DELETE",
        });
      }

      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  };

  // Update product status (approve/reject)
  const updateProductStatus = async (productId, approved) => {
    try {
      const product = products.find(
        (p) => p.id.toString() === productId.toString()
      );
      if (!product) {
        throw new Error("Product not found");
      }

      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved }),
      });

      if (!response.ok) {
        throw new Error("Failed to update product status");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating product status:", error);
      throw error;
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
    const category = categoryFilter.value;
    const seller = sellerFilter.value;
    const sort = sortFilter.value;
    const search = productSearch.value.toLowerCase();

    // Filter by status
    filteredProducts = products.filter((product) => {
      if (status === "all") return true;
      if (status === "approved") return product.approved;
      if (status === "not approved") return !product.approved;
      return true;
    });

    // Filter by category
    if (category !== "all") {
      filteredProducts = filteredProducts.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by seller
    if (seller !== "all") {
      filteredProducts = filteredProducts.filter(
        (product) => product.seller && product.seller.id === seller
      );
    }

    // Filter by search
    if (search) {
      filteredProducts = filteredProducts.filter((product) => {
        return (
          product.title.toLowerCase().includes(search) ||
          product.category.toLowerCase().includes(search) ||
          product.description.toLowerCase().includes(search) ||
          (product.seller && product.seller.name.toLowerCase().includes(search))
        );
      });
    }

    // Sort products
    filteredProducts.sort((a, b) => {
      if (sort === "title-asc") {
        return a.title.localeCompare(b.title);
      } else if (sort === "title-desc") {
        return b.title.localeCompare(a.title);
      } else if (sort === "price-high") {
        return parseFloat(b.price) - parseFloat(a.price);
      } else if (sort === "price-low") {
        return parseFloat(a.price) - parseFloat(b.price);
      } else if (sort === "quantity-high") {
        return parseInt(b.quantity) - parseInt(a.quantity);
      } else if (sort === "quantity-low") {
        return parseInt(a.quantity) - parseInt(b.quantity);
      }
      return 0;
    });

    // Reset to first page
    currentPage = 1;

    // Update stats
    updateStats();

    // Render products
    renderProducts();
  };

  // Update product stats
  const updateStats = () => {
    const totalCount = products.length;
    const approvedCount = products.filter((p) => p.approved).length;
    const pendingCount = products.filter((p) => !p.approved).length;
    const lowStockCount = products.filter(
      (p) => parseInt(p.quantity) < 10
    ).length;

    totalCountEl.textContent = totalCount;
    approvedCountEl.textContent = approvedCount;
    pendingCountEl.textContent = pendingCount;
    lowStockCountEl.textContent = lowStockCount;
  };

  // Populate seller filter
  const populateSellerFilter = () => {
    // Clear existing options except the first one
    while (sellerFilter.options.length > 1) {
      sellerFilter.remove(1);
    }

    // Add seller options
    sellers.forEach((seller) => {
      const option = document.createElement("option");
      option.value = seller.id;
      option.textContent = seller.name;
      sellerFilter.appendChild(option);
    });
  };

  // Populate category filter
  const populateCategoryFilter = () => {
    // Get unique categories
    const categories = [...new Set(products.map((p) => p.category))].filter(
      Boolean
    );

    // Clear existing options except the first one
    while (categoryFilter.options.length > 1) {
      categoryFilter.remove(1);
    }

    // Add category options
    categories.sort().forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  };

  // Fetch sellers
  const fetchSellers = async () => {
    try {
      const response = await fetch(`${API_URL}/users?role=seller`);
      if (!response.ok) {
        throw new Error("Failed to fetch sellers");
      }

      sellers = await response.json();
      populateSellerFilter();
    } catch (error) {
      console.error("Error fetching sellers:", error);
      showToast("error", "Error", "Failed to load sellers");
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      productsContainer.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Loading products...</p>
                </div>
            `;

      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      products = await response.json();

      // Populate category filter
      populateCategoryFilter();

      // Apply filters
      applyFilters();
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast("error", "Error", "Failed to load products");

      productsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fa-solid fa-exclamation-triangle"></i>
                    </div>
                    <h3>Error Loading Products</h3>
                    <p>There was an error loading the products. Please try again later.</p>
                    <button id="retry-btn" class="btn-primary">Retry</button>
                </div>
            `;

      const retryBtn = document.getElementById("retry-btn");
      if (retryBtn) {
        retryBtn.addEventListener("click", fetchProducts);
      }
    }
  };

  // Event listeners for filters
  if (statusFilter) {
    statusFilter.addEventListener("change", applyFilters);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", applyFilters);
  }

  if (sellerFilter) {
    sellerFilter.addEventListener("change", applyFilters);
  }

  if (sortFilter) {
    sortFilter.addEventListener("change", applyFilters);
  }

  if (productSearch) {
    productSearch.addEventListener("input", applyFilters);
  }

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
      statusFilter.value = "all";
      categoryFilter.value = "all";
      sellerFilter.value = "all";
      sortFilter.value = "price-low";
      productSearch.value = "";
      applyFilters();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      await fetchProducts();
      showToast("info", "Refreshed", "Product list has been refreshed");
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "ID,Title,Category,Price,Quantity,Status,Seller\n";

      filteredProducts.forEach((product) => {
        const row = [
          product.id,
          `"${product.title.replace(/"/g, '""')}"`,
          `"${product.category}"`,
          product.price,
          product.quantity,
          product.approved ? "Approved" : "Not Approved",
          `"${product.seller ? product.seller.name : "Unknown"}"`,
        ];
        csvContent += row.join(",") + "\n";
      });

      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `products_export_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);

      // Trigger download
      link.click();
      document.body.removeChild(link);

      showToast(
        "success",
        "Export Complete",
        "Products have been exported to CSV"
      );
    });
  }

  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => {
      openProductModal("add");
    });
  }

  // Pagination
  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderProducts();
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderProducts();
      }
    });
  }

  // Initialize
  if (checkAuth()) {
    fetchSellers();
    fetchProducts();
  }
});
