
// Variables globales para el carrito y usuario
let carrito = [];
let total = 0;
let usuarioLogueado = null;

// Variables globales 
let carritoVacioMensaje, carritoItemsContenedor, carritoTotalMonto;
let irAPagoBtn, formularioPedidoContenedorGlobal, cancelarPedidoBtn;
let mobileCartBtn, mobileCartCount, opcionPedidoModal, contenedorMenus;
let pedidoFormDomicilio, pedidoFormRestaurante;

// Función global para agregar platos al carrito (accesible desde onclick)
function agregarAlCarrito(platoId, nombrePlato, precio) {
    const quantity = 1; // Por defecto agregamos 1
    
    if (isNaN(platoId) || isNaN(precio)) {
        alert("Error: El plato tiene datos inválidos (ID o precio).");
        return;
    }
    
    const existingItemIndex = carrito.findIndex(item => item.id === platoId);
    if (existingItemIndex !== -1) {
        carrito[existingItemIndex].quantity += quantity;
    } else {
        carrito.push({ 
            id: platoId, 
            name: nombrePlato, 
            price: precio, 
            quantity: quantity 
        });
    }
    
    actualizarVisualizacionCarrito();
    console.log(`Agregado al carrito: ${nombrePlato} x${quantity}`);
    
    // Efecto visual para feedback
    const button = event.target.closest('.btn-add-to-cart');
    if (button) {
        button.classList.add('pulse');
        setTimeout(() => { button.classList.remove('pulse'); }, 500);
    }
}

// Función global para actualizar la visualización del carrito
function actualizarVisualizacionCarrito() {
    if (!carritoItemsContenedor || !carritoVacioMensaje || !carritoTotalMonto || !mobileCartCount) {
        console.log('Elementos del DOM no están inicializados aún');
        return;
    }
    
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
    
    // Asignar eventos a los botones de eliminar
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

document.addEventListener('DOMContentLoaded', function() { 
    // Inicializar variables del DOM
    carritoVacioMensaje = document.querySelector('.empty-cart-message');
    carritoItemsContenedor = document.getElementById('cart-items');
    carritoTotalMonto = document.getElementById('cart-total-amount');
    irAPagoBtn = document.getElementById('ir-A-pago');
    formularioPedidoContenedorGlobal = document.getElementById('formularioPedidoContainer');
    cancelarPedidoBtn = document.getElementById('cancelarPedido');
    mobileCartBtn = document.getElementById('mobile-cart-btn');
    mobileCartCount = document.getElementById('mobile-cart-count');
    opcionPedidoModal = new bootstrap.Modal(document.getElementById('opcionModal'));
    contenedorMenus = document.getElementById('contenedorMenus');
    
    pedidoFormDomicilio = document.getElementById('pedidoForm'); 
    pedidoFormRestaurante = document.getElementById('pedidoForm2'); 

    /**
     * Cuando la página carga, verifico la sesión y cargo todos los menús.
     */
    async function inicializarPagina() {
        await verificarSesionUsuario(); 
        await cargarYRenderizarTodosLosMenus();
        
        recuperarCarritoTemporal(); 
    }

    /**
     * pregunto al backend si hay un usuario con sesión activa.
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
     *  recupero el carrito de sessionStorage si el usuario fue redirigido al login y volvió.
     */
    function recuperarCarritoTemporal() {
        const carritoGuardado = sessionStorage.getItem('carritoTemporal');
        if (carritoGuardado) {
            carrito = JSON.parse(carritoGuardado);
            sessionStorage.removeItem('carritoTemporal'); 
            if (carrito.length > 0) {
                actualizarVisualizacionCarrito();
                console.log("Carrito recuperado de sessionStorage", carrito);
            }
        }
    }

    
    /**
     * Cargo todos los menús disponibles y sus platos correspondientes
     */
    async function cargarYRenderizarTodosLosMenus() {
        if (!contenedorMenus) {
            console.error("El contenedor de menús no se encontró en el DOM.");
            return;
        }

        contenedorMenus.innerHTML = '<div class="col-12 text-center"><p>Cargando menús deliciosos...</p></div>';

        try {
            // Primero obtengo todos los menús disponibles
            const menusResponse = await fetch('/api/menus');
            if (!menusResponse.ok) {
                throw new Error(`Error ${menusResponse.status} al cargar los menús.`);
            }
            const menus = await menusResponse.json();
            
            console.log('Menús cargados:', menus);

            // Limpiar el contenedor
            contenedorMenus.innerHTML = '';

            // Para cada menú, crear una sección y cargar sus platos
            for (const menu of menus) {
                await crearSeccionMenu(menu);
            }

        } catch (error) {
            console.error("¡Rayos! No pude cargar los menús:", error);
            contenedorMenus.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle"></i>
                        <p>Ups! No pudimos cargar los menús en este momento.</p>
                        <p><small>${error.message}</small></p>
                        <button class="btn btn-outline-danger" onclick="cargarYRenderizarTodosLosMenus()">
                            <i class="bi bi-arrow-clockwise"></i> Reintentar
                        </button>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Crear una sección completa para un menú específico
     */
    async function crearSeccionMenu(menu) {
        try {
            // Obtener los platos del menú
            const platosResponse = await fetch(`/api/platos/menu/${menu.idMenu}`);
            if (!platosResponse.ok) {
                throw new Error(`Error ${platosResponse.status} al cargar platos del menú ${menu.nombreMenu}.`);
            }
            const platos = await platosResponse.json();

            // Solo mostrar el menú si tiene platos
            if (platos && platos.length > 0) {
                // Crear el HTML de la sección del menú
                const seccionHTML = `
                    <div class="menu-section mb-5">
                        <h2 class="section-title text-center">${menu.nombreMenu.toUpperCase()}</h2>
                        <p class="section-subtitle text-center">Seleccione sus platos favoritos</p>
                        <div class="row mt-4" id="contenedor-menu-${menu.idMenu}">
                        </div>
                    </div>
                `;

                // Agregar la sección al contenedor principal
                contenedorMenus.insertAdjacentHTML('beforeend', seccionHTML);

                // Renderizar los platos en esta sección específica
                const contenedorEspecifico = document.getElementById(`contenedor-menu-${menu.idMenu}`);
                renderizarPlatosEnSeccion(platos, contenedorEspecifico);
            } else {
                console.log(`El menú "${menu.nombreMenu}" no tiene platos, se omite.`);
            }

        } catch (error) {
            console.error(`Error cargando el menú "${menu.nombreMenu}":`, error);
            
            // Mostrar error para este menú específico
            const errorHTML = `
                <div class="menu-section mb-3">
                    <h2 class="section-title text-center">${menu.nombreMenu.toUpperCase()}</h2>
                    <div class="alert alert-warning text-center">
                        <i class="bi bi-exclamation-circle"></i>
                        <p>No pudimos cargar los platos de este menú.</p>
                    </div>
                </div>
            `;
            contenedorMenus.insertAdjacentHTML('beforeend', errorHTML);
        }
    }
    /**
     * Nueva función para renderizar platos en una sección específica
     */
    function renderizarPlatosEnSeccion(platos, contenedor) {
        if (!contenedor) return;
        contenedor.innerHTML = '';
        
        if (!platos || platos.length === 0) {
            contenedor.innerHTML = '<div class="col-12 text-center"><p>No hay platos disponibles en este menú.</p></div>';
            return;
        }

        platos.forEach(plato => {
            const platoHTML = crearHTMLPlato(plato);
            contenedor.insertAdjacentHTML('beforeend', platoHTML);
        });
    }

    /**
     * Función para mantener compatibilidad (usando la nueva función)
     */
    function renderizarPlatosEnHTML(platos) {
        // Esta función se mantiene para compatibilidad, pero ya no se usa
        const contenedorPrincipal = document.getElementById('contenedor-menu-1') || contenedorMenus;
        if (contenedorPrincipal) {
            renderizarPlatosEnSeccion(platos, contenedorPrincipal);
        }
    }

    /**
     * Crear el HTML de un plato individual
     */
    function crearHTMLPlato(plato) {
        const precioFormateado = plato.precio ? parseFloat(plato.precio).toLocaleString('es-CO') : '0';
        const imagenSrc = plato.imagenUrl && plato.imagenUrl.trim() !== '' 
            ? plato.imagenUrl 
            : '/IMG/placeholder-dish.jpg';

        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="dish-card">
                    <div class="dish-image-container">
                        <img src="${imagenSrc}" 
                             alt="${plato.nombrePlato || 'Plato'}" 
                             class="dish-image"
                             onerror="this.src='/IMG/placeholder-dish.jpg'">
                    </div>
                    <div class="dish-info">
                        <h3 class="dish-name">${plato.nombrePlato || 'Sin nombre'}</h3>
                        <p class="dish-description">${plato.descripcion || 'Delicioso plato preparado con los mejores ingredientes.'}</p>
                        <div class="dish-footer">
                            <span class="dish-price">$${precioFormateado}</span>
                            <button class="btn-add-to-cart" 
                                    onclick="agregarAlCarrito(${plato.idPlato}, '${(plato.nombrePlato || '').replace(/'/g, "\\'")}', ${plato.precio || 0})">
                                <i class="bi bi-plus-lg"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // La función agregarAlCarrito ahora es global (definida fuera del DOMContentLoaded)

    // Función simplificada para compatibilidad - ya no se usa con múltiples menús
    function asignarEventosControlesCantidad() {
        // Esta función se mantiene vacía para evitar errores
        console.log('asignarEventosControlesCantidad() llamada pero no es necesaria con la nueva implementación');
    }
    // Función simplificada - ya no es necesaria con la nueva implementación
    function asignarEventosAddToCart() {
        console.log('asignarEventosAddToCart() llamada pero ya no es necesaria - usando onclick directo');
    }
    // La función actualizarVisualizacionCarrito ahora es global
    


    /**
     * Cuando el cliente quiere pagar primero verifico si está logueado.
     * Si no lo está, lo mando a iniciar sesión.
     */
    irAPagoBtn.addEventListener('click', async function() { 
        if (carrito.length === 0) {
            alert('Añade algo al carrito primero, ¿vale?');
            return;
        }

        // Vuelvo a verificar la sesión por si acaso cambió algo desde que cargó la página.
        await verificarSesionUsuario(); 

        if (!usuarioLogueado) {
            // Mostrar un modal más elegante en lugar de un alert
            if (confirm("Para realizar un pedido necesitas iniciar sesión o crear una cuenta.\n\n¿Deseas ir a la página de inicio de sesión ahora?")) {
                // Guardo el carrito actual en sessionStorage para recuperarlo después del login
                sessionStorage.setItem('carritoTemporal', JSON.stringify(carrito));
                // Lo redirijo al login, y le digo que vuelva aquí.
                window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
            }
            return; 
        }

        // Si llegamos aquí, es porque el usuario SÍ está logueado.
        opcionPedidoModal.show(); 
    });

    mobileCartBtn.addEventListener('click', function() {
        document.querySelector('.cart-section').scrollIntoView({ behavior: 'smooth' });
    });

   
    document.getElementById('pedidoDomicilio').addEventListener('click', function() {
        opcionPedidoModal.hide();
       
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
        } else { 
            prepararFormulario('restauranteLogueado', true); 
        }
    });
    
    /**
     *  preparo y muestro el formulario correcto según el tipo y si se debe mostrar.
     */
    function prepararFormulario(tipo, mostrar) {
        irAPagoBtn.style.display = mostrar ? 'none' : 'block';
        cancelarPedidoBtn.style.display = mostrar ? 'block' : 'none';
        pedidoFormDomicilio.style.display = 'none'; 
        pedidoFormRestaurante.style.display = 'none';
        
        if (mostrar) {
            formularioPedidoContenedorGlobal.classList.remove('d-none');
            switch (tipo) {
                case 'domicilioLogueado': 
                    pedidoFormDomicilio.style.display = 'block';
                    actualizarFormularioDomicilioLogueado();
                    break;
                case 'restauranteLogueado':
                    pedidoFormRestaurante.style.display = 'block';
                    actualizarFormularioRestauranteLogueado();
                    break;
                
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
    

    function actualizarFormularioDomicilioLogueado() {
        
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
     * proceso el pedido cuando un CLIENTE (ya logueado) lo hace, sea domicilio o restaurante.
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
     *  proceso el pedido cuando un ENCARGADO lo crea para un INVITADO en el restaurante.
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
     * enviar el pedido al backend.
     */
    function enviarPedidoAlBackend(payload, tipoPedidoDesc) {
        
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
     * Después de un pedido exitoso limpio todo.
     */
    function limpiarCarritoYFormularios() {
       
        carrito = [];
        actualizarVisualizacionCarrito();
        prepararFormulario(null, false); 
        pedidoFormDomicilio.reset(); 
        pedidoFormRestaurante.reset();
        
    }

    
    inicializarPagina();
});
