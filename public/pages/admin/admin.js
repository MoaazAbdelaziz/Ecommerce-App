window.addEventListener('load', function () {
    const user = JSON.parse(localStorage.getItem("user"));
    const logOut = document.querySelector(".logout");
    const manageUsersBtn = document.querySelector(".manage-users");
    const manageProductsBtn = document.querySelector(".manage-products");
    const manageOrdersBtn = document.querySelector(".manage-orders");

    console.log(user);

    if (!user) {
        window.location.href = "./../home/home.html";
    } else if (user.role == "customer") {
        window.location.href = "./../home/home.html";
    } else if (user.role == "seller") {
        window.location.href = "./../seller-dashboard/seller-dashboard.html";
    }

    logOut.addEventListener("click", () => {
        localStorage.removeItem("user");
        window.location.href = "./../auth/auth.html";
    });


    manageUsersBtn.addEventListener("click", () => {
        window.location.href = "./user-managment/user-managment.html";
    });

    manageProductsBtn.addEventListener("click", () => {
        window.location.href = "./product-managment/product-managment.html";
    });

    manageOrdersBtn.addEventListener("click", () => {
        window.location.href = "./order-managment/order-managment.html";
    });
});