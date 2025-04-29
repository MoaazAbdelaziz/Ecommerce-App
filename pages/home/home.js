window.onload = function() {
    const user = JSON.parse(localStorage.getItem("user"));
    const sellerDashboard = document.querySelector(".seller-dashboard");
    if (user.role == "seller") {
      sellerDashboard.style.display = "block";
    } else if (user.role == "customer") {
      sellerDashboard.style.display = "none";
    }
    
    
    
    console.log("Page loaded successfully!");
    // Check if user is logged in
    const logOut=document.querySelector(".logout");
    
    const hello = document.querySelector("h1");
    hello.textContent += `${user.name}!`;

    logOut.addEventListener("click", function() {
        localStorage.removeItem("user");
        console.log("User logged out. Redirecting to login page.");
        window.location.href = "./../auth/auth.html";
    });
}