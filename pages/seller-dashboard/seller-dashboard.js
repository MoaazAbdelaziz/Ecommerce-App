window.addEventListener('load', function () {
    const menu = document.querySelector(".menu-content");
    const menuItems = document.querySelectorAll(".submenu-item");
    const subMenuTitles = document.querySelectorAll(".submenu .menu-title");
    const homeLink = document.querySelector(".home-link");
    const productList = document.querySelector(".product-list");
    const newProductBtn = document.getElementById("new-product");
    const newProductFrom = document.getElementById("new-product-form");

    newProductFrom.style.display = "none";


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

    newProductBtn.addEventListener('click', function () {
        productList.style.display = 'none';
        newProductFrom.style.display = "block";
    });
});
