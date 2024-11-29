const API_URL = "https://fakestoreapi.com";
let currentPage = 1; // Текущая страница
const ProductsPerPage = 6; // Количество товаров на страницу
let allProducts = []; // Товары загружаются порциями

async function getProducts(category = "") {
  try {
    const response = await fetch(`${API_URL}/products${category ? `/category/${category}` : ""}`);
    if (!response.ok) throw new Error(response.statusText);
    const products = await response.json();
    allProducts = products; // Сохраняем все товары в массив
    displayProducts(getPaginatedProducts());
  } catch (error) {
    console.log(error.message);
  }
}

function getPaginatedProducts() {
  // Получаем текущую порцию товаров
  const startIndex = (currentPage - 1) * ProductsPerPage;
  const endIndex = currentPage * ProductsPerPage;
  return allProducts.slice(startIndex, endIndex);
}

function displayProducts(products) {
  const productList = document.getElementById("productList");
  if (currentPage === 1) productList.innerHTML = ""; // Очистка списка товаров при начальной загрузке

  products.forEach((product) => {
    const productElement = document.createElement("div");
    productElement.className = "product";
    productElement.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p>$${product.price}</p>
      <button onclick="deleteProduct(${product.id})">Delete</button>
    `;
    productList.appendChild(productElement);
  });

  updateLoadMoreButton();
}

function updateLoadMoreButton() {
  const loadMoreButton = document.getElementById("loadMore");
  const totalLoaded = currentPage * ProductsPerPage;

  if (totalLoaded >= allProducts.length) {
    loadMoreButton.style.display = "none"; // Скрываем кнопку, если все товары загружены
    document.getElementById("endMessage").style.display = "block";
  } else {
    loadMoreButton.style.display = "block"; // Показываем кнопку
    document.getElementById("endMessage").style.display = "none";
  }
}

function loadMoreProducts() {
  currentPage++; // Увеличиваем номер страницы
  displayProducts(getPaginatedProducts()); // Загружаем следующую порцию товаров
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
    showMessage(`Товар "${newProduct.title}" успешно добавлен`);
    getProducts();
  } catch (error) {
    showMessage("Error adding product: " + error.message, "error");
  }
}

async function deleteProduct(id) {
  try { // Получаем информацию о продукте и удаляем его
    const [productResponse, deleteResponse] = await Promise.all([
      fetch(`${API_URL}/products/${id}`),
      fetch(`${API_URL}/products/${id}`, { method: "DELETE" })
    ]);
    if (!productResponse.ok || !deleteResponse.ok) {
      throw new Error("Network response was not ok");
    }

    const product = await productResponse.json();
    showMessage(`Товар "${product.title}" успешно удален`);
    getProducts();
  } catch (error) {
    showMessage("Error deleting product: " + error.message, "error");
  }
}


async function getCategories() { // Получение категорий с API
  try {
    const response = await fetch(`${API_URL}/products/categories`);
    if (!response.ok) throw new Error(response.statusText);
    const categories = await response.json();
    populateCategoryFilter(categories);
  } catch (error) {
    console.log(error.message);
  }
}

function populateCategoryFilter(categories) { // Заполнение фильтра категориями
  const categoryFilter = document.getElementById("categoryFilter");
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  // Добавление обработчика событий для изменения выбранной категории
  categoryFilter.addEventListener("change", (event) => {
    const selectedCategory = event.target.value;
    getProducts(selectedCategory); // Вывод продуктов с соответствующей категорией
  });
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
document.getElementById("loadMore").addEventListener("click", loadMoreProducts);

getProducts();
getCategories();
