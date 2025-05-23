window.onload = function () {
  const productId = localStorage.getItem("productId");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!productId) {
    console.error("No product selected.");
    return;
  }

  fetch(`http://localhost:3000/products/${productId}`)
    .then((res) => res.json())
    .then((product) => {
      const container = document.querySelector(".product-details-container");
      container.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.title}" />
        <div class="product-info">
          <h2>${product.title}</h2>
          <p style=" font-weight: bold; font-size: 25px; color: #0156FF; " class="description">${product.description}</p>
          <p class="price">${product.category} </p>
          <p class="price">${product.price} EGP</p>
          <p>${product.description}</p>
        </div>
        <div class="add-to-cart-div" data-id="${product.id}">
          <button class="add-to-cart-btn">Add to Cart</button>
        </div>
      `;

      const reviewContainer = document.querySelector(".review-container");
      reviewContainer.innerHTML = `
        <div class="review-section">
          <h3>Customer Reviews</h3>
          <form id="review-form" style="margin-bottom: 20px;">
            <textarea id="review-text" placeholder="Write your review..." required></textarea>
            <button type="submit">Submit Review</button>
          </form>
          <div id="reviews-list"></div>
        </div>
      `;

      loadReviews(product.id);
      setupReviewForm(product.id);

      const addToCartBtn = document.querySelector(".add-to-cart-btn");
      addToCartBtn.addEventListener("click", () => {
        addToCart(product);
      });
    })
    .catch((err) => {
      console.error("Failed to fetch product:", err);
    });

  function addToCart(product) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      Swal.fire({
        title: "You need to log in!",
        text: "Please log in to add items to your cart.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Go to Login",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "./../auth/auth.html";
        }
      });
      return;
    }

    fetch("http://localhost:3000/cart")
      .then((res) => res.json())
      .then((orders) => {
        const userOrder = orders.find((order) => order.user.id === user.id);

        if (userOrder) {
          const existingProduct = userOrder.products.find(
            (p) => p.id === product.id
          );

          let updatedProducts;

          if (existingProduct) {
            updatedProducts = userOrder.products.map((p) => {
              if (p.id === product.id) {
                return { ...p, quantity: (p.quantity || 1) + 1 };
              }
              return p;
            });
          } else {
            updatedProducts = [
              ...userOrder.products,
              {
                id: product.id,
                title: product.title,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: 1,
              },
            ];
          }

          fetch(`http://localhost:3000/cart/${userOrder.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ products: updatedProducts }),
          })
            .then(() => {
              Swal.fire({
                icon: "success",
                imageUrl: `${product.imageUrl}`,
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: "Product Image",
                title: "Added to Cart",
                text: `"${product.title}" has been added to your cart!`,
                showConfirmButton: false,
                timer: 1500,
              });
            })
            .catch((err) => console.error("Failed to update order:", err));
        } else {
          fetch("http://localhost:3000/cart", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              },
              products: [
                {
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  imageUrl: product.imageUrl,
                  quantity: 1,
                },
              ],
            }),
          })
            .then(() => {
              Swal.fire({
                icon: "success",
                title: "Added to Cart",
                imageUrl: `${product.imageUrl}`,
                imageWidth: 100,
                imageHeight: 100,
                text: `"${product.title}" has been added to your cart!`,
                showConfirmButton: false,
                timer: 1500,
              });
            })
            .catch((err) => console.error("Failed to create new order:", err));
        }
      })
      .catch((err) => console.error("Failed to fetch orders:", err));
  }

  function loadReviews(productId) {
    fetch(`http://localhost:3000/reviews?productId=${productId}`)
      .then((res) => res.json())
      .then((reviews) => {
        const reviewsList = document.getElementById("reviews-list");
        reviewsList.innerHTML = "";
        reviews.forEach((review) => {
          const div = document.createElement("div");
          div.className = "review-item";
          div.style = "padding: 10px; border-bottom: 1px solid #eee;";
          div.innerHTML = `
            <strong>${review.user.name}</strong> <small style="color:gray;">(${review.date})</small>
            <p style="margin: 5px 0;">${review.comment}</p>
          `;
          reviewsList.appendChild(div);
        });
      })
      .catch((err) => console.error("Failed to load reviews:", err));
  }

  function setupReviewForm(productId) {
    const form = document.getElementById("review-form");
    const textarea = document.getElementById("review-text");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const comment = textarea.value.trim();
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        Swal.fire("Login Required", "You must be logged in to write a review.", "warning");
        return;
      }

      const newReview = {
        id: "r" + Date.now(),
        productId,
        comment,
        date: new Date().toISOString().split("T")[0],
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          password: user.password,
        },
      };

      fetch("http://localhost:3000/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReview),
      })
        .then(() => {
          textarea.value = "";
          loadReviews(productId);
        })
        .catch((err) => console.error("Failed to submit review:", err));
    });
  }
};
