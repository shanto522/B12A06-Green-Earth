const categoriesEl = document.getElementById("categories");
const plantsEl = document.getElementById("plants");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const loadingEl = document.getElementById("loading");

const loadWordDetail = async (id) => {
  const url = `https://openapi.programming-hero.com/api/plant/${id}`;
  const res = await fetch(url);
  const details = await res.json();
  displayWordDetails(details.plants);
};

const displayWordDetails = (plant) => {
  console.log(plant);
  const detailsBox = document.getElementById("details-container");
  detailsBox.innerHTML = `
  
  <div>
      <h2 class="text-[20px] font-bold">${plant.name}</h2>
    </div>
    <div>
      <img class="w-full  h-50 object-cover rounded-md cursor-pointer" src="${plant.image}" alt="">
    </div>
    <div>
      <p ><span class="font-bold">Category :</span> ${plant.category}</p>
    </div>
    <div>
      <p ><span class="font-bold">Price :</span> ৳${plant.price}</p>
    </div>
    <div>
      <p ><span class="font-bold">Description :</span> ${plant.description} </p>
    </div>
  
  `;
  document.getElementById("word_modal").showModal();
};
let activeCategory = "all";
let cart = [];
let allPlants = [];

const categoriesList = [
  { id: "fruittree", category_name: "Fruit Tree" },
  { id: "floweringtree", category_name: "Flowering Tree" },
  { id: "shadetree", category_name: "Shade Tree" },
  { id: "medicinaltree", category_name: "Medicinal Tree" },
  { id: "timbertree", category_name: "Timber Tree" },
  { id: "evergreentree", category_name: "Evergreen Tree" },
  { id: "ornamentalplant", category_name: "Ornamental Plant" },
  { id: "bamboo", category_name: "Bamboo" },
  { id: "climber", category_name: "Climber" },
  { id: "aquaticplant", category_name: "Aquatic Plant" },
];

function showLoading(show = true) {
  if (show) {
    loadingEl.classList.remove("hidden");
    plantsEl.classList.add("hidden");
  } else {
    loadingEl.classList.add("hidden");
    plantsEl.classList.remove("hidden");
  }
}

async function smartLoading(fetchFunc) {
  const start = Date.now();
  const result = await fetchFunc();
  const elapsed = Date.now() - start;
  if (elapsed < 150) await new Promise((res) => setTimeout(res, 150 - elapsed));
  return result;
}

function renderCategories() {
  categoriesEl.innerHTML = `<li>
      <button onclick="selectCategory('all')" class="w-full font-semibold text-left px-3 py-2 rounded-md ${
        activeCategory === "all"
          ? "bg-green-600 text-white"
          : "bg-white hover:bg-green-100"
      }">All Trees</button>
    </li>`;

  categoriesList.forEach((cat) => {
    categoriesEl.innerHTML += `<li>
        <button onclick="selectCategory('${
          cat.id
        }')" class="w-full font-semibold text-left px-3 py-2 rounded-md ${
      activeCategory === cat.id
        ? "bg-green-600 text-white"
        : "bg-white hover:bg-green-100"
    }">${cat.category_name}</button>
      </li>`;
  });
}

function renderPlants(plants) {
  if (!plants || plants.length === 0) {
    plantsEl.innerHTML = `<p class="col-span-12 text-center text-gray-500">No plants found in this category.</p>`;
    return;
  }

  plantsEl.innerHTML = plants
    .map((plant) => {
      const plantId = plant.id || plant.plantId || plant._id || "";
      return `
        <div class="bg-white rounded-xl shadow p-4 flex flex-col space-y-3">
          <img src="${plant.image}" alt="${
        plant.name
      }" class="w-full h-40 object-cover rounded-md mb-3 cursor-pointer" ('${plantId}')">
          <h3 onclick="loadWordDetail(${
            plant.id
          })" class="font-bold cursor-pointer hover:underline">${
        plant.name
      }</h3>
          <p class="text-sm text-gray-600 mb-2">${
            plant.description ? plant.description.slice(0, 70) : ""
          }...</p>
          <div class="flex justify-between items-center">
            <span class="bg-[#DCFCE7] px-4 py-2 rounded-full font-bold text-[#15803D]">${
              plant.category
            }</span>
            <span class="font-bold">৳${plant.price}</span>
          </div>
          <button onclick="addToCart('${plantId}','${plant.name}',${
        plant.price
      })" class="mt-auto font-semibold cursor-pointer bg-green-600 text-white py-2 px-4 rounded-full hover:bg-green-700">Add to Cart</button>
        </div>`;
    })
    .join("");
}

async function loadAllPlants() {
  showLoading(true);
  try {
    const data = await smartLoading(async () => {
      const res = await fetch(
        "https://openapi.programming-hero.com/api/plants"
      );
      return await res.json();
    });
    allPlants = data.data || data.plants || [];
    renderPlants(allPlants);
  } catch (err) {
    console.error("Failed to load plants", err);
    plantsEl.innerHTML = `<p class="text-center text-red-500 col-span-12">Failed to load plants. Check your internet connection.</p>`;
  } finally {
    showLoading(false);
  }
}

async function selectCategory(id) {
  activeCategory = id;
  renderCategories();
  showLoading(true);
  await smartLoading(async () => {
    const filtered =
      id === "all"
        ? allPlants
        : allPlants.filter(
            (p) => (p.category || "").toLowerCase().replace(/\s+/g, "") === id
          );
    renderPlants(filtered);
  });
  showLoading(false);
}

function addToCart(id, name, price) {
  const existing = cart.find((i) => i.id === id);
  if (existing) existing.qty++;
  else cart.push({ id, name, price, qty: 1 });
  renderCart();
}

function removeFromCart(id) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  if (item.qty > 1) item.qty--;
  else cart = cart.filter((i) => i.id !== id);
  renderCart();
}

function renderCart() {
  cartItemsEl.innerHTML = cart
    .map(
      (i) => `
      <div class="flex justify-between items-center bg-green-50 rounded-md px-2 py-3">
        <div class="font-bold"><span>${i.name} </span>
          <div class="text-gray-500 text-[18px]">৳${i.price} × ${i.qty}</div>
        </div>
        <button onclick="removeFromCart('${i.id}')" class="text-red-500 font-extrabold cursor-pointer"><i class="fa-solid fa-xmark"></i></button>
      </div>
    `
    )
    .join("");

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  cartTotalEl.textContent = "৳" + total;
}
renderCategories();
loadAllPlants();
