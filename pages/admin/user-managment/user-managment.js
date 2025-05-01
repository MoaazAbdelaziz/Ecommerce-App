const renderUsers = function (filteredUsers, usersContainer) {
    usersContainer.innerHTML = "";

    if (filteredUsers.length === 0) {
        usersContainer.innerHTML = `
            <div style="text-align: center; width: 100%; padding: 40px; font-size: 18px; color: #64748b;">
                No users found for your search.
            </div>
        `;
        return;
    }

    filteredUsers.forEach(user => {
        usersContainer.innerHTML += `
            <div class="user-card">
                <div class="user-info">
                    <h2>${user.name}</h2>
                    <p>${user.email}</p>
                </div>
                <div class="user-role">
                    <label>Role:</label>
                    <select>
                        <option ${user.role === "customer" ? "selected" : ""}>Customer</option>
                        <option ${user.role === "seller" ? "selected" : ""}>Seller</option>
                    </select>
                </div>
                <div class="user-actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn" data-id="${user.id}">Delete</button>
                </div>
            </div>
        `;
    });
};

const getUsers = async function () {
    const response = await fetch("http://localhost:3000/users");
    const data = await response.json();
    if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
    }
    return data;
};

const deleteUser = async function (id) {
    const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: "DELETE",
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
    }

    const cartRes = await fetch(`http://localhost:3000/cart`);
    const cartData = await cartRes.json();
    const userCart = cartData.find(cart => cart.user.id === id);
    if (userCart) {
        await fetch(`http://localhost:3000/cart/${userCart.id}`, {
            method: "DELETE",
        });
    }

    const productsRes = await fetch(`http://localhost:3000/products`);
    const products = await productsRes.json();
    const userProducts = products.filter(p => p.seller.id === id);
    for (const product of userProducts) {
        await fetch(`http://localhost:3000/products/${product.id}`, {
            method: "DELETE",
        });
    }
};

const updateUser = async function (id, role) {
    const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
    }
};

window.addEventListener('load', async function () {
    const user = JSON.parse(localStorage.getItem("user"));
    const logOut = document.querySelector(".logout");
    const goBack = document.querySelector(".go-back");
    const usersContainer = document.querySelector(".user-container");
    const searchInput = document.querySelector(".search-input");

    if (!user || user.role === "customer") {
        window.location.href = "./../../home/home.html";
    } else if (user.role === "seller") {
        window.location.href = "./../../seller-dashboard/seller-dashboard.html";
    }

    logOut.addEventListener("click", () => {
        localStorage.removeItem("user");
        window.location.href = "./../../auth/auth.html";
    });

    goBack.addEventListener("click", () => {
        window.location.href = "./../../admin/admin.html";
    });

    let users = await getUsers();
    let customerOrSeller = users.filter(user => user.role === "customer" || user.role === "seller");

    renderUsers(customerOrSeller, usersContainer);

    searchInput.addEventListener("keyup", function () {
        const query = this.value.toLowerCase().trim();
        const filtered = customerOrSeller.filter(user =>
            user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
        );
        renderUsers(filtered, usersContainer);
    });

    usersContainer.addEventListener("click", async function (e) {
        if (e.target.classList.contains("delete-btn")) {
            const id = e.target.getAttribute("data-id");

            const result = await Swal.fire({
                title: "Are you sure?",
                text: "This will permanently delete the user and all related data!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes, delete it!",
            });

            if (result.isConfirmed) {
                try {
                    await deleteUser(id);
                    users = await getUsers();
                    customerOrSeller = users.filter(user => user.role === "customer" || user.role === "seller");
                    renderUsers(customerOrSeller, usersContainer);

                    Swal.fire("Deleted!", "The user and their data have been deleted.", "success");
                } catch (error) {
                    Swal.fire("Error", "Failed to delete user: " + error.message, "error");
                }
            }
        }
    });
});
