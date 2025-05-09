document.addEventListener("DOMContentLoaded", function () {
  const user = JSON.parse(localStorage.getItem("user"));
  const cartContainer = document.querySelector(".cart-container");
  const totalSpan = document.getElementById("total");
  const subtotalSpan = document.getElementById("subtotal");
  const taxSpan = document.getElementById("tax");
  const confirmBtn = document.getElementById("confirmBtn");
  const clearCartBtn = document.getElementById("clearCartBtn");
  const backToTopBtn = document.getElementById("backToTop");

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
    renderEmptyCart("Please login to see your cart", true);
    return;
  }

  // Load cart data
  loadCart();

  // Event listeners for buttons
  confirmBtn.addEventListener("click", handleConfirmOrder);
  clearCartBtn.addEventListener("click", handleClearCart);

  // Apply promo code button (placeholder functionality)
  const promoBtn = document.querySelector(".promo-btn");
  if (promoBtn) {
    promoBtn.addEventListener("click", function () {
      const promoInput = document.querySelector(".promo-input");
      const promoCode = promoInput.value.trim();

      if (promoCode) {
        Swal.fire({
          icon: "info",
          title: "Promo Code",
          text: `Promo code "${promoCode}" applied successfully!`,
          showConfirmButton: false,
          timer: 1500,
        });
        promoInput.value = "";
      } else {
        Swal.fire({
          icon: "warning",
          title: "Oops...",
          text: "Please enter a promo code",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  }

  // Functions
  function loadCart() {
    fetch("http://localhost:3000/cart")
      .then((res) => res.json())
      .then((carts) => {
        const userCart = carts.find((c) => c.user.id === user.id);

        if (!userCart || userCart.products.length === 0) {
          renderEmptyCart();
          return;
        }

        renderCart(userCart);
      })
      .catch((error) => {
        console.error("Error loading cart:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Failed to load your cart. Please try again later.",
        });
      });
  }

  function renderEmptyCart(
    message = "Your Cart is Empty",
    isLoginRequired = false
  ) {
    cartContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart empty-cart-icon"></i>
                <h2>${message}</h2>
                <p>Add items to your cart to see them here.</p>
                ${
                  isLoginRequired
                    ? `<button class="empty-cart-btn" onclick="window.location.href='./../auth/auth.html'">Login Now</button>`
                    : `<button class="empty-cart-btn" onclick="window.location.href='./../home/home.html'">Continue Shopping</button>`
                }
            </div>
        `;

    // Hide summary elements
    confirmBtn.style.display = "none";
    clearCartBtn.style.display = "none";

    // Reset totals
    updateTotals(0);
  }

  function renderCart(cart) {
    cartContainer.innerHTML = "";

    let subtotal = 0;

    cart.products.forEach((product, index) => {
      const itemSubtotal = product.price * product.quantity;
      subtotal += itemSubtotal;

      const cartItem = document.createElement("div");
      cartItem.classList.add("cart-item");
      cartItem.innerHTML = `
                <img src="${product.imageUrl}" alt="${
        product.title
      }" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${product.title}</h3>
                    <div class="cart-item-price">${product.price} EGP</div>
                    <div class="cart-item-meta">
                        <span>SKU: TECH-${product.id}</span>
                        <span>Category: Electronics</span>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn decrease-btn" data-index="${index}">-</button>
                        <input type="number" value="${
                          product.quantity
                        }" min="1" class="quantity-input" data-index="${index}" readonly>
                        <button class="quantity-btn increase-btn" data-index="${index}">+</button>
                    </div>
                    <button class="remove-btn" data-index="${index}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
                <div class="cart-item-subtotal">${itemSubtotal.toFixed(
                  2
                )} EGP</div>
            `;

      cartContainer.appendChild(cartItem);

      // Add event listeners
      const decreaseBtn = cartItem.querySelector(".decrease-btn");
      const increaseBtn = cartItem.querySelector(".increase-btn");
      const quantityInput = cartItem.querySelector(".quantity-input");
      const removeBtn = cartItem.querySelector(".remove-btn");

      decreaseBtn.addEventListener("click", () => {
        if (product.quantity > 1) {
          product.quantity--;
          updateCart(cart);
        }
      });

      increaseBtn.addEventListener("click", () => {
        product.quantity++;
        updateCart(cart);
      });

      quantityInput.addEventListener("change", () => {
        const newQuantity = parseInt(quantityInput.value);
        if (newQuantity > 0) {
          product.quantity = newQuantity;
          updateCart(cart);
        }
      });

      removeBtn.addEventListener("click", () => {
        removeCartItem(index, cart);
      });
    });

    // Show buttons
    confirmBtn.style.display = "flex";
    clearCartBtn.style.display = "flex";

    // Update totals
    updateTotals(subtotal);
  }

  function updateTotals(subtotal) {
    const tax = subtotal * 0.14; // Assuming 14% tax
    const total = subtotal + tax;

    subtotalSpan.textContent = `${subtotal.toFixed(2)} EGP`;
    taxSpan.textContent = `${tax.toFixed(2)} EGP`;
    totalSpan.textContent = `${total.toFixed(2)} EGP`;
  }

  function updateCart(cart) {
    fetch(`http://localhost:3000/cart/${cart.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cart),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update cart");
        }
        loadCart();
      })
      .catch((error) => {
        console.error("Error updating cart:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Failed to update your cart. Please try again later.",
        });
      });
  }

  function removeCartItem(index, cart) {
    Swal.fire({
      title: "Remove Item",
      text: "Are you sure you want to remove this item from your cart?",
      imageUrl:`${cart.products[index].imageUrl}`,
      imageAlt:`${cart.products[index].title}`,
      imageWidth: 300,
      showCancelButton: true,
      confirmButtonColor: "#0156FF",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!",
    }).then((result) => {
      if (result.isConfirmed) {
        cart.products.splice(index, 1);

        if (cart.products.length === 0) {
          // If cart is empty after removing item, delete the cart
          fetch(`http://localhost:3000/cart/${cart.id}`, {
            method: "DELETE",
          })
            .then(() => {
              renderEmptyCart();
              Swal.fire(
                "Removed!",
                "The item has been removed from your cart.",
                "success"
              );
            })
            .catch((error) => {
              console.error("Error deleting cart:", error);
            });
        } else {
          // Update cart with removed item
          updateCart(cart);
          Swal.fire(
            "Removed!",
            "The item has been removed from your cart.",
            "success"
          );
        }
      }
    });
  }

  function handleConfirmOrder() {
    fetch("http://localhost:3000/cart")
      .then((res) => res.json())
      .then((carts) => {
        const userCart = carts.find((c) => c.user.id === user.id);

        if (!userCart || userCart.products.length === 0) {
          Swal.fire({
            icon: "info",
            title: "Empty Cart",
            text: "Your cart is empty. Add some products before checking out.",
          });
          return;
        }

        Swal.fire({
          title: "Confirm Order",
          text: "Are you sure you want to place this order?",
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#0156FF",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, place order!",
        }).then((result) => {
          if (result.isConfirmed) {
            // Get all products to enrich with seller data
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

                const subtotal = userCart.products.reduce(
                  (acc, prod) => acc + prod.price * prod.quantity,
                  0
                );
                const tax = subtotal * 0.14;
                const total = subtotal + tax;

                const orderData = {
                  id: crypto.randomUUID(),
                  user: userCart.user,
                  products: enrichedProducts,
                  subtotal: subtotal,
                  tax: tax,
                  total: total,
                  status: "pending",
                  date: new Date().toISOString(),
                };

                // Create order
                fetch("http://localhost:3000/orders", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(orderData),
                })
                  .then((response) => {
                    if (!response.ok) {
                      throw new Error("Failed to create order");
                    }

                    // Clear cart after successful order
                    return fetch(`http://localhost:3000/cart/${userCart.id}`, {
                      method: "DELETE",
                    });
                  })
                  .then(() => {
                    Swal.fire({
                      icon: "success",
                      title: "Order Placed!",
                      text: "Your order has been placed successfully.",
                      confirmButtonColor: "#0156FF",
                    }).then(() => {
                      renderEmptyCart("Order Placed Successfully!");
                    });
                  })
                  .catch((error) => {
                    console.error("Error placing order:", error);
                    Swal.fire({
                      icon: "error",
                      title: "Oops...",
                      text: "Failed to place your order. Please try again later.",
                    });
                  });
              });
          }
        });
      });
  }

  function handleClearCart() {
    Swal.fire({
      title: "Clear Cart",
      text: "Are you sure you want to clear your entire cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0156FF",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, clear it!",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch("http://localhost:3000/cart")
          .then((res) => res.json())
          .then((carts) => {
            const userCart = carts.find((c) => c.user.id === user.id);

            if (!userCart) {
              Swal.fire({
                icon: "info",
                title: "Empty Cart",
                text: "Your cart is already empty.",
              });
              return;
            }

            fetch(`http://localhost:3000/cart/${userCart.id}`, {
              method: "DELETE",
            })
              .then(() => {
                Swal.fire({
                  icon: "success",
                  title: "Cart Cleared",
                  text: "Your cart has been cleared successfully.",
                  confirmButtonColor: "#0156FF",
                });
                renderEmptyCart();
              })
              .catch((error) => {
                console.error("Error clearing cart:", error);
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: "Failed to clear your cart. Please try again later.",
                });
              });
          });
      }
    });
  }
});
