if (!customElements.get('product-form')) {
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
        // Trigger click on the first remove button
        removeBtn.click();
      } else {
        // No more items left → stop the interval
        clearInterval(interval);
        console.log("Cart is now empty ✅");
         document.getElementById('cart-timer').style.display = 'none';
      }
    }, 500); 
  }

  function updateTimerDisplay() {
    clearInterval(countdownInterval); // reset if already running

    countdownInterval = setInterval(() => {
      const remaining = getRemainingTime();      
      if (remaining <= 0 ) {
        clearInterval(countdownInterval); // stop countdown
        clearCart(); // only once
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      const timerElement = document.getElementById('cart-timer');

      if (timerElement) {
        
        timerElement.textContent = `Reserviert für  ${minutes}:${seconds < 10 ? '0' : ''}${seconds} Min!`;
        document.getElementById('cart-timer').style.display = 'flex';
      }
    }, 100);
  }

  // Public init
  window[initCartTimer] = async () => {
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        if (cart.items && cart.items.length > 0) {
          if (!localStorage.getItem(CART_TIMER_KEY)) {
            startTimer(); // start fresh if not running
          } else {
            updateTimerDisplay(); // resume existing timer
          }
        } else {
          localStorage.removeItem(CART_TIMER_KEY);
          clearInterval(countdownInterval); // stop timer if cart empty
        }
      });
  };
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.variantIdInput.disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');
        this.submitButtonText = this.submitButton.querySelector('span');

        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

        this.hideErrors = this.dataset.hideErrors === 'true';
      }
      
      onSubmitHandler(evt) {
        evt.preventDefault();
        console.log(this.submitButton.classList,'eeevvvvvvvvnnnnntttttt');
        // if(document.querySelector('body').classList.contains('template_nail-bundles')){
        //   if(document.querySelector('.main-variant-picker input[name="Menge"]:checked').getAttribute('pair_number') != '6'){            
        //     return;
        //   }
        // }        
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;        
        this.handleErrorMessage();

        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.classList.add('loading');
        this.querySelector('.loading__spinner').classList.remove('hidden');

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);
        const productVariantId = formData.get('id');
        
        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        
 var bundleWrap = document.getElementById('np-bundle-wrap');
        if (bundleWrap) {
          if(bundleWrap.getAttribute('data-upgrade') == 'true'){
            var get_value = bundleWrap.getAttribute('data-count');
             
            function generateArray(number) {
                let array = [];
                for (let i = 0; i < number; i++) {
                    array.push(i);
                }
                return array;
            }            
            var variantMapping = {            
            '49627093827910': generateArray(get_value), // Starterset 2 Variant
            '49627093860678': generateArray(get_value), // Starterset 4 Variant
            '49627093893446': generateArray(get_value), // Starterset 6 Variant
            '49667139469638': generateArray(get_value), // Farbenset 3 Variant
            '49667139502406': generateArray(get_value), // Farbenset 6 Variant
            '49667139535174': generateArray(get_value), // Farbenset 9 Variant
            '55036256911686': generateArray(get_value), // Starterset sale 4 Variant
            '55036256944454': generateArray(get_value), // Starterset sale 6 Variant
            '55036263694662': generateArray(get_value), // Starterset sale 9 Variant
            '55036266283334': generateArray(get_value), // Farbenset sale 4 Variant
            '55036266316102': generateArray(get_value), // Farbenset sale 6 Variant
            '55052037914950': generateArray(get_value), // Farbenset sale 9 Variant

              
            };
          }else{            
            var variantMapping = {            
              '49627093827910': [0, 1], // Starterset 2 Variant
              '49627093860678': [0, 1, 2, 3], // Starterset 4 Variant
              '49627093893446': [0, 1, 2, 3, 4, 5], // Starterset 6 Variant
              '49667139469638': [0, 1], // Farbenset 3 Variant
              '49667139502406': [0, 1, 2, 3], // Farbenset 6 Variant
              '49667139535174': [0, 1, 2, 3, 4, 5], // Farbenset 9 Variant
              '55036256911686': [0, 1, 2, 3], // Starterset sale 4 Variant
              '55036256944454': [0, 1, 2, 3, 4, 5], // Starterset sale 6 Variant
              '55036263694662': [0, 1, 2, 3, 4, 5, 6, 7, 8], // Starterset sale 9 Variant
              '55036266283334': [0, 1, 2, 3], // Starterset sale 4 Variant
              '55036266316102': [0, 1, 2, 3, 4, 5], // Starterset sale 6 Variant
              '55052037914950': [0, 1, 2, 3, 4, 5, 6, 7, 8], // Starterset sale 9 Variant
            };
          }
          var productNAME = [];
          var variantIDs = [];
          var variantIMAGEs = [];
          var productHandle = [];
          var productUnique = [];
        
          function appendVariantIDs(indices) {
            console.log(indices,"indices")
            indices.forEach((index, i) => {
              formData.append('properties[Farbe ' + (i + 1) + ']', productNAME[index]);
              formData.append('properties[_VariantID' + (i + 1) + ']', variantIDs[index]);
              formData.append('properties[_VariantImg' + (i + 1) + ']', variantIMAGEs[index]);
              formData.append('properties[_Producthandle' + (i + 1) + ']', productHandle[index]);
              formData.append('properties[_uniqueId' + (i + 1) + ']', productUnique[index]);
            });
          }
          var getValue = Number(bundleWrap.dataset.nail);        
        
          for (var i = 1; i <= getValue; i++) {
            var inputNAME = 'hidden-color' + i;
            var inputElementNAME = document.getElementById(inputNAME);
            if (inputElementNAME) {
              productNAME.push(inputElementNAME.value);
            }
            var inputID = 'hidden-variantID' + i;
            var inputElement = document.getElementById(inputID);
            if (inputElement) {
              variantIDs.push(inputElement.value);
            }
            var inputIMAGE = 'hidden-variantIMG' + i;
            var inputElementImg = document.getElementById(inputIMAGE);
            if (inputElementImg) {
              variantIMAGEs.push(inputElementImg.value);
            }
            var inputHANDLE = 'hidden-producthandle' + i;
            var inputElementHANDLE = document.getElementById(inputHANDLE);
            if (inputElementHANDLE) {
              productHandle.push(inputElementHANDLE.value);
            }
            var inputNumber = 'hidden-number' + i;
            var inputElementNumber = document.getElementById(inputNumber);
            if (inputElementNumber) {
              productUnique.push('Bundle' + inputElementNumber.value);
            }
          }
        
          // Call appendVariantIDs only if productVariantId exists in variantMapping
          if (variantMapping[productVariantId]) {
            appendVariantIDs(variantMapping[productVariantId]);
          }
          if (productVariantId == '55036263694662' || productVariantId == '55052037914950') {
            formData.append('properties[_topcoat]', '50659225469254');
          }
        }
        
        config.body = formData;
        
        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {   
            startTimer(); 
            updateTimerDisplay();         
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: productVariantId,
                errors: response.errors || response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);

              const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
              if (!soldOutMessage) return;
              this.submitButton.setAttribute('aria-disabled', true);
              this.submitButtonText.classList.add('hidden');
              soldOutMessage.classList.remove('hidden');
              this.error = true;
              return;
            } else if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
            }

            if (!this.error)
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                cartData: response,
              });
            this.error = false;
            const quickAddModal = this.closest('quick-add-modal');
            if (quickAddModal) {
              document.body.addEventListener(
                'modalClosed',
                () => {
                  setTimeout(() => {
                    this.cart.renderContents(response);
                  });
                },
                { once: true }
              );
              quickAddModal.hide(true);
            } else {
              this.cart.renderContents(response);
            }
             window[initCartTimer]();          
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            this.submitButton.classList.remove('loading');
            if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
            if (!this.error) this.submitButton.removeAttribute('aria-disabled');
            this.querySelector('.loading__spinner').classList.add('hidden');
          });
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      toggleSubmitButton(disable = true, text) {
        if (disable) {
          this.submitButton.setAttribute('disabled', 'disabled');
          if (text) this.submitButtonText.textContent = text;
        } else {
          this.submitButton.removeAttribute('disabled');
          this.submitButtonText.textContent = window.variantStrings.addToCart;
        }
      }

      get variantIdInput() {
        return this.form.querySelector('[name=id]');
      }
    }
  );
}
