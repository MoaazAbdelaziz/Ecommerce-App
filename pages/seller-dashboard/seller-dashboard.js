window.addEventListener('load', function () {
    let user = JSON.parse(localStorage.getItem("user"));

    
    console.log(user);
    if (!user) {
        window.location.href = "./../home/home.html";
        console.log("User not logged in. Redirecting to login page.");

        
    }else if (user.role == "customer") {
        window.location.href = "./../home/home.html";
        console.log("User logged in. Welcome back!");
    }
    else{

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
        approved: true,
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
          displayProducts(productArr);
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
            updatedProduct.id = currentEditProductId; // retain id
            productArr[index] = updatedProduct;
            displayProducts(productArr);
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
                            <div class="product-price"><small>$${
                              p.price
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
          fetch(`http://localhost:3000/products/${id}`, {
            method: "DELETE",
          })
            .then((res) => {
              if (!res.ok) throw new Error("Delete failed");
              productArr = productArr.filter((p) => p.id != id);
              displayProducts(productArr);
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
          displayProducts(productArr);
          bindEditEvents();
          bindDeleteEvents();
        })
        .catch((err) => console.error("Fetch error:", err));
    }

    searchInput.addEventListener("input", function () {
      const searchValue = searchInput.value.toLowerCase();
      const filtered = productArr.filter((p) =>
        p.title.toLowerCase().includes(searchValue)
      );
      displayProducts(filtered);
      bindEditEvents();
      bindDeleteEvents();
    });

    listAllproducts();

    }
    
    

});
