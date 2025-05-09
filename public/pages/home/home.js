document.addEventListener("DOMContentLoaded", function () {
  // User authentication
  const user = JSON.parse(localStorage.getItem("user"));
  const sellerDashboard = document.querySelector(".seller-dashboard");
  const cart = document.querySelector(".cart");
  const orderDashboard = document.querySelector(".orders");
  const logOut = document.querySelector(".logout");
  const logIn = document.querySelector(".login");
  let searchInput = document.getElementById("searchInput");
  let products = []; // Global declaration

  // Handle user authentication state
  if (!user) {
    console.log("User not logged in.");
    cart.style.display = "none";
    orderDashboard.style.display = "none";
    sellerDashboard.style.display = "none";
    logIn.style.display = "flex";
    logOut.style.display = "none";
  } else {
    if (user.role == "seller") {
      window.location.href = "./../seller-dashboard/seller-dashboard.html";
      sellerDashboard.style.display = "flex";
      orderDashboard.style.display = "none";
      logIn.style.display = "none";
      logOut.style.display = "flex";
    } else if (user.role == "customer") {
      sellerDashboard.style.display = "none";
      orderDashboard.style.display = "flex";
      cart.style.display = "flex";
      logIn.style.display = "none";
      logOut.style.display = "flex";
    } else if (user.role == "admin") {
      window.location.href = "./../admin/admin.html";
    } else {
      console.log("User role not recognized.");
      sellerDashboard.style.display = "none";
      orderDashboard.style.display = "none";
      logOut.style.display = "flex";
    }
  }

  // Event listeners for navigation
  logIn.addEventListener("click", function () {
    window.location.href = "./../auth/auth.html";
  });

  sellerDashboard.addEventListener("click", function () {
    window.location.href = "./../seller-dashboard/seller-dashboard.html";
  });

  logOut.addEventListener("click", function () {
    localStorage.removeItem("user");
    window.location.href = "./../auth/auth.html";
    console.log("User logged out. Redirecting to login page.");
  });

  orderDashboard.addEventListener("click", () => {
    window.location.href = "../details-product/details.html";
  });

  // Mobile menu toggle
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.querySelector(".nav-menu");

  navToggle.addEventListener("click", function () {
    navMenu.classList.toggle("active");

    // Animate hamburger to X
    const spans = navToggle.querySelectorAll("span");
    if (navMenu.classList.contains("active")) {
      spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
      spans[1].style.opacity = "0";
      spans[2].style.transform = "rotate(-45deg) translate(7px, -6px)";
    } else {
      spans[0].style.transform = "none";
      spans[1].style.opacity = "1";
      spans[2].style.transform = "none";
    }
  });

  // Search toggle
  const searchToggle = document.getElementById("searchToggle");
  const searchContainer = document.getElementById("searchContainer");

  searchToggle.addEventListener("click", function () {
    searchContainer.classList.toggle("active");
    if (searchContainer.classList.contains("active")) {
      searchInput.focus();
    }
  });

  // Back to top button
  const backToTopBtn = document.getElementById("backToTop");

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

  // Initialize Owl Carousel
  $(".custom-carousel").owlCarousel({
    autoWidth: true,
    loop: true,
    dots: true,
    autoplay: true,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 2,
      },
      1000: {
        items: 3,
      },
    },
  });

  // Handle carousel item click
  $(".custom-carousel .item").click(function () {
    $(".custom-carousel .item").not($(this)).removeClass("active");
    $(this).toggleClass("active");
  });

  // Fetch and display products
  fetch("http://localhost:3000/products")
    .then((res) => res.json())
    .then((data) => {
      products = data; // store globally
      const approvedProducts = products.filter((p) => p.approved);
      displayProducts(approvedProducts);
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
      // Display placeholder products if API fails
      displayPlaceholderProducts();
    });

  // Function to display placeholder products if API fails
  function displayPlaceholderProducts() {
    const placeholderProducts = [
      {
        id: 1,
        title: "Gaming Headset Pro",
        price: 129.99,
        description:
          "Immersive 7.1 surround sound gaming headset with noise-cancelling microphone",
        imageUrl: "https://placehold.co/300x300?text=Gaming+Headset",
      },
      {
        id: 2,
        title: "Mechanical Gaming Keyboard",
        price: 89.99,
        description:
          "RGB backlit mechanical keyboard with customizable keys and macro support",
        imageUrl: "https://placehold.co/300x300?text=Gaming+Keyboard",
      },
      {
        id: 3,
        title: "Ultra-Light Gaming Mouse",
        price: 59.99,
        description:
          "Precision gaming mouse with adjustable DPI and programmable buttons",
        imageUrl: "https://placehold.co/300x300?text=Gaming+Mouse",
      },
      {
        id: 4,
        title: "4K Gaming Monitor",
        price: 349.99,
        description:
          "27-inch 4K gaming monitor with 144Hz refresh rate and 1ms response time",
        imageUrl: "https://placehold.co/300x300?text=Gaming+Monitor",
      },
    ];

    displayProducts(placeholderProducts);
  }

  // Function to display products
  function displayProducts(productList) {
    const container = document.querySelector(".products-container");
    container.innerHTML = ""; // clear old products

    productList.forEach((product) => {
      const card = document.createElement("div");
      card.classList.add("product-card");
      card.innerHTML = `
        <div data-id="${product.id}" class="product-contentt">
          <img src="${product.imageUrl}" alt="${product.title}" />
          <div class="product-content">
            <h3>${
              product.title.length > 20
                ? product.title.slice(0, 20) + "..."
                : product.title
            }</h3>
            <p class="price">${product.price} EGP</p>
            <p>${product.description.substring(0, 60)}...</p>
          </div>
          <button type="button" class="add-to-cart">Add to Cart</button>
        </div>
      `;

      const addToCartBtn = card.querySelector(".add-to-cart");
      addToCartBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        addToCart(product);
      });

      card.querySelector(".product-contentt").addEventListener("click", () => {
        productDetails(product.id);
      });

      container.appendChild(card);
    });
  }

  // Function to handle product details
  function productDetails(id) {
    localStorage.setItem("productId", id);
    window.location.href = "./../details-product/details.html";
  }

  // Function to handle adding to cart
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
                imageWidth: 200,
                imageAlt: "Product image",
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

  // Search functionality
  searchInput.addEventListener("input", function () {
    const searchValue = searchInput.value.toLowerCase();
    if (products.length > 0) {
      const filtered = products
        .filter((p) => p.approved === true)
        .filter((p) => p.title.toLowerCase().includes(searchValue));
      displayProducts(filtered);
    }
  });

  // Newsletter form submission
  const newsletterForm = document.querySelector(".newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = this.querySelector("input").value;

      // You can implement actual newsletter subscription here

      Swal.fire({
        icon: "success",
        title: "Subscribed!",
        text: `You've been subscribed to our newsletter with ${email}`,
        showConfirmButton: false,
        timer: 2000,
      });

      this.reset();
    });
  }

  // Animate elements on scroll
  const animateOnScroll = function () {
    const elements = document.querySelectorAll(
      ".category-card, .product-card, .section-title"
    );

    elements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.2;

      if (elementPosition < screenPosition) {
        element.style.opacity = "1";
        element.style.transform = "translateY(0)";
      }
    });
  };

  // Set initial state for animated elements
  document
    .querySelectorAll(".category-card, .product-card, .section-title")
    .forEach((element) => {
      element.style.opacity = "0";
      element.style.transform = "translateY(20px)";
      element.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    });

  // Run animation on scroll
  window.addEventListener("scroll", animateOnScroll);
  // Run once on page load
  animateOnScroll();
});
