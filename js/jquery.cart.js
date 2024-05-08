let btnLocation = document.getElementById("open_cart_btn");

function formatterCart(priceSum) {
   let price = priceSum.toString();
   let formattedPrice = "";
   for (let i = 0; i < price.length; i++) {
      if (i > 0 && i % 3 === 0) {
         formattedPrice = " " + formattedPrice;
      }
      formattedPrice = price[price.length - 1 - i] + formattedPrice;
   }
   return formattedPrice;
}

let cart = [];

function saveCartToLocalStorage() {
   localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
   const cartData = localStorage.getItem("cart");
   if (cartData) {
      cart = JSON.parse(cartData);
   }
}

function updatedCartNumber() {
   const openCartNumber = document.querySelector(".open_cart_number");
   if (openCartNumber) {
      openCartNumber.textContent = cart.reduce(
         (total, product) => total + product.number,
         0
      );
   }
}

document.querySelectorAll(".product_item_price_btn").forEach((button) => {
   button.addEventListener("click", function () {
      const dataCode = button.getAttribute("data-code");
      const productInCartIndex = cart.findIndex(
         (item) => item.code === dataCode
      );
      console.log(productInCartIndex);

      if (productInCartIndex !== -1) {
         cart[productInCartIndex].number += 1;
      } else {
         const productInData = window.data.find(
            (item) => item.code === dataCode
         );
         if (productInData) {
            cart.push({
               ...productInData,
               number: 1,
            });
            // console.log(productInData);
         }
      }

      // const openCartNumber = document.querySelector(".open_cart_number");
      // if (openCartNumber) {
      //    openCartNumber.textContent = cart.reduce(
      //       (total, product) => total + product.number,
      //       0
      //    );
      // }
      saveCartToLocalStorage();
      updatedCartNumber();
   });
});

window.addEventListener("load", () => {
   loadCartFromLocalStorage();

   updatedCartNumber();
});

function renderCartItems() {
   const divElement = document.createElement("div");
   divElement.classList.add("jqcart_layout");

   const cartItemsMarkup = cart
      .map(
         (product) => `
       <ul class="jqcart_tbody" data-id="${product.code}">
          <li class="jqcart_small_td">
             <img src="${product.img}" alt="Img">
          </li>
          <li>
             <div class="jqcart_nd">
                <a href="${product.link}">${product.title}</a>
             </div>
          </li>
          <li></li>
          <li class="jqcart_price">${formatterCart(product.price)}</li>
          <li>
             <div class="jqcart_pm">
                <input type="text" class="jqcart_amount" value="${
                   product.number
                }">
                <span class="jqcart_incr" data-incr="1">
                   <i class="fa fa-angle-up" aria-hidden="true"></i>
                </span>
                <span class="jqcart_incr" data-incr="-1">
                   <i class="fa fa-angle-down" aria-hidden="true"></i>
                </span>
             </div>
          </li>
          <li class="jqcart_sum">${formatterCart(
             product.price * product.number
          )} тг</li>
       </ul>
    `
      )
      .join("");

   divElement.innerHTML = `
       <div class="jqcart_content">
          <div class="jqcart_table_wrapper">
             <div class="jqcart_manage_order">
                <ul class="jqcart_thead">
                   <li></li>
                   <li>ТОВАР</li>
                   <li></li>
                   <li>ЦЕНА</li>
                   <li>КОЛИЧЕСТВО</li>
                   <li>СТОИМОСТЬ</li>
                </ul>
                ${cartItemsMarkup}
             </div>
          </div>
          <div class="jqcart_manage_block">
             <div class="jqcart_btn">
                <button class="jqcart_open_form_btn">Оформить заказ</button>
                <form class="jqcart_order_form">
                   <input class="jqcart_return_btn" type="reset" value="Закрыть">
                </form>
             </div>
             <div class="jqcart_subtotal">Итого: <strong>${formatterCart(
                calculateTotal(cart)
             )}</strong> тг</div>
          </div>
       </div>
    `;

   document.body.appendChild(divElement);

   document
      .querySelector(".jqcart_return_btn")
      .addEventListener("click", () => {
         document.querySelector(".jqcart_layout").remove();
      });

   document.querySelectorAll(".jqcart_incr").forEach((button) => {
      button.addEventListener("click", function () {
         const incr = parseInt(button.getAttribute("data-incr"));

         const parentElement = button.closest(".jqcart_tbody");
         console.log(parentElement);
         const productId = parentElement.getAttribute("data-id");
         const productIndex = cart.findIndex((item) => item.code === productId);

         if (productIndex !== -1) {
            cart[productIndex].number += incr;

            if (cart[productIndex].number < 1) {
               cart[productIndex].number = 1;
            }

            const amountElement = parentElement.querySelector(".jqcart_amount");
            console.log(amountElement);
            amountElement.value = cart[productIndex].number;

            const sumElement = parentElement.querySelector(".jqcart_sum");
            sumElement.textContent =
               formatterCart(
                  cart[productIndex].price * cart[productIndex].number
               ) + " тг";

            const priceElement = parentElement.querySelector(".jqcart_price");
            priceElement.textContent =
               formatterCart(
                  cart[productIndex].price * cart[productIndex].number
               ) + " тг";

            const totalElement = document.querySelector(
               ".jqcart_subtotal strong"
            );
            totalElement.textContent = formatterCart(calculateTotal(cart));
         }
      });
   });
}

btnLocation.addEventListener("click", function () {
   renderCartItems();
});

function calculateTotal(cart) {
   return cart.reduce(
      (total, product) => total + product.price * product.number,
      0
   );
}
