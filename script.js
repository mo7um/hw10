const API_URL = "https://fakestoreapi.com";

async function getProducts() {
  try {
    const responce = await fetch(`${API_URL}/products`);
    if (!responce.ok) throw new Error(responce.statusText);
    const products = await responce.json();
    displayProducts(products);
  } catch (error) {
    console.log(error.message);
  }
}

function displayProducts(products) {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";
  products.forEach((product) => {
    const productElement = document.createElement("div");
    productElement.className = "product";
    productElement.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p>$${product.price}</p>
      <button onclick="deleteProduct(${product.id})">Delete</button>
    `; // при нажатии на кнопку удаления вызывается функция deleteProduct со значением id товара
    productList.appendChild(productElement);
  });
}

async function addProduct(event) {
  event.preventDefault(); // Предотвращаем стандартное поведение браузера, отменяем отправку формы и обновление страницы.
  const newProduct = {
    // Подготавливаем описание нового продукта к преобразованию в формат json дял отправки на сервер.
    title: document.getElementById("productTitle").value,
    price: parseFloat(document.getElementById("productPrice").value),
    category: document.getElementById("productCategory").value,
    description: document.getElementById("productDescription").value,
    image: document.getElementById("productImage").value
  };

  // очиста полей ввода после отправки
  const inputs = document.querySelectorAll(".productInput");
  inputs.forEach((input) => {
    input.value = "";
  });

  try {
    const response = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // Сообщаем серверу что отправляемые данные имеют формат json.
      body: JSON.stringify(newProduct)
    });
    if (!response.ok) throw new Error("Network response was not ok"); // Проверяем выполнение запроса, если запрос не выполнен выводим сообщение об ошибке.
    const addedProduct = await response.json();
    showMessage("Товар успешно добавлен");
    getProducts();
  } catch (error) {
    showMessage("Error adding product: " + error.message, "error");
  }
}

async function deleteProduct(id) {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Network response was not ok");
    showMessage("Товар успешно удален");
    getProducts();
  } catch (error) {
    showMessage("Error deleting product: " + error.message, "error");
  }
}

function showMessage(message, type = "success") {
  const messageElement = document.getElementById("popUpMessage");
  messageElement.textContent = message;
  messageElement.className = type;
  messageElement.style.display = "block";
  setTimeout(() => {
    messageElement.style.display = "none";
  }, 3000);
}

document.getElementById("addProductForm").addEventListener("submit", addProduct);
getProducts();
