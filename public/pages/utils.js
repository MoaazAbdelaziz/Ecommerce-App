// pages/utils.js

// Validation regex patterns
export const nameRegex = /^[A-Za-z\s]{3,}$/;
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex = /^.{6,}$/;

// Elements
const rname = document.getElementById("rname");
const remail = document.getElementById("remail");
const rpassword = document.getElementById("rpassword");

// Validation functions
export function validateName() {
  if (nameRegex.test(rname.value.trim())) {
    setValid(rname);
    return true;
  } else {
    setInvalid(rname, "Name should be more than 2 characters.");
    return false;
  }
}

export function validateEmail() {
  if (emailRegex.test(remail.value.trim())) {
    setValid(remail);
    return true;
  } else {
    setInvalid(remail, "Please enter a valid email address.");
    return false;
  }
}

export function validatePassword() {
  if (passwordRegex.test(rpassword.value.trim())) {
    setValid(rpassword);
    return true;
  } else {
    setInvalid(rpassword, "Password must be at least 6 characters long.");
    return false;
  }
}

// Helper UI functions
export function setValid(input) {
  input.style.border = "2px solid green";
  const alertBox = document.querySelector(".alert");
  hideAlert(alertBox);
}

export function setInvalid(input, message) {
  input.style.border = "2px solid red";
  const alertBox = document.querySelector(".alert");
  showAlert(alertBox, message);
}

export function showAlert(alertBox, message) {
  alertBox.style=`
    display: block;
    background-color: #f44336; /* Red */
    color: white;
    padding: 20px;
    margin-bottom: 15px;
    border-radius: 5px;
    `;
  alertBox.innerHTML = message;
}

export function hideAlert(alertBox) {
  if (alertBox) {
    alertBox.style.display = "none";
  }
}
