const productId = localStorage.getItem("productId");
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log(productId);
  

  if (!productId) {
    console.error("No product selected.");
    return;
  }
        if (!productId) {
          console.error("No product selected.");
          Swal.fire({
            icon: "error",
            title: "Product Not Found",
            text: "Please select a product to view details.",
          });
          return;
        }

  // Fetch product details
  fetchProductDetails(productId);

  // Fetch related products
  fetchRelatedProducts();

  // Setup tab navigation
  setupTabs();

  // Back to top button functionality
  setupBackToTop();
});

function fetchProductDetails(productId) {
  fetch(`http://localhost:3000/products/${productId}`)
    .then((res) => res.json())
    .then((product) => {
      // Update breadcrumb
      document.getElementById("product-breadcrumb").textContent = product.title;

      // Render product details
      renderProductDetails(product);

      // Render product description tab
      renderProductDescription(product);

      // Render product specifications tab
      renderProductSpecifications(product);

      // Setup reviews tab
      setupReviewsTab(product.id);
    })
    .catch((err) => {
      console.error("Failed to fetch product:", err);
      // Show error message
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to load product details. Please try again later.",
      });
    });
}

function renderProductDetails(product) {
  const container = document.querySelector(".product-details-container");

  // Create gallery HTML
  const galleryHTML = `
        <div class="product-gallery">
            <img src="${product.imageUrl}" alt="${
    product.title
  }" class="product-main-image" id="mainImage">
            
        </div>
    `;

  // Create info HTML
  const infoHTML = `
        <div class="product-info">
            <h1 class="product-title">${product.title}</h1>
            <span class="product-category">${
              product.category || "Electronics"
            }</span>
            <div class="product-price">${product.price} EGP</div>
            <p class="product-description">${product.description}</p>
            
            <div class="product-meta">
                <div class="product-meta-item">
                    <span class="product-meta-label">Availability:</span>
                    <span class="product-meta-value">In Stock</span>
                </div>
                <div class="product-meta-item">
                    <span class="product-meta-label">SKU:</span>
                    <span class="product-meta-value">TECH-${product.id}</span>
                </div>
                <div class="product-meta-item">
                    <span class="product-meta-label">Category:</span>
                    <span class="product-meta-value">${
                      product.category || "Electronics"
                    }</span>
                </div>
            </div>
            
            <div class="product-actions">
                <div class="quantity-selector">
                    <button class="quantity-btn" onclick="decrementQuantity()">-</button>
                    <input type="number" value="1" min="1" class="quantity-input" id="quantityInput">
                    <button class="quantity-btn" onclick="incrementQuantity()">+</button>
                </div>
                <button class="add-to-cart-btn" id="addToCartBtn" data-product-id="${
                  product.id
                }">
                    <i class="fas fa-shopping-cart"></i>
                    Add to Cart
                </button>
                <button class="wishlist-btn" onclick="addToWishlist(${
                  product.id
                })">
                    <i class="far fa-heart"></i>
                </button>
            </div>
        </div>
    `;

  // Set the HTML
  container.innerHTML = galleryHTML + infoHTML;

  // Add event listener for Add to Cart button
  const addToCartBtn = document.getElementById("addToCartBtn");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", function () {
      addToCart(productId);
    });
  }
}

function renderProductDescription(product) {
  const descriptionPanel = document.getElementById("description-panel");
  descriptionPanel.innerHTML = `
        <h3>Product Description</h3>
        <div class="description-content">
            <p>${product.description}</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </div>
    `;
}

function renderProductSpecifications(product) {
  const specificationsPanel = document.getElementById("specifications-panel");
  specificationsPanel.innerHTML = `
        <h3>Technical Specifications</h3>
        <table class="specs-table">
            <tbody>
                <tr>
                    <td>Brand</td>
                    <td>TechStore</td>
                </tr>
                <tr>
                    <td>Model</td>
                    <td>TECH-${product.id}</td>
                </tr>
                <tr>
                    <td>Category</td>
                    <td>${product.category || "Electronics"}</td>
                </tr>
                <tr>
                    <td>Warranty</td>
                    <td>1 Year</td>
                </tr>
                <tr>
                    <td>Dimensions</td>
                    <td>30 x 20 x 10 cm</td>
                </tr>
                <tr>
                    <td>Weight</td>
                    <td>1.5 kg</td>
                </tr>
            </tbody>
        </table>
    `;
}

function setupReviewsTab(productId) {
  const reviewsPanel = document.getElementById("reviews-panel");
  reviewsPanel.innerHTML = `
        <div class="review-form">
            <h3>Write a Review</h3>
            <form id="review-form">
                <textarea id="review-text" class="review-textarea" placeholder="Share your thoughts about this product..." required></textarea>
                <button type="submit" class="review-submit">Submit Review</button>
            </form>
        </div>
        <div class="reviews-list" id="reviews-list">
            <div class="loading-reviews">Loading reviews...</div>
        </div>
    `;

  // Setup review form submission
  setupReviewForm(productId);

  // Load existing reviews
  loadReviews(productId);
}

function setupReviewForm(productId) {
  const form = document.getElementById("review-form");
  const textarea = document.getElementById("review-text");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const comment = textarea.value.trim();
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      Swal.fire({
        title: "Login Required",
        text: "You must be logged in to write a review.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0156FF",
        cancelButtonColor: "#d33",
        confirmButtonText: "Login Now",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "./../auth/auth.html";
        }
      });
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

    // Show loading state
    const submitBtn = form.querySelector("button");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Submitting...';

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

        // Show success message
        Swal.fire({
          icon: "success",
          title: "Review Submitted",
          text: "Thank you for your feedback!",
          showConfirmButton: false,
          timer: 1500,
        });
      })
      .catch((err) => {
        console.error("Failed to submit review:", err);

        // Show error message
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Failed to submit your review. Please try again later.",
        });
      })
      .finally(() => {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
  });
}

function loadReviews(productId) {
  const reviewsList = document.getElementById("reviews-list");
  reviewsList.innerHTML =
    '<div class="loading-reviews">Loading reviews...</div>';

  fetch(`http://localhost:3000/reviews?productId=${productId}`)
    .then((res) => res.json())
    .then((reviews) => {
      if (reviews.length === 0) {
        reviewsList.innerHTML =
          '<div class="no-reviews">No reviews yet. Be the first to review this product!</div>';
        return;
      }

      reviewsList.innerHTML = "";
      reviews.forEach((review) => {
        const reviewItem = document.createElement("div");
        reviewItem.className = "review-item";
        reviewItem.innerHTML = `
                    <div class="review-header">
                        <span class="review-author">${review.user.name}</span>
                        <span class="review-date">${review.date}</span>
                    </div>
                    <p class="review-content">${review.comment}</p>
                `;
        reviewsList.appendChild(reviewItem);
      });
    })
    .catch((err) => {
      console.error("Failed to load reviews:", err);
      reviewsList.innerHTML =
        '<div class="error-message">Failed to load reviews. Please try again later.</div>';
    });
}

function fetchRelatedProducts() {
  fetch("http://localhost:3000/products")
    .then((res) => res.json())
    .then((products) => {
      // Filter to get only approved products and limit to 4
      const approvedProducts = products.filter((p) => p.approved).slice(0, 4);
      renderRelatedProducts(approvedProducts);
    })
    .catch((err) => {
      console.error("Failed to fetch related products:", err);
    });
}

function renderRelatedProducts(products) {
  const container = document.querySelector(".related-products-container");
  container.innerHTML = "";

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.setAttribute("data-id", product.id);
    productCard.style.cursor = "pointer";
    productCard.addEventListener("click", () => {
      viewProductDetails(product.id);
    });

    productCard.innerHTML = `
            <img src="${product.imageUrl}" alt="${
      product.title
    }" class="product-card-img">
            <div class="product-card-content">
                <h3 class="product-card-title">${
                  product.title.length > 20
                    ? product.title.slice(0, 20) + "..."
                    : product.title
                }</h3>
                <div class="product-card-price">${product.price} EGP</div>
                <button class="product-card-btn">View Details</button>
            </div>
        `;
    container.appendChild(productCard);
  });
}

function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons and panels
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabPanels.forEach((panel) => panel.classList.remove("active"));

      // Add active class to clicked button and corresponding panel
      button.classList.add("active");
      const tabId = button.getAttribute("data-tab");
      document.getElementById(`${tabId}-panel`).classList.add("active");
    });
  });
}

function setupBackToTop() {
  const backToTopBtn = document.getElementById("backToTop");

  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add("active");
    } else {
      backToTopBtn.classList.remove("active");
    }
  });

  backToTopBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Helper Functions
function generatePlaceholderThumbnails(count) {
  let thumbnails = "";
  for (let i = 0; i < count; i++) {
    thumbnails += `<img src="https://placehold.co/100x100?text=Image+${
      i + 2
    }" alt="Product thumbnail" class="product-thumbnail" onclick="changeMainImage(this.src)">`;
  }
  return thumbnails;
}

// Global functions that need to be accessible from HTML
window.changeMainImage = (src) => {
  const mainImage = document.getElementById("mainImage");
  mainImage.src = src;

  // Update active thumbnail
  const thumbnails = document.querySelectorAll(".product-thumbnail");
  thumbnails.forEach((thumb) => {
    if (thumb.src === src) {
      thumb.classList.add("active");
    } else {
      thumb.classList.remove("active");
    }
  });
};

window.incrementQuantity = () => {
  const input = document.getElementById("quantityInput");
  input.value = Number.parseInt(input.value) + 1;
};

window.decrementQuantity = () => {
  const input = document.getElementById("quantityInput");
  if (Number.parseInt(input.value) > 1) {
    input.value = Number.parseInt(input.value) - 1;
  }
};

window.addToCart = (productId) => {
  const quantity = Number.parseInt(
    document.getElementById("quantityInput").value
  );
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    Swal.fire({
      title: "You need to log in!",
      text: "Please log in to add items to your cart.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0156FF",
      cancelButtonColor: "#d33",
      confirmButtonText: "Go to Login",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "./../auth/auth.html";
      }
    });
    return;
  }

  // Fetch product details
  fetch(`http://localhost:3000/products/${productId}`)
    .then((res) => res.json())
    .then((product) => {
      // Fetch cart
      return fetch("http://localhost:3000/cart")
        .then((res) => res.json())
        .then((orders) => {
          const userOrder = orders.find((order) => order.user.id === user.id);

          if (userOrder) {
            // User already has a cart
            const existingProduct = userOrder.products.find(
              (p) => p.id === product.id
            );
            let updatedProducts;

            if (existingProduct) {
              // Product already in cart, update quantity
              updatedProducts = userOrder.products.map((p) => {
                if (p.id === product.id) {
                  return { ...p, quantity: (p.quantity || 1) + quantity };
                }
                return p;
              });
            } else {
              // Add new product to cart
              updatedProducts = [
                ...userOrder.products,
                {
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  imageUrl: product.imageUrl,
                  quantity: quantity,
                },
              ];
            }

            // Update cart
            return fetch(`http://localhost:3000/cart/${userOrder.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ products: updatedProducts }),
            });
          } else {
            // Create new cart for user
            return fetch("http://localhost:3000/cart", {
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
                    quantity: quantity,
                  },
                ],
              }),
            });
          }
        });
    })
    .then(() => {
      // Show success message
      Swal.fire({
        icon: "success",
        title: "Added to Cart",
        text: "Product has been added to your cart!",
        showConfirmButton: false,
        timer: 1500,
      });
    })
    .catch((err) => {
      console.error("Failed to add to cart:", err);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to add product to cart. Please try again later.",
      });
    });
};

window.addToWishlist = (productId) => {
  // This is a placeholder function - you can implement wishlist functionality
  Swal.fire({
    icon: "info",
    title: "Wishlist",
    text: "Wishlist functionality coming soon!",
    showConfirmButton: false,
    timer: 1500,
  });
};

window.viewProductDetails = (productId) => {
  localStorage.setItem("productId", productId);
  // Instead of just reloading, we'll navigate to the details page
  window.location.href = "./details.html";
};
