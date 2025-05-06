window.onload = function () {
  const user = JSON.parse(localStorage.getItem("user"));
  const sellerDashboard = document.querySelector(".seller-dashboard");
  const cart = document.querySelector(".cart");
  const orderDashboard = document.querySelector(".orders");
  const hello = document.querySelector("h1");
  const logOut = document.querySelector(".logout");
  const logIn = document.querySelector(".login");

  if (!user) {
    console.log("User not logged in. Redirecting to login page.");
    cart.style.display = "none";
    orderDashboard.style.display = "none";
    sellerDashboard.style.display = "none";
    hello.textContent = "Please log in to access your dashboard.";
    logIn.style.display = "block";
    logOut.style.display = "none";

  } else {
    if (user.role == "seller") {
      sellerDashboard.style.display = "block";
      orderDashboard.style.display = "none";
      logIn.style.display = "none";
      hello.textContent += `${user.name}!`;
      window.location.href = "./../seller-dashboard/seller-dashboard.html";

    } else if (user.role == "customer") {
      sellerDashboard.style.display = "none";
      orderDashboard.style.display = "block";
      cart.style.display = "block";
      logIn.style.display = "none";

      hello.textContent += `${user.name}!`;
    } else if (user.role == "admin") {
      window.location.href = "./../admin/admin.html";
    }
    else {
      console.log("User role not recognized. Hiding seller dashboard.");
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

  console.log("Page loaded successfully!");
  // Check if user is logged in
  logOut.addEventListener("click", function () {
    localStorage.removeItem("user");
    window.location.href = "./../auth/auth.html";
    console.log("User logged out. Redirecting to login page.");
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
      const products = data;
      const container = document.querySelector(".products-container");

      const approvedProducts = products.filter((p) => p.approved);

      approvedProducts.forEach((product) => {
        const card = document.createElement("div");
        card.classList.add("product-card");
        card.innerHTML = `
        <div style="width: 100%; cursor: pointer;" data-id="${product.id}" class="product-contentt" >
        <img  style="wi dth: 100%;" src="${product.imageUrl}" alt="${product.title}" />
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
          e.stopPropagation(); // ✅ لو في حاجة بتوصل فوق
          addToCart(product);
        });

        container.appendChild(card);
      });
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
          // شوف لو المنتج ده موجود بالفعل في الأوردر
          const existingProduct = userOrder.products.find(
            (p) => p.id === product.id
          );

          let updatedProducts;

          if (existingProduct) {
            // ✅ لو موجود: زود الـ quantity
            updatedProducts = userOrder.products.map((p) => {
              if (p.id === product.id) {
                return { ...p, quantity: (p.quantity || 1) + 1 };
              }
              return p;
            });
          } else {
            // ✅ لو مش موجود: ضيفه مع quantity = 1
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
                imageAlt: "Custom image",
                title: "Added to Cart",
                text: `"${product.title}" has been added to your cart!`,
                showConfirmButton: false,
                timer: 1500,
              });
            })
            .catch((err) => console.error("Failed to update order:", err));
        } else {
          // ✅ لو مفيش أوردر: نعمل أوردر جديد
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

document.querySelector(".products-container").addEventListener("click", (e) => {
  const productCard = e.target.closest(".product-contentt");
  if (productCard) {
    const id = productCard.getAttribute("data-id");
    console.log(id);
    productDetails(id);
  }
});
  function productDetails(id) {
    localStorage.setItem("productId", id);
    window.location.href = "./../details-product/details.html";
  }


  orderDashboard.addEventListener("click", () => {
    window.location.href = "../details-product/details.html";
  });
}