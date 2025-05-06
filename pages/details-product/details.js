window.onload = function () {
  const productId = localStorage.getItem("productId");

  if (!productId) {
    console.error("No product selected.");
    return;
  }

  fetch(`http://localhost:3000/products/${productId}`)
    .then((res) => res.json())
    .then((product) => {
      const container = document.querySelector(".product-details-container");
      container.innerHTML = `
  <img src="${product.imageUrl}" alt="${product.title}" />
  <div class="product-info">
    <h2>${product.title}</h2>
    
    <p style=" font-weight: bold; font-size: 25px; color: #0156FF; " class="description">${product.description}</p>
    <p class="price">${product.category} </p>
    
    <p class="price">${product.price} EGP</p>
    <p>${product.description}</p>
  </div>
`;
    })
    .catch((err) => {
      console.error("Failed to fetch product:", err);
    });
};
