// Variables globales
let cart = [];
let cartTotal = 0;
const REGULAR_PRICE = 21000;
const WHOLESALE_PRICE = 18900;
const WHOLESALE_MINIMUM = 24;

// Función para agregar productos al carrito
function addToCart(productName, price, image) {
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: REGULAR_PRICE, // Precio base, se calculará dinámicamente
            image: image,
            quantity: 1
        });
    }
    
    updateCartUI();
    
    // Mensaje especial si alcanza precio mayorista
    const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
    if (totalQuantity === WHOLESALE_MINIMUM) {
        showNotification(`¡Felicitaciones! Alcanzaste el precio mayorista: $${WHOLESALE_PRICE.toLocaleString()} por unidad`);
    } else {
        showNotification(`${productName} agregado al carrito!`);
    }
}

// Función para eliminar productos del carrito
function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    updateCartUI();
    showNotification(`${productName} eliminado del carrito`);
}

function addToCartWithSize(name, price, image, sizeSelectId) {
    const sizeSelect = document.getElementById(sizeSelectId);
    const selectedSize = sizeSelect.value;
    
    if (!selectedSize) {
        alert('Por favor selecciona un talle antes de agregar al carrito');
        return;
    }
    
    // Modificar el nombre del producto para incluir el talle
    const productNameWithSize = `${name} - Talle ${selectedSize}`;
    
    // Usar la función existente addToCart con el nombre modificado
    addToCart(productNameWithSize, price, image);
    
    // Resetear la selección de talle
    sizeSelect.value = '';
}

// Función para cambiar cantidad de productos
function changeQuantity(productName, newQuantity) {
    const item = cart.find(item => item.name === productName);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productName);
        } else {
            item.quantity = newQuantity;
            updateCartUI();
        }
    }
}

// Función para obtener el precio según la cantidad total
function getCurrentPrice() {
    const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
    return totalQuantity >= WHOLESALE_MINIMUM ? WHOLESALE_PRICE : REGULAR_PRICE;
}

// Función para verificar si es compra mayorista
function isWholesale() {
    const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
    return totalQuantity >= WHOLESALE_MINIMUM;
}

// Función para calcular el total del carrito
function calculateTotal() {
    const currentPrice = getCurrentPrice();
    return cart.reduce((total, item) => total + (currentPrice * item.quantity), 0);
}

// Función para actualizar la interfaz del carrito
function updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    const cartItems = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.cart-total');
    
    // Actualizar contador
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    
    // Verificar si es compra mayorista
    const isWholesaleOrder = isWholesale();
    const currentPrice = getCurrentPrice();
    
    // Actualizar items del carrito
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    } else {
        let wholesaleMessage = '';
        if (isWholesaleOrder) {
            wholesaleMessage = `
                <div class="wholesale-notice">
                    <i class="fas fa-star"></i>
                    <strong>¡Compra Mayorista!</strong><br>
                    Precio especial: $${currentPrice.toLocaleString()} por unidad
                </div>
            `;
        } else if (totalItems >= 20) {
            const remaining = WHOLESALE_MINIMUM - totalItems;
            wholesaleMessage = `
                <div class="wholesale-alert">
                    <i class="fas fa-info-circle"></i>
                    ¡Solo ${remaining} productos más para precio mayorista!<br>
                    Precio mayorista: $${WHOLESALE_PRICE.toLocaleString()} por unidad
                </div>
            `;
        }
        
        cartItems.innerHTML = wholesaleMessage + cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">$${currentPrice.toLocaleString()}</p>
                    <div class="quantity-controls">
                        <button onclick="changeQuantity('${item.name}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity('${item.name}', ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart('${item.name}')">×</button>
            </div>
        `).join('');
    }
    
    // Actualizar total
    const total = calculateTotal();
    cartTotal.textContent = `$${total.toLocaleString()}`;
    
    // Mostrar/ocultar botón de checkout
    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.style.display = cart.length > 0 ? 'block' : 'none';
}

// Función para mostrar/ocultar carrito
function toggleCart() {
    const cartSidebar = document.querySelector('.cart-sidebar');
    cartSidebar.classList.toggle('open');
}

// Función para mostrar notificaciones
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Función para proceder al checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío');
        return;
    }
    
    document.querySelector('.checkout-modal').style.display = 'flex';
}

// Función para cerrar modal de checkout
function closeCheckout() {
    document.querySelector('.checkout-modal').style.display = 'none';
}

// Función para procesar el pedido
function processOrder() {
    const form = document.querySelector('.checkout-form');
    const formData = new FormData(form);
    
    // Validar formulario
    if (!form.checkValidity()) {
        showNotification('Por favor, completa todos los campos');
        return;
    }
    
    // Simular procesamiento del pedido
    const orderData = {
        items: cart,
        total: calculateTotal(),
        customerInfo: {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            city: formData.get('city'),
            postalCode: formData.get('postalCode')
        }
    };
    
    // Mostrar confirmación
    alert(`¡Pedido confirmado!\n\nTotal: $${orderData.total.toLocaleString()}\nSe enviará a: ${orderData.customerInfo.address}, ${orderData.customerInfo.city}\n\nGracias por tu compra en Kava Sports!`);
    
    // Limpiar carrito
    cart = [];
    updateCartUI();
    closeCheckout();
    toggleCart();
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    updateCartUI();
});
