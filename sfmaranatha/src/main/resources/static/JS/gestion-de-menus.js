// Espero a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales para gestionar el carrito y los formularios
    let carrito = [];
    let total = 0;
    const carritoVacio = document.querySelector('.empty-cart-message');
    const carritoItems = document.getElementById('cart-items');
    const carritoTotal = document.getElementById('cart-total-amount');
    const irAPagoBtn = document.getElementById('ir-A-pago');
    const formularioPedidoContainer = document.getElementById('formularioPedidoContainer');
    const cancelarPedidoBtn = document.getElementById('cancelarPedido');
    const mobileCartBtn = document.getElementById('mobile-cart-btn');
    const mobileCartCount = document.getElementById('mobile-cart-count');
    
    // Inicializo el modal de opciones de pedido
    const opcionModal = new bootstrap.Modal(document.getElementById('opcionModal'));
    
    // Capturo todos los botones de añadir al carrito
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    // Configuro los eventos para los botones de incremento y decremento de cantidad
    const decrementButtons = document.querySelectorAll('.decrement');
    const incrementButtons = document.querySelectorAll('.increment');
    
    // Evento para incrementar cantidad
    incrementButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('.quantity-input');
            input.value = parseInt(input.value) + 1;
        });
    });
    
    // Evento para decrementar cantidad
    decrementButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('.quantity-input');
            if (parseInt(input.value) > 1) {
                input.value = parseInt(input.value) - 1;
            }
        });
    });
    
    // Evento para añadir productos al carrito
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.menu-card');
            const name = this.getAttribute('data-name');
            const price = parseInt(this.getAttribute('data-price'));
            const quantity = parseInt(card.querySelector('.quantity-input').value);
            
            // Verifico si el producto ya está en el carrito
            const existingItemIndex = carrito.findIndex(item => item.name === name);
            
            if (existingItemIndex !== -1) {
                // Si ya existe, incremento la cantidad
                carrito[existingItemIndex].quantity += quantity;
            } else {
                // Si no existe, lo añado como nuevo ítem
                carrito.push({
                    name: name,
                    price: price,
                    quantity: quantity
                });
            }
            
            // Actualizo el carrito y muestro feedback visual
            actualizarCarrito();
            this.classList.add('pulse');
            setTimeout(() => {
                this.classList.remove('pulse');
            }, 500);
        });
    });
    
    // Función para actualizar la visualización del carrito
    function actualizarCarrito() {
        carritoItems.innerHTML = '';
        total = 0;
        
        if (carrito.length === 0) {
            carritoVacio.style.display = 'flex';
            mobileCartCount.textContent = '0';
        } else {
            carritoVacio.style.display = 'none';
            
            carrito.forEach((item, index) => {
                const subtotal = item.price * item.quantity;
                total += subtotal;
                
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toLocaleString()}</div>
                    </div>
                    <span class="cart-item-quantity">${item.quantity}x</span>
                    <i class="bi bi-x-circle cart-item-remove" data-index="${index}"></i>
                `;
                carritoItems.appendChild(itemElement);
            });
            
            // Actualizo contadores
            mobileCartCount.textContent = carrito.length;
        }
        
        // Actualizo el total
        carritoTotal.textContent = `$${total.toLocaleString()}`;
        
        // Agrego eventos para eliminar ítems
        document.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                carrito.splice(index, 1);
                actualizarCarrito();
            });
        });
    }
    
    // Evento para el botón de pago
    irAPagoBtn.addEventListener('click', function() {
        if (carrito.length > 0) {
            // Muestro el modal para que elija tipo de pedido
            opcionModal.show();
        } else {
            alert('Por favor, agregue productos a su carrito antes de continuar.');
        }
    });
    
    // Evento para el botón de carrito móvil
    mobileCartBtn.addEventListener('click', function() {
        const cartSection = document.querySelector('.cart-section');
        cartSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Configuración de los formularios según tipo de pedido
    const pedidoForm = document.getElementById('pedidoForm');
    const pedidoForm2 = document.getElementById('pedidoForm2');
    
    // Oculto ambos formularios inicialmente
    pedidoForm.style.display = 'none';
    pedidoForm2.style.display = 'none';
    
    // Configuro evento para pedido a domicilio
    document.getElementById('pedidoDomicilio').addEventListener('click', function() {
        // Oculto el modal
        opcionModal.hide();
        
        // Muestro el formulario de pedido a domicilio
        formularioPedidoContainer.classList.remove('d-none');
        pedidoForm.style.display = 'block';
        pedidoForm2.style.display = 'none';
        irAPagoBtn.style.display = 'none';
        cancelarPedidoBtn.style.display = 'block';
        
        // Actualizo el formulario a domicilio con los campos necesarios
        actualizarFormularioDomicilio();
    });
    
    // Configuro evento para comer en restaurante
    document.getElementById('comerRestaurante').addEventListener('click', function() {
        // Oculto el modal
        opcionModal.hide();
        
        // Muestro el formulario para comer en restaurante
        formularioPedidoContainer.classList.remove('d-none');
        pedidoForm.style.display = 'none';
        pedidoForm2.style.display = 'block';
        irAPagoBtn.style.display = 'none';
        cancelarPedidoBtn.style.display = 'block';
        
        // Actualizo el formulario de restaurante con los campos necesarios
        actualizarFormularioRestaurante();
    });
    
    // Función para actualizar el formulario de domicilio con los campos requeridos
    function actualizarFormularioDomicilio() {
        // Limpio el formulario existente
        pedidoForm.innerHTML = '';
        
        // Agrego los campos de información personal
        pedidoForm.innerHTML += `
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="nombre" class="form-label">Nombre*</label>
                    <input type="text" class="form-control" id="nombre" name="nombre" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="apellido" class="form-label">Apellido*</label>
                    <input type="text" class="form-control" id="apellido" name="apellido" required>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="tipoDocumento" class="form-label">Tipo de Documento*</label>
                    <select class="form-control" id="tipoDocumento" name="tipoDocumento" required>
                        <option value="">Seleccione</option>
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="TI">Tarjeta de Identidad</option>
                        <option value="PP">Pasaporte</option>
                    </select>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="numeroDocumento" class="form-label">Número de Documento*</label>
                    <input type="text" class="form-control" id="numeroDocumento" name="numeroDocumento" required>
                </div>
            </div>
            
            <div class="mb-3">
                <label for="telefono" class="form-label">Teléfono o Celular*</label>
                <input type="tel" class="form-control" id="telefono" name="telefono" required>
            </div>
            
            <div class="mb-3">
                <label for="email" class="form-label">Correo Electrónico*</label>
                <input type="email" class="form-control" id="email" name="email" required>
            </div>
            
            <div class="mb-3">
                <label for="direccion" class="form-label">Dirección para envío*</label>
                <input type="text" class="form-control" id="direccion" name="direccion" required>
            </div>
            
            <div class="mb-3">
                <label for="barrio" class="form-label">Barrio*</label>
                <input type="text" class="form-control" id="barrio" name="barrio" required>
            </div>
            
            <div class="mb-3">
                <label for="metodoPago" class="form-label">Método de pago*</label>
                <select class="form-control" id="metodoPago" name="metodoPago" required>
                    <option value="efectivo">Efectivo</option>
                    <option value="pse">PSE</option>
                    <option value="Ahorro-a-La-Mano">Ahorro a la mano</option>
                    <option value="Nequi">Nequi</option>
                    <option value="Daviplata">Daviplata</option>
                    <option value="Bancolombia">Bancolombia</option>
                </select>
            </div>
            
            <button type="submit" class="btn btn-submit">Completar Orden</button>
        `;
        
        // Agrego evento para enviar el formulario
        pedidoForm.addEventListener('submit', enviarPedidoDomicilio);
    }
    
    // Función para actualizar el formulario de restaurante con los campos requeridos
    function actualizarFormularioRestaurante() {
        // Limpio el formulario existente
        pedidoForm2.innerHTML = '';
        
        // Agrego los campos de información personal
        pedidoForm2.innerHTML += `
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="nombreR" class="form-label">Nombre*</label>
                    <input type="text" class="form-control" id="nombreR" name="nombre" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="apellidoR" class="form-label">Apellido*</label>
                    <input type="text" class="form-control" id="apellidoR" name="apellido" required>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="tipoDocumentoR" class="form-label">Tipo de Documento*</label>
                    <select class="form-control" id="tipoDocumentoR" name="tipoDocumento" required>
                        <option value="">Seleccione</option>
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="TI">Tarjeta de Identidad</option>
                        <option value="PP">Pasaporte</option>
                    </select>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="numeroDocumentoR" class="form-label">Número de Documento*</label>
                    <input type="text" class="form-control" id="numeroDocumentoR" name="numeroDocumento" required>
                </div>
            </div>
            
            <div class="mb-3">
                <label for="telefonoR" class="form-label">Teléfono o Celular*</label>
                <input type="tel" class="form-control" id="telefonoR" name="telefono" required>
            </div>
            
            <div class="mb-3">
                <label for="emailR" class="form-label">Correo Electrónico*</label>
                <input type="email" class="form-control" id="emailR" name="email" required>
            </div>
            
            <div class="mb-3">
                <label for="horaReserva" class="form-label">Seleccionar Hora*</label>
                <input type="time" class="form-control" id="horaReserva" name="horaReserva" min="11:00" max="22:00" required>
                <small class="form-text text-muted">Horario disponible: 11:00 AM - 10:00 PM</small>
            </div>
            
            <div class="mb-3">
                <label class="form-label">¿Es tu primera visita al restaurante?*</label>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="primeraVisita" id="primeraVisitaSi" value="si" required>
                    <label class="form-check-label" for="primeraVisitaSi">
                        Sí, es mi primera vez
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="primeraVisita" id="primeraVisitaNo" value="no">
                    <label class="form-check-label" for="primeraVisitaNo">
                        No, ya he visitado antes
                    </label>
                </div>
            </div>
            
            <div class="mb-3">
                <label for="metodoPagoR" class="form-label">Método de pago*</label>
                <select class="form-control" id="metodoPagoR" name="metodoPago" required>
                    <option value="efectivo">Efectivo</option>
                    <option value="pse">PSE</option>
                    <option value="Ahorro-a-La-Mano">Ahorro a la mano</option>
                    <option value="Nequi">Nequi</option>
                    <option value="Daviplata">Daviplata</option>
                </select>
            </div>
            
            <button type="submit" class="btn btn-submit">Completar Orden</button>
        `;
        
        // Agrego evento para enviar el formulario
        pedidoForm2.addEventListener('submit', enviarPedidoRestaurante);
    }
    
    // Evento para cancelar el pedido
    cancelarPedidoBtn.addEventListener('click', function() {
        formularioPedidoContainer.classList.add('d-none');
        irAPagoBtn.style.display = 'block';
        cancelarPedidoBtn.style.display = 'none';
    });
    
    // Función para enviar pedido a domicilio a SpringBoot
    function enviarPedidoDomicilio(event) {
        event.preventDefault();
        
        // Obtengo los datos del formulario
        const formData = new FormData(pedidoForm);
        const pedidoData = {
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            tipoDocumento: formData.get('tipoDocumento'),
            numeroDocumento: formData.get('numeroDocumento'),
            telefono: formData.get('telefono'),
            email: formData.get('email'),
            direccion: formData.get('direccion'),
            barrio: formData.get('barrio'),
            metodoPago: formData.get('metodoPago'),
            esDomicilio: true,
            fueDirectamenteEnRestaurante: false,
            primerVisita: false,
            items: carrito.map(item => ({
                nombre: item.name,
                cantidad: item.quantity,
                precio: item.price
            })),
            total: total
        };
        
        // Envío los datos al backend
        fetch('/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedidoData)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Error al procesar el pedido');
        })
        .then(data => {
            // Manejo la respuesta exitosa
            alert('¡Su pedido ha sido procesado correctamente! Pronto recibirá su comida.');
            limpiarCarrito();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un problema al procesar su pedido. Por favor, inténtelo nuevamente.');
        });
    }
    
    // Función para enviar pedido en restaurante a SpringBoot
    function enviarPedidoRestaurante(event) {
        event.preventDefault();
        
        // Obtengo los datos del formulario
        const formData = new FormData(pedidoForm2);
        const pedidoData = {
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            tipoDocumento: formData.get('tipoDocumento'),
            numeroDocumento: formData.get('numeroDocumento'),
            telefono: formData.get('telefono'),
            email: formData.get('email'),
            horaReserva: formData.get('horaReserva'),
            metodoPago: formData.get('metodoPago'),
            esDomicilio: false,
            fueDirectamenteEnRestaurante: true,
            primerVisita: formData.get('primeraVisita') === 'si',
            items: carrito.map(item => ({
                nombre: item.name,
                cantidad: item.quantity,
                precio: item.price
            })),
            total: total
        };
        
        // Envío los datos al backend
        fetch('/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedidoData)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Error al procesar el pedido');
        })
        .then(data => {
            // Manejo la respuesta exitosa
            alert('¡Su pedido ha sido registrado correctamente! Puede acercarse a la caja para pagar.');
            limpiarCarrito();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un problema al procesar su pedido. Por favor, inténtelo nuevamente.');
        });
    }
    
    // Función para limpiar el carrito después de un pedido exitoso
    function limpiarCarrito() {
        carrito = [];
        actualizarCarrito();
        formularioPedidoContainer.classList.add('d-none');
        irAPagoBtn.style.display = 'block';
        cancelarPedidoBtn.style.display = 'none';
    }
});