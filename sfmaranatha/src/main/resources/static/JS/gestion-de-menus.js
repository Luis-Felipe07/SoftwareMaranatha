// Hola, soy el script que maneja la página de gestión de menús y pedidos.
document.addEventListener('DOMContentLoaded', function() {
    // Mis variables globales
    let carrito = [];
    let total = 0;
    let usuarioLogueado = null; // Aquí guardaré los datos del usuario si está logueado.
    // 'usuarioIdActualParaPedido' ya no es tan necesario globalmente si siempre usamos 'usuarioLogueado.idUsuario'

    // Elementos del DOM
    const carritoVacioMensaje = document.querySelector('.empty-cart-message');
    const carritoItemsContenedor = document.getElementById('cart-items');
    const carritoTotalMonto = document.getElementById('cart-total-amount');
    const irAPagoBtn = document.getElementById('ir-A-pago');
    const formularioPedidoContenedorGlobal = document.getElementById('formularioPedidoContainer');
    const cancelarPedidoBtn = document.getElementById('cancelarPedido');
    const mobileCartBtn = document.getElementById('mobile-cart-btn');
    const mobileCartCount = document.getElementById('mobile-cart-count');
    const opcionPedidoModal = new bootstrap.Modal(document.getElementById('opcionModal'));
    const contenedorPlatosDinamicos = document.getElementById('contenedorPlatosDinamicos');
    
    const pedidoFormDomicilio = document.getElementById('pedidoForm'); 
    const pedidoFormRestaurante = document.getElementById('pedidoForm2'); 

    /**
     * Cuando la página carga, verifico la sesión y cargo los platos.
     */
    async function inicializarPagina() {
        await verificarSesionUsuario(); 
        await cargarYRenderizarPlatos();
        // Recupero el carrito si el usuario vuelve del login
        recuperarCarritoTemporal(); 
    }

    /**
     * Yo pregunto al backend si hay un usuario con sesión activa.
     */
    async function verificarSesionUsuario() {
        try {
            const response = await fetch('/api/usuarios/sesion-actual');
            if (response.ok) {
                const data = await response.json();
                if (data && data.autenticado && data.idUsuario) {
                    usuarioLogueado = data; 
                    console.log('Yo detecté un usuario logueado:', usuarioLogueado);
                } else {
                    console.log('Yo no encontré una sesión de usuario activa o los datos estaban incompletos.');
                    usuarioLogueado = null;
                }
            } else { 
                console.log('Yo recibí una respuesta no OK (' + response.status + ') al verificar la sesión.');
                usuarioLogueado = null;
            }
        } catch (error) {
            console.error('Yo tuve un error al verificar la sesión del usuario:', error);
            usuarioLogueado = null; 
        }
    }

    /**
     * Yo recupero el carrito de sessionStorage si el usuario fue redirigido al login y volvió.
     */
    function recuperarCarritoTemporal() {
        const carritoGuardado = sessionStorage.getItem('carritoTemporal');
        if (carritoGuardado) {
            carrito = JSON.parse(carritoGuardado);
            sessionStorage.removeItem('carritoTemporal'); // Limpio para no reusarlo accidentalmente
            if (carrito.length > 0) {
                actualizarVisualizacionCarrito();
                console.log("Carrito recuperado de sessionStorage", carrito);
            }
        }
    }

    // --- Carga y renderizado de platos (sin cambios respecto a la versión anterior que te di) ---
    async function cargarYRenderizarPlatos() {
        // ... (esta función ya te la di completa y correcta en la respuesta anterior, asegúrate de tenerla aquí)
        // Incluye la llamada a verificarSesionUsuario() si no la haces en inicializarPagina() antes.
        // Por ahora, asumo que inicializarPagina() ya llamó a verificarSesionUsuario().

        const idMenuDelDia = 1; 
        if (!contenedorPlatosDinamicos) {
            console.error("El contenedor de platos dinámicos no se encontró en el DOM.");
            return;
        }
        contenedorPlatosDinamicos.innerHTML = '<div class="col-12 text-center"><p>Cargando platillos deliciosos...</p></div>';

        try {
            const response = await fetch(`/api/platos/menu/${idMenuDelDia}`);
            if (!response.ok) {
                let errorMsg = `Error ${response.status} al cargar los platos.`;
                try { const errorData = await response.json(); errorMsg = errorData.message || errorData.error || errorMsg; } catch (e) {}
                throw new Error(errorMsg);
            }
            const platos = await response.json();
            renderizarPlatosEnHTML(platos);
        } catch (error) {
            console.error("¡Rayos! No pude cargar los platos:", error);
            if (contenedorPlatosDinamicos) {
                 contenedorPlatosDinamicos.innerHTML = `<p class="text-danger text-center">No pudimos cargar los platos. Detalle: ${error.message}. Intenta recargar la página.</p>`;
            }
        }
    }
    function renderizarPlatosEnHTML(platos) {
        // ... (esta función ya te la di completa y correcta, asegúrate de tenerla aquí)
        if (!contenedorPlatosDinamicos) return;
        contenedorPlatosDinamicos.innerHTML = ''; 

        if (!platos || platos.length === 0) {
            contenedorPlatosDinamicos.innerHTML = '<p class="text-center">No hay platos disponibles en este momento.</p>';
            return;
        }
        platos.forEach(plato => {
            const precioFormateado = `$${parseFloat(plato.precio).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
            const imagenPorDefecto = 'IMG/default-placeholder.jpg';
            const platoHtml = `
                <div class="col-md-4 mb-4">
                    <div class="menu-card">
                        <div class="menu-card-image">
                            <img src="${plato.imagenUrl || imagenPorDefecto}" alt="${plato.nombrePlato}" onerror="this.onerror=null;this.src='${imagenPorDefecto}';">
                            <div class="menu-card-overlay"><div class="menu-card-price">${precioFormateado}</div></div>
                            ${plato.nombrePlato === 'Bandeja Paisa' ? '<div class="menu-card-badge">Promoción: 3x4</div>' : ''}
                        </div>
                        <div class="menu-card-body">
                            <h3 class="menu-card-title">${plato.nombrePlato}</h3>
                            <p class="menu-card-desc">${plato.descripcion || 'Un platillo delicioso de nuestro menú.'}</p>
                            <div class="menu-card-actions">
                                <div class="quantity-selector">
                                    <button class="quantity-btn decrement">-</button>
                                    <input type="number" min="1" value="1" class="quantity-input">
                                    <button class="quantity-btn increment">+</button>
                                </div>
                                <button class="btn btn-add add-to-cart" data-id="${plato.idPlato}" data-name="${plato.nombrePlato}" data-price="${plato.precio}">
                                    <i class="bi bi-cart-plus"></i> Añadir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
            contenedorPlatosDinamicos.insertAdjacentHTML('beforeend', platoHtml);
        });
        asignarEventosControlesCantidad();
        asignarEventosAddToCart();
    }
    function asignarEventosControlesCantidad() {
        // ... (esta función ya te la di completa y correcta, asegúrate de tenerla aquí)
         document.querySelectorAll('#contenedorPlatosDinamicos .increment').forEach(button => {
            const newButton = button.cloneNode(true); 
            button.parentNode.replaceChild(newButton, button);
            newButton.addEventListener('click', function() {
                const input = this.closest('.quantity-selector').querySelector('.quantity-input');
                input.value = parseInt(input.value) + 1;
            });
        });
        document.querySelectorAll('#contenedorPlatosDinamicos .decrement').forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            newButton.addEventListener('click', function() {
                const input = this.closest('.quantity-selector').querySelector('.quantity-input');
                if (parseInt(input.value) > 1) {
                    input.value = parseInt(input.value) - 1;
                }
            });
        });
    }
    function asignarEventosAddToCart() {
        // ... (esta función ya te la di completa y correcta, asegúrate de tenerla aquí)
        document.querySelectorAll('#contenedorPlatosDinamicos .add-to-cart').forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            newButton.addEventListener('click', function() {
                const card = this.closest('.menu-card');
                const platoId = parseInt(this.getAttribute('data-id'));
                const name = this.getAttribute('data-name');
                const price = parseFloat(this.getAttribute('data-price')); 
                const quantity = parseInt(card.querySelector('.quantity-input').value);
                if (isNaN(platoId) || isNaN(price)) {
                     alert("Error: El plato tiene datos inválidos (ID o precio).");
                     return;
                }
                const existingItemIndex = carrito.findIndex(item => item.id === platoId);
                if (existingItemIndex !== -1) {
                    carrito[existingItemIndex].quantity += quantity;
                } else {
                    carrito.push({ id: platoId, name: name, price: price, quantity: quantity });
                }
                actualizarVisualizacionCarrito();
                this.classList.add('pulse');
                setTimeout(() => { this.classList.remove('pulse'); }, 500);
            });
        });
    }
    function actualizarVisualizacionCarrito() {
        // ... (esta función ya te la di completa y correcta, asegúrate de tenerla aquí)
        carritoItemsContenedor.innerHTML = '';
        total = 0;
        if (carrito.length === 0) {
            carritoVacioMensaje.style.display = 'flex';
            mobileCartCount.textContent = '0';
        } else {
            carritoVacioMensaje.style.display = 'none';
            carrito.forEach((item, index) => {
                const subtotal = item.price * item.quantity;
                total += subtotal;
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${item.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</div>
                    </div>
                    <span class="cart-item-quantity">${item.quantity}x</span>
                    <i class="bi bi-x-circle cart-item-remove" data-index="${index}"></i>`;
                carritoItemsContenedor.appendChild(itemElement);
            });
            mobileCartCount.textContent = carrito.reduce((acc, item) => acc + item.quantity, 0);
        }
        carritoTotalMonto.textContent = total.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
        document.querySelectorAll('.cart-item-remove').forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            newButton.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                carrito.splice(index, 1);
                actualizarVisualizacionCarrito();
            });
        });
    }
    // --- FIN Carga y renderizado de platos ---


    /**
     * Cuando el cliente quiere pagar, ahora primero verifico si está logueado.
     * Si no lo está, lo mando a iniciar sesión.
     */
    irAPagoBtn.addEventListener('click', async function() { // Hago esta función async para poder usar await adentro
        if (carrito.length === 0) {
            alert('Añade algo al carrito primero, ¿vale?');
            return;
        }

        // Vuelvo a verificar la sesión por si acaso cambió algo desde que cargó la página.
        await verificarSesionUsuario(); 

        if (!usuarioLogueado) {
            alert("Para hacer un pedido, primero debes iniciar sesión o crear una cuenta.");
            // Guardo el carrito actual en sessionStorage para recuperarlo después del login
            sessionStorage.setItem('carritoTemporal', JSON.stringify(carrito));
            // Lo redirijo al login, y le digo que vuelva aquí.
            window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
            return; // Detengo la ejecución aquí.
        }

        // Si llegamos aquí, es porque el usuario SÍ está logueado.
        opcionPedidoModal.show(); // Muestro el modal para elegir tipo de pedido.
    });

    mobileCartBtn.addEventListener('click', function() {
        document.querySelector('.cart-section').scrollIntoView({ behavior: 'smooth' });
    });

    /**
     * Manejador para "Pedido a Domicilio".
     * Como el chequeo de login se hizo antes de mostrar el modal, aquí ya sé que 'usuarioLogueado' tiene datos.
     */
    document.getElementById('pedidoDomicilio').addEventListener('click', function() {
        opcionPedidoModal.hide();
        // Como ahora es obligatorio estar logueado, directamente muestro el formulario para logueados.
        prepararFormulario('domicilioLogueado', true);
    });

    /**
     * Manejador para "Comer en Restaurante".
     * Aquí también sé que 'usuarioLogueado' tiene datos.
     * Diferencio si es un trabajador o un cliente normal.
     */
    document.getElementById('comerRestaurante').addEventListener('click', function() {
        opcionPedidoModal.hide();
        if (usuarioLogueado && (usuarioLogueado.tipoUsuario === 'ENCARGADO' || usuarioLogueado.tipoUsuario === 'ADMIN')) {
            prepararFormulario('restauranteEncargado', true); 
        } else { // Si está logueado y no es encargado/admin, es un cliente.
            prepararFormulario('restauranteLogueado', true); 
        }
    });
    
    /**
     * Yo preparo y muestro el formulario correcto según el tipo y si se debe mostrar.
     */
    function prepararFormulario(tipo, mostrar) {
        irAPagoBtn.style.display = mostrar ? 'none' : 'block';
        cancelarPedidoBtn.style.display = mostrar ? 'block' : 'none';
        pedidoFormDomicilio.style.display = 'none'; 
        pedidoFormRestaurante.style.display = 'none';
        
        if (mostrar) {
            formularioPedidoContenedorGlobal.classList.remove('d-none');
            switch (tipo) {
                case 'domicilioLogueado': // Ya no hay 'domicilioNoLogueado' para auto-servicio
                    pedidoFormDomicilio.style.display = 'block';
                    actualizarFormularioDomicilioLogueado();
                    break;
                case 'restauranteLogueado':
                    pedidoFormRestaurante.style.display = 'block';
                    actualizarFormularioRestauranteLogueado();
                    break;
                // 'restauranteNoLogueado' ya no se alcanzaría para clientes si el login es obligatorio primero.
                // Se mantiene por si algún flujo interno lo necesita o para futura referencia, pero la lógica principal de 'irAPagoBtn' lo previene.
                // case 'restauranteNoLogueado': 
                //     pedidoFormRestaurante.style.display = 'block';
                //     actualizarFormularioRestauranteNoLogueado(); 
                //     break;
                case 'restauranteEncargado':
                    pedidoFormRestaurante.style.display = 'block';
                    actualizarFormularioRestauranteParaEncargado();
                    break;
            }
        } else {
            formularioPedidoContenedorGlobal.classList.add('d-none');
        }
    }
    
    // --- FORMULARIOS DINÁMICOS ---
    // (Las funciones actualizarFormularioDomicilioLogueado, actualizarFormularioRestauranteLogueado, 
    //  y actualizarFormularioRestauranteParaEncargado siguen siendo relevantes.
    //  actualizarFormularioRestauranteNoLogueado y generarCamposComunesUsuario para no logueados
    //  ya no serían llamadas directamente por el cliente si el login es obligatorio antes del modal)

    function actualizarFormularioDomicilioLogueado() {
        // ... (igual que en la respuesta anterior, usa los datos de 'usuarioLogueado')
        pedidoFormDomicilio.innerHTML = `
            <p>¡Hola de nuevo, <strong>${usuarioLogueado.nombre || ''} ${usuarioLogueado.apellido || ''}</strong>!</p>
            <p>Confirmemos tu pedido a domicilio:</p>
            <div class="mb-3">
                <label for="domLogDireccion" class="form-label">Dirección de envío*</label>
                <input type="text" class="form-control" id="domLogDireccion" name="direccion" value="${usuarioLogueado.direccion || ''}" required>
            </div>
            <div class="mb-3">
                <label for="domLogBarrio" class="form-label">Barrio</label>
                <input type="text" class="form-control" id="domLogBarrio" name="barrio" value="${usuarioLogueado.barrio || ''}">
            </div>
            <div class="mb-3">
                <label for="domLogMetodoPago" class="form-label">Método de pago*</label>
                <select class="form-control" id="domLogMetodoPago" name="metodoPago" required>
                    <option value="EFECTIVO">Efectivo</option><option value="PSE">PSE</option><option value="AHORRO_MANO">Ahorro a la mano</option><option value="NEQUI">Nequi</option><option value="DAVIPLATA">Daviplata</option><option value="BANCOLOMBIA">Bancolombia</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="domLogDescripcion" class="form-label">Observaciones</label>
                <textarea class="form-control" id="domLogDescripcion" name="descripcion"></textarea>
            </div>
            <button type="submit" class="btn btn-submit">Confirmar Pedido a Domicilio</button>
        `;
        pedidoFormDomicilio.removeEventListener('submit', procesarPedidoCliente);
        pedidoFormDomicilio.addEventListener('submit', procesarPedidoCliente);
    }

    function actualizarFormularioRestauranteLogueado() {
        // ... (igual que en la respuesta anterior, usa 'usuarioLogueado')
         pedidoFormRestaurante.innerHTML = `
            <p>¡Hola de nuevo, <strong>${usuarioLogueado.nombre || ''} ${usuarioLogueado.apellido || ''}</strong>!</p>
            <p>Confirma los detalles para tu pedido en el restaurante:</p>
            <div class="mb-3">
                <label for="restLogHoraEntrega" class="form-label">Hora de Entrega/Recogida*</label>
                <input type="time" class="form-control" id="restLogHoraEntrega" name="horaEntrega" min="11:00" max="22:00" required>
            </div>
            <div class="mb-3">
                <label for="restLogMetodoPago" class="form-label">Método de pago*</label>
                <select class="form-control" id="restLogMetodoPago" name="metodoPago" required>
                    <option value="EFECTIVO">Efectivo</option><option value="TARJETA">Tarjeta</option><option value="NEQUI">Nequi</option><option value="DAVIPLATA">Daviplata</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="restLogDescripcion" class="form-label">Observaciones</label>
                <textarea class="form-control" id="restLogDescripcion" name="descripcion"></textarea>
            </div>
            <button type="submit" class="btn btn-submit">Confirmar Pedido en Restaurante</button>
        `;
        pedidoFormRestaurante.removeEventListener('submit', procesarPedidoCliente);
        pedidoFormRestaurante.addEventListener('submit', procesarPedidoCliente);
    }
    
    function actualizarFormularioRestauranteParaEncargado() {
        // ... (igual que en la respuesta anterior)
        pedidoFormRestaurante.innerHTML = `
            <p class="form-subtitle">Registrando pedido para cliente en local (por ${usuarioLogueado.tipoUsuario})</p>
            <div class="mb-3">
                <label for="encNombreInvitado" class="form-label">Nombre del Cliente (Opcional)</label>
                <input type="text" class="form-control" id="encNombreInvitado" name="nombreInvitadoOpcional">
            </div>
            <div class="mb-3">
                <label for="encHoraEntrega" class="form-label">Hora de Entrega/Recogida*</label>
                <input type="time" class="form-control" id="encHoraEntrega" name="horaEntrega" min="11:00" max="22:00" value="12:00" required>
            </div>
            <div class="mb-3">
                <label for="encMetodoPago" class="form-label">Método de pago*</label>
                <select class="form-control" id="encMetodoPago" name="metodoPago" required>
                    <option value="EFECTIVO">Efectivo</option><option value="TARJETA">Tarjeta</option><option value="NEQUI">Nequi</option><option value="DAVIPLATA">Daviplata</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="encDescripcion" class="form-label">Observaciones</label>
                <textarea class="form-control" id="encDescripcion" name="descripcion"></textarea>
            </div>
            <button type="submit" class="btn btn-submit">Crear Pedido para Cliente</button>
        `;
        pedidoFormRestaurante.removeEventListener('submit', procesarPedidoRestauranteEncargado);
        pedidoFormRestaurante.addEventListener('submit', procesarPedidoRestauranteEncargado);
    }

    cancelarPedidoBtn.addEventListener('click', function() {
        prepararFormulario(null, false);
    });

    /**
     * Yo proceso el pedido cuando un CLIENTE (ya logueado) lo hace, sea domicilio o restaurante.
     */
    async function procesarPedidoCliente(event) {
        event.preventDefault();
        if (!usuarioLogueado || !usuarioLogueado.idUsuario) {
            alert("Error crítico: Se intentó procesar un pedido de cliente sin un usuario logueado. Por favor, recarga la página e inicia sesión.");
            return;
        }

        const esDomicilio = event.target.id === pedidoFormDomicilio.id; // Determino si es el form de domicilio
        const formData = new FormData(event.target); 
        
        const pedidoPayloadDTO = {
            solicitanteUsuarioId: usuarioLogueado.idUsuario, 
            items: carrito.map(item => ({ platoId: item.id, cantidad: item.quantity })),
            metodoPago: formData.get('metodoPago'),
            descripcion: formData.get('descripcion') || "",
            direccionEntrega: esDomicilio ? formData.get('direccion') : null, 
            horaEntregaRestaurante: esDomicilio ? null : formData.get('horaEntrega'), 
            paraInvitadoPorEncargado: false, 
            nombreInvitadoOpcional: null
        };
        enviarPedidoAlBackend(pedidoPayloadDTO, esDomicilio ? "domicilio (cliente)" : "restaurante (cliente)");
    }

    /**
     * Yo proceso el pedido cuando un ENCARGADO lo crea para un INVITADO en el restaurante.
     */
    async function procesarPedidoRestauranteEncargado(event) {
        event.preventDefault();
        if (!usuarioLogueado || !(usuarioLogueado.tipoUsuario === 'ENCARGADO' || usuarioLogueado.tipoUsuario === 'ADMIN')) {
            alert("¡Ojo! Esta acción es solo para personal autorizado.");
            return;
        }
        const formData = new FormData(pedidoFormRestaurante); 
        
        const pedidoPayloadDTO = {
            solicitanteUsuarioId: usuarioLogueado.idUsuario, // ID del ENCARGADO
            items: carrito.map(item => ({ platoId: item.id, cantidad: item.quantity })),
            metodoPago: formData.get('metodoPago'),
            descripcion: formData.get('descripcion') || "",
            direccionEntrega: null, 
            horaEntregaRestaurante: formData.get('horaEntrega'), 
            paraInvitadoPorEncargado: true, 
            nombreInvitadoOpcional: formData.get('nombreInvitadoOpcional') || ""
        };
        enviarPedidoAlBackend(pedidoPayloadDTO, "restaurante (invitado por encargado)");
    }

    /**
     * Yo soy el encargado final de enviar el pedido al backend.
     */
    function enviarPedidoAlBackend(payload, tipoPedidoDesc) {
        // ... (igual que en la respuesta anterior)
        console.log("Yo voy a enviar esto al backend:", payload);
        fetch('/api/pedidos/nuevo', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (response.ok) return response.json();
            return response.json().then(err => { 
                console.error("El backend me dio un error:", err); 
                throw new Error(err.mensaje || `El servidor respondió con ${response.status}`); 
            });
        })
        .then(data => {
            alert(`¡Pedido para ${tipoPedidoDesc} procesado con éxito! ID del Pedido: ${data.pedidoId}. Total: $${data.total ? data.total.toLocaleString() : 'N/A'}`);
            limpiarCarritoYFormularios();
        })
        .catch(error => {
            console.error('Yo tuve un error final enviando el pedido:', error);
            alert(`Hubo un problema al procesar tu pedido: ${error.message}`);
        });
    }

    /**
     * Después de un pedido exitoso, yo limpio todo.
     */
    function limpiarCarritoYFormularios() {
        // ... (igual que en la respuesta anterior)
        carrito = [];
        actualizarVisualizacionCarrito();
        prepararFormulario(null, false); 
        pedidoFormDomicilio.reset(); 
        pedidoFormRestaurante.reset();
        // usuarioIdActualParaPedido ya no es necesario globalmente, se usa usuarioLogueado.idUsuario
    }

    // ¡Listo! Empiezo por verificar la sesión y cargar los platos.
    inicializarPagina();
});
