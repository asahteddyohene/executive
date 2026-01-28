const products=[
  {id:1,name:"Okro Stew",image:"https://decapitalgrille.com/wp-content/uploads/2023/09/okro-soup-1.jpg",sizes:[
    {size:"Small",price:20,description:"Small portion: Okro stew with minimal ingredients."},
    {size:"Medium",price:30,description:"Medium portion: Okro stew with extra veggies."},
    {size:"Large",price:40,description:"Large portion: Rich Okro stew, full ingredients."}
  ]},
  {id:2,name:"Groundnut Soup",image:"https://i.ytimg.com/vi/w15k0SXOHQc/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLA1GHgfaHIJiQASXz8o4FZE3jfBvw",sizes:[
    {size:"Small",price:25,description:"Small portion: Groundnut soup, light."},
    {size:"Medium",price:35,description:"Medium portion: Groundnut soup with chicken."},
    {size:"Large",price:45,description:"Large portion: Rich Groundnut soup with protein."}
  ]}
];

const menu=document.getElementById('menuContainer');
const toast=document.getElementById('toast');

function showToast(msg){
  toast.innerText=msg;
  toast.style.display='block';
  setTimeout(()=>{toast.style.display='none';},2000);
}

function updateCartCount(){
  const cart=JSON.parse(localStorage.getItem('cart'))||[];
  document.getElementById('cartCount').innerText=cart.reduce((a,b)=>a+b.qty,0);
}

function openCart(){document.getElementById('cartModal').classList.add('active'); renderCart();}
function closeCart(){document.getElementById('cartModal').classList.remove('active');}
function openCheckout(){document.getElementById('checkoutModal').classList.add('active'); renderCheckout();}
function closeCheckout(){document.getElementById('checkoutModal').classList.remove('active');}

products.forEach(p=>{
  const card=document.createElement('div');
  card.className='food-card';
  card.innerHTML=`
    <img src="${p.image}">
    <h3>${p.name}</h3>
    <p id="desc-${p.id}">${p.sizes[0].description}</p>
    <select id="size-${p.id}">
      ${p.sizes.map(s=>`<option value="${s.price}" data-desc="${s.description}">${s.size} - GHS ${s.price}</option>`).join('')}
    </select>
    <button id="add-${p.id}">Add to Cart</button>`;
  menu.appendChild(card);

  const select=document.getElementById(`size-${p.id}`);
  const desc=document.getElementById(`desc-${p.id}`);
  select.addEventListener('change',()=>{desc.innerText=select.options[select.selectedIndex].dataset.desc;});

  document.getElementById(`add-${p.id}`).addEventListener('click',()=>{
    const selected=select.options[select.selectedIndex];
    const cart=JSON.parse(localStorage.getItem('cart'))||[];
    const sizeName=selected.text.split(" - ")[0];
    const existingIndex=cart.findIndex(c=>c.id===p.id && c.size===sizeName);
    if(existingIndex>-1){cart[existingIndex].qty+=1;}
    else{cart.push({id:p.id,name:p.name,image:p.image,size:sizeName,price:Number(selected.value),qty:1});}
    localStorage.setItem('cart',JSON.stringify(cart));
    updateCartCount();
    showToast(`${p.name} has been added to cart ✅`);
  });
});

// CART & CHECKOUT
const cartItemsDiv=document.getElementById('cartItems');
const cartTotalSpan=document.getElementById('cartTotal');
const checkoutItemsDiv=document.getElementById('checkoutItems');
const checkoutTotalSpan=document.getElementById('checkoutTotal');

function renderCart(){
  const cart=JSON.parse(localStorage.getItem('cart'))||[];
  cartItemsDiv.innerHTML=''; let total=0;
  if(cart.length===0){cartItemsDiv.innerHTML='<p>Your cart is empty</p>'; cartTotalSpan.innerText='Total: GHS 0'; return;}
  cart.forEach((item,index)=>{
    total+=item.price*item.qty;
    const div=document.createElement('div'); div.className='cart-item';
    div.innerHTML=`
      <span>${item.name} (${item.size})</span>
      <div style="display:flex;align-items:center;gap:5px;">
        <button onclick="changeQty(${index},-1)">-</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${index},1)">+</button>
      </div>
      <span>GHS ${item.price*item.qty}</span>
      <button onclick="removeItem(${index})">Remove</button>`;
    cartItemsDiv.appendChild(div);
  });
  cartTotalSpan.innerText='Total: GHS '+total;
  renderCheckout();
}

function changeQty(index,delta){
  const cart=JSON.parse(localStorage.getItem('cart'))||[];
  cart[index].qty+=delta; if(cart[index].qty<1) cart[index].qty=1;
  localStorage.setItem('cart',JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

function removeItem(index){
  const cart=JSON.parse(localStorage.getItem('cart'))||[];
  cart.splice(index,1); localStorage.setItem('cart',JSON.stringify(cart));
  renderCart(); updateCartCount();
}

function renderCheckout(){
  const cart=JSON.parse(localStorage.getItem('cart'))||[];
  checkoutItemsDiv.innerHTML=''; let total=0;
  cart.forEach(item=>{total+=item.price*item.qty; checkoutItemsDiv.innerHTML+=`<p>${item.name} (${item.size}) x ${item.qty} - GHS ${item.price*item.qty}</p>`;});
  checkoutTotalSpan.innerText=total;
}

// PLACE ORDER
document.getElementById('placeOrder').onclick=function(){
  const cart=JSON.parse(localStorage.getItem('cart'))||[];
  if(cart.length===0){showToast("Cart is empty"); return;}
  const name=document.getElementById('name').value;
  const phone=document.getElementById('phone').value;
  const whatsapp=document.getElementById('whatsapp').value.replace(/\D/g,'');
  const address=document.getElementById('address').value;
  let total=cart.reduce((a,b)=>a+b.price*b.qty,0);

  const orderData={
    _subject:"New Order from "+name,
    _template:"table",
    _captcha:"false",
    Name:name,
    Phone:phone,
    WhatsApp:whatsapp,
    Address:address,
    Order:cart.map(i=>`${i.name} (${i.size}) x ${i.qty} - GHS ${i.price*i.qty}`).join("\n"),
    Total:"GHS "+total,
    Reply_Link:`https://wa.me/${whatsapp}?text=Hello%20${encodeURIComponent(name)},%20I%20have%20received%20your%20order%20for%20GHS%20${total}.`
  };

  fetch("https://formsubmit.co/ajax/prisandmultibusiness1@gmail.com",{
    method:"POST",
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify(orderData)
  }).then(res=>{
    if(res.ok){
      localStorage.removeItem('cart');
      renderCart(); updateCartCount();
      closeCheckout(); closeCart();
      showToast("Order submitted ✅");
    } else{return res.json().then(d=>{throw new Error(d.message)})}
  }).catch(err=>{showToast("Error: "+err.message);});
};

updateCartCount();
