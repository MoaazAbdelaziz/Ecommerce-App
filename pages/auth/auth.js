// pages/auth/auth.js

import {
  validateName,
  validateEmail,
  validatePassword,
  showAlert,
  hideAlert,
} from "./../utils.js";
const arrUsers = [];
window.onload = function () {
  fetch("http://localhost:3000/users")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((user) => {
        arrUsers.push(user);
      }); 
      console.log("Users loaded:", arrUsers);
    })
}
for(let i = 0; i < arrUsers.length; i++) {
    console.log(arrUsers[i].name, arrUsers[i].email, arrUsers[i].password);
}


const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");


const svg=document.querySelector("svg");
svg.addEventListener("click", () => {
    container.classList.remove("right-panel-active");
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        console.log("User logged in. Welcome back!");
        window.location.href = "./../home/home.html";
    } else {
        console.log("User not logged in. Redirecting to login page.");
        window.location.href = "./../auth/auth.html";
    }
})

signUpButton.addEventListener("click", () => {
  container.classList.add("right-panel-active");
});

signInButton.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
});

const signUpForm = document.getElementById("signUpForm");
const alertBox = document.querySelector(".alert");

signUpForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
for(let i = 0; i < arrUsers.length; i++) {
    if (arrUsers[i].email === signUpForm.remail.value.trim()) {
        showAlert(alertBox, "Email already exists.");
        return;
    }
  }
  if (isNameValid && isEmailValid && isPasswordValid) {
      const formData = new FormData(signUpForm);
      const data = Object.fromEntries(formData.entries());
      console.log("✅ Form Data:", data);

      fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "Network response was not ok " + response.statusText
            );
          }
          return response.json();
        })
        .then((result) => {
          console.log("Success:", result);
          signUpForm.reset();
          hideAlert(alertBox);
        })
        .catch((error) => {
          console.error("Error:", error);
          showAlert(alertBox, "There was a problem with registration");
        });
    } else {
      console.log("Form not valid, fix the errors first.");
    }
});

// Attach real-time validation
document.getElementById("rname").addEventListener("input", validateName);
document.getElementById("remail").addEventListener("input", validateEmail);
document.getElementById("rpassword").addEventListener("input", validatePassword);



const homeButton = document.querySelector(".home");

homeButton.addEventListener("click", () => {
    if (!localStorage.getItem("user")) {
        console.log("User not logged in. Redirecting to login page.");
    } else {
        console.log("User logged in. Welcome back!");
        window.location.href = "./../home/home.html";
    }
});



// Elements
const loginForm = document.querySelector(".sign-in");
const loginEmail = document.getElementById("lemail");
const loginPassword = document.getElementById("lpassword");
const loginAlertBox = document.querySelector(".alert2");

// Event Listener
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  fetch("http://localhost:3000/users")
    .then((response) => response.json())
    .then((data) => {
      const user = data.find(
        (user) =>
          user.email === loginEmail.value.trim() &&
          user.password === loginPassword.value.trim()
      );
      if (user) {
        console.log("✅ Login successful:", user);
        loginForm.reset();
        localStorage.setItem("user", JSON.stringify(user));
        hideAlert(loginAlertBox);
        window.location.href = "./../home/home.html";
        
      } else {
        showAlert(loginAlertBox, "Invalid email or password.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showAlert(loginAlertBox, "There was a problem with login");
    });
});
