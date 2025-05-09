document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar")
    const toggleSidebarBtn = document.getElementById("toggle-sidebar")
    const mobileSidebarToggle = document.getElementById("mobile-sidebar-toggle")
    const logoutBtn = document.getElementById("logout-btn")
    const manageUsersBtn = document.querySelector(".manage-users")
    const manageProductsBtn = document.querySelector(".manage-products")
    const manageOrdersBtn = document.querySelector(".manage-orders")
    const adminNameElement = document.getElementById("admin-name")
    const dashboardContainer = document.querySelector(".dashboard-container")
    const userNameElement = document.querySelector(".user-name")
    const userEmailElement = document.querySelector(".user-email")
    const avatrarElement = document.querySelector(".avatar")


    const storedUser = localStorage.getItem("user")

    if (!storedUser) {
        window.location.href = "./../home/home.html"
        return
    }

    const user = JSON.parse(storedUser)

    if (user.name) {
        adminNameElement.textContent = user.name
    }

    if (user.role === "customer") {
        window.location.href = "./../home/home.html"
        return
    } else if (user.role === "seller") {
        window.location.href = "./../seller-dashboard/seller-dashboard.html"
        return
    }

    userNameElement.textContent = user.name
    userEmailElement.textContent = user.email
    avatrarElement.textContent = user.name.charAt(0).toUpperCase()


    toggleSidebarBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed")
        dashboardContainer.classList.toggle("sidebar-collapsed")
    })

    mobileSidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active")
    })

    document.addEventListener("click", (event) => {
        const isClickInsideSidebar = sidebar.contains(event.target)
        const isClickOnMobileToggle = mobileSidebarToggle.contains(event.target)

        if (!isClickInsideSidebar && !isClickOnMobileToggle && window.innerWidth <= 992) {
            sidebar.classList.remove("active")
        }
    })

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("user")
        window.location.href = "./../auth/auth.html"
    })

    if (manageUsersBtn) {
        manageUsersBtn.addEventListener("click", () => {
            window.location.href = "./user-managment/user-managment.html"
        })
    }

    if (manageProductsBtn) {
        manageProductsBtn.addEventListener("click", () => {
            window.location.href = "./product-managment/product-managment.html"
        })
    }

    if (manageOrdersBtn) {
        manageOrdersBtn.addEventListener("click", () => {
            window.location.href = "./order-managment/order-managment.html"
        })
    }

    function handleResize() {
        if (window.innerWidth <= 992) {
            sidebar.classList.remove("collapsed")
            dashboardContainer.classList.remove("sidebar-collapsed")
        } else {
            sidebar.classList.remove("active")
        }
    }

    window.addEventListener("resize", handleResize)
    handleResize()
})
