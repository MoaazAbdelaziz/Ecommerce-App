document.addEventListener("DOMContentLoaded", function () {
  const user = JSON.parse(localStorage.getItem("user"));
  const ordersContainer = document.getElementById("ordersContainer");
  const statusFilter = document.getElementById("status-filter");
  const dateFilter = document.getElementById("date-filter");
  const backToTopBtn = document.getElementById("backToTop");

  let allOrders = [];

  // Setup back to top button
  window.addEventListener("scroll", function () {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add("active");
    } else {
      backToTopBtn.classList.remove("active");
    }
  });

  backToTopBtn.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Handle user authentication
  if (!user) {
    ordersContainer.innerHTML = `
            <div class="empty-orders">
                <i class="fas fa-user-lock empty-orders-icon"></i>
                <h2>Please Log In</h2>
                <p>You need to be logged in to view your order history.</p>
                <a href="./../auth/auth.html" class="empty-orders-btn">
                    <i class="fas fa-sign-in-alt"></i> Log In
                </a>
            </div>
        `;
    return;
  }

  // Fetch orders
  fetchOrders();

  // Event listeners for filters
  statusFilter.addEventListener("change", filterOrders);
  dateFilter.addEventListener("change", filterOrders);

  function fetchOrders() {
    fetch("http://localhost:3000/orders")
      .then((res) => res.json())
      .then((orders) => {
        // Filter orders for current user
        allOrders = orders.filter((order) => order.user.id === user.id);

        // Sort by newest first (default)
        allOrders.sort((a, b) => {
          const dateA = a.date ? new Date(a.date) : new Date(0);
          const dateB = b.date ? new Date(b.date) : new Date(0);
          return dateB - dateA;
        });

        renderOrders(allOrders);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        ordersContainer.innerHTML = `
                    <div class="empty-orders">
                        <i class="fas fa-exclamation-triangle empty-orders-icon"></i>
                        <h2>Error Loading Orders</h2>
                        <p>We encountered a problem while loading your orders. Please try again later.</p>
                        <button onclick="location.reload()" class="empty-orders-btn">
                            <i class="fas fa-sync-alt"></i> Try Again
                        </button>
                    </div>
                `;
      });
  }

  function renderOrders(orders) {
    // Clear loading spinner
    ordersContainer.innerHTML = "";

    if (orders.length === 0) {
      ordersContainer.innerHTML = `
                <div class="empty-orders">
                    <img src="https://static.vecteezy.com/system/resources/previews/014/814/239/non_2x/no-order-a-flat-rounded-icon-is-up-for-premium-use-vector.jpg" alt="No Orders" class="empty-orders-image">
                    <h2>No Orders Yet</h2>
                    <p>Looks like you haven't placed any orders yet.</p>
                    <a href="./../home/home.html" class="empty-orders-btn">
                        <i class="fas fa-shopping-cart"></i> Start Shopping
                    </a>
                </div>
            `;
      return;
    }

    orders.forEach((order, index) => {
      // Format date if available
      const orderDate = order.date
        ? new Date(order.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A";

      // Calculate order total
      const orderTotal =
        order.total ||
        order.products.reduce((sum, product) => {
          return sum + product.price * (product.quantity || 1);
        }, 0);

      // Create order card
      const orderCard = document.createElement("div");
      orderCard.className = "order-card";

      // Create order header
      const orderHeader = document.createElement("div");
      orderHeader.className = "order-header";
      orderHeader.innerHTML = `
                <div>
                    <div class="order-id">Order #${order.id.substring(
                      0,
                      8
                    )}</div>
                    <div class="order-date">${orderDate}</div>
                </div>
                <div class="order-status ${order.status || "pending"}">${
        order.status || "pending"
      }</div>
            `;

      // Create order body with products
      const orderBody = document.createElement("div");
      orderBody.className = "order-body";

      const productsHTML = order.products
        .map(
          (product) => `
                <div class="order-product">
                    <img src="${product.imageUrl}" alt="${
            product.title
          }" class="product-image">
                    <div class="product-details">
                        <div class="product-name">${product.title}</div>
                        <div class="product-price">${product.price} EGP</div>
                        <div class="product-quantity">Quantity: ${
                          product.quantity || 1
                        }</div>
                        <div class="product-seller">
                            Seller: <strong>${
                              product.seller?.name || "TechStore"
                            }</strong>
                            ${
                              product.seller?.email
                                ? `<br>Email: ${product.seller.email}`
                                : ""
                            }
                        </div>
                    </div>
                </div>
            `
        )
        .join("");

      orderBody.innerHTML = `
                <div class="order-products">
                    ${productsHTML}
                </div>
            `;

      // Create order footer
      const orderFooter = document.createElement("div");
      orderFooter.className = "order-footer";
      orderFooter.innerHTML = `
                <div class="order-total">Total: ${orderTotal.toFixed(
                  2
                )} EGP</div>
                <div class="order-actions">
                    <button class="order-action-btn primary" onclick="trackOrder('${
                      order.id
                    }')">
                        <i class="fas fa-truck"></i> Track Order
                    </button>
                    <button class="order-action-btn secondary" onclick="reorder('${
                      order.id
                    }')">
                        <i class="fas fa-redo"></i> Reorder
                    </button>
                </div>
            `;

      // Assemble order card
      orderCard.appendChild(orderHeader);
      orderCard.appendChild(orderBody);
      orderCard.appendChild(orderFooter);

      // Add to container
      ordersContainer.appendChild(orderCard);
    });
  }

  function filterOrders() {
    const statusValue = statusFilter.value;
    const dateValue = dateFilter.value;

    let filteredOrders = [...allOrders];

    // Filter by status
    if (statusValue !== "all") {
      filteredOrders = filteredOrders.filter(
        (order) =>
          (order.status || "pending").toLowerCase() ===
          statusValue.toLowerCase()
      );
    }

    // Sort by date
    if (dateValue === "oldest") {
      filteredOrders.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateA - dateB;
      });
    } else {
      filteredOrders.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
      });
    }

    renderOrders(filteredOrders);
  }
});

// Global functions for order actions
window.trackOrder = function (orderId) {
  alert(`Tracking order ${orderId}. This feature is coming soon!`);
};

window.reorder = function (orderId) {
  alert(`Reordering items from order ${orderId}. This feature is coming soon!`);
};
