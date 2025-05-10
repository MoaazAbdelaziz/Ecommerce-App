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
    })
}



const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");


const svg = document.querySelector("svg");
svg.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
  window.location.href = "./../home/home.html";
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
  for (let i = 0; i < arrUsers.length; i++) {
    if (arrUsers[i].email === signUpForm.remail.value.trim()) {
      showAlert(alertBox, "Email already exists.");
      return;
    }
  }
  if (isNameValid && isEmailValid && isPasswordValid) {
    const formData = new FormData(signUpForm);
    const data = Object.fromEntries(formData.entries());


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
        signUpForm.reset();
        hideAlert(alertBox);
      })
      .catch((error) => {
        console.error("Error:", error);
        showAlert(alertBox, "There was a problem with registration");
      });
  }
});

// Attach real-time validation
document.getElementById("rname").addEventListener("input", validateName);
document.getElementById("remail").addEventListener("input", validateEmail);
document.getElementById("rpassword").addEventListener("input", validatePassword);







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
