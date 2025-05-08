const renderProducts = function (products, productContainer) {
    productContainer.innerHTML = "";

    if (products.length === 0) {
        productContainer.innerHTML = `
            <div style="text-align: center; width: 100%; padding: 40px; font-size: 18px; color: #64748b;">
                No products found.
            </div>
        `;
    } else {
        products.forEach(product => {
            productContainer.innerHTML += `
                <div class="product-card">
                    <img src=${product.imageUrl}>

                    <button class="badge approve-toggle ${product.approved ? 'approved' : 'rejected'}" data-id="${product.id}">
                        ${product.approved ? 'Approved' : 'Not Approved'}
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
                        <p><strong>Email:</strong> 
                            ${product.seller.email.length > 25 ? product.seller.email.slice(0, 25) + "..." : product.seller.email}
                        </p>
                    </div>

                    <div class="product-actions">
                        <button class="btn edit-btn" data-id="${product.id}">Edit</button>
                        <button class="btn delete-btn" data-id="${product.id}">Delete</button>
                    </div>
                </div>
            `;
        });
    }

    attachDeleteEventListeners();
    attachAprroveToggleEventListeners();
    attachUpdateEventListeners();
};

const attachDeleteEventListeners = function () {
    const deleteBtns = document.querySelectorAll(".delete-btn");
    deleteBtns.forEach(btn => {
        btn.addEventListener("click", async function () {
            const id = this.getAttribute("data-id");
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: 'Do you really want to delete this product?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, keep it',
                reverseButtons: true
            });

            if (result.isConfirmed) {
                try {
                    await deleteProduct(id);
                    products = await getAllProducts();
                    Swal.fire({
                        icon: 'success',
                        title: 'Product Deleted',
                        text: 'The product was deleted successfully!',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    applySearchAndFilter(products, currentFilter, searchInput.value.trim(), productContainer);
                } catch (err) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Deletion Failed',
                        text: 'Failed to delete the product. Please try again.',
                    });
                }
            }
        });
    });
}

const attachAprroveToggleEventListeners = function () {
    const approveToggleBtns = document.querySelectorAll(".approve-toggle");

    approveToggleBtns.forEach(btn => {
        btn.addEventListener("click", async function () {
            const id = this.getAttribute("data-id");
            const approved = this.classList.contains("approved");

            const actionText = approved ? "reject" : "approve";
            const confirmText = approved ? "Yes, reject it!" : "Yes, approve it!";
            const successMsg = approved ? "Product has been rejected." : "Product has been approved.";

            const result = await Swal.fire({
                title: `Are you sure you want to ${actionText} this product?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: confirmText
            });

            if (result.isConfirmed) {
                try {
                    await toggleApproval(id, approved);
                    products = await getAllProducts();
                    applySearchAndFilter(products, currentFilter, searchInput.value.trim(), productContainer);

                    Swal.fire({
                        title: "Success!",
                        text: successMsg,
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false
                    });
                } catch (err) {
                    console.error(err);
                    Swal.fire("Error", "Something went wrong!", "error");
                }
            }
        });
    });
};

const attachUpdateEventListeners = function () {
    const updateModal = document.getElementById("update-modal");
    const productManagmentContainer = document.querySelector(".product-management-container");
    const updateForm = document.getElementById("update-form");
    const editBtns = document.querySelectorAll(".edit-btn");

    editBtns.forEach(btn => {
        btn.addEventListener("click", async function () {
            productManagmentContainer.style.display = "none";
            updateModal.style.display = "block";
            const id = this.getAttribute("data-id");

            const product = products.find(p => p.id == id);
            console.log(product)
            updateForm.setAttribute("data-id", id);

            updateForm.querySelector("#title").value = product.title;
            updateForm.querySelector("#category").value = product.category;
            updateForm.querySelector("#price").value = product.price;
            updateForm.querySelector("#quantity").value = product.quantity;
            updateForm.querySelector("#description").value = product.description;
            updateForm.querySelector("#image-url").value = product.imageUrl;
        });
    });

    updateForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const id = updateForm.getAttribute("data-id");
        const updatedProduct = {
            title: updateForm.querySelector("#title").value,
            category: updateForm.querySelector("#category").value,
            price: updateForm.querySelector("#price").value,
            quantity: updateForm.querySelector("#quantity").value,
            description: updateForm.querySelector("#description").value,
            imageUrl: updateForm.querySelector("#image-url").value
        };

        try {
            await editProduct(id, updatedProduct);

            Swal.fire({
                icon: "success",
                title: "Product Updated",
                text: "The product was updated successfully.",
                timer: 1500,
                showConfirmButton: false
            });

            products = await getAllProducts();
            updateModal.style.display = "none";
            updateForm.reset();
            productManagmentContainer.style.display = "block";
            applySearchAndFilter(products, currentFilter, searchInput.value.trim(), productContainer);
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text: "Something went wrong while updating the product."
            });
        }
    });
};

const filterProducts = function (allProducts, filterValue) {
    if (filterValue === "all") {
        return allProducts;
    } else if (filterValue === "approved") {
        return allProducts.filter(p => p.approved);
    } else {
        return allProducts.filter(p => !p.approved);
    }
};

const applySearchAndFilter = function (allProducts, filterValue, searchQuery, productContainer) {
    let filtered = filterProducts(allProducts, filterValue);
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(product =>
            product.title.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.seller.name.toLowerCase().includes(query)
        );
    }
    renderProducts(filtered, productContainer);
};

const getAllProducts = async function () {
    const response = await fetch("http://localhost:3000/products");
    const data = await response.json();
    if (!response.ok) throw new Error("Network response was not ok " + response.statusText);
    return data;
};

const toggleApproval = async function (id, approved) {
    const response = await fetch(`http://localhost:3000/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ approved: !approved }),
        headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("Network response was not ok " + response.statusText);
};

const deleteProduct = async function (id) {
    const response = await fetch(`http://localhost:3000/products/${id}`, {
        method: "DELETE"
    });
    if (!response.ok) throw new Error("Network response was not ok " + response.statusText);

    const productReviewsRes = await fetch(`http://localhost:3000/reviews?productId=${id}`);
    const productReviews = await productReviewsRes.json();
    for (const review of productReviews) {
        await fetch(`http://localhost:3000/reviews/${review.id}`, { method: "DELETE" });
    }
};

const editProduct = async function (id, updatedProduct) {
    const response = await fetch(`http://localhost:3000/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updatedProduct),
        headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("Network response was not ok " + response.statusText);
};

let products = [];
let currentFilter = "not approved";
let productContainer;
let searchInput;
window.addEventListener('load', async function () {
    const updateModal = document.getElementById("update-modal");
    updateModal.style.display = "none";

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

    products = await getAllProducts();
    productContainer = document.querySelector(".product-container");
    renderProducts(products.filter(product => product.approved === false), productContainer);

    searchInput = document.querySelector(".search-input");

    const filterSelect = document.querySelector(".filter-select");
    filterSelect.addEventListener("change", async function () {
        currentFilter = this.value;
        applySearchAndFilter(products, currentFilter, searchInput.value.trim(), productContainer);
    });

    searchInput.addEventListener("input", function () {
        applySearchAndFilter(products, currentFilter, this.value.trim(), productContainer);
    });

    const formClose = document.querySelector(".close");
    const productManagmentContainer = document.querySelector(".product-management-container");
    formClose.addEventListener("click", function () {
        updateModal.style.display = "none";
        productManagmentContainer.style.display = "block";
    });
});
