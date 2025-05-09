
window.addEventListener("load", function () {
  let user = JSON.parse(localStorage.getItem("user"));


  if (!user) {
    window.location.href = "./../home/home.html";
  } else if (user.role == "customer") {
    window.location.href = "./../home/home.html";
  } else {
    const menu = document.querySelector(".menu-content");
    const menuItems = document.querySelectorAll(".submenu-item");
    const subMenuTitles = document.querySelectorAll(".submenu .menu-title");
    const logOut = document.querySelector(".home-link");

    logOut.addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "./../auth/auth.html";
    });

    menuItems.forEach((item, index) => {
      item.addEventListener("click", () => {
        menu.classList.add("submenu-active");
        item.classList.add("show-submenu");
        menuItems.forEach((item2, index2) => {
          if (index !== index2) item2.classList.remove("show-submenu");
        });
      });
    });

    subMenuTitles.forEach((title) => {
      title.addEventListener("click", () => {
        menu.classList.remove("submenu-active");
      });
    });

    const productList = document.querySelector(".product-list");
    const newProductFrom = document.getElementById("new-product-form");
    const productForm = document.querySelector("#newProductForm");
    const productMangement = document.querySelector(".remove-form");
    const submitButton = document.getElementById("submitBtn");
    const updateBtn = document.getElementById("updateBtn");
    const newProductBtn = document.getElementById("new-product");
    const productTable = document.querySelector(".product-table");
    const searchInput = document.querySelector("#search");






    let productArr = [];
    let currentEditProductId = null;

    updateBtn.style.display = "none";
    newProductFrom.style.display = "none";

    function showProductList() {
      productList.style.display = "flex";
      newProductFrom.style.display = "none";
      submitButton.style.display = "block";
      updateBtn.style.display = "none";
      currentEditProductId = null;
    }

    function showProductForm() {
      productList.style.display = "none";
      newProductFrom.style.display = "block";
    }

    productMangement.addEventListener("click", showProductList);
    newProductBtn.addEventListener("click", () => {
      productForm.reset();
      showProductForm();
    });

    submitButton.addEventListener("click", function (event) {
      event.preventDefault();
      const formData = new FormData(productForm);
      const newProduct = {
        title: formData.get("title"),
        imageUrl: formData.get("imageUrl"),
        price: formData.get("price"),
        description: formData.get("description"),
        category: formData.get("category"),
        quantity: formData.get("quantity"),
        approved: false,
        seller: user,
      };

      fetch("http://localhost:3000/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      })
        .then((res) => res.json())
        .then((result) => {
          productArr.push(result);
          productForm.reset();
          showProductList();
          displayProducts(productArr.filter((p) => p.approved === true));
          bindEditEvents();
          bindDeleteEvents();
        })
        .catch((error) => console.error("Error:", error));
    });

    updateBtn.addEventListener("click", function (event) {
      event.preventDefault();
      if (!currentEditProductId) return;

      const formData = new FormData(productForm);
      const updatedProduct = {
        title: formData.get("title"),
        imageUrl: formData.get("imageUrl"),
        price: formData.get("price"),
        description: formData.get("description"),
        category: formData.get("category"),
        quantity: formData.get("quantity"),
        approved: true,
        seller: user,
      };

      fetch(`http://localhost:3000/products/${currentEditProductId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to update");
          const index = productArr.findIndex(
            (p) => p.id == currentEditProductId
          );
          if (index !== -1) {
            updatedProduct.id = currentEditProductId;
            productArr[index] = updatedProduct;
            displayProducts(productArr.filter((p) => p.approved === true));
            bindEditEvents();
            bindDeleteEvents();
            showProductList();
          }
        })
        .catch((err) => console.error("Update error:", err));
    });

    function displayProducts(products) {
      productTable.innerHTML = products
        .map(
          (p, i) => `
            <div class="product-card">
                <div class="product-tumb">
                    <img src="${p.imageUrl}" alt="">
                </div>
                <div class="product-details">
                    <span class="product-catagory">${p.category}</span>
                    <h4>${p.title.slice(0, 20)}</h4>
                    <p>${p.description.slice(0, 50)}</p>
                    <div class="product-bottom-details">
                        <div>
                            <p>Quantity: ${p.quantity}</p>
                            <div class="product-price"><small>$${p.price
            }</small></div>
                        </div>
                        <div class="product-controls">
                            <i class="fa fa-pen" data-index="${i}"></i>
                            <i class="fa fa-trash" data-id="${p.id}"></i>
                        </div>
                    </div>
                </div>
            </div>
        `
        )
        .join("");
    }

    function bindDeleteEvents() {
      document.querySelectorAll(".fa-trash").forEach((icon) => {
        icon.addEventListener("click", () => {
          const id = icon.getAttribute("data-id");
          const product = productArr.find((p) => p.id == id);

          if (product && product.seller.email !== user.email) {
            alert("You are not authorized to delete this product.");
            return;
          }

          fetch(`http://localhost:3000/products/${id}`, {
            method: "DELETE",
          })
            .then((res) => {
              if (!res.ok) throw new Error("Delete failed");
              return fetch(`http://localhost:3000/reviews?productId=${id}`);
            })
            .then((res) => res.json())
            .then((reviews) => {
              const deletePromises = reviews.map((review) =>
                fetch(`http://localhost:3000/reviews/${review.id}`, {
                  method: "DELETE",
                })
              );
              return Promise.all(deletePromises);
            })
            .then(() => {
              productArr = productArr.filter((p) => p.id != id);
              displayProducts(productArr.filter((p) => p.approved === true));
              bindEditEvents();
              bindDeleteEvents();
            })
            .catch((err) => console.error("Delete error:", err));
        });
      });
    }



    function bindEditEvents() {
      document.querySelectorAll(".fa-pen").forEach((icon) => {
        icon.addEventListener("click", () => {
          const index = icon.getAttribute("data-index");
          const product = productArr[index];

          if (product.seller.email !== user.email) {
            alert("You are not authorized to edit this product.");
            return;
          }

          productForm.title.value = product.title;
          productForm.imageUrl.value = product.imageUrl;
          productForm.price.value = product.price;
          productForm.description.value = product.description;
          productForm.category.value = product.category;
          productForm.quantity.value = product.quantity;
          currentEditProductId = product.id;

          showProductForm();
          submitButton.style.display = "none";
          updateBtn.style.display = "block";
        });
      });
    }


    function listAllproducts() {
      fetch("http://localhost:3000/products")
        .then((res) => res.json())
        .then((data) => {
          productArr = data.filter((p) => p.seller.email === user.email);
          const approvedProducts = productArr.filter(
            (p) => p.approved === true
          );

          displayProducts(approvedProducts);
          bindEditEvents();
          bindDeleteEvents();
        })
        .catch((err) => console.error("Fetch error:", err));
    }

    searchInput.addEventListener("input", function () {
      const searchValue = searchInput.value.toLowerCase();
      const filtered = productArr
        .filter((p) => p.approved === true)
        .filter((p) => p.title.toLowerCase().includes(searchValue));
      displayProducts(filtered);
      bindEditEvents();
      bindDeleteEvents();
    });

    listAllproducts();
  }

  //list all orders 

  const seller = JSON.parse(localStorage.getItem("user"));
  const viewOrdersBtn = document.querySelector("#view-orders");
  const OrderManagement = document.querySelector(".Order-Management");
  const ordersContainer = document.querySelector(".orders-containers");
  const ordersList = document.querySelector("section");



  viewOrdersBtn.addEventListener("click", function () {
    ordersList.style.display = "block";

    document.getElementById("new-product-form").style.display = "none";
    document.getElementById("product-list").style.display = "none";
    listSellerOrders();
  })

  OrderManagement.addEventListener("click", function () {
    document.querySelector("#new-product-form").style.display = "none";
    document.querySelector(".product-list").style.display = "flex";
    ordersList.style.display = "none";


    showProductList();
  })



  function listSellerOrders() {
    fetch("http://localhost:3000/orders")
      .then((res) => res.json())
      .then((orders) => {
        ordersContainer.innerHTML = "";
        let orderCount = 0;


        orders.forEach((order) => {

          const sellerProducts = order.products.filter(
            (prod) => prod.seller?.email === seller.email
          );

          if (sellerProducts.length > 0) {
            orderCount++;
            const orderDiv = document.createElement("div");


            const productsHTML = sellerProducts

              .map(
                (prod) => `
              <div class="order-card">
                        <img style="width: 100px; height: 100px;" src="${prod.imageUrl}" alt="">
                        <div class="order-details">
                            <h3>${prod.title}</h3>
                            <div class="order-quantity">Quantity: ${prod.quantity}</div>
                            <div class="order-total">Total: $${(prod.price * prod.quantity).toFixed(2)}</div>
                            <div class="order-date">customr: ${order.user.name}</div>
                            <div class="order-date">customr email: ${order.user.email}</div>
                              
                            

                    </div>
                 </div>
            `
              )
              .join("");
            orderDiv.innerHTML = `
            <h2>order #${orderCount}</h2>
            ${productsHTML}
            <h2>Total: $${order.total}</h2>


            <div style="display: flex; gap: 20px; justify-content: center; align-items: center;">

            <div style="margin: 20px 0; font-weight: bold; font-size: 20px;" class="order-date">order status: ${order.status}</div>
             <select  name="status"  data-index="${orderCount - 1}" data-id="${order.id}" id="status">
            <option value=""hidden>select status</option>
            <option value="pending">pending</option>
            <option value="delivered">delivered</option>
            <option value="shipped">shipped</option>
            </select>
    
</div>



  
          `;
            orderDiv.style = `
            border: 1px solid #ccc;
            border-radius: 5px;
            padding: 10px;
            margin: 30px 0;
            background-color: #f9f9f9;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s;
          
            `
            ordersContainer.appendChild(orderDiv);

            const statusSelect = orderDiv.querySelector("#status");
            statusSelect.addEventListener("change", function () {
              const newStatus = statusSelect.value;
              const orderId = statusSelect.getAttribute("data-id");
              fetch(`http://localhost:3000/orders/${orderId}`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
              })
                .then((res) => res.json())
                .then((data) => {
                  listSellerOrders();
                })
                .catch((err) => console.error("Fetch error:", err));
            });

          }




        });

        if (orderCount === 0) {
          ordersContainer.innerHTML = "<p>No orders found for this seller.</p>";
        }
      })
      .catch((err) => console.error("Fetch error:", err));
  }






});
