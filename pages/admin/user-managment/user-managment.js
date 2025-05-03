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
                <p style="font-size: 14px; color: #475569;"><strong>Role:</strong> ${user.role}</p>
                <div class="user-actions">
                    <button class="edit-btn" data-id="${user.id}">Edit</button>
                    <button class="delete-btn" data-id="${user.id}">Delete</button>
                </div>
            </div>
        `;
    });
};

const getUsers = async function () {
    const response = await fetch("http://localhost:3000/users");
    const data = await response.json();
    if (!response.ok) throw new Error("Network response was not ok " + response.statusText);
    return data;
};

const addUser = async function (user) {
    const response = await fetch("http://localhost:3000/users", {
        method: "POST",
        body: JSON.stringify(user),
    });
    const data = await response.json();
    if (!response.ok) throw new Error("Network response was not ok " + response.statusText);
};

const deleteUser = async function (id) {
    const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: "DELETE",
    });
    const data = await response.json();
    if (!response.ok) throw new Error("Network response was not ok " + response.statusText);

    const cartRes = await fetch(`http://localhost:3000/cart`);
    const cartData = await cartRes.json();
    const userCart = cartData.find(cart => cart.user.id === id);
    if (userCart) {
        await fetch(`http://localhost:3000/cart/${userCart.id}`, { method: "DELETE" });
    }

    const productsRes = await fetch(`http://localhost:3000/products`);
    const products = await productsRes.json();
    const userProducts = products.filter(p => p.seller.id === id);
    for (const product of userProducts) {
        await fetch(`http://localhost:3000/products/${product.id}`, { method: "DELETE" });
    }
};

const updateUser = async function (id, updatedData) {
    const updateRes = await fetch(`http://localhost:3000/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updatedData),
    });
    if (!updateRes.ok) throw new Error("Failed to update user");

    const productsRes = await fetch("http://localhost:3000/products");
    const products = await productsRes.json();
    const cartsRes = await fetch("http://localhost:3000/cart");
    const carts = await cartsRes.json();

    if (updatedData.role === "customer") {
        const userProducts = products.filter(p => p.seller.id === id);
        for (const product of userProducts) {
            await fetch(`http://localhost:3000/products/${product.id}`, { method: "DELETE" });
        }
    }

    if (updatedData.role === "seller") {
        const userCart = carts.find(cart => cart.user.id === id);
        if (userCart) await fetch(`http://localhost:3000/cart/${userCart.id}`, { method: "DELETE" });
    }
};

const validateForm = function (updatedEmail) {
    const name = document.getElementById("name").value.trim();
    const email = updatedEmail.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.querySelector("select").value;

    if (!name || !email || !password || !role) {
        Swal.fire("Validation Error", "Please fill in all fields.", "error");
        return false;
    }

    if (name.length < 3) {
        Swal.fire("Validation Error", "Name must be at least 3 characters long.", "error");
        return false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        Swal.fire("Validation Error", "Please enter a valid email address.", "error");
        return false;
    }


    if (password.length < 6) {
        Swal.fire("Validation Error", "Password must be at least 6 characters long.", "error");
        return false;
    }

    return true;
};

const checkEmailUnique = async function (email, id) {
    const usersRes = await fetch("http://localhost:3000/users");
    const users = await usersRes.json();

    const userWithSameEmail = users.find(user => user.email === email && user.id !== id);
    if (userWithSameEmail) {
        Swal.fire("Validation Error", "This email is already in use by another user.", "error");
        return false;
    }

    return true;
};

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

    let users = await getUsers();
    let customerOrSellerOrOtherAdmins = users.filter(user => user.role === "customer" || user.role === "seller" || user.id !== userAdmin.id);
    const usersContainer = document.querySelector(".user-container");
    renderUsers(customerOrSellerOrOtherAdmins, usersContainer);

    const searchInput = document.querySelector(".search-input");
    searchInput.addEventListener("keyup", function () {
        const query = this.value.toLowerCase().trim();
        const filtered = customerOrSellerOrOtherAdmins.filter(user =>
            user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
        );
        renderUsers(filtered, usersContainer);
    });

    const formModal = document.getElementById("add-update-modal");
    const addUserBtn = document.querySelector(".add-user-btn");
    const formClose = document.querySelector(".close");
    const userManagmentContainer = document.querySelector(".user-management-container");
    formModal.style.display = "none";

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
                confirmButtonText: "Yes, delete it!"
            });

            if (result.isConfirmed) {
                try {
                    await deleteUser(id);
                    users = await getUsers();
                    customerOrSellerOrOtherAdmins = users.filter(user => user.role === "customer" || user.role === "seller" || user.id !== userAdmin.id);
                    renderUsers(customerOrSellerOrOtherAdmins, usersContainer);

                    Swal.fire("Deleted!", "The user and their data have been deleted.", "success");
                } catch (error) {
                    Swal.fire("Error", "Failed to delete user: " + error.message, "error");
                }
            }
        } else if (e.target.classList.contains("edit-btn")) {
            const id = e.target.getAttribute("data-id");
            let user = customerOrSellerOrOtherAdmins.find(user => user.id === id);
            userManagmentContainer.style.display = "none";
            formModal.style.display = "block";

            document.getElementById("name").value = user.name;
            document.getElementById("email").value = user.email;
            document.getElementById("password").value = user.password;
            document.querySelector("select").value = user.role;

            const submitBtn = document.getElementById("submit");
            submitBtn.textContent = "Update";
            submitBtn.addEventListener("click", async function (e) {
                e.preventDefault();
                const updatedEmail = document.getElementById("email").value;

                if (await checkEmailUnique(updatedEmail, id) && validateForm(updatedEmail)) {
                    const updatedData = {
                        name: document.getElementById("name").value,
                        email: updatedEmail,
                        password: document.getElementById("password").value,
                        role: document.querySelector("select").value,
                    };

                    try {
                        await updateUser(id, updatedData);

                        users = await getUsers();
                        customerOrSellerOrOtherAdmins = users.filter(user => user.role === "customer" || user.role === "seller" || user.id !== userAdmin.id);
                        renderUsers(customerOrSellerOrOtherAdmins, usersContainer);

                        Swal.fire("Success", "User updated successfully", "success");
                        formModal.style.display = "none";
                        userManagmentContainer.style.display = "block";
                    } catch (error) {
                        Swal.fire("Error", "Failed to update user: " + error.message, "error");
                    }
                }
            });
        }
    });

    addUserBtn.addEventListener("click", function () {
        const title = document.querySelector(".title");
        const form = document.getElementById("add-update-form");
        const submitBtn = document.getElementById("submit");
        submitBtn.value = "Add";
        title.textContent = "Add New User";
        userManagmentContainer.style.display = "none";
        formModal.style.display = "block";

        submitBtn.addEventListener("click", async function (e) {
            e.preventDefault();
            const formData = new FormData(form);
            const name = formData.get("name");
            const email = formData.get("email");
            const password = formData.get("password");
            const role = formData.get("role");

            if (await checkEmailUnique(email) && validateForm(email)) {
                const newUser = {
                    name,
                    email,
                    password,
                    role,
                };

                try {
                    await addUser(newUser);
                    users = await getUsers();
                    customerOrSellerOrOtherAdmins = users.filter(user => user.role === "customer" || user.role === "seller" || user.id !== userAdmin.id);
                    renderUsers(customerOrSellerOrOtherAdmins, usersContainer);

                    Swal.fire("Success", "User added successfully", "success");
                    formModal.style.display = "none";
                    userManagmentContainer.style.display = "block";
                } catch (error) {
                    Swal.fire("Error", "Failed to add user: " + error.message, "error");
                }
            }
        });

    });

    formClose.addEventListener("click", function () {
        formModal.style.display = "none";
        userManagmentContainer.style.display = "block";
    });
});