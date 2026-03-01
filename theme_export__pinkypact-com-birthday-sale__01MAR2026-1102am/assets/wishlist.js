// Initial setup: read the wishlist from the cookie
let cookieValue = document.cookie.match('(^|;) ?' + 'wishlists' + '=([^;]*)(;|$)');
let wishlistArray = cookieValue ? JSON.parse(cookieValue[2]) : [];

// Function to update wishlist indicators
const updateWishlistIndicators = () => {
  const allWishHeadLink = document.querySelectorAll('.wishlist_link');
  if (wishlistArray.length) {
    allWishHeadLink.forEach(link => {
      link.classList.add('active');
      link.querySelector('.wishlist-bubble').classList.remove('hidden');
      link.querySelector('.wishlist-bubble').innerText = wishlistArray.length;
    });
  } else {
    allWishHeadLink.forEach(link => {
      link.classList.remove('active');
      link.querySelector('.wishlist-bubble').classList.add('hidden');
    });
  }
};

// Function to update the wishlist cookie
const updateWishlistCookie = () => {
  let arrayString = JSON.stringify(wishlistArray);
  let expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 30);
  document.cookie = `wishlists=${arrayString}; expires=${expirationDate.toUTCString()}; path=/`;
  console.log( document.cookie," document.cookie")
};

// Function to handle button clicks
const onButtonClick = (button) => {
  if (button.classList.contains('active')) {
    button.classList.remove('active');
  } else {
    button.classList.add('active');
  }
  
  let existingItem = wishlistArray.find(obj => obj.var === button.dataset.var);
  if (!existingItem) {
    let newItem = {
      id: button.dataset.id,
      title: button.dataset.title,
      handle: button.dataset.handle,
      var: button.dataset.var,
      image: button.dataset.img,
      quantity: parseInt(button.dataset.qty),
      tags: button.dataset.tag.split(',')
    };
    wishlistArray.push(newItem);
  } else {
    wishlistArray = wishlistArray.filter(obj => obj.var !== button.dataset.var);
  }
  updateWishlistCookie();
  updateWishlistIndicators();
};

// Initialize wishlist product buttons
document.querySelectorAll('.wishlist-Product').forEach(button => {
  if (wishlistArray.find(obj => obj.var === button.dataset.var)) {
    button.classList.add('active');
  }
  if (!button.classList.contains('disabled')) {
    button.addEventListener('click', () => {
      onButtonClick(button);
    });
  }
});

updateWishlistIndicators();

// Polling function to check stock status
const checkStockStatus = async () => {
  try {
    let updatedWishlist = [];
    for (let item of wishlistArray) {
      let response = await fetch(`${location.origin}${item.handle}?sections=check-stock`);
      let data = await response.json();
      let parser = new DOMParser();
      let doc = parser.parseFromString(data["check-stock"], 'text/html');
      let stockStatus = doc.body.textContent.trim();
      if (stockStatus === 'inStock') {
        updatedWishlist.push(item);
      }
    }
    wishlistArray = updatedWishlist;
    updateWishlistCookie();
    updateWishlistIndicators();
  } catch (error) {
    // console.error('Error checking stock status:', error);
  }
};
// setInterval(checkStockStatus, 3600000);
// checkStockStatus();
