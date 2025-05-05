// orders.js

const user = JSON.parse(localStorage.getItem("user")); 

fetch("http://localhost:3000/orders")
  .then((res) => res.json())
  .then((orders) => {
    const userOrders = orders.filter((order) => order.user.id === user.id);
    const ordersContainer = document.getElementById("ordersContainer");

    if (userOrders.length === 0) {
      ordersContainer.innerHTML = `
        <div class="empty-order">
        <h1>No Orders Yet</h1>
        <img src="https://static.vecteezy.com/system/resources/previews/014/814/239/non_2x/no-order-a-flat-rounded-icon-is-up-for-premium-use-vector.jpg" alt="">
        <p>Looks like you haven't placed any orders yet.</p>
        <button onclick="window.location.href='./../home/home.html'">Continue Shopping</button>
    </div>
      `;
      return;
    }

    userOrders.forEach((order, index) => {
      const orderDiv = document.createElement("div");
      orderDiv.classList.add("order-card");

      const productsHTML = order.products
        .map(
          (prod) => `
          <div class="product">
            <img src="${prod.imageUrl}" alt="${prod.title}" />
            <div class="product-details">
              <h3>${prod.title}</h3>
              <p>: ${prod.price} EGP</p>

              <p>Quantity: ${prod.quantity}</p>
              <div class="seller">
                seller: <strong>${
                  prod.seller?.name || "Unknown Seller"
                }</strong> <br/>
                email: ${prod.seller?.email || "-"}
              </div>
            </div>
          </div>
        `
        )
        .join("");

      orderDiv.innerHTML = `
        <h2>order #${index + 1}</h2>
        ${productsHTML}
      `;

      ordersContainer.appendChild(orderDiv);
    });
  });
