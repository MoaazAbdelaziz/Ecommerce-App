window.addEventListener('load', function () {
   const menu = document.querySelector(".menu-content");
   const menuItems = document.querySelectorAll(".submenu-item");
   const subMenuTitles = document.querySelectorAll(".submenu .menu-title");
   const homeLink = document.querySelector(".home-link");

   
    homeLink.addEventListener("click", () => {
        window.location.href = "./../home/home.html";
    });

    menuItems.forEach((item, index) => {
        item.addEventListener("click", () => {
            menu.classList.add("submenu-active");
            item.classList.add("show-submenu");

            menuItems.forEach((item2, index2) => {
                if (index !== index2) {
                    item2.classList.remove("show-submenu");
                }
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
        const productForm = this.document.querySelector("#newProductForm");
        
    const productMangement = document.querySelector(".remove-form");
    function showProductList(){
        productList.style.display = 'flex';
        newProductFrom.style.display = "none";
    }
    function showProductForm() {
                    productList.style.display = "none";
                    newProductFrom.style.display = "block";
    }
productMangement.addEventListener("click", function () {
    showProductList();
})

    newProductFrom.style.display = "none";
    const newProductBtn = document.getElementById("new-product");
    newProductBtn.addEventListener('click', function () {
        showProductForm();
    });

productForm.addEventListener("submit", function (event) {
    event.preventDefault();
    showProductList();
    const formData = new FormData(productForm);
    const newProduct = {
      title: formData.get("title"),
      imageUrl: formData.get("imageUrl"),
      price: formData.get("price"),
      description: formData.get("description"),
      category: formData.get("category"),
        quantity: formData.get("quantity"),
      approved: true,
      seller: JSON.parse(localStorage.getItem("user")),
    };
    fetch('http://localhost:3000/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then((result) => {
            console.log('Success:', result);
            productForm.reset();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
})

const productTable = document.querySelector(".product-table");
const productArr= [];
let user = JSON.parse(localStorage.getItem("user"));
let cart=""
listAllproducts();
function listAllproducts(){
    
fetch('http://localhost:3000/products')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then((data) => {
            console.log('Success:', data);
            for (let i = 0; i < data.length; i++) {
                if (data[i].seller.email === user.email) {
                    productArr.push(data[i]);
                }
            }
            console.log(productArr);
            
            for (let i = 0; i < productArr.length; i++) {
                cart += `
                <div class="product-card">
                <div class="product-tumb">
                    <img src="${productArr[i].imageUrl}" alt="">
                </div>
                <div class="product-details">
                    <span class="product-catagory">${productArr[i].category}</span>
                    <h4>${productArr[i].title.slice(0, 20)}</h4>
                    <p>${productArr[i].description.slice(0, 50)}</p>
                    <div class="product-bottom-details">
                        <div>
                            <p>Quantity: ${productArr[i].quantity}</p>
                            <div class="product-price"><small>$${productArr[i].price}</small></div>
                        </div>
                        <div class="product-controls">
                            <i class="fa fa-pen"></i>
                            <i class="fa fa-shopping-cart"></i>
                        </div>
                    </div>
                </div>
            </div>
                `;
            }
            productTable.innerHTML = cart;
            
            })
        .catch((error) => {
            console.error('Error:', error);
        });


}

const searchInput = document.querySelector("#search");
searchInput.addEventListener("input", function () {
    const searchValue = searchInput.value.toLowerCase();
    const filteredProducts = productArr.filter(product => product.title.toLowerCase().includes(searchValue));
    let cart = "";
    for (let i = 0; i < filteredProducts.length; i++) {
        cart += `
        <div class="product-card">
        <div class="product-tumb">
            <img src="${filteredProducts[i].imageUrl}" alt="">
        </div>
        <div class="product-details">
            <span class="product-catagory">${filteredProducts[i].category}</span>
            <h4>${filteredProducts[i].title.slice(0, 20)}</h4>
            <p>${filteredProducts[i].description.slice(0, 50)}</p>
            <div class="product-bottom-details">
                <div>
                    <p>Quantity: ${filteredProducts[i].quantity}</p>
                    <div class="product-price"><small>$${filteredProducts[i].price}</small></div>
                </div>
                <div class="product-controls">
                    <i class="fa fa-pen"></i>
                    <i class="fa fa-shopping-cart"></i>
                </div>
            </div>
        </div>
    </div>
        `;
    }
    productTable.innerHTML = cart;
});



});
