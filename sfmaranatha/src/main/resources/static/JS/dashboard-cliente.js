// Espero a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Verifico si el usuario está autenticado
    verificarAutenticacionYcargarDatosUsuario(); // Combiné las funciones iniciales

    // Configuro los eventos de los botones del dashboard
    configurarEventosDashboard();

    // Carga inicial de datos de muestra para el resumen del dashboard (puedes reemplazarlo con datos reales)
    // cargarDatosResumenDashboard(); // Comentado si prefieres cargar datos reales aquí también
});

/**
 * Verifica si el usuario está autenticado y carga sus datos.
 * Si no está autenticado, lo redirige a la página de login.
 */
async function verificarAutenticacionYcargarDatosUsuario() {
    const token = localStorage.getItem('token'); // 'token' es un indicador de sesión activa
    const nombreUsuarioGuardado = localStorage.getItem('nombreUsuario');

    if (!token || !nombreUsuarioGuardado) {
        console.log('Usuario no autenticado o falta nombre, redirigiendo al login...');
        // Descomentar en producción:
        // window.location.href = '/login.html';
        // Para demostración, si no hay token, simulamos uno y recargamos para que la lógica de abajo funcione
        // En un caso real, el login.js se encargaría de esto.
        if (!token) {
            localStorage.setItem('token', 'demo-token-simulado');
            localStorage.setItem('nombreUsuario', 'Usuario Demo');
            // location.reload(); // Podría causar un bucle si el login no está bien
            console.warn("Token simulado. Asegúrate que el flujo de login guarde 'token' y 'nombreUsuario'.");
            document.getElementById('nombreUsuario').textContent = `Bienvenido, Usuario Demo`;
        }
        return;
    }

    // Mostrar nombre de usuario
    document.getElementById('nombreUsuario').textContent = `Bienvenido, ${nombreUsuarioGuardado}`;

    // Intentar cargar datos reales del resumen del dashboard desde el backend
    // (Esta es una funcionalidad adicional que podrías implementar)
    try {
        const response = await fetch('/api/usuarios/sesion-actual'); // Reutilizamos este endpoint
        if (response.ok) {
            const data = await response.json();
            if (data.autenticado) {
                // Actualizar el nombre por si cambió o para mayor consistencia
                document.getElementById('nombreUsuario').textContent = `Bienvenido, ${data.nombre}`;
                localStorage.setItem('nombreUsuario', data.nombre); // Actualizar localStorage
                if (data.idUsuario) localStorage.setItem('idUsuario', data.idUsuario);


                // Aquí podrías llamar a una función que cargue el resumen del dashboard
                // Por ejemplo: cargarResumenActividad(data.idUsuario);
                // Y también podrías cargar los pedidos y reservas recientes aquí para el resumen inicial
                cargarDatosResumenDashboard(data); // Pasamos los datos del usuario
            }
        } else {
            console.warn("No se pudo obtener datos de sesión actual para el resumen, usando datos de muestra.");
            cargarDatosDeMuestraResumen(); // Carga datos de muestra si falla la API
        }
    } catch (error) {
        console.error("Error al cargar datos de sesión para el resumen:", error);
        cargarDatosDeMuestraResumen(); // Carga datos de muestra si hay error de red
    }
}


/**
 * Carga los datos de resumen del dashboard.
 * Intenta obtener datos reales y usa de muestra como fallback.
 * @param {Object} datosUsuario - Datos del usuario obtenidos de /api/usuarios/sesion-actual (opcional)
 */
async function cargarDatosResumenDashboard(datosUsuario) {
    // Si tenemos datos del usuario, podríamos hacer llamadas específicas para el resumen.
    // Por ahora, usamos la lógica de muestra o placeholders.
    // Ejemplo: podrías tener endpoints como /api/pedidos/resumen-cliente o /api/reservas/proxima

    // Datos de muestra para el panel de resumen
    document.getElementById('totalPedidos').textContent = datosUsuario?.totalPedidos || 7; // Ejemplo
    document.getElementById('proximaReserva').textContent = datosUsuario?.proximaReserva || 'Jueves 18 de Mayo, 20:00'; // Ejemplo
    document.getElementById('ultimoPedido').textContent = datosUsuario?.ultimoPedido || 'Pollo a la parrilla'; // Ejemplo
}

function cargarDatosDeMestraResumen() {
    document.getElementById('totalPedidos').textContent = 5;
    document.getElementById('proximaReserva').textContent = 'Viernes 19 de Mayo, 19:00';
    document.getElementById('ultimoPedido').textContent = 'Hamburguesa Clásica';
}


/**
 * Configura los eventos de click para los distintos botones del dashboard.
 */
function configurarEventosDashboard() {
    const btnCerrarSesion = document.querySelector('.cerrar-sesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', function(e) {
            e.preventDefault();
            cerrarSesion();
        });
    }
    // Puedes añadir más event listeners para otros botones del dashboard aquí
}

/**
 * Cierra la sesión del usuario.
 */
function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('nombreUsuario');
    localStorage.removeItem('idUsuario');
    localStorage.removeItem('tipoUsuario');
    alert('Sesión cerrada correctamente.');
    window.location.href = '/login.html';
}


/**
 * Formatea una cadena de fecha ISO (o un objeto Date) a un formato legible.
 * @param {string | Date} dateString - La fecha en formato ISO o como objeto Date.
 * @returns {string} Fecha formateada (ej: "17/05/2025 18:30").
 */
function formatDateTime(dateString) {
    if (!dateString) return 'Fecha no disponible';
    try {
        const date = new Date(dateString);
        if (isNaN(date)) return 'Fecha inválida';

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses son 0-indexados
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (e) {
        console.error("Error formateando fecha:", dateString, e);
        return 'Fecha inválida';
    }
}

/**
 * Formatea un número como moneda (COP).
 * @param {number} amount - El monto a formatear.
 * @returns {string} Monto formateado (ej: "$12.500").
 */
function formatCurrency(amount) {
    if (typeof amount !== 'number') {
        return '$0';
    }
    return `$${amount.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Carga y muestra los pedidos del usuario autenticado.
 */
async function cargarDatosPedidos() {
    const tablaPedidosBody = document.getElementById('tablaPedidos');
    const noPedidosDiv = document.getElementById('noPedidos');
    const seccionPedidos = document.getElementById('seccionPedidos');

    if (!tablaPedidosBody || !noPedidosDiv || !seccionPedidos) {
        console.error("Elementos del DOM para pedidos no encontrados.");
        return;
    }

    // Muestra un indicador de carga
    tablaPedidosBody.innerHTML = '<tr><td colspan="6" class="text-center">Cargando tus pedidos... <span class="spinner-border spinner-border-sm"></span></td></tr>';
    noPedidosDiv.style.display = 'none';
    seccionPedidos.style.display = 'block'; // Asegurarse que la sección es visible

    try {
        const response = await fetch('/api/pedidos/mis-pedidos');
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                mostrarMensajeAlerta("Debes iniciar sesión para ver tus pedidos.", "warning", tablaPedidosBody, 6);
                // Opcionalmente, redirigir al login:
                // window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
            } else {
                const errorData = await response.json().catch(() => ({ mensaje: "Error desconocido del servidor" }));
                throw new Error(errorData.mensaje || `Error del servidor: ${response.status}`);
            }
            return;
        }

        const pedidos = await response.json();

        if (pedidos && pedidos.length > 0) {
            tablaPedidosBody.innerHTML = ''; // Limpiar mensaje de carga
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
                let claseEstado = 'bg-secondary'; // Default
                if (pedido.estado) {
                    switch (pedido.estado.toUpperCase()) {
                        case 'PENDIENTE': claseEstado = 'bg-warning text-dark'; break;
                        case 'EN PREPARACION':
                        case 'EN PREPARACIÓN': claseEstado = 'bg-info text-dark'; break;
                        case 'LISTO PARA RECOGER':
                        case 'EN CAMINO': claseEstado = 'bg-primary'; break;
                        case 'ENTREGADO':
                        case 'COMPLETADO': claseEstado = 'bg-success'; break;
                        case 'CANCELADO': claseEstado = 'bg-danger'; break;
                    }
                }

                tr.innerHTML = `
                    <td>${pedido.idPedido || 'N/A'}</td>
                    <td>${formatDateTime(pedido.fechaPedido)}</td>
                    <td>${productosStr}</td>
                    <td>${formatCurrency(pedido.total)}</td>
                    <td><span class="badge ${claseEstado}">${pedido.estado || 'Desconocido'}</span></td>
                    <td class="acciones-pedido">
                        <button class="btn btn-sm btn-outline-primary btn-repetir-pedido" data-id="${pedido.idPedido}" title="Repetir Pedido">
                            <i class="fas fa-redo"></i> <span class="d-none d-md-inline">Repetir</span>
                        </button>
                        ${(pedido.estado && pedido.estado.toUpperCase() === 'PENDIENTE') ? `
                            <button class="btn btn-sm btn-outline-danger btn-cancelar-pedido ms-1" data-id="${pedido.idPedido}" title="Cancelar Pedido">
                                <i class="fas fa-times"></i> <span class="d-none d-md-inline">Cancelar</span>
                            </button>
                        ` : ''}
                    </td>
                `;
                tablaPedidosBody.appendChild(tr);
            });
            noPedidosDiv.style.display = 'none';

            // Añadir event listeners a los nuevos botones
            document.querySelectorAll('.btn-cancelar-pedido').forEach(button => {
                button.addEventListener('click', function() {
                    solicitarCancelacionPedido(this.dataset.id);
                });
            });
            document.querySelectorAll('.btn-repetir-pedido').forEach(button => {
                button.addEventListener('click', function() {
                    // Lógica para repetir pedido (puede redirigir a gestion-de-menus.html con el carrito precargado)
                    alert(`Funcionalidad 'Repetir Pedido' (ID: ${this.dataset.id}) aún no implementada.`);
                });
            });

        } else {
            noPedidosDiv.style.display = 'block';
            tablaPedidosBody.innerHTML = ''; // Limpiar por si había mensaje de carga
        }
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        mostrarMensajeAlerta(`Error al cargar pedidos: ${error.message}`, "danger", tablaPedidosBody, 6);
        noPedidosDiv.style.display = 'none'; // Ocultar el mensaje de "no hay pedidos" si hay un error
    }
}


/**
 * Muestra un mensaje de alerta dentro de una tabla.
 * @param {string} mensaje - El mensaje a mostrar.
 * @param {string} tipo - El tipo de alerta de Bootstrap (e.g., 'danger', 'warning', 'success').
 * @param {HTMLElement} tbodyElement - El elemento tbody de la tabla.
 * @param {number} colspan - El número de columnas que debe abarcar el mensaje.
 */
function mostrarMensajeAlerta(mensaje, tipo, tbodyElement, colspan) {
    if (tbodyElement) {
        tbodyElement.innerHTML = `<tr><td colspan="${colspan}" class="text-center alert alert-${tipo}">${mensaje}</td></tr>`;
    }
}


/**
 * Solicita la cancelación de un pedido.
 * @param {string | number} idPedido - El ID del pedido a cancelar.
 */
async function solicitarCancelacionPedido(idPedido) {
    if (!confirm(`¿Estás seguro de que deseas cancelar el pedido #${idPedido}? Esta acción no se puede deshacer.`)) {
        return;
    }

    // Mostrar algún indicador de carga, por ejemplo, deshabilitar el botón
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
                // Spring Security maneja la autenticación/autorización vía Principal (sesión/cookie)
            }
        });

        const data = await response.json();

        if (response.ok && data.exito) {
            alert(data.mensaje || `Pedido #${idPedido} cancelado con éxito.`);
            cargarDatosPedidos(); // Recargar la lista de pedidos
        } else {
            alert(`Error al cancelar el pedido: ${data.mensaje || 'Respuesta no exitosa del servidor.'}`);
            if (botonCancelar) { // Restaurar botón si falló
                botonCancelar.disabled = false;
                botonCancelar.innerHTML = '<i class="fas fa-times"></i> <span class="d-none d-md-inline">Cancelar</span>';
            }
        }
    } catch (error) {
        console.error('Error en la solicitud de cancelación:', error);
        alert('Error de red o del servidor al intentar cancelar el pedido.');
        if (botonCancelar) { // Restaurar botón si falló
            botonCancelar.disabled = false;
            botonCancelar.innerHTML = '<i class="fas fa-times"></i> <span class="d-none d-md-inline">Cancelar</span>';
        }
    }
}


// --- Funciones para mostrar/ocultar secciones y otras funcionalidades del dashboard ---

/**
 * Muestra la sección de pedidos y carga los datos.
 */
function mostrarPedidos() {
    ocultarSeccionesDinamicas();
    const seccionPedidos = document.getElementById('seccionPedidos');
    if (seccionPedidos) {
        seccionPedidos.style.display = 'block';
        cargarDatosPedidos(); // Cargar los datos cuando se muestra la sección
    }
}

/**
 * Muestra la sección de reservas (simulado).
 */
function mostrarReservas() {
    ocultarSeccionesDinamicas();
    const seccionReservas = document.getElementById('seccionReservas');
    if (seccionReservas) {
        seccionReservas.style.display = 'block';
        cargarDatosReservas(); // Esta función ya existe y carga datos de muestra
    }
}


/**
 * Carga los datos de las reservas desde el servidor (simulado por ahora)
 */
function cargarDatosReservas() {
    const tablaReservas = document.getElementById('tablaReservas');
    const noReservas = document.getElementById('noReservas');

    // En una aplicación real, aquí haría una petición AJAX al servidor
    // para obtener las reservas del cliente

    // Datos de muestra (simulando respuesta del servidor)
    const reservasMuestra = [
        {
            id: 'R-00578',
            fecha: '18/05/2025', // Ajustado para ejemplo
            hora: '20:00',
            personas: '4',
            estado: 'CONFIRMADA'
        },
        {
            id: 'R-00579',
            fecha: '25/05/2025', // Ajustado para ejemplo
            hora: '19:30',
            personas: '2',
            estado: 'PENDIENTE'
        }
    ];

    if (reservasMuestra.length > 0) {
        noReservas.style.display = 'none';
        tablaReservas.innerHTML = '';
        reservasMuestra.forEach(reserva => {
            let claseEstado = '';
            switch (reserva.estado) {
                case 'CONFIRMADA': claseEstado = 'bg-success'; break;
                case 'PENDIENTE': claseEstado = 'bg-warning text-dark'; break;
                case 'CANCELADA': claseEstado = 'bg-danger'; break;
                default: claseEstado = 'bg-secondary';
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${reserva.id}</td>
                <td>${reserva.fecha}</td>
                <td>${reserva.hora}</td>
                <td>${reserva.personas}</td>
                <td><span class="badge ${claseEstado}">${reserva.estado}</span></td>
                <td class="acciones-pedido">
                    ${reserva.estado !== 'CANCELADA' ? `
                        <button class="btn btn-sm btn-outline-primary" onclick="alert('Funcionalidad Reprogramar Reserva (ID: ${reserva.id}) no implementada.')" title="Reprogramar Reserva">
                            <i class="fas fa-calendar-alt"></i> <span class="d-none d-md-inline">Reprogramar</span>
                        </button>
                        <button class="btn btn-sm btn-outline-danger ms-1" onclick="alert('Funcionalidad Cancelar Reserva (ID: ${reserva.id}) no implementada.')" title="Cancelar Reserva">
                            <i class="fas fa-times"></i> <span class="d-none d-md-inline">Cancelar</span>
                        </button>
                    ` : ''}
                </td>
            `;
            tablaReservas.appendChild(tr);
        });
    } else {
        noReservas.style.display = 'block';
        tablaReservas.innerHTML = '';
    }
}


/**
 * Oculta todas las secciones dinámicas (pedidos, reservas, etc.).
 */
function ocultarSeccionesDinamicas() {
    const secciones = ['seccionPedidos', 'seccionReservas']; // Añade IDs de otras secciones aquí
    secciones.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.style.display = 'none';
        }
    });
}

// --- Funciones placeholder para otras acciones del dashboard ---
function mostrarMetodosPago() {
    alert('Funcionalidad de métodos de pago en desarrollo.');
}

function mostrarPerfil() {
    alert('Funcionalidad de edición de perfil en desarrollo.');
}

// Inicialización de componentes Bootstrap si es necesario
document.addEventListener('DOMContentLoaded', function() {
    if (typeof bootstrap !== 'undefined') {
        // Inicializar tooltips, popovers, etc.
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
});
