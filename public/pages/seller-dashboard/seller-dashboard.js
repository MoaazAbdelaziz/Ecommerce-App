document.addEventListener("DOMContentLoaded", function () {
  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // Check if user is logged in and is a seller
  if (!user) {
    window.location.href = "./../auth/auth.html";
    console.log("User not logged in. Redirecting to login page.");
    return;
  } else if (user.role !== "seller") {
    window.location.href = "./../home/home.html";
    console.log("User is not a seller. Redirecting to home page.");
    return;
  }

  // Update user name in the navbar
  if (document.getElementById("user-name")) {
    document.getElementById("user-name").textContent = user.name || "Seller";
  }

  // DOM Elements - Sidebar and Navigation
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const menuToggle = document.getElementById("menu-toggle");
  const pageTitle = document.querySelector(".page-title");
  const sections = document.querySelectorAll("main section");

  // DOM Elements - Product Management
  const productGrid = document.getElementById("product-grid");
  const productForm = document.getElementById("product-form");
  const productSearch = document.getElementById("product-search");
  const categoryFilter = document.getElementById("category-filter");
  const statusFilter = document.getElementById("status-filter");
  const sortFilter = document.getElementById("sort-filter");

  // DOM Elements - Product Form
  const formTitle = document.getElementById("form-title");
  const submitBtn = document.getElementById("submit-btn");
  const updateBtn = document.getElementById("update-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const backToProductsBtn = document.getElementById("back-to-products-btn");
  const addProductBtn = document.getElementById("add-product-btn");
  const imagePreviewBtn = document.getElementById("image-preview-btn");

  // DOM Elements - Product Preview
  const previewImg = document.getElementById("preview-img");
  const previewTitle = document.getElementById("preview-title");
  const previewPrice = document.getElementById("preview-price");
  const previewCategory = document.getElementById("preview-category");
  const previewDescription = document.getElementById("preview-description");

  // DOM Elements - Orders
  const ordersContainer = document.getElementById("orders-container");
  const orderStatusFilter = document.getElementById("order-status-filter");
  const orderDateFilter = document.getElementById("order-date-filter");
  const recentOrdersList = document.getElementById("recent-orders-list");

  // DOM Elements - Dashboard Stats
  const topProductsList = document.getElementById("top-products-list");
  const productCount = document.getElementById("product-count");
  const orderCount = document.getElementById("order-count");
  const revenue = document.getElementById("revenue");
  const customerCount = document.getElementById("customer-count");

  // Navigation Links
  const dashboardLink = document.getElementById("dashboard-link");
  const productListLink = document.getElementById("product-list-link");
  const newProductLink = document.getElementById("new-product-link");
  const viewOrdersLink = document.getElementById("view-orders-link");
  const analyticsLink = document.getElementById("analytics-link");
  const settingsLink = document.getElementById("settings-link");
  const viewAllOrdersLink = document.getElementById("view-all-orders");
  const viewAllProductsLink = document.getElementById("view-all-products");
  const logoutBtn = document.getElementById("logout-btn");

  // Submenu Items
  const menu = document.querySelector(".menu-content");
  const menuItems = document.querySelectorAll(".submenu-item");
  const subMenuTitles = document.querySelectorAll(".submenu .menu-title");
  const submenuItems = document.querySelectorAll(".submenu-item");
  const backLinks = document.querySelectorAll(".back-link");

  // Variables
  let products = [];
  let orders = [];
  let currentEditProductId = null;

  // Initialize the dashboard
  initializeDashboard();

  // ===== EVENT LISTENERS =====

  // Sidebar Navigation
  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      sidebar.classList.toggle("active");
    });
  }

  // Legacy Sidebar Navigation
  menuItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      menu.classList.add("submenu-active");
      item.classList.add("show-submenu");
      menuItems.forEach((item2, index2) => {
        if (index !== index2) item2.classList.remove("show-submenu");
      });
    });
  });

  subMenuTitles.forEach((title) => {
    title.addEventListener("click", () => {
      menu.classList.remove("submenu-active");
    });
  });

  // Submenu toggle
  submenuItems.forEach((item) => {
    item.addEventListener("click", function () {
      const parent = this.parentElement;
      parent.classList.toggle("active");
    });
  });

  // Back to main menu
  backLinks.forEach((link) => {
    link.addEventListener("click", function () {
      const submenu = this.closest(".submenu");
      const parent = submenu.parentElement;
      parent.classList.remove("active");
    });
  });

  // Navigation Links
  if (dashboardLink) {
    dashboardLink.addEventListener("click", function (e) {
      e.preventDefault();
      showSection("dashboard-section", "Dashboard");
    });
  }

  if (productListLink) {
    productListLink.addEventListener("click", function (e) {
      e.preventDefault();
      showSection("product-list-section", "Product Management");
    });
  }

  if (newProductLink) {
    newProductLink.addEventListener("click", function (e) {
      e.preventDefault();
      resetProductForm();
      showSection("product-form-section", "Add New Product");
    });
  }

  if (viewOrdersLink) {
    viewOrdersLink.addEventListener("click", function (e) {
      e.preventDefault();
      showSection("orders-section", "Order Management");
    });
  }

  if (analyticsLink) {
    analyticsLink.addEventListener("click", function (e) {
      e.preventDefault();
      showSection("analytics-section", "Analytics & Reports");
    });
  }

  if (settingsLink) {
    settingsLink.addEventListener("click", function (e) {
      e.preventDefault();
      showSection("settings-section", "Account Settings");
    });
  }

  if (viewAllOrdersLink) {
    viewAllOrdersLink.addEventListener("click", function (e) {
      e.preventDefault();
      showSection("orders-section", "Order Management");
    });
  }

  if (viewAllProductsLink) {
    viewAllProductsLink.addEventListener("click", function (e) {
      e.preventDefault();
      showSection("product-list-section", "Product Management");
    });
  }

  // Logout Button
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      confirmLogout();
    });
  }

  // Product Form Actions
  if (addProductBtn) {
    addProductBtn.addEventListener("click", function () {
      resetProductForm();
      showSection("product-form-section", "Add New Product");
    });
  }

  if (backToProductsBtn) {
    backToProductsBtn.addEventListener("click", function () {
      showSection("product-list-section", "Product Management");
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      showSection("product-list-section", "Product Management");
    });
  }

  if (productForm) {
    productForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (currentEditProductId) {
        updateProduct();
      } else {
        addNewProduct();
      }
    });
  }

  if (updateBtn) {
    updateBtn.addEventListener("click", function (e) {
      e.preventDefault();
      updateProduct();
    });
  }

  // Image Preview
  if (imagePreviewBtn) {
    imagePreviewBtn.addEventListener("click", function () {
      const imageUrl = document.getElementById("imageUrl").value;
      if (imageUrl && previewImg) {
        previewImg.src = imageUrl;
      }
    });
  }

  // Live Preview for Product Form
  if (document.getElementById("title")) {
    document.getElementById("title").addEventListener("input", updatePreview);
  }

  if (document.getElementById("price")) {
    document.getElementById("price").addEventListener("input", updatePreview);
  }

  if (document.getElementById("category")) {
    document
      .getElementById("category")
      .addEventListener("input", updatePreview);
  }

  if (document.getElementById("description")) {
    document
      .getElementById("description")
      .addEventListener("input", updatePreview);
  }

  if (document.getElementById("imageUrl")) {
    document.getElementById("imageUrl").addEventListener("input", function () {
      const imageUrl = this.value;
      if (imageUrl && previewImg) {
        previewImg.src = imageUrl;
      }
      updatePreview();
    });
  }

  // Search and Filters
  if (productSearch) {
    productSearch.addEventListener("input", function () {
      filterProducts();
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterProducts);
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", filterProducts);
  }

  if (sortFilter) {
    sortFilter.addEventListener("change", filterProducts);
  }

  if (orderStatusFilter) {
    orderStatusFilter.addEventListener("change", filterOrders);
  }

  if (orderDateFilter) {
    orderDateFilter.addEventListener("change", filterOrders);
  }

  // ===== FUNCTIONS =====

  function initializeDashboard() {
    // Fetch products
    fetchProducts();

    // Fetch orders
    fetchOrders();

    // Show product list section by default instead of dashboard
    if (document.getElementById("product-list-section")) {
      showSection("product-list-section", "Product Management");

      // Also update the active link in the sidebar
      if (productListLink) {
        document.querySelectorAll(".menu-link").forEach((link) => {
          link.classList.remove("active");
        });
        productListLink.classList.add("active");

        // Expand the Product Management submenu
        const productManagementItem =
          productListLink.closest(".submenu").parentElement;
        if (productManagementItem) {
          productManagementItem.classList.add("active");
          productManagementItem
            .querySelector(".submenu-item")
            .classList.add("show-submenu");
          menu.classList.add("submenu-active");
        }
      }
    }
  }

  function showSection(sectionId, title) {
    // Check if we're using the new UI
    if (!sections || sections.length === 0) {
      // Legacy UI handling
      return;
    }

    // Hide all sections
    sections.forEach((section) => {
      section.classList.remove("active");
    });

    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add("active");
    }

    // Update page title
    if (pageTitle) {
      pageTitle.textContent = title;
    }

    // Close sidebar on mobile
    if (window.innerWidth < 992 && sidebar) {
      sidebar.classList.remove("active");
    }

    // Update active link
    document.querySelectorAll(".menu-link").forEach((link) => {
      link.classList.remove("active");
    });

    // Set active link based on section
    switch (sectionId) {
      case "dashboard-section":
        if (dashboardLink) dashboardLink.classList.add("active");
        break;
      case "product-list-section":
        if (productListLink) productListLink.classList.add("active");
        break;
      case "product-form-section":
        if (newProductLink) newProductLink.classList.add("active");
        break;
      case "orders-section":
        if (viewOrdersLink) viewOrdersLink.classList.add("active");
        break;
      case "analytics-section":
        if (analyticsLink) analyticsLink.classList.add("active");
        break;
      case "settings-section":
        if (settingsLink) settingsLink.classList.add("active");
        break;
    }
  }

  function fetchProducts() {
    // Show loading state
    if (productGrid) {
      productGrid.innerHTML = `
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Loading products...</span>
        </div>
      `;
    }

    fetch("http://localhost:3000/products")
      .then((response) => response.json())
      .then((data) => {
        // Filter products for current seller
        products = data.filter(
          (product) => product.seller && product.seller.email === user.email
        );

        // Update product count
        if (productCount) {
          productCount.textContent = products.length;
        }

        // Render products in new UI
        if (productGrid) {
          renderProducts(products);
        }

        // Render top products
        if (topProductsList) {
          renderTopProducts();
        }
      })
      .catch((error) => {
        console.error("Error fetching products:", error);

        // Show error in new UI
        if (productGrid) {
          productGrid.innerHTML = `
            <div class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              <p>Failed to load products. Please try again later.</p>
            </div>
          `;
        }
      });
  }

  function fetchOrders() {
    // Show loading state in new UI
    if (ordersContainer) {
      ordersContainer.innerHTML = `
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Loading orders...</span>
        </div>
      `;
    }

    fetch("http://localhost:3000/orders")
      .then((response) => response.json())
      .then((data) => {
        // Filter orders that contain products from this seller
        orders = data.filter((order) => {
          return order.products.some(
            (product) => product.seller && product.seller.email === user.email
          );
        });

        // Update order count
        if (orderCount) {
          orderCount.textContent = orders.length;
        }

        // Calculate revenue and unique customers
        let totalRevenue = 0;
        let uniqueCustomers = new Set();

        orders.forEach((order) => {
          order.products.forEach((product) => {
            if (product.seller && product.seller.email === user.email) {
              totalRevenue += product.price * (product.quantity || 1);
            }
          });

          if (order.user && order.user.id) {
            uniqueCustomers.add(order.user.id);
          }
        });

        // Update dashboard stats
        if (revenue) {
          revenue.textContent = "$" + totalRevenue.toFixed(2);
        }

        if (customerCount) {
          customerCount.textContent = uniqueCustomers.size;
        }

        // Render orders in new UI
        if (ordersContainer) {
          renderOrders(orders);
        }

        // Render recent orders
        if (recentOrdersList) {
          renderRecentOrders();
        }
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);

        // Show error in new UI
        if (ordersContainer) {
          ordersContainer.innerHTML = `
            <div class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              <p>Failed to load orders. Please try again later.</p>
            </div>
          `;
        }
      });
  }

  // New UI function to render products
  function renderProducts(productsToRender) {
    if (!productGrid) return;

    if (productsToRender.length === 0) {
      productGrid.innerHTML = `
        <div class="empty-message">
          <i class="fas fa-box-open"></i>
          <h3>No Products Found</h3>
          <p>You haven't added any products yet or no products match your filter criteria.</p>
          <button class="primary-btn" id="empty-add-product-btn">
            <i class="fas fa-plus"></i> Add Your First Product
          </button>
        </div>
      `;

      document
        .getElementById("empty-add-product-btn")
        .addEventListener("click", function () {
          resetProductForm();
          showSection("product-form-section", "Add New Product");
        });

      return;
    }

    productGrid.innerHTML = productsToRender
      .map(
        (product) => `
      <div class="product-card">
        <div class="product-image">
          <img src="${product.imageUrl}" alt="${product.title}">
          <div class="product-status ${
            product.approved ? "approved" : "pending"
          }">
            ${product.approved ? "Approved" : "Pending"}
          </div>
        </div>
        <div class="product-details">
          <div class="product-category">${
            product.category || "Uncategorized"
          }</div>
          <h3 class="product-title">${product.title}</h3>
          <div class="product-price">$${product.price}</div>
          <div class="product-meta">
            <span>Quantity: ${product.quantity || 0}</span>
            <span>ID: ${product.id.substring(0, 8)}</span>
          </div>
          <div class="product-actions">
            <button class="product-action-btn edit" data-id="${product.id}">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="product-action-btn delete" data-id="${product.id}">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    // Add event listeners to edit and delete buttons
    document.querySelectorAll(".product-action-btn.edit").forEach((button) => {
      button.addEventListener("click", function () {
        const productId = this.getAttribute("data-id");
        editProduct(productId);
      });
    });

    document
      .querySelectorAll(".product-action-btn.delete")
      .forEach((button) => {
        button.addEventListener("click", function () {
          const productId = this.getAttribute("data-id");
          deleteProduct(productId);
        });
      });
  }

  // New UI function to render orders
  function renderOrders(ordersToRender) {
    if (!ordersContainer) return;

    if (ordersToRender.length === 0) {
      ordersContainer.innerHTML = `
        <div class="empty-message">
          <i class="fas fa-shopping-cart"></i>
          <h3>No Orders Found</h3>
          <p>You haven't received any orders yet or no orders match your filter criteria.</p>
        </div>
      `;
      return;
    }

    ordersContainer.innerHTML = ordersToRender
      .map((order) => {
        // Filter products that belong to this seller
        const sellerProducts = order.products.filter(
          (product) => product.seller && product.seller.email === user.email
        );

        if (sellerProducts.length === 0) return "";

        // Calculate total for seller's products
        const sellerTotal = sellerProducts.reduce((total, product) => {
          return total + product.price * (product.quantity || 1);
        }, 0);

        // Format date
        const orderDate = order.date
          ? new Date(order.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "N/A";

        // Generate HTML for seller's products
        const productsHTML = sellerProducts
          .map(
            (product) => `
        <div class="order-product">
          <div class="order-product-image">
            <img src="${product.imageUrl}" alt="${product.title}">
          </div>
          <div class="order-product-details">
            <h4 class="order-product-title">${product.title}</h4>
            <div class="order-product-price">$${product.price}</div>
            <div class="order-product-quantity">Quantity: ${
              product.quantity || 1
            }</div>
            <div class="order-customer">
              Customer: <strong>${order.user.name}</strong><br>
              Email: ${order.user.email}
            </div>
          </div>
        </div>
      `
          )
          .join("");

        return `
        <div class="order-card">
          <div class="order-header">
            <div>
              <div class="order-id">Order #${order.id.substring(0, 8)}</div>
              <div class="order-date">${orderDate}</div>
            </div>
            <div class="order-status ${order.status || "pending"}">${
          order.status || "pending"
        }</div>
          </div>
          <div class="order-products">
            ${productsHTML}
          </div>
          <div class="order-footer">
            <div class="order-total">Total: $${sellerTotal.toFixed(2)}</div>
            <div class="order-actions">
              <select class="status-select" data-id="${order.id}">
                <option value="" disabled>Update Status</option>
                <option value="pending" ${
                  order.status === "pending" ? "selected" : ""
                }>Pending</option>
                <option value="processing" ${
                  order.status === "processing" ? "selected" : ""
                }>Processing</option>
                <option value="shipped" ${
                  order.status === "shipped" ? "selected" : ""
                }>Shipped</option>
                <option value="delivered" ${
                  order.status === "delivered" ? "selected" : ""
                }>Delivered</option>
                <option value="cancelled" ${
                  order.status === "cancelled" ? "selected" : ""
                }>Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    // Add event listeners to status selects
    document.querySelectorAll(".status-select").forEach((select) => {
      select.addEventListener("change", function () {
        const orderId = this.getAttribute("data-id");
        const newStatus = this.value;
        updateOrderStatus(orderId, newStatus);
      });
    });
  }

  function renderRecentOrders() {
    if (!recentOrdersList) return;

    if (orders.length === 0) {
      recentOrdersList.innerHTML = `
        <div class="empty-message">
          <p>No orders yet</p>
        </div>
      `;
      return;
    }

    // Sort orders by date (newest first) and take the first 5
    const recentOrders = [...orders]
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
      })
      .slice(0, 5);

    recentOrdersList.innerHTML = recentOrders
      .map((order) => {
        // Filter products that belong to this seller
        const sellerProducts = order.products.filter(
          (product) => product.seller && product.seller.email === user.email
        );

        if (sellerProducts.length === 0) return "";

        // Calculate total for seller's products
        const sellerTotal = sellerProducts.reduce((total, product) => {
          return total + product.price * (product.quantity || 1);
        }, 0);

        // Format date
        const orderDate = order.date
          ? new Date(order.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "N/A";

        return `
        <div class="recent-order-item">
          <div class="recent-order-header">
            <div class="recent-order-id">Order #${order.id.substring(
              0,
              8
            )}</div>
            <div class="recent-order-date">${orderDate}</div>
          </div>
          <div class="recent-order-details">
            <div class="recent-order-customer">Customer: ${
              order.user.name
            }</div>
            <div class="recent-order-status ${order.status || "pending"}">${
          order.status || "pending"
        }</div>
            <div class="recent-order-total">$${sellerTotal.toFixed(2)}</div>
          </div>
        </div>
      `;
      })
      .join("");
  }

  function renderTopProducts() {
    if (!topProductsList) return;

    if (products.length === 0) {
      topProductsList.innerHTML = `
        <div class="empty-message">
          <p>No products yet</p>
        </div>
      `;
      return;
    }

    // Sort products by price (highest first) and take the first 5
    const topProducts = [...products]
      .sort((a, b) => b.price - a.price)
      .slice(0, 5);

    topProductsList.innerHTML = topProducts
      .map(
        (product) => `
      <div class="top-product-item">
        <div class="top-product-image">
          <img src="${product.imageUrl}" alt="${product.title}">
        </div>
        <div class="top-product-details">
          <div class="top-product-title">${product.title}</div>
          <div class="top-product-price">$${product.price}</div>
          <div class="top-product-status ${
            product.approved ? "approved" : "pending"
          }">
            ${product.approved ? "Approved" : "Pending"}
          </div>
        </div>
      </div>
    `
      )
      .join("");
  }

  function filterProducts() {
    if (!productSearch || !categoryFilter || !statusFilter || !sortFilter)
      return;

    const searchTerm = productSearch.value.toLowerCase();
    const category = categoryFilter.value.toLowerCase();
    const status = statusFilter.value;
    const sort = sortFilter.value;

    let filteredProducts = [...products];

    // Apply search filter
    if (searchTerm) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm) ||
          (product.description &&
            product.description.toLowerCase().includes(searchTerm)) ||
          (product.category &&
            product.category.toLowerCase().includes(searchTerm))
      );
    }

    // Apply category filter
    if (category) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.category && product.category.toLowerCase() === category
      );
    }

    // Apply status filter
    if (status) {
      const isApproved = status === "true";
      filteredProducts = filteredProducts.filter(
        (product) => product.approved === isApproved
      );
    }

    // Apply sorting
    switch (sort) {
      case "newest":
        // Assuming products have a createdAt field, or using ID as a proxy
        filteredProducts.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "oldest":
        filteredProducts.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case "price-high":
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "price-low":
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
    }

    renderProducts(filteredProducts);
  }

  function filterOrders() {
    if (!orderStatusFilter || !orderDateFilter) return;

    const status = orderStatusFilter.value;
    const dateSort = orderDateFilter.value;

    let filteredOrders = [...orders];

    // Apply status filter
    if (status) {
      filteredOrders = filteredOrders.filter(
        (order) => order.status === status
      );
    }

    // Apply date sorting
    if (dateSort === "newest") {
      filteredOrders.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
      });
    } else if (dateSort === "oldest") {
      filteredOrders.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateA - dateB;
      });
    }

    renderOrders(filteredOrders);
  }

  function addNewProduct() {
    if (!productForm) return;

    const formData = new FormData(productForm);

    const newProduct = {
      title: formData.get("title"),
      price: parseFloat(formData.get("price")),
      category: formData.get("category"),
      description: formData.get("description"),
      imageUrl: formData.get("imageUrl"),
      quantity: parseInt(formData.get("quantity")),
      approved: false,
      seller: user,
    };

    fetch("http://localhost:3000/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to add product");
        return response.json();
      })
      .then((result) => {
        products.push(result);

        // Show success message
        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: "success",
            title: "Product Added",
            text: "Your product has been added successfully and is pending approval.",
            confirmButtonColor: "#0156FF",
          }).then(() => {
            showSection("product-list-section", "Product Management");
            renderProducts(products);
            renderTopProducts();

            // Update product count
            if (productCount) {
              productCount.textContent = products.length;
            }
          });
        } else {
          alert("Product added successfully!");
          showSection("product-list-section", "Product Management");
          renderProducts(products);
          renderTopProducts();

          // Update product count
          if (productCount) {
            productCount.textContent = products.length;
          }
        }
      })
      .catch((error) => {
        console.error("Error adding product:", error);

        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to add product. Please try again later.",
            confirmButtonColor: "#0156FF",
          });
        } else {
          alert("Failed to add product. Please try again later.");
        }
      });
  }

  function editProduct(productId) {
    const product = products.find((p) => p.id == productId);

    if (!product) {
      if (typeof Swal !== "undefined") {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Product not found.",
          confirmButtonColor: "#0156FF",
        });
      } else {
        alert("Product not found.");
      }
      return;
    }

    // Fill form with product data
    if (document.getElementById("title")) {
      document.getElementById("title").value = product.title || "";
    }

    if (document.getElementById("price")) {
      document.getElementById("price").value = product.price || "";
    }

    if (document.getElementById("category")) {
      document.getElementById("category").value = product.category || "";
    }

    if (document.getElementById("description")) {
      document.getElementById("description").value = product.description || "";
    }

    if (document.getElementById("imageUrl")) {
      document.getElementById("imageUrl").value = product.imageUrl || "";
    }

    if (document.getElementById("quantity")) {
      document.getElementById("quantity").value = product.quantity || "";
    }

    // Update preview
    if (previewImg) {
      previewImg.src =
        product.imageUrl || "https://placehold.co/300x300?text=Product+Image";
    }

    if (previewTitle) {
      previewTitle.textContent = product.title || "Product Title";
    }

    if (previewPrice) {
      previewPrice.textContent = "$" + (product.price || "0.00");
    }

    if (previewCategory) {
      previewCategory.textContent = product.category || "Category";
    }

    if (previewDescription) {
      previewDescription.textContent =
        product.description || "Product description will appear here...";
    }

    // Set current edit product ID
    currentEditProductId = productId;

    // Update form title and button
    if (formTitle) {
      formTitle.textContent = "Edit Product";
    }

    if (submitBtn) {
      submitBtn.style.display = "none";
    }

    if (updateBtn) {
      updateBtn.style.display = "block";
    }

    // Show form section
    showSection("product-form-section", "Edit Product");
  }

  function updateProduct() {
    if (!currentEditProductId || !productForm) return;

    const formData = new FormData(productForm);

    const updatedProduct = {
      title: formData.get("title"),
      price: parseFloat(formData.get("price")),
      category: formData.get("category"),
      description: formData.get("description"),
      imageUrl: formData.get("imageUrl"),
      quantity: parseInt(formData.get("quantity")),
      approved: false, // Reset approval status on update
      seller: user,
    };

    fetch(`http://localhost:3000/products/${currentEditProductId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProduct),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to update product");
        return response.json();
      })
      .then((result) => {
        // Update product in array
        const index = products.findIndex((p) => p.id == currentEditProductId);
        if (index !== -1) {
          products[index] = result;
        }

        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: "success",
            title: "Product Updated",
            text: "Your product has been updated successfully and is pending approval.",
            confirmButtonColor: "#0156FF",
          }).then(() => {
            showSection("product-list-section", "Product Management");
            renderProducts(products);
            renderTopProducts();

            // Reset current edit product ID
            currentEditProductId = null;
          });
        } else {
          alert("Product updated successfully!");
          showSection("product-list-section", "Product Management");
          renderProducts(products);
          renderTopProducts();

          // Reset current edit product ID
          currentEditProductId = null;
        }
      })
      .catch((error) => {
        console.error("Error updating product:", error);

        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to update product. Please try again later.",
            confirmButtonColor: "#0156FF",
          });
        } else {
          alert("Failed to update product. Please try again later.");
        }
      });
  }

  function deleteProduct(productId) {
    const confirmDelete = () => {
      fetch(`http://localhost:3000/products/${productId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to delete product");

          // Remove product from array
          products = products.filter((p) => p.id != productId);

          if (typeof Swal !== "undefined") {
            Swal.fire({
              icon: "success",
              title: "Product Deleted",
              text: "Your product has been deleted successfully.",
              confirmButtonColor: "#0156FF",
            }).then(() => {
              renderProducts(products);
              renderTopProducts();

              // Update product count
              if (productCount) {
                productCount.textContent = products.length;
              }
            });
          } else {
            alert("Product deleted successfully!");
            renderProducts(products);
            renderTopProducts();

            // Update product count
            if (productCount) {
              productCount.textContent = products.length;
            }
          }
        })
        .catch((error) => {
          console.error("Error deleting product:", error);

          if (typeof Swal !== "undefined") {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Failed to delete product. Please try again later.",
              confirmButtonColor: "#0156FF",
            });
          } else {
            alert("Failed to delete product. Please try again later.");
          }
        });
    };

    if (typeof Swal !== "undefined") {
      Swal.fire({
        title: "Delete Product",
        text: "Are you sure you want to delete this product? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#FF7675",
        cancelButtonColor: "#0156FF",
        confirmButtonText: "Yes, delete it",
      }).then((result) => {
        if (result.isConfirmed) {
          confirmDelete();
        }
      });
    } else {
      if (
        confirm(
          "Are you sure you want to delete this product? This action cannot be undone."
        )
      ) {
        confirmDelete();
      }
    }
  }

  function updateOrderStatus(orderId, newStatus) {
    fetch(`http://localhost:3000/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to update order status");
        return response.json();
      })
      .then((result) => {
        // Update order in array
        const index = orders.findIndex((o) => o.id == orderId);
        if (index !== -1) {
          orders[index].status = newStatus;
        }

        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: "success",
            title: "Status Updated",
            text: "Order status has been updated successfully.",
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          alert("Order status updated successfully!");
        }

        // Refresh orders display
        if (ordersContainer) {
          renderOrders(orders);
        }

        if (recentOrdersList) {
          renderRecentOrders();
        }
      })
      .catch((error) => {
        console.error("Error updating order status:", error);

        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to update order status. Please try again later.",
            confirmButtonColor: "#0156FF",
          });
        } else {
          alert("Failed to update order status. Please try again later.");
        }
      });
  }

  function resetProductForm() {
    if (!productForm) return;

    productForm.reset();

    // Reset preview
    if (previewImg) {
      previewImg.src = "https://placehold.co/300x300?text=Product+Image";
    }

    if (previewTitle) {
      previewTitle.textContent = "Product Title";
    }

    if (previewPrice) {
      previewPrice.textContent = "$0.00";
    }

    if (previewCategory) {
      previewCategory.textContent = "Category";
    }

    if (previewDescription) {
      previewDescription.textContent =
        "Product description will appear here...";
    }

    // Reset form title and button
    if (formTitle) {
      formTitle.textContent = "Add New Product";
    }

    if (submitBtn) {
      submitBtn.style.display = "block";
    }

    if (updateBtn) {
      updateBtn.style.display = "none";
    }

    // Reset current edit product ID
    currentEditProductId = null;
  }

  function updatePreview() {
    if (
      !previewTitle ||
      !previewPrice ||
      !previewCategory ||
      !previewDescription
    )
      return;

    const title = document.getElementById("title")?.value || "Product Title";
    const price = document.getElementById("price")?.value || "0.00";
    const category = document.getElementById("category")?.value || "Category";
    const description =
      document.getElementById("description")?.value ||
      "Product description will appear here...";

    previewTitle.textContent = title;
    previewPrice.textContent = "$" + price;
    previewCategory.textContent = category;
    previewDescription.textContent = description;
  }

  function confirmLogout() {
    if (typeof Swal !== "undefined") {
      Swal.fire({
        title: "Logout",
        text: "Are you sure you want to logout?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#0156FF",
        cancelButtonColor: "#FF7675",
        confirmButtonText: "Yes, logout",
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem("user");
          window.location.href = "./../auth/auth.html";
        }
      });
    } else {
      if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("user");
        window.location.href = "./../auth/auth.html";
      }
    }
  }
});
