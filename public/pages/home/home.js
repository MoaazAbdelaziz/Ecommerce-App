window.onload = function () {
  const user = JSON.parse(localStorage.getItem("user"));
  const sellerDashboard = document.querySelector(".seller-dashboard");
  const cart = document.querySelector(".cart");
  const orderDashboard = document.querySelector(".orders");
  const hello = document.querySelector("h1");
  const logOut = document.querySelector(".logout");
  const logIn = document.querySelector(".login");
  let searchInput = document.getElementById("searchInput");
  let products = []; // Global declaration

  if (!user) {
    cart.style.display = "none";
    orderDashboard.style.display = "none";
    sellerDashboard.style.display = "none";
    logIn.style.display = "block";
    logOut.style.display = "none";
  } else {
    if (user.role == "seller") {
      sellerDashboard.style.display = "block";
      orderDashboard.style.display = "none";
      logIn.style.display = "none";
      window.location.href = "./../seller-dashboard/seller-dashboard.html";
    } else if (user.role == "customer") {
      sellerDashboard.style.display = "none";
      orderDashboard.style.display = "block";
      cart.style.display = "block";
      logIn.style.display = "none";

    } else if (user.role == "admin") {
      window.location.href = "./../admin/admin.html";
    } else {
      sellerDashboard.style.display = "none";
      orderDashboard.style.display = "none";
    }
  }
  logIn.addEventListener("click", function () {
    window.location.href = "./../auth/auth.html";
  });

  sellerDashboard.addEventListener("click", function () {
    window.location.href = "./../seller-dashboard/seller-dashboard.html";
  });

  // Check if user is logged in
  logOut.addEventListener("click", function () {
    localStorage.removeItem("user");
    window.location.href = "./../auth/auth.html";
  });

  // const orderDashboard = document.querySelector(".orders");

  orderDashboard.addEventListener("click", () => {
    window.location.href = "../details-product/details.html";
  });

  ////////////////////

  // Fetch and display products
  fetch("http://localhost:3000/products")
    .then((res) => res.json())
    .then((data) => {
      products = data; // store globally
      const container = document.querySelector(".products-container");

      const approvedProducts = products.filter((p) => p.approved);
      displayProducts(approvedProducts);
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
    });

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
                // imageHeight: 100,
                imageAlt: "Custom image",
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

  document
    .querySelector(".products-container")
    .addEventListener("click", (e) => {
      const productCard = e.target.closest(".product-contentt");
      if (productCard) {
        const id = productCard.getAttribute("data-id");
        productDetails(id);
      }
    });
  function productDetails(id) {
    localStorage.setItem("productId", id);
    window.location.href = "./../details-product/details.html";
  }
  function displayProducts(productList) {
    const container = document.querySelector(".products-container");
    container.innerHTML = ""; // clear old products

    productList.forEach((product) => {
      const card = document.createElement("div");
      card.classList.add("product-card");
      card.innerHTML = `
      <div style="width: 100%; cursor: pointer;" data-id="${product.id
        }" class="product-contentt" >
        <img style="width: 100%;" src="${product.imageUrl}" alt="${product.title
        }" />
        <div class="product-content">
          <h3>${product.title.slice(0, 20)}</h3>
          <p><strong>Price:</strong> ${product.price} EGP</p>
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

      container.appendChild(card);
    });
  }


  searchInput.addEventListener("input", function () {
    const searchValue = searchInput.value.toLowerCase();
    const filtered = products
      .filter((p) => p.approved === true)
      .filter((p) => p.title.toLowerCase().includes(searchValue));
    displayProducts(filtered);
  });

  orderDashboard.addEventListener("click", () => {
    window.location.href = "../details-product/details.html";
  });

  $(".custom-carousel").owlCarousel({
    autoWidth: true,
    loop: true,
  });

  $(document).ready(function () {
    $(".custom-carousel .item").click(function () {
      $(".custom-carousel .item").not($(this)).removeClass("active");
      $(this).toggleClass("active");
    });
  });



}