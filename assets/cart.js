  var CART_TIMER_KEY = 'cart_timer_start';
var MAX_TIME = 30 * 60 * 1000; // 30 minutes

let countdownInterval; // global timer reference

function startTimer() {
  const now = Date.now();
  localStorage.setItem(CART_TIMER_KEY, now.toString());
  updateTimerDisplay();
}

function getRemainingTime() {
  const startTime = parseInt(localStorage.getItem(CART_TIMER_KEY), 10);
  if (!startTime) return 0;
  const now = Date.now();
  const timePassed = now - startTime;
  return MAX_TIME - timePassed;
}

function clearCart() {
  const interval = setInterval(() => {
    const removeBtn = document.querySelector('cart-remove-button');

    if (removeBtn) {
      removeBtn.click(); // Trigger click on first remove button
    } else {
      clearInterval(interval);
      clearInterval(countdownInterval);

      localStorage.removeItem(CART_TIMER_KEY); // ✅ clear timer key
      console.log("Cart is now empty ✅");

      // also clear timer UI if exists
      const timerElement = document.getElementById('cart-timer');
      if (timerElement) {
        timerElement.textContent = '';
        document.querySelector('.count-down-timer').style.display = 'none';
      }
    }
  }, 500);
}

function updateTimerDisplay() {
  clearInterval(countdownInterval); // reset if already running

  countdownInterval = setInterval(() => {
    const remaining = getRemainingTime();

    if (remaining <= 0) {
      clearInterval(countdownInterval);
      clearCart();
      return;
    }

    // update UI
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    const timerElement = document.getElementById('cart-timer');

    if (timerElement) {
      timerElement.textContent = `Reserviert für  ${minutes}:${seconds < 10 ? '0' : ''}${seconds} Min!`;
      document.querySelector('.count-down-timer').style.display = 'flex';
    }
  }, 500);
}

// ✅ Proper definition
window.initCartTimer = function () {
  fetch('/cart.js')
    .then(response => response.json())
    .then(cart => {
      if (cart.items && cart.items.length > 0) {
        if (!localStorage.getItem(CART_TIMER_KEY)) {
          startTimer(); // start fresh
        } else {
          updateTimerDisplay(); // resume
        }
        document.querySelector('.count-down-timer').style.display  = 'flex';
      } else {
        localStorage.removeItem(CART_TIMER_KEY);
        clearInterval(countdownInterval);

        const timerElement = document.getElementById('cart-timer');
        if (timerElement) {
          timerElement.textContent = '';
          timerElement.style.display = 'none';
        }
      }
    });
};

class CartRemoveButton extends HTMLElement {   
  constructor() {
    super();

    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
      cartItems.updateQuantity(this.dataset.index, 0);
      
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);
 

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.lineItemStatusElement =
      document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus');

    const debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, ON_CHANGE_DEBOUNCE_TIMER);

    this.addEventListener('change', debouncedOnChange.bind(this));
  }

  cartUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
      if (event.source === 'cart-items') {
        return;
      }
      this.onCartUpdate();
    });
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber();
    }
  }

  resetQuantityInput(id) {
    const input = this.querySelector(`#Quantity-${id}`);
    input.value = input.getAttribute('value');
    this.isEnterPressed = false;
  }

  setValidity(event, index, message) {
    event.target.setCustomValidity(message);
    event.target.reportValidity();
    this.resetQuantityInput(index);
    event.target.select();
  }

  validateQuantity(event) {
    const inputValue = parseInt(event.target.value);
    const index = event.target.dataset.index;
    let message = '';

    if (inputValue < event.target.dataset.min) {
      message = window.quickOrderListStrings.min_error.replace('[min]', event.target.dataset.min);
    } else if (inputValue > parseInt(event.target.max)) {
      message = window.quickOrderListStrings.max_error.replace('[max]', event.target.max);
    } else if (inputValue % parseInt(event.target.step) !== 0) {
      message = window.quickOrderListStrings.step_error.replace('[step]', event.target.step);
    }

    if (message) {
      this.setValidity(event, index, message);
    } else {
      event.target.setCustomValidity('');
      event.target.reportValidity();
      this.updateQuantity(
        index,
        inputValue,
        document.activeElement.getAttribute('name'),
        event.target.dataset.quantityVariantId
      );
    }
  }

  onChange(event) {
    this.validateQuantity(event);
  }

  onCartUpdate() {
  
    if (this.tagName === 'CART-DRAWER-ITEMS') {
      fetch(`${routes.cart_url}?section_id=cart-drawer`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const selectors = ['cart-drawer-items', '.cart-drawer__footer'];
          for (const selector of selectors) {
            const targetElement = document.querySelector(selector);
            const sourceElement = html.querySelector(selector);
            if (targetElement && sourceElement) {
              targetElement.replaceWith(sourceElement);
            }
            updateShipment();
            window[delivery_estimates]();
            initCartTimer(); 
            
          }
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      fetch(`${routes.cart_url}?section_id=main-cart-items`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const sourceQty = html.querySelector('cart-items');
          this.innerHTML = sourceQty.innerHTML;
          updateShipment();
          window[delivery_estimates](); 
          initCartTimer(); 
        })
        .catch((e) => {
          console.error(e);
        });
    }
   
  }

  getSectionsToRender() {
    return [
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '.js-contents',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section',
      },
      {
        id: 'main-cart-footer',
        section: document.getElementById('main-cart-footer').dataset.id,
        selector: '.js-contents',
      },
    ];
  }

  updateQuantity(line, quantity, name, variantId) {
    this.enableLoading(line);

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        const quantityElement =
          document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`);
        const items = document.querySelectorAll('.cart-item');

        if (parsedState.errors) {
          quantityElement.value = quantityElement.getAttribute('value');
          this.updateLiveRegions(line, parsedState.errors);
          return;
        }

        this.classList.toggle('is-empty', parsedState.item_count === 0);
        const cartDrawerWrapper = document.querySelector('cart-drawer');
        const cartFooter = document.getElementById('main-cart-footer');

        if (cartFooter) cartFooter.classList.toggle('is-empty', parsedState.item_count === 0);
        if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0);

        this.getSectionsToRender().forEach((section) => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
          elementToReplace.innerHTML = this.getSectionInnerHTML(
            parsedState.sections[section.section],
            section.selector
          );
        });
        const updatedValue = parsedState.items[line - 1] ? parsedState.items[line - 1].quantity : undefined;
        let message = '';
        if (items.length === parsedState.items.length && updatedValue !== parseInt(quantityElement.value)) {
          if (typeof updatedValue === 'undefined') {
            message = window.cartStrings.error;
          } else {
            message = window.cartStrings.quantityError.replace('[quantity]', updatedValue);
          }
        }
        this.updateLiveRegions(line, message);

        const lineItem =
          document.getElementById(`CartItem-${line}`) || document.getElementById(`CartDrawer-Item-${line}`);
        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          cartDrawerWrapper
            ? trapFocus(cartDrawerWrapper, lineItem.querySelector(`[name="${name}"]`))
            : lineItem.querySelector(`[name="${name}"]`).focus();
        } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper.querySelector('.drawer__inner-empty'), cartDrawerWrapper.querySelector('a'));
        } else if (document.querySelector('.cart-item') && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper, document.querySelector('.cart-item__name'));
        }
        setTimeout(updateShipment, 1000);
        setTimeout(initCartTimer(), 1000);
        setTimeout(window[delivery_estimates](), 1000);        
        publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items', cartData: parsedState, variantId: variantId });
        
      })
      .catch(() => {
        this.querySelectorAll('.loading__spinner').forEach((overlay) => overlay.classList.add('hidden'));
        const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
        errors.textContent = window.cartStrings.error;
      })
      .finally(() => {
        this.disableLoading(line);
      });
  }

  updateLiveRegions(line, message) {
    const lineItemError =
      document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
    if (lineItemError) lineItemError.querySelector('.cart-item__error-text').innerHTML = message;

    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus =
      document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.add('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading__spinner`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading__spinner`);

    [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) => overlay.classList.remove('hidden'));

    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.remove('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading__spinner`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading__spinner`);

    cartItemElements.forEach((overlay) => overlay.classList.add('hidden'));
    cartDrawerItemElements.forEach((overlay) => overlay.classList.add('hidden'));
  }
}

customElements.define('cart-items', CartItems);

if (!customElements.get('cart-note')) {
  customElements.define(
    'cart-note',
    class CartNote extends HTMLElement {
      constructor() {
        super();

        this.addEventListener(
          'input',
          debounce((event) => {
            const body = JSON.stringify({ note: event.target.value });
            fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } });
          }, ON_CHANGE_DEBOUNCE_TIMER)
        );
      }
    }
  );
}

async function fetchCart() {
  try {
    let response = await fetch(window.Shopify.routes.root + "cart.js");
    let cart = await response.json();
    // console.log(cart, "result checkkkk");
    await checkBundleStock(cart);
  } catch (error) {
    console.error("Error fetching cart data:", error);
  }
}

async function checkBundleStock(cart) {
  try {
    const itemsToRemove = [];
    for (let item of cart.items) {
      let variantIds = [];
      let productHandles = [];
      
      for (let key in item.properties) {
        if (key.startsWith('_VariantID')) {
          variantIds.push(item.properties[key]);
        }
        if (key.startsWith('_Producthandle')) {
          productHandles.push(item.properties[key]);
        }
      }
      
      // Check the stock status of each variant ID
      for (let i = 0; i < variantIds.length; i++) {
        let variantId = variantIds[i];
        let productHandle = productHandles[i];
        let url = `${location.origin}/products/${productHandle}?sections=item-property-available-status`;
        let response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let variant = await response.json();
        let parser = new DOMParser();
        let doc = parser.parseFromString(variant["item-property-available-status"], 'text/html');
        let stockStatus = doc.body.textContent.trim();

        if (stockStatus === 'outOfStock') {
          console.log('any product outof stock check ',item.id)
           // await removeFromCart(item.id);
          itemsToRemove.push({ id: item.id, quantity: 0 });
        }
      }
    }
     if (itemsToRemove.length > 0) {
      await updateCart(itemsToRemove);
    }
  } catch (error) {
    console.error("Error checking bundle stock:", error);
  }
}

async function updateCart(items) {
  try {
    const response = await fetch(`${window.Shopify.routes.root}cart/update.js`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updates: items.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {}) }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const updatedCart = await response.json();
    // console.log('Cart updated:', updatedCart);
    
    // Fetch the cart drawer and update the necessary elements
    fetch(`${routes.cart_url}?section_id=cart-drawer`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const selectors = ['cart-drawer-items', '.cart-drawer__footer'];
        for (const selector of selectors) {
          const targetElement = document.querySelector(selector);
          const sourceElement = html.querySelector(selector);
          if (targetElement && sourceElement) {
            targetElement.replaceWith(sourceElement);
          }
        }
      })
      .catch((e) => {
        console.error('Error updating cart drawer:', e);
      });

  } catch (error) {
    console.error('Error updating cart:', error);
  }
}
