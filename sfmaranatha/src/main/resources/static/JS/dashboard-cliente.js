
document.addEventListener('DOMContentLoaded', function() {
    // Verifico si el usuario está autenticado
    verificarAutenticacionYcargarDatosUsuario();
    
    // Configuro los eventos de los botones del dashboard
    configurarEventosDashboard();
    
    // Cargo datos del resumen inicial
    cargarDatosResumenInicial();
});

/**
 * Verifica si el usuario está autenticado y carga sus datos.
 * Si no está autenticado, lo redirige a la página de login.
 */
async function verificarAutenticacionYcargarDatosUsuario() {
    try {
        const response = await fetch('/api/usuarios/sesion-actual');
        const data = await response.json();
        
        if (!data.autenticado) {
            console.log('Usuario no autenticado, redirigiendo al login...');
            window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
            return;
        }
        
        // Mostrar nombre de usuario
        document.getElementById('nombreUsuario').textContent = `Bienvenido, ${data.nombre}`;
        
        // Guardar datos en localStorage para uso posterior
        localStorage.setItem('nombreUsuario', data.nombre);
        localStorage.setItem('idUsuario', data.idUsuario);
        localStorage.setItem('tipoUsuario', data.tipoUsuario);
        
        // Cargar datos del resumen
        cargarDatosResumenDashboard(data);
        
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        window.location.href = '/login.html';
    }
}

/**
 * Carga los datos iniciales del resumen del dashboard
 */
async function cargarDatosResumenInicial() {
    // Esta función se ejecuta en paralelo para cargar datos más rápido
    try {
        await Promise.all([
            cargarTotalPedidos(),
            cargarProximaReserva(),
            cargarUltimoPedido()
        ]);
    } catch (error) {
        console.error('Error cargando datos del resumen:', error);
    }
}

/**
 * Carga el total de pedidos del usuario
 */
async function cargarTotalPedidos() {
    try {
        const response = await fetch('/api/pedidos/mis-pedidos');
        if (response.ok) {
            const pedidos = await response.json();
            document.getElementById('totalPedidos').textContent = pedidos.length;
        }
    } catch (error) {
        console.error('Error cargando total de pedidos:', error);
        document.getElementById('totalPedidos').textContent = '0';
    }
}

/**
 * Carga la próxima reserva del usuario
 */
async function cargarProximaReserva() {
    try {
        const response = await fetch('/api/reservas/mis-reservas');
        if (response.ok) {
            const reservas = await response.json();
            
            // Filtrar solo reservas futuras y confirmadas
            const ahora = new Date();
            const reservasFuturas = reservas.filter(reserva => {
                const fechaReserva = new Date(reserva.fechaReserva + 'T' + reserva.horaReserva);
                return fechaReserva > ahora && reserva.estado === 'CONFIRMADA';
            });
            
            if (reservasFuturas.length > 0) {
                // Ordenar por fecha más próxima
                reservasFuturas.sort((a, b) => {
                    const fechaA = new Date(a.fechaReserva + 'T' + a.horaReserva);
                    const fechaB = new Date(b.fechaReserva + 'T' + b.horaReserva);
                    return fechaA - fechaB;
                });
                
                const proximaReserva = reservasFuturas[0];
                const fecha = formatearFecha(proximaReserva.fechaReserva);
                const hora = proximaReserva.horaReserva.substring(0, 5); // HH:mm
                document.getElementById('proximaReserva').textContent = `${fecha} a las ${hora}`;
            } else {
                document.getElementById('proximaReserva').textContent = 'No hay reservas próximas';
            }
        }
    } catch (error) {
        console.error('Error cargando próxima reserva:', error);
        document.getElementById('proximaReserva').textContent = 'No hay reservas';
    }
}

/**
 * Carga el último pedido del usuario
 */
async function cargarUltimoPedido() {
    try {
        const response = await fetch('/api/pedidos/mis-pedidos');
        if (response.ok) {
            const pedidos = await response.json();
            
            if (pedidos.length > 0) {
                // Ordenar por fecha más reciente
                pedidos.sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido));
                
                const ultimoPedido = pedidos[0];
                let descripcion = 'Pedido #' + ultimoPedido.idPedido;
                
                // Si hay items, mostrar el primero
                if (ultimoPedido.items && ultimoPedido.items.length > 0) {
                    descripcion = ultimoPedido.items[0].plato.nombrePlato;
                    if (ultimoPedido.items.length > 1) {
                        descripcion += ` (+${ultimoPedido.items.length - 1} más)`;
                    }
                }
                
                document.getElementById('ultimoPedido').textContent = descripcion;
            } else {
                document.getElementById('ultimoPedido').textContent = 'No hay pedidos';
            }
        }
    } catch (error) {
        console.error('Error cargando último pedido:', error);
        document.getElementById('ultimoPedido').textContent = 'No hay pedidos';
    }
}

/**
 * Carga los datos de resumen del dashboard.
 */
function cargarDatosResumenDashboard(datosUsuario) {
    // Los datos ya se cargan de forma asíncrona en cargarDatosResumenInicial
    // Esta función puede usarse para datos adicionales si es necesario
}

/**
 * Configura los eventos de click para los distintos botones del dashboard.
 */
function configurarEventosDashboard() {
    // Cerrar sesión
    const btnCerrarSesion = document.querySelector('.cerrar-sesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', function(e) {
            e.preventDefault();
            cerrarSesion();
        });
    }
    
    // Cambiar contraseña - redirigir a la página correcta
    const btnCambiarPassword = document.querySelector('a[href="/sfmaranatha/src/main/resources/static/recuperar-contrasenia.html"]');
    if (btnCambiarPassword) {
        btnCambiarPassword.href = '/recuperar-contrasenia.html';
    }
    
    // Actualizar las rutas de los enlaces
    actualizarRutasEnlaces();
}

/**
 * Actualiza las rutas de todos los enlaces para que funcionen correctamente
 */
function actualizarRutasEnlaces() {
    // Actualizar enlaces de acciones principales
    const enlaces = [
        { selector: 'a[href="/sfmaranatha/src/main/resources/static/gestion-de-menus.html"]', nuevaRuta: '/gestion-de-menus.html' },
        { selector: 'a[href="/sfmaranatha/src/main/resources/static/mesas.html"]', nuevaRuta: '/mesas.html' }
    ];
    
    enlaces.forEach(enlace => {
        const elementos = document.querySelectorAll(enlace.selector);
        elementos.forEach(el => {
            el.href = enlace.nuevaRuta;
        });
    });
}

/**
 * Cierra la sesión del usuario.
 */
function cerrarSesion() {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
        localStorage.clear();
        sessionStorage.clear();
        
        // Mostrar mensaje de despedida
        mostrarMensajeDespedida();
    }
}

/**
 * Muestra mensaje de despedida antes de redirigir
 */
function mostrarMensajeDespedida() {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    const mensaje = document.createElement('div');
    mensaje.style.cssText = `
        background-color: white;
        padding: 2rem 3rem;
        border-radius: 10px;
        text-align: center;
    `;
    mensaje.innerHTML = `
        <h3 style="color: #e63946;">¡Hasta pronto!</h3>
        <p>Gracias por visitarnos</p>
        <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Cerrando sesión...</span>
        </div>
    `;
    
    overlay.appendChild(mensaje);
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        window.location.href = '/login.html';
    }, 1500);
}

/**
 * Muestra la sección de pedidos y carga los datos.
 */
async function mostrarPedidos() {
    ocultarSeccionesDinamicas();
    const seccionPedidos = document.getElementById('seccionPedidos');
    if (seccionPedidos) {
        seccionPedidos.style.display = 'block';
        await cargarDatosPedidos();
    }
}

/**
 * Carga y muestra los pedidos del usuario autenticado.
 */
async function cargarDatosPedidos() {
    const tablaPedidosBody = document.getElementById('tablaPedidos');
    const noPedidosDiv = document.getElementById('noPedidos');
    
    if (!tablaPedidosBody || !noPedidosDiv) {
        console.error("Elementos del DOM para pedidos no encontrados.");
        return;
    }

    // Mostrar indicador de carga
    tablaPedidosBody.innerHTML = '<tr><td colspan="6" class="text-center">Cargando tus pedidos... <span class="spinner-border spinner-border-sm"></span></td></tr>';
    noPedidosDiv.style.display = 'none';

    try {
        const response = await fetch('/api/pedidos/mis-pedidos');
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
                return;
            }
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const pedidos = await response.json();

        if (pedidos && pedidos.length > 0) {
            tablaPedidosBody.innerHTML = '';
            
            // Ordenar pedidos por fecha (más recientes primero)
            pedidos.sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido));
            
            pedidos.forEach(pedido => {
                const tr = document.createElement('tr');

                // Formatear productos
                let productosStr = "No especificado";
                if (pedido.items && pedido.items.length > 0) {
                    productosStr = pedido.items.map(item => {
                        const nombrePlato = item.plato ? item.plato.nombrePlato : 'Plato desconocido';
                        return `${nombrePlato} x${item.cantidad}`;
                    }).join(', ');
                }

                // Determinar clase de estado para el badge
                let claseEstado = 'bg-secondary';
                switch (pedido.estado?.toUpperCase()) {
                    case 'PENDIENTE': claseEstado = 'bg-warning text-dark'; break;
                    case 'EN PREPARACION': claseEstado = 'bg-info'; break;
                    case 'ENTREGADO': claseEstado = 'bg-success'; break;
                    case 'CANCELADO': claseEstado = 'bg-danger'; break;
                }

                // Determinar tipo de pedido
                const tipoPedido = pedido.direccionEntrega ? 
                    '<i class="fas fa-motorcycle"></i> Domicilio' : 
                    '<i class="fas fa-store"></i> Restaurante';

                tr.innerHTML = `
                    <td>#${pedido.idPedido}</td>
                    <td>${formatDateTime(pedido.fechaPedido)}</td>
                    <td>
                        <div>${productosStr}</div>
                        <small class="text-muted">${tipoPedido}</small>
                    </td>
                    <td>${formatCurrency(pedido.total)}</td>
                    <td><span class="badge ${claseEstado}">${pedido.estado || 'Desconocido'}</span></td>
                    <td class="acciones-pedido">
                        ${generarAccionesPedido(pedido)}
                    </td>
                `;
                tablaPedidosBody.appendChild(tr);
            });
            
            noPedidosDiv.style.display = 'none';
            
            // Añadir event listeners a los botones
            configurarEventosPedidos();
            
        } else {
            noPedidosDiv.style.display = 'block';
            tablaPedidosBody.innerHTML = '';
        }
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        mostrarMensajeAlerta(`Error al cargar pedidos: ${error.message}`, "danger", tablaPedidosBody, 6);
        noPedidosDiv.style.display = 'none';
    }
}

/**
 * Genera las acciones disponibles para un pedido
 */
function generarAccionesPedido(pedido) {
    let acciones = '';
    
    // Ver detalles siempre disponible
    acciones += `
        <button class="btn btn-sm btn-outline-info btn-ver-detalle" data-pedido='${JSON.stringify(pedido)}' title="Ver Detalles">
            <i class="fas fa-eye"></i> <span class="d-none d-md-inline">Detalles</span>
        </button>
    `;
    
    // Cancelar solo si está pendiente
    if (pedido.estado?.toUpperCase() === 'PENDIENTE') {
        acciones += `
            <button class="btn btn-sm btn-outline-danger btn-cancelar-pedido ms-1" data-id="${pedido.idPedido}" title="Cancelar Pedido">
                <i class="fas fa-times"></i> <span class="d-none d-md-inline">Cancelar</span>
            </button>
        `;
    }
    
    // Repetir pedido para pedidos entregados
    if (pedido.estado?.toUpperCase() === 'ENTREGADO') {
        acciones += `
            <button class="btn btn-sm btn-outline-primary btn-repetir-pedido ms-1" data-pedido='${JSON.stringify(pedido)}' title="Repetir Pedido">
                <i class="fas fa-redo"></i> <span class="d-none d-md-inline">Repetir</span>
            </button>
        `;
    }
    
    return acciones;
}

/**
 * Configura los eventos de los botones de acciones de pedidos
 */
function configurarEventosPedidos() {
    // Ver detalles
    document.querySelectorAll('.btn-ver-detalle').forEach(button => {
        button.addEventListener('click', function() {
            const pedido = JSON.parse(this.dataset.pedido);
            mostrarDetallePedido(pedido);
        });
    });
    
    // Cancelar pedido
    document.querySelectorAll('.btn-cancelar-pedido').forEach(button => {
        button.addEventListener('click', function() {
            solicitarCancelacionPedido(this.dataset.id);
        });
    });
    
    // Repetir pedido
    document.querySelectorAll('.btn-repetir-pedido').forEach(button => {
        button.addEventListener('click', function() {
            const pedido = JSON.parse(this.dataset.pedido);
            repetirPedido(pedido);
        });
    });
}

/**
 * Muestra el detalle de un pedido en un modal
 */
function mostrarDetallePedido(pedido) {
    // Crear modal si no existe
    let modal = document.getElementById('modalDetallePedido');
    if (!modal) {
        modal = crearModalDetallePedido();
        document.body.appendChild(modal);
    }
    
    // Llenar contenido del modal
    const modalBody = modal.querySelector('.modal-body');
    
    let itemsHtml = '';
    let subtotal = 0;
    
    if (pedido.items && pedido.items.length > 0) {
        itemsHtml = pedido.items.map(item => {
            const precioItem = item.precioUnitario * item.cantidad;
            subtotal += precioItem;
            return `
                <tr>
                    <td>${item.plato?.nombrePlato || 'Producto'}</td>
                    <td class="text-center">${item.cantidad}</td>
                    <td class="text-end">${formatCurrency(item.precioUnitario)}</td>
                    <td class="text-end">${formatCurrency(precioItem)}</td>
                </tr>
            `;
        }).join('');
    }
    
    modalBody.innerHTML = `
        <div class="row mb-3">
            <div class="col-md-6">
                <p><strong>Pedido #:</strong> ${pedido.idPedido}</p>
                <p><strong>Fecha:</strong> ${formatDateTime(pedido.fechaPedido)}</p>
                <p><strong>Estado:</strong> <span class="badge bg-${getEstadoColor(pedido.estado)}">${pedido.estado}</span></p>
            </div>
            <div class="col-md-6">
                <p><strong>Método de pago:</strong> ${pedido.metodoPago || 'No especificado'}</p>
                <p><strong>Tipo:</strong> ${pedido.direccionEntrega ? 'Domicilio' : 'Restaurante'}</p>
                ${pedido.direccionEntrega ? `<p><strong>Dirección:</strong> ${pedido.direccionEntrega}</p>` : ''}
                ${pedido.horaEntregaRestaurante ? `<p><strong>Hora:</strong> ${pedido.horaEntregaRestaurante}</p>` : ''}
            </div>
        </div>
        
        <h6>Productos del pedido:</h6>
        <table class="table table-sm">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th class="text-center">Cantidad</th>
                    <th class="text-end">Precio Unit.</th>
                    <th class="text-end">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml || '<tr><td colspan="4" class="text-center">No hay productos</td></tr>'}
            </tbody>
            <tfoot>
                <tr class="fw-bold">
                    <td colspan="3" class="text-end">Total:</td>
                    <td class="text-end">${formatCurrency(pedido.total)}</td>
                </tr>
            </tfoot>
        </table>
        
        ${pedido.descripcion ? `<p class="mt-3"><strong>Observaciones:</strong> ${pedido.descripcion}</p>` : ''}
    `;
    
    // Mostrar modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

/**
 * Crea el modal para mostrar detalles del pedido
 */
function crearModalDetallePedido() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'modalDetallePedido';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Detalle del Pedido</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <!-- Contenido dinámico -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    return modal;
}

/**
 * Repetir un pedido anterior
 */
function repetirPedido(pedido) {
    if (!pedido.items || pedido.items.length === 0) {
        alert('Este pedido no tiene productos para repetir.');
        return;
    }
    
    // Crear carrito con los items del pedido anterior
    const carrito = pedido.items.map(item => ({
        id: item.plato.idPlato,
        name: item.plato.nombrePlato,
        price: item.precioUnitario,
        quantity: item.cantidad
    }));
    
    // Guardar en sessionStorage
    sessionStorage.setItem('carritoTemporal', JSON.stringify(carrito));
    
    // Redirigir a la página de menús
    window.location.href = '/gestion-de-menus.html';
}

/**
 * Solicita la cancelación de un pedido.
 */
async function solicitarCancelacionPedido(idPedido) {
    if (!confirm(`¿Estás seguro de que deseas cancelar el pedido #${idPedido}? Esta acción no se puede deshacer.`)) {
        return;
    }

    const botonCancelar = document.querySelector(`.btn-cancelar-pedido[data-id="${idPedido}"]`);
    if (botonCancelar) {
        botonCancelar.disabled = true;
        botonCancelar.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Cancelando...';
    }

    try {
        const response = await fetch(`/api/pedidos/cancelar/${idPedido}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok && data.exito) {
            mostrarToast('success', `Pedido #${idPedido} cancelado con éxito.`);
            await cargarDatosPedidos(); // Recargar la lista
        } else {
            mostrarToast('error', data.mensaje || 'Error al cancelar el pedido.');
            if (botonCancelar) {
                botonCancelar.disabled = false;
                botonCancelar.innerHTML = '<i class="fas fa-times"></i> <span class="d-none d-md-inline">Cancelar</span>';
            }
        }
    } catch (error) {
        console.error('Error en la solicitud de cancelación:', error);
        mostrarToast('error', 'Error de red al intentar cancelar el pedido.');
        if (botonCancelar) {
            botonCancelar.disabled = false;
            botonCancelar.innerHTML = '<i class="fas fa-times"></i> <span class="d-none d-md-inline">Cancelar</span>';
        }
    }
}

/**
 * Muestra la sección de reservas
 */
async function mostrarReservas() {
    ocultarSeccionesDinamicas();
    const seccionReservas = document.getElementById('seccionReservas');
    if (seccionReservas) {
        seccionReservas.style.display = 'block';
        await cargarDatosReservas();
    }
}

/**
 * Carga los datos de las reservas del usuario
 */
async function cargarDatosReservas() {
    const tablaReservas = document.getElementById('tablaReservas');
    const noReservas = document.getElementById('noReservas');

    // Mostrar indicador de carga
    tablaReservas.innerHTML = '<tr><td colspan="6" class="text-center">Cargando reservas... <span class="spinner-border spinner-border-sm"></span></td></tr>';
    noReservas.style.display = 'none';

    try {
        const response = await fetch('/api/reservas/mis-reservas');
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
                return;
            }
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const reservas = await response.json();

        if (reservas && reservas.length > 0) {
            tablaReservas.innerHTML = '';
            
            // Ordenar por fecha más reciente
            reservas.sort((a, b) => {
                const fechaA = new Date(a.fechaReserva + 'T' + a.horaReserva);
                const fechaB = new Date(b.fechaReserva + 'T' + b.horaReserva);
                return fechaB - fechaA;
            });
            
            reservas.forEach(reserva => {
                let claseEstado = '';
                switch (reserva.estado) {
                    case 'CONFIRMADA': claseEstado = 'bg-success'; break;
                    case 'PENDIENTE': claseEstado = 'bg-warning text-dark'; break;
                    case 'CANCELADA': claseEstado = 'bg-danger'; break;
                    default: claseEstado = 'bg-secondary';
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>R-${String(reserva.idReserva).padStart(5, '0')}</td>
                    <td>${formatearFecha(reserva.fechaReserva)}</td>
                    <td>${reserva.horaReserva.substring(0, 5)}</td>
                    <td>${reserva.numeroPersonas}</td>
                    <td><span class="badge ${claseEstado}">${reserva.estado}</span></td>
                    <td class="acciones-pedido">
                        ${generarAccionesReserva(reserva)}
                    </td>
                `;
                tablaReservas.appendChild(tr);
            });
            
            noReservas.style.display = 'none';
            
            // Configurar eventos
            configurarEventosReservas();
            
        } else {
            noReservas.style.display = 'block';
            tablaReservas.innerHTML = '';
        }
    } catch (error) {
        console.error('Error al cargar reservas:', error);
        mostrarToast('error', 'Error al cargar las reservas');
        noReservas.style.display = 'block';
        tablaReservas.innerHTML = '';
    }
}

/**
 * Genera las acciones disponibles para una reserva
 */
function generarAccionesReserva(reserva) {
    let acciones = '';
    
    // Ver detalles siempre disponible
    acciones += `
        <button class="btn btn-sm btn-outline-info btn-ver-detalle-reserva" data-reserva='${JSON.stringify(reserva)}' title="Ver Detalles">
            <i class="fas fa-eye"></i> <span class="d-none d-md-inline">Detalles</span>
        </button>
    `;
    
    // Solo permitir cancelar si es futura y está confirmada
    const fechaReserva = new Date(reserva.fechaReserva + 'T' + reserva.horaReserva);
    const ahora = new Date();
    
    if (reserva.estado === 'CONFIRMADA' && fechaReserva > ahora) {
        acciones += `
            <button class="btn btn-sm btn-outline-danger btn-cancelar-reserva ms-1" data-id="${reserva.idReserva}" title="Cancelar Reserva">
                <i class="fas fa-times"></i> <span class="d-none d-md-inline">Cancelar</span>
            </button>
        `;
    }
    
    return acciones;
}

/**
 * Configura los eventos de las reservas
 */
function configurarEventosReservas() {
    // Ver detalles
    document.querySelectorAll('.btn-ver-detalle-reserva').forEach(button => {
        button.addEventListener('click', function() {
            const reserva = JSON.parse(this.dataset.reserva);
            mostrarDetalleReserva(reserva);
        });
    });
    
    // Cancelar reserva
    document.querySelectorAll('.btn-cancelar-reserva').forEach(button => {
        button.addEventListener('click', function() {
            cancelarReserva(this.dataset.id);
        });
    });
}

/**
 * Muestra el detalle de una reserva
 */
function mostrarDetalleReserva(reserva) {
    let modal = document.getElementById('modalDetalleReserva');
    if (!modal) {
        modal = crearModalDetalleReserva();
        document.body.appendChild(modal);
    }
    
    const modalBody = modal.querySelector('.modal-body');
    
    // Verificar si hay pedidos asociados
    let pedidosHtml = '';
    if (reserva.pedidos && reserva.pedidos.length > 0) {
        pedidosHtml = `
            <div class="mt-3">
                <h6>Pedido anticipado:</h6>
                <ul class="list-unstyled">
                    ${reserva.pedidos.map(p => `
                        <li>Pedido #${p.idPedido} - ${formatCurrency(p.total)} - ${p.estado}</li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    modalBody.innerHTML = `
        <div class="row mb-3">
            <div class="col-md-6">
                <p><strong>Reserva #:</strong> R-${String(reserva.idReserva).padStart(5, '0')}</p>
                <p><strong>Fecha:</strong> ${formatearFecha(reserva.fechaReserva)}</p>
                <p><strong>Hora:</strong> ${reserva.horaReserva.substring(0, 5)}</p>
                <p><strong>Mesa:</strong> ${reserva.numeroMesa}</p>
            </div>
            <div class="col-md-6">
                <p><strong>Personas:</strong> ${reserva.numeroPersonas}</p>
                <p><strong>Estado:</strong> <span class="badge bg-${getEstadoColor(reserva.estado)}">${reserva.estado}</span></p>
            </div>
        </div>
        ${pedidosHtml}
    `;
    
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

/**
 * Crea el modal para detalles de reserva
 */
function crearModalDetalleReserva() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'modalDetalleReserva';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Detalle de la Reserva</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <!-- Contenido dinámico -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    return modal;
}

/**
 * Cancela una reserva
 */
async function cancelarReserva(idReserva) {
    if (!confirm(`¿Estás seguro de que deseas cancelar la reserva R-${String(idReserva).padStart(5, '0')}? Esta acción no se puede deshacer.`)) {
        return;
    }

    const botonCancelar = document.querySelector(`.btn-cancelar-reserva[data-id="${idReserva}"]`);
    if (botonCancelar) {
        botonCancelar.disabled = true;
        botonCancelar.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Cancelando...';
    }

    try {
        const response = await fetch(`/api/reservas/${idReserva}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok && data.exito) {
            mostrarToast('success', 'Reserva cancelada con éxito.');
            await cargarDatosReservas(); // Recargar la lista
            await cargarProximaReserva(); // Actualizar el resumen
        } else {
            mostrarToast('error', data.mensaje || 'Error al cancelar la reserva.');
            if (botonCancelar) {
                botonCancelar.disabled = false;
                botonCancelar.innerHTML = '<i class="fas fa-times"></i> <span class="d-none d-md-inline">Cancelar</span>';
            }
        }
    } catch (error) {
        console.error('Error al cancelar reserva:', error);
        mostrarToast('error', 'Error de red al intentar cancelar la reserva.');
        if (botonCancelar) {
            botonCancelar.disabled = false;
            botonCancelar.innerHTML = '<i class="fas fa-times"></i> <span class="d-none d-md-inline">Cancelar</span>';
        }
    }
}

/**
 * Oculta todas las secciones dinámicas
 */
function ocultarSeccionesDinamicas() {
    const secciones = ['seccionPedidos', 'seccionReservas'];
    secciones.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.style.display = 'none';
        }
    });
}

/**
 * Muestra métodos de pago (funcionalidad pendiente)
 */
function mostrarMetodosPago() {
    mostrarToast('info', 'Funcionalidad de métodos de pago en desarrollo.');
}

/**
 * Muestra perfil del usuario
 */
async function mostrarPerfil() {
    try {
        const response = await fetch('/api/usuarios/sesion-actual');
        const usuario = await response.json();
        
        if (usuario.autenticado) {
            mostrarModalPerfil(usuario);
        } else {
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Error al cargar perfil:', error);
        mostrarToast('error', 'Error al cargar el perfil');
    }
}

/**
 * Muestra el modal con el perfil del usuario
 */
function mostrarModalPerfil(usuario) {
    let modal = document.getElementById('modalPerfil');
    if (!modal) {
        modal = crearModalPerfil();
        document.body.appendChild(modal);
    }
    
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = `
        <form id="formEditarPerfil">
            <div class="mb-3">
                <label class="form-label">Nombre</label>
                <input type="text" class="form-control" value="${usuario.nombre}" readonly>
            </div>
            <div class="mb-3">
                <label class="form-label">Apellido</label>
                <input type="text" class="form-control" value="${usuario.apellido}" readonly>
            </div>
            <div class="mb-3">
                <label class="form-label">Correo</label>
                <input type="email" class="form-control" value="${usuario.correo}" readonly>
            </div>
            <div class="mb-3">
                <label class="form-label">Teléfono</label>
                <input type="tel" class="form-control" id="perfilTelefono" value="${usuario.telefono || ''}" placeholder="Agregar teléfono">
            </div>
            <div class="mb-3">
                <label class="form-label">Dirección</label>
                <input type="text" class="form-control" id="perfilDireccion" value="${usuario.direccion || ''}" placeholder="Agregar dirección">
            </div>
            <div class="mb-3">
                <label class="form-label">Tipo de documento</label>
                <input type="text" class="form-control" value="${usuario.tipoDocumento}" readonly>
            </div>
            <div class="mb-3">
                <label class="form-label">Número de documento</label>
                <input type="text" class="form-control" value="${usuario.numeroDocumento}" readonly>
            </div>
        </form>
    `;
    
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

/**
 * Crea el modal del perfil
 */
function crearModalPerfil() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'modalPerfil';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Mi Perfil</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <!-- Contenido dinámico -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    <button type="button" class="btn btn-primary" onclick="guardarPerfil()">Guardar cambios</button>
                </div>
            </div>
        </div>
    `;
    return modal;
}

/**
 * Guarda los cambios del perfil
 */
async function guardarPerfil() {
    const telefono = document.getElementById('perfilTelefono').value.trim();
    const direccion = document.getElementById('perfilDireccion').value.trim();
    
    // Validar teléfono si se proporciona
    if (telefono && !/^\d{7,15}$/.test(telefono)) {
        mostrarToast('warning', 'El teléfono debe contener entre 7 y 15 dígitos');
        return;
    }
    
    try {
        const response = await fetch('/api/usuarios/actualizar-perfil', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                telefono: telefono,
                direccion: direccion
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.exito) {
            mostrarToast('success', 'Perfil actualizado exitosamente');
            
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalPerfil'));
            if (modal) {
                modal.hide();
            }
            
            // Actualizar datos en localStorage si es necesario
            if (data.usuario) {
                if (data.usuario.telefono) localStorage.setItem('telefono', data.usuario.telefono);
                if (data.usuario.direccion) localStorage.setItem('direccion', data.usuario.direccion);
            }
        } else {
            mostrarToast('error', data.mensaje || 'Error al actualizar el perfil');
        }
    } catch (error) {
        console.error('Error al guardar perfil:', error);
        mostrarToast('error', 'Error de conexión al actualizar el perfil');
    }
}

// Funciones auxiliares

/**
 * Formatea fecha y hora
 */
function formatDateTime(dateString) {
    if (!dateString) return 'Fecha no disponible';
    try {
        const date = new Date(dateString);
        if (isNaN(date)) return 'Fecha inválida';

        const opciones = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        
        return date.toLocaleString('es-CO', opciones);
    } catch (e) {
        console.error("Error formateando fecha:", dateString, e);
        return 'Fecha inválida';
    }
}

/**
 * Formatea solo la fecha
 */
function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO + 'T00:00:00');
    const opciones = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return fecha.toLocaleDateString('es-CO', opciones);
}

/**
 * Formatea moneda
 */
function formatCurrency(amount) {
    if (typeof amount !== 'number') {
        amount = parseFloat(amount) || 0;
    }
    return `${amount.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Obtiene el color del badge según el estado
 */
function getEstadoColor(estado) {
    const colores = {
        'PENDIENTE': 'warning text-dark',
        'CONFIRMADA': 'success',
        'ENTREGADO': 'success',
        'CANCELADO': 'danger',
        'CANCELADA': 'danger',
        'EN PREPARACION': 'info',
        'LISTO': 'primary'
    };
    return colores[estado?.toUpperCase()] || 'secondary';
}

/**
 * Muestra un mensaje de alerta en una tabla
 */
function mostrarMensajeAlerta(mensaje, tipo, tbodyElement, colspan) {
    if (tbodyElement) {
        tbodyElement.innerHTML = `<tr><td colspan="${colspan}" class="text-center alert alert-${tipo}">${mensaje}</td></tr>`;
    }
}

/**
 * Muestra un toast de notificación
 */
function mostrarToast(tipo, mensaje) {
    // Crear contenedor de toasts si no existe
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '1050';
        document.body.appendChild(toastContainer);
    }
    
    const toastId = 'toast-' + Date.now();
    const bgClass = tipo === 'success' ? 'bg-success' : 
                    tipo === 'error' ? 'bg-danger' : 
                    tipo === 'warning' ? 'bg-warning' : 'bg-info';
    
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${mensaje}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 5000
    });
    
    toast.show();
    
    // Eliminar el toast del DOM después de ocultarse
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Recargar datos cada cierto tiempo
setInterval(() => {
    if (document.visibilityState === 'visible') {
        cargarDatosResumenInicial();
    }
}, 60000); // Cada minuto