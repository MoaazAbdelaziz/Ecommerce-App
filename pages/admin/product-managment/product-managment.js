const renderProducts = function (products, productContainer) {
    productContainer.innerHTML = "";

    products.forEach(product => {
        productContainer.innerHTML += `
            <div class="product-card">
                <img src=${product.imageUrl}>

                <button class="badge approve-toggle ${product.approved ? 'approved' : 'rejected'}">
                    ${product.approved ? 'Approved' : 'Rejected'}
                </button>

                <div class="product-details">
                    <h2 class="product-title">
                        ${product.title.length > 30 ? product.title.slice(0, 20) + "..." : product.title}
                    </h2>
                    <p><strong>Category:</strong> ${product.category}</p>
                    <p><strong>Price:</strong> $${product.price}</p>
                    <p><strong>Quantity:</strong> ${product.quantity}</p>
                    <p><strong>Description:</strong> 
                        ${product.description.length > 50 ? product.description.slice(0, 50) + "..." : product.description}
                    </p>
                    <p><strong>Seller:</strong> 
                        ${product.seller.name.length > 25 ? product.seller.name.slice(0, 25) + "..." : product.seller.name}
                    </p>
                </div>

                <div class="product-actions">
                    <button class="btn edit-btn" data-id="${product.id}">Edit</button>
                    <button class="btn delete-btn" data-id="${product.id}">Delete</button>
                </div>
            </div>
        `;
    });
};


const getAllProducts = async function () {
    const response = await fetch("http://localhost:3000/products");
    const data = await response.json();
    if (!response.ok) throw new Error("Network response was not ok " + response.statusText);
    return data;
}

window.addEventListener('load', async function () {
    const userAdmin = JSON.parse(localStorage.getItem("user"));
    if (!userAdmin || userAdmin.role === "customer") {
        window.location.href = "./../../home/home.html";
    } else if (userAdmin.role === "seller") {
        window.location.href = "./../../seller-dashboard/seller-dashboard.html";
    }

    const logOut = document.querySelector(".logout");
    logOut.addEventListener("click", () => {
        localStorage.removeItem("user");
        window.location.href = "./../../auth/auth.html";
    });

    const goBack = document.querySelector(".go-back");
    goBack.addEventListener("click", () => {
        window.location.href = "./../../admin/admin.html";
    });

    let products = await getAllProducts();
    const productContainer = document.querySelector(".product-container");
    renderProducts(products, productContainer);

});