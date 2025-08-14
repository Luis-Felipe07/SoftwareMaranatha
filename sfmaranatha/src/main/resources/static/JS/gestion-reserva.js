// Variables globales para cachear los pedidos y reservas
let pedidosCache = {
    pendientes: [],
    entregados: [],
    cancelados: []
};

let reservasCache = [];

document.addEventListener('DOMContentLoaded', function () {
    // Verificar autenticación
    verificarAutenticacion();
    
    // Cargar datos iniciales
    cargarPedidos();
    cargarReservas();
    cargarMesasNoDisponibles();
    
    // Configurar eventos de tabs
    configurarEventosTabs();
    
    // Recargar datos cada 30 segundos
    setInterval(() => {
        cargarPedidos();
        cargarReservas();
    }, 30000);
});

// Configurar eventos de tabs
function configurarEventosTabs() {
    // Manejar cambio de tabs
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        const targetTab = $(e.target).attr('href');
        console.log('Cambiando a tab:', targetTab);
        
        // Actualizar estilos de los tabs
        $('.nav-link').removeClass('active bg-warning').addClass('bg-danger');
        $(e.target).removeClass('bg-danger').addClass('active bg-warning');
    });
}

// Verificar si el usuario está autenticado y tiene permisos
async function verificarAutenticacion() {
    try {
        const response = await fetch('/api/usuarios/sesion-actual');
        const data = await response.json();
        
        if (!data.autenticado || (data.tipoUsuario !== 'ADMIN' && data.tipoUsuario !== 'ENCARGADO')) {
            alert('No tienes permisos para acceder a esta página');
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        window.location.href = '/login.html';
    }
}

// Cargar todos los pedidos y categorizarlos
async function cargarPedidos() {
    try {
        const response = await fetch('/api/pedidos');
        if (!response.ok) throw new Error('Error al cargar pedidos');
        
        const pedidos = await response.json();
        
        // Categorizar pedidos
        pedidosCache.pendientes = pedidos.filter(p => p.estado === 'PENDIENTE');
        pedidosCache.entregados = pedidos.filter(p => p.estado === 'ENTREGADO');
        pedidosCache.cancelados = pedidos.filter(p => p.estado === 'CANCELADO');
        
        // Actualizar contadores
        document.getElementById('countPendientes').textContent = pedidosCache.pendientes.length;
        document.getElementById('countEntregados').textContent = pedidosCache.entregados.length;
        document.getElementById('countCancelados').textContent = pedidosCache.cancelados.length;
        
        // Mostrar pedidos en todas las pestañas
        mostrarPedidos(pedidosCache.pendientes, 'listaPendientes', true);
        mostrarPedidos(pedidosCache.entregados, 'listaEntregados', false);
        mostrarPedidos(pedidosCache.cancelados, 'listaCancelados', false);
        
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        mostrarError('Error al cargar los pedidos');
    }
}

// Cargar todas las reservas
async function cargarReservas() {
    try {
        const response = await fetch('/api/reservas');
        if (!response.ok) throw new Error('Error al cargar reservas');
        
        reservasCache = await response.json();
        
        // Mostrar reservas en la pestaña correspondiente
        mostrarReservas(reservasCache, 'listaReservas');
        
        // Actualizar contador si existe
        const countElement = document.getElementById('countReservas');
        if (countElement) {
            countElement.textContent = reservasCache.length;
        }
        
    } catch (error) {
        console.error('Error al cargar reservas:', error);
        mostrarError('Error al cargar las reservas');
        
        // En caso de error, limpiar la lista
        const contenedor = document.getElementById('listaReservas');
        if (contenedor) {
            contenedor.innerHTML = '<div class="alert alert-warning">No se pudieron cargar las reservas</div>';
        }
    }
}

// Mostrar pedidos en la interfaz
function mostrarPedidos(pedidos, contenedorId, mostrarAcciones) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    if (pedidos.length === 0) {
        contenedor.innerHTML = '<div class="alert alert-info">No hay pedidos en esta categoría</div>';
        return;
    }
    
    pedidos.forEach(pedido => {
        const pedidoCard = document.createElement('div');
        pedidoCard.className = 'card mb-3';
        pedidoCard.dataset.pedidoId = pedido.idPedido;
        
        // Determinar tipo de entrega
        const tipoEntrega = pedido.direccionEntrega ? 'Domicilio' : 'Restaurante';
        const infoEntrega = pedido.direccionEntrega 
            ? `<strong>Dirección:</strong> ${pedido.direccionEntrega}`
            : `<strong>Hora recogida:</strong> ${pedido.horaEntregaRestaurante || 'No especificada'}`;
        
        // Formatear items
        let itemsHtml = '';
        if (pedido.items && pedido.items.length > 0) {
            itemsHtml = pedido.items.map(item => 
                `${item.nombrePlato} x${item.cantidad}`
            ).join(', ');
        }
        
        pedidoCard.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Pedido #${pedido.idPedido}</h5>
                <span class="badge badge-${getBadgeClass(pedido.estado)}">${pedido.estado}</span>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Cliente:</strong> ${pedido.nombreCliente}</p>
                        <p><strong>Total:</strong> $${formatearPrecio(pedido.total)}</p>
                        <p><strong>Método de pago:</strong> ${pedido.metodoPago}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Tipo:</strong> ${tipoEntrega}</p>
                        <p>${infoEntrega}</p>
                        <p><strong>Fecha:</strong> ${formatearFecha(pedido.fechaPedido)}</p>
                    </div>
                </div>
                <div class="mt-2">
                    <p><strong>Items:</strong> ${itemsHtml || 'No hay items'}</p>
                </div>
                ${mostrarAcciones ? `
                <div class="mt-3 text-right">
                    <button class="btn btn-success btn-sm" onclick="actualizarEstadoPedido(${pedido.idPedido}, 'ENTREGADO')">
                        <i class="bi bi-check-circle"></i> Marcar como Entregado
                    </button>
                    <button class="btn btn-danger btn-sm ml-2" onclick="actualizarEstadoPedido(${pedido.idPedido}, 'CANCELADO')">
                        <i class="bi bi-x-circle"></i> Cancelar Pedido
                    </button>
                    <button class="btn btn-info btn-sm ml-2" onclick="verDetallePedido(${pedido.idPedido})">
                        <i class="bi bi-eye"></i> Ver Detalle
                    </button>
                </div>
                ` : ''}
            </div>
        `;
        
        contenedor.appendChild(pedidoCard);
    });
}

// Mostrar reservas en la interfaz
function mostrarReservas(reservas, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    if (reservas.length === 0) {
        contenedor.innerHTML = '<div class="alert alert-info">No hay reservas registradas</div>';
        return;
    }

    reservas.forEach(reserva => {
        const reservaCard = document.createElement('div');
        reservaCard.className = 'card mb-3 border-left-primary shadow-sm';
        
        const fechaReserva = new Date(reserva.fechaReserva).toLocaleDateString('es-CO');
        const horaReserva = reserva.horaReserva || 'No especificada';
        
        reservaCard.innerHTML = `
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h6 class="card-title">Reserva #${reserva.idReserva}</h6>
                        <p class="card-text mb-1">
                            <strong>Cliente:</strong> ${reserva.nombreCompleto || 'Sin nombre'}
                        </p>
                        <p class="card-text mb-1">
                            <strong>Mesa:</strong> Mesa ${reserva.numeroMesa || 'Sin asignar'}
                        </p>
                        <p class="card-text mb-1">
                            <strong>Fecha:</strong> ${fechaReserva} - <strong>Hora:</strong> ${horaReserva}
                        </p>
                        <p class="card-text mb-1">
                            <strong>Personas:</strong> ${reserva.numeroPersonas || 'No especificado'}
                        </p>
                        ${reserva.observaciones ? `<p class="card-text mb-1"><strong>Observaciones:</strong> ${reserva.observaciones}</p>` : ''}
                    </div>
                    <div class="col-md-4 text-right">
                        <span class="badge badge-${getEstadoReservaColor(reserva.estado)} mb-2">${reserva.estado}</span>
                        <br>
                        <div class="btn-group-vertical">
                            <button class="btn btn-sm btn-info" onclick="verDetalleReserva(${reserva.idReserva})">
                                <i class="bi bi-eye"></i> Ver Detalle
                            </button>
                            ${reserva.estado === 'CONFIRMADA' ? `
                                <button class="btn btn-sm btn-success" onclick="actualizarEstadoReserva(${reserva.idReserva}, 'COMPLETADA')">
                                    <i class="bi bi-check"></i> Marcar Completada
                                </button>
                            ` : ''}
                            ${reserva.estado !== 'CANCELADA' && reserva.estado !== 'COMPLETADA' ? `
                                <button class="btn btn-sm btn-danger" onclick="actualizarEstadoReserva(${reserva.idReserva}, 'CANCELADA')">
                                    <i class="bi bi-x"></i> Cancelar
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        contenedor.appendChild(reservaCard);
    });
}

// Obtener color del badge según el estado de la reserva
function getEstadoReservaColor(estado) {
    switch(estado) {
        case 'CONFIRMADA': return 'success';
        case 'COMPLETADA': return 'primary';
        case 'CANCELADA': return 'danger';
        case 'PENDIENTE': return 'warning';
        default: return 'secondary';
    }
}

// Actualizar estado de pedido
async function actualizarEstadoPedido(idPedido, nuevoEstado) {
    const confirmacion = confirm(`¿Está seguro de cambiar el estado del pedido #${idPedido} a ${nuevoEstado}?`);
    if (!confirmacion) return;
    
    try {
        const response = await fetch(`/api/pedidos/actualizar-estado/${idPedido}?nuevoEstado=${nuevoEstado}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.exito) {
            mostrarMensaje('Estado actualizado correctamente', 'success');
            
            // Recargar pedidos para actualizar las vistas
            await cargarPedidos();
            
            // Si estamos en la pestaña de pendientes y actualizamos un pedido,
            // podríamos querer cambiar automáticamente a la pestaña correspondiente
            if (nuevoEstado === 'ENTREGADO') {
                $('#entregados-tab').tab('show');
            } else if (nuevoEstado === 'CANCELADO') {
                $('#cancelados-tab').tab('show');
            }
        } else {
            mostrarError(data.mensaje || 'Error al actualizar el estado');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al actualizar el estado del pedido');
    }
}

// Cargar mesas no disponibles
async function cargarMesasNoDisponibles() {
    try {
        const response = await fetch('/api/mesas/no-disponibles');
        const mesas = await response.json();
        
        const selectMesas = document.getElementById('listaMesas');
        selectMesas.innerHTML = '<option value="">Seleccione una mesa para habilitar...</option>';
        
        mesas.forEach(mesa => {
            const option = document.createElement('option');
            option.value = mesa.id;
            option.textContent = `Mesa ${mesa.numero} - Estado: ${mesa.estado}`;
            selectMesas.appendChild(option);
        });
        
        if (mesas.length === 0) {
            selectMesas.innerHTML = '<option value="">Todas las mesas están disponibles</option>';
        }
    } catch (error) {
        console.error('Error al cargar mesas:', error);
        mostrarError('Error al cargar las mesas');
    }
}

// Habilitar mesa seleccionada
document.getElementById('habilitarMesa').addEventListener('click', async function() {
    const mesaId = document.getElementById('listaMesas').value;
    
    if (!mesaId) {
        mostrarError('Por favor seleccione una mesa', 'mensajeMesa');
        return;
    }
    
    try {
        const response = await fetch(`/api/mesas/${mesaId}/habilitar`, {
            method: 'PUT'
        });
        
        const data = await response.json();
        
        if (data.exito) {
            mostrarMensaje(data.mensaje, 'success', 'mensajeMesa');
            cargarMesasNoDisponibles(); // Recargar lista
        } else {
            mostrarError(data.mensaje || 'Error al habilitar la mesa', 'mensajeMesa');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al habilitar la mesa', 'mensajeMesa');
    }
});

// Ver detalle del pedido
function verDetallePedido(idPedido) {
    // Buscar el pedido en el cache
    let pedido = null;
    for (let categoria in pedidosCache) {
        pedido = pedidosCache[categoria].find(p => p.idPedido === idPedido);
        if (pedido) break;
    }
    
    if (pedido) {
        mostrarModalDetalle(pedido);
    }
}

// Mostrar modal con detalles
function mostrarModalDetalle(pedido) {
    const contenido = document.getElementById('contenidoDetallePedido');
    
    let itemsDetalle = '';
    if (pedido.items && pedido.items.length > 0) {
        itemsDetalle = pedido.items.map(item => `
            <tr>
                <td>${item.nombrePlato}</td>
                <td class="text-center">${item.cantidad}</td>
                <td class="text-right">$${formatearPrecio(item.precioUnitario)}</td>
                <td class="text-right">$${formatearPrecio(item.precioUnitario * item.cantidad)}</td>
            </tr>
        `).join('');
    }
    
    contenido.innerHTML = `
        <div class="pedido-detalle">
            <h6>Información del Pedido #${pedido.idPedido}</h6>
            <hr>
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Cliente:</strong> ${pedido.nombreCliente}</p>
                    <p><strong>Estado:</strong> <span class="badge badge-${getBadgeClass(pedido.estado)}">${pedido.estado}</span></p>
                    <p><strong>Fecha:</strong> ${formatearFecha(pedido.fechaPedido)}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Método de pago:</strong> ${pedido.metodoPago}</p>
                    <p><strong>Total:</strong> $${formatearPrecio(pedido.total)}</p>
                    ${pedido.descripcion ? `<p><strong>Observaciones:</strong> ${pedido.descripcion}</p>` : ''}
                </div>
            </div>
            <hr>
            <h6>Detalle de Items</h6>
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Plato</th>
                        <th class="text-center">Cantidad</th>
                        <th class="text-right">Precio Unit.</th>
                        <th class="text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsDetalle || '<tr><td colspan="4" class="text-center">No hay items</td></tr>'}
                </tbody>
                <tfoot>
                    <tr class="font-weight-bold">
                        <td colspan="3" class="text-right">Total:</td>
                        <td class="text-right">$${formatearPrecio(pedido.total)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
    
    $('#modalDetallePedido').modal('show');
}

// Funciones auxiliares
function getBadgeClass(estado) {
    switch(estado) {
        case 'PENDIENTE': return 'warning';
        case 'ENTREGADO': return 'success';
        case 'CANCELADO': return 'danger';
        default: return 'secondary';
    }
}

function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO').format(precio);
}

function formatearFecha(fecha) {
    const date = new Date(fecha);
    return date.toLocaleString('es-CO');
}

function mostrarMensaje(mensaje, tipo = 'success', contenedorId = null) {
    const alertHtml = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${mensaje}
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        </div>
    `;
    
    if (contenedorId) {
        document.getElementById(contenedorId).innerHTML = alertHtml;
    } else {
        // Mostrar en un contenedor general
        const container = document.querySelector('.container');
        const existingAlert = container.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        container.insertAdjacentHTML('afterbegin', alertHtml);
        
        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            const alert = container.querySelector('.alert');
            if (alert) {
                $(alert).alert('close');
            }
        }, 5000);
    }
}

function mostrarError(mensaje, contenedorId = null) {
    mostrarMensaje(mensaje, 'danger', contenedorId);
}

// Navegación
function irAPanelAdmin() {
    window.location.href = '/admin.html';
}

function cerrarSesion() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login.html';
}

// =============== FUNCIONES PARA MANEJAR RESERVAS ===============

// Actualizar estado de reserva
async function actualizarEstadoReserva(idReserva, nuevoEstado) {
    const confirmacion = confirm(`¿Está seguro de cambiar el estado de la reserva #${idReserva} a ${nuevoEstado}?`);
    if (!confirmacion) return;
    
    try {
        const response = await fetch(`/api/reservas/${idReserva}/estado?nuevoEstado=${nuevoEstado}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.exito) {
            mostrarMensaje('Estado de reserva actualizado correctamente', 'success');
            
            // Recargar reservas para actualizar la vista
            await cargarReservas();
        } else {
            mostrarError(data.mensaje || 'Error al actualizar el estado de la reserva');
        }
    } catch (error) {
        console.error('Error updating reserva:', error);
        mostrarError('Error al actualizar el estado de la reserva');
    }
}

// Ver detalle de reserva
function verDetalleReserva(idReserva) {
    // Buscar la reserva en el cache
    const reserva = reservasCache.find(r => r.idReserva === idReserva);
    
    if (reserva) {
        mostrarModalDetalleReserva(reserva);
    }
}

// Mostrar modal con detalles de la reserva
function mostrarModalDetalleReserva(reserva) {
    // Crear modal si no existe
    let modal = document.getElementById('modalDetalleReserva');
    if (!modal) {
        modal = crearModalDetalleReserva();
        document.body.appendChild(modal);
    }
    
    const contenido = document.getElementById('contenidoDetalleReserva');
    const fechaReserva = new Date(reserva.fechaReserva).toLocaleDateString('es-CO');
    
    contenido.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <p><strong>Reserva #:</strong> ${reserva.idReserva}</p>
                <p><strong>Cliente:</strong> ${reserva.nombreCompleto || 'Sin nombre'}</p>
                <p><strong>Estado:</strong> <span class="badge badge-${getEstadoReservaColor(reserva.estado)}">${reserva.estado}</span></p>
                <p><strong>Fecha:</strong> ${fechaReserva}</p>
            </div>
            <div class="col-md-6">
                <p><strong>Mesa:</strong> Mesa ${reserva.numeroMesa || 'Sin asignar'}</p>
                <p><strong>Hora:</strong> ${reserva.horaReserva || 'No especificada'}</p>
                <p><strong>Número de personas:</strong> ${reserva.numeroPersonas || 'No especificado'}</p>
                ${reserva.observaciones ? `<p><strong>Observaciones:</strong> ${reserva.observaciones}</p>` : ''}
            </div>
        </div>
        
        ${reserva.correoUsuario ? `
            <hr>
            <h6>Datos de contacto</h6>
            <p><strong>Correo:</strong> ${reserva.correoUsuario}</p>
            ${reserva.telefonoUsuario ? `<p><strong>Teléfono:</strong> ${reserva.telefonoUsuario}</p>` : ''}
        ` : ''}
        
        ${reserva.pedidos && reserva.pedidos.length > 0 ? `
            <hr>
            <h6>Pedidos asociados</h6>
            <p>Esta reserva tiene ${reserva.pedidos.length} pedido(s) asociado(s).</p>
        ` : ''}
    `;
    
    $('#modalDetalleReserva').modal('show');
}

// Crear modal para detalles de reserva
function crearModalDetalleReserva() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'modalDetalleReserva';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('role', 'dialog');
    
    modal.innerHTML = `
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Detalle de la Reserva</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body" id="contenidoDetalleReserva">
                    <!-- Se llenará dinámicamente -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}