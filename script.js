const WHATSAPP_NUMBER = "94770828319";
const SIZES = ["Small", "Medium", "Large", "Extra Large"];

const cart = [];
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartCount = document.querySelector("#cart-count");
const cartTotal = document.querySelector("#cart-total");
const requestOrderButton = document.querySelector("#request-order");
const clearCartButton = document.querySelector("#clear-cart");

function formatPrice(amount) {
  return `LKR ${amount.toLocaleString("en-LK")}`;
}

function getPriceValue(priceText) {
  return Number(priceText.replace(/[^\d]/g, ""));
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function getProductData(card) {
  const name = card.querySelector("h3").textContent.trim();
  const priceText = card.querySelector(".product-info strong").textContent.trim();
  const colors = [...card.querySelectorAll(".swatch")]
    .map((swatch) => swatch.getAttribute("title"))
    .filter(Boolean);

  return {
    name,
    price: getPriceValue(priceText),
    colors
  };
}

function createField(labelText, field) {
  const wrapper = document.createElement("div");
  const label = document.createElement("label");

  label.textContent = labelText;
  label.setAttribute("for", field.id);
  wrapper.append(label, field);

  return wrapper;
}

function createSelect(id, options) {
  const select = document.createElement("select");
  select.id = id;

  options.forEach((optionText) => {
    const option = document.createElement("option");
    option.textContent = optionText;
    option.value = optionText;
    select.append(option);
  });

  return select;
}

function addProductControls(card, index) {
  const product = getProductData(card);
  const productId = `${slugify(product.name)}-${index}`;
  const form = document.createElement("form");
  const options = document.createElement("div");
  const colorSelect = createSelect(`${productId}-color`, product.colors);
  const sizeSelect = createSelect(`${productId}-size`, SIZES);
  const quantityInput = document.createElement("input");
  const addButton = document.createElement("button");

  form.className = "product-order";
  form.setAttribute("aria-label", `Add ${product.name} to cart`);
  options.className = "product-options";

  quantityInput.id = `${productId}-quantity`;
  quantityInput.type = "number";
  quantityInput.min = "1";
  quantityInput.value = "1";

  addButton.className = "button primary";
  addButton.type = "submit";
  addButton.textContent = "Add to Cart";

  const quantityField = createField("Quantity", quantityInput);
  quantityField.className = "quantity-field";

  options.append(
    createField("Color", colorSelect),
    createField("Size", sizeSelect),
    quantityField
  );

  form.append(options, addButton);
  card.append(form);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const quantity = Math.max(1, Number(quantityInput.value) || 1);

    addToCart({
      name: product.name,
      price: product.price,
      color: colorSelect.value,
      size: sizeSelect.value,
      quantity
    });

    quantityInput.value = "1";
    document.querySelector("#cart").scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

function addToCart(item) {
  const existingItem = cart.find(
    (cartItem) =>
      cartItem.name === item.name &&
      cartItem.color === item.color &&
      cartItem.size === item.size
  );

  if (existingItem) {
    existingItem.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function getCartTotals() {
  return cart.reduce(
    (totals, item) => {
      totals.quantity += item.quantity;
      totals.price += item.price * item.quantity;
      return totals;
    },
    { quantity: 0, price: 0 }
  );
}

function renderCart() {
  const totals = getCartTotals();

  cartItems.innerHTML = "";
  cartEmpty.hidden = cart.length > 0;
  cartCount.textContent = `${totals.quantity} ${totals.quantity === 1 ? "item" : "items"}`;
  cartTotal.textContent = formatPrice(totals.price);
  requestOrderButton.disabled = cart.length === 0;
  clearCartButton.disabled = cart.length === 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    const li = document.createElement("li");
    const details = document.createElement("div");
    const title = document.createElement("h4");
    const meta = document.createElement("p");
    const price = document.createElement("strong");
    const removeButton = document.createElement("button");

    li.className = "cart-item";
    title.textContent = item.name;
    meta.textContent = `${item.color} / ${item.size} / Qty ${item.quantity}`;
    price.textContent = formatPrice(itemTotal);
    removeButton.className = "remove-item";
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => removeFromCart(index));

    details.append(title, meta);
    li.append(details, price, removeButton);
    cartItems.append(li);
  });
}

function buildWhatsAppMessage() {
  const totals = getCartTotals();
  const lines = [
    "Hello CEYLOOM, I would like to request this T-shirt order:",
    ""
  ];

  cart.forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.name}`,
      `Color: ${item.color}`,
      `Size: ${item.size}`,
      `Quantity: ${item.quantity}`,
      `Unit Price: ${formatPrice(item.price)}`,
      `Subtotal: ${formatPrice(item.price * item.quantity)}`,
      ""
    );
  });

  lines.push(
    `Total Quantity: ${totals.quantity}`,
    `Estimated Total: ${formatPrice(totals.price)}`,
    "",
    "Please confirm availability, final price, and delivery details."
  );

  return lines.join("\n");
}

function requestOrder() {
  if (cart.length === 0) {
    return;
  }

  const message = encodeURIComponent(buildWhatsAppMessage());
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank", "noopener");
}

document.querySelectorAll(".product-card").forEach(addProductControls);
requestOrderButton.addEventListener("click", requestOrder);
clearCartButton.addEventListener("click", () => {
  cart.length = 0;
  renderCart();
});
renderCart();
