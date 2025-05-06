window.onload = function () {
  const user = JSON.parse(localStorage.getItem("user"));
  const cartContainer = document.querySelector(".cart-container");
  const totalSpan = document.getElementById("total");

  if (!user) {
    cartContainer.innerHTML = "<p>Please login to see your cart.</p>";
    return;
  }

  function loadCart() {
    fetch("http://localhost:3000/cart")
      .then((res) => res.json())
      .then((carts) => {
        cartContainer.innerHTML = "";
        const userCart = carts.find((c) => c.user.id === user.id);
        if (!userCart || userCart.products.length === 0) {
          // If the cart is empty, show a message and hide buttons
          cartContainer.innerHTML = `
          <div class="empty-cart">
            <h2>Your Cart is Empty</h2>
            <p>Add items to your cart to see them here.</p>
            <img src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png" alt="">
            <button style="margin-bottom: 20px; " onclick="window.location.href='./../home/home.html'">Continue shopping</button>
        </div>
          `;
          document.getElementById("confirmBtn").style.display = "none";
          document.getElementById("clearCartBtn").style.display = "none";
          document.querySelector(".total").style.display = "none";
          totalSpan.textContent = 0;
          return;
        }

        let total = 0;

        userCart.products.forEach((product, index) => {
          const item = document.createElement("div");
          item.classList.add("cart-item");

          const itemTotal = parseFloat(product.price) * product.quantity;
          total += itemTotal;

          item.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.title}" />
            <div class="cart-details">
              <h3>${product.title}</h3>
              <p>Price: ${product.price} EGP</p>
              <p>Quantity: ${product.quantity}</p>
              <p><strong>Subtotal:</strong> ${(
                product.price * product.quantity
              ).toFixed(2)} EGP</p>
            </div>
            <div class="cart-actions">
              <div class="quantity-group">
                <button class="quantity-btn decrease-btn" data-index="${index}">➖</button>
                <button class="quantity-btn increase-btn" data-index="${index}">➕</button>
              </div>
              <button style="width: 100%; " class="remove-btn" data-index="${index}">Remove</button>
            </div>
          `;

          // Append item
          cartContainer.appendChild(item);

          // Add event listeners after element creation
          const increaseBtn = item.querySelector(".increase-btn");
          const decreaseBtn = item.querySelector(".decrease-btn");
          const removeBtn = item.querySelector(".remove-btn");

          increaseBtn.addEventListener("click", () => {
            userCart.products[index].quantity++;
            updateCart(userCart);
          });

          decreaseBtn.addEventListener("click", () => {
            userCart.products[index].quantity--;
            if (userCart.products[index].quantity <= 0) {
              deleteProduct(index, userCart);
            } else {
              updateCart(userCart);
            }
          });

          removeBtn.addEventListener("click", () => {
            deleteProduct(index, userCart);
          });
        });

        totalSpan.textContent = total.toFixed(2);

        document.getElementById("confirmBtn").style.display = "inline-block";
        document.getElementById("clearCartBtn").style.display = "inline-block";
      });
  }

  function updateCart(cart) {
    fetch(`http://localhost:3000/cart/${cart.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cart),
    }).then(loadCart);
  }

  function deleteProduct(index, userCart) {
    Swal.fire({
      title: "Are you sure?",
      text: "This product will be removed from the cart.",
      imageUrl: `${userCart.products[index].imageUrl}`,
      imageWidth: 100,
      imageHeight: 100,
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch("http://localhost:3000/cart")
          .then((res) => res.json())
          .then((carts) => {
            const userCart = carts.find((c) => c.user.id === user.id);
            userCart.products.splice(index, 1);
            updateCart(userCart);
          });
      }
    });
  }

  document.getElementById("confirmBtn").addEventListener("click", function () {
    fetch("http://localhost:3000/cart")
      .then((res) => res.json())
      .then((carts) => {
        const userCart = carts.find((c) => c.user.id === user.id);
        if (!userCart || userCart.products.length === 0) return;

        //get all products to post the order data
        fetch("http://localhost:3000/products")
          .then((res) => res.json())
          .then((allProducts) => {
            const enrichedProducts = userCart.products.map((prod) => {
              const fullProduct = allProducts.find((p) => p.id === prod.id);
              return {
                ...prod,
                seller: fullProduct?.seller || {},
              };
            });

            const orderData = {
              id: crypto.randomUUID(),
              user: userCart.user,
              products: enrichedProducts,
              total: userCart.products.reduce(
                (acc, prod) => acc + prod.price * prod.quantity,
                0
              ),
            };

            //  POST order with full seller data
            fetch("http://localhost:3000/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(orderData),
            })
              .then((res) => {
                if (!res.ok) throw new Error("Failed to confirm order.");
                return res.json();
              })
              .then(() => {
                // 🧹 Clear the cart
                fetch(`http://localhost:3000/cart/${userCart.id}`, {
                  method: "DELETE",
                }).then(loadCart);
              })
              .catch((err) => {
                console.error("Error confirming order:", err);
              });
          });
      });
  });

  const clearCartBtn = document.getElementById("clearCartBtn");

  clearCartBtn.addEventListener("click", () => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will remove all items from your cart.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, clear it!",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch("http://localhost:3000/cart")
          .then((res) => res.json())
          .then((carts) => {
            const userCart = carts.find((c) => c.user.id === user.id);
            if (!userCart) return;
            fetch(`http://localhost:3000/cart/${userCart.id}`, {
              method: "DELETE",
            }).then(loadCart);
          });
      }
    });
  });

  loadCart();
};
