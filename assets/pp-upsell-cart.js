const upsell_loader = (loaderDiv, state) => {
  if (state == true) {
    loaderDiv.classList.add("active");
  } else {
    loaderDiv.classList.remove("active");
  }
};

const thisCart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');

const upsell_product = (e) => {
  let loaderDiv = e.target.closest(".Stack__item").querySelector(".loader");
  let loaderBubmit = e.target.closest("body").querySelector(`#${e.target.dataset.id}`);
  let cartItems = e.target.closest("cart-drawer").querySelector("cart-drawer-items");

  if (e.target.checked == true) {
    upsell_loader(loaderDiv, true);
    e.target.classList.add("active");
    setTimeout(() => {
    upsell_loader(loaderDiv, false);
    loaderBubmit.click();
    }, 1000);
  } else {
    upsell_loader(loaderDiv, true);
    setTimeout(() => {
      upsell_loader(loaderDiv, false);
      cartItems.updateQuantity(e.target.dataset.index, 0);
    }, 1000);
    e.target.classList.remove("active");
  }
};