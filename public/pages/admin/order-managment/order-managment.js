const renderOrders = function (orderContainer, orders) {
  orderContainer.innerHTML = "";

  orders.forEach((order) => {
    orderContainer.innerHTML += `
        <div class="order-card">
            <div class="order-details">
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Total:</strong> $${order.total}</p>
                <p><strong>Customer:</strong> ${order.user.name}</p>
                <p><strong>Customer Email:</strong> ${order.user.email}</p>
                <p><strong>Customer Status:</strong> ${order.status}</p>
                <div class="order-actions">
                    <button class="btn-cancel" data-id="${order.id}">Cancel Order</button>
                </div>
            </div>
        </div>
        `;
  });
};

const getOrders = async function () {
  const response = await fetch("http://localhost:3000/orders");
  const data = await response.json();
  if (!response.ok)
    throw new Error("Network response was not ok " + response.statusText);
  return data;
};

const deleteOrder = async function (id) {
  const response = await fetch(`http://localhost:3000/orders/${id}`, {
    method: "DELETE",
  });
  if (!response.ok)
    throw new Error("Network response was not ok " + response.statusText);
};

function attachCancelEventListeners(orderContainer, orders) {
  const cancelBtns = document.querySelectorAll(".btn-cancel");
  cancelBtns.forEach((btn) => {
    btn.addEventListener("click", async function () {
      const id = btn.getAttribute("data-id");
      try {
        const result = await Swal.fire({
          title: "Are you sure?",
          text: "Do you really want to cancel this order?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, cancel it!",
          cancelButtonText: "No, keep it",
          reverseButtons: true,
        });
        if (result.isConfirmed) {
          await deleteOrder(id);
          const updatedOrders = await getOrders();
          const pendingOrders = updatedOrders.filter(
            (order) => order.status === "pending"
          );
          renderOrders(orderContainer, pendingOrders);
          attachCancelEventListeners(orderContainer, pendingOrders);

          Swal.fire({
            icon: "success",
            title: "Order Cancelled",
            text: "The order was cancelled successfully!",
            timer: 1500,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while canceling the order.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  });
}

window.addEventListener("load", async function () {
  const userAdmin = JSON.parse(localStorage.getItem("user"));
  if (!userAdmin || userAdmin.role === "customer") {
    window.location.href = "./../../home/home.html";
  } else if (userAdmin.role === "seller") {
    window.location.href = "./../../seller-dashboard/seller-dashboard.html";
  }

  const logOut = document.querySelector(".logout");
  logOut.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "./../../auth/auth.html";
  });

  const goBack = document.querySelector(".go-back");
  goBack.addEventListener("click", () => {
    window.location.href = "./../../admin/admin.html";
  });

  const orderContainer = document.querySelector(".order-container");
  const orders = await getOrders();
  const pendingOrders = orders.filter((order) => order.status === "pending");

  renderOrders(orderContainer, pendingOrders);
  attachCancelEventListeners(orderContainer, pendingOrders);
});
