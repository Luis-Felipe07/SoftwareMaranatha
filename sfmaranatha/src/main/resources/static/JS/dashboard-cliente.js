/**
 * dashboard-cliente.js
 * Este archivo controla la funcionalidad del dashboard del cliente
 * para el Restaurante Maranatha.
 * 
 * Autor: [Tu nombre]
 * Fecha: Abril 2025
 */

// Espero a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Verifico si el usuario está autenticado
    verificarAutenticacion();
    
    // Cargo los datos del usuario
    cargarDatosUsuario();
    
    // Configuro los eventos de los botones
    configurarEventos();
    
    // Cargo datos de muestra para el dashboard
    cargarDatosDeMuestra();
});

/**
 * Verifico si el usuario está autenticado, si no lo está, lo redirijo al login
 */
function verificarAutenticacion() {
    // En una aplicación real, aquí verificaría si hay un token en localStorage
    // o en cookies, y validaría que el token sea válido con el servidor.
    const tokenUsuario = localStorage.getItem('token');
    
    // Si no hay token, redirijo al login
    if (!tokenUsuario) {
        console.log('Usuario no autenticado, redirigiendo al login...');
        // En un entorno real, descomentar la siguiente línea:
        // window.location.href = '/sfmaranatha/src/main/resources/static/login.html';
        
        // Para propósitos de demostración, simulo un token
        localStorage.setItem('token', 'demo-token-123456');
        localStorage.setItem('nombreUsuario', 'Carlos Rodríguez');
    }
}

/**
 * Cargo los datos del usuario desde el almacenamiento local o de la sesión
 */
function cargarDatosUsuario() {
    // Obtengo el nombre del usuario desde localStorage
    const nombreUsuario = localStorage.getItem('nombreUsuario') || 'Cliente';
    
    // Actualizo el elemento en el DOM
    document.getElementById('nombreUsuario').textContent = `Bienvenido, ${nombreUsuario}`;
}

/**
 * Configuro los eventos de click para los distintos botones
 */
function configurarEventos() {
    // Evento para el botón de cerrar sesión
    const btnCerrarSesion = document.querySelector('.cerrar-sesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', function(e) {
            e.preventDefault();
            cerrarSesion();
        });
    }
}

/**
 * Función para cerrar la sesión del usuario
 */
function cerrarSesion() {
    // Elimino el token y los datos de usuario
    localStorage.removeItem('token');
    localStorage.removeItem('nombreUsuario');
    
    // Redirijo al login
    alert('Sesión cerrada correctamente');
    window.location.href = '/sfmaranatha/src/main/resources/static/login.html';
}

/**
 * Cargo datos de muestra para la demostración del dashboard
 * En una aplicación real, estos datos vendrían del servidor
 */
function cargarDatosDeMuestra() {
    // Datos de muestra para el panel de resumen
    const datosMuestra = {
        totalPedidos: 7,
        proximaReserva: 'Jueves 18 de Abril, 20:00',
        ultimoPedido: 'Pollo a la parrilla con ensalada'
    };
    
    // Actualizo el DOM con los datos de muestra
    document.getElementById('totalPedidos').textContent = datosMuestra.totalPedidos;
    document.getElementById('proximaReserva').textContent = datosMuestra.proximaReserva;
    document.getElementById('ultimoPedido').textContent = datosMuestra.ultimoPedido;
}

/**
 * Función para mostrar los pedidos de forma dinámica
 */
function mostrarPedidos() {
    // Oculto todas las secciones dinámicas primero
    ocultarSeccionesDinamicas();
    
    // Muestro la sección de pedidos
    const seccionPedidos = document.getElementById('seccionPedidos');
    seccionPedidos.style.display = 'block';
    
    // Cargo los datos de los pedidos
    cargarDatosPedidos();
}

/**
 * Función para mostrar las reservas de forma dinámica
 */
function mostrarReservas() {
    // Oculto todas las secciones dinámicas primero
    ocultarSeccionesDinamicas();
    
    // Muestro la sección de reservas
    const seccionReservas = document.getElementById('seccionReservas');
    seccionReservas.style.display = 'block';
    
    // Cargo los datos de las reservas
    cargarDatosReservas();
}

/**
 * Función para mostrar los métodos de pago de forma dinámica
 */
function mostrarMetodosPago() {
    // Aquí implementaría el mostrar los métodos de pago de manera dinámica
    // Para esta demostración, solo muestro un mensaje
    alert('Funcionalidad de métodos de pago en desarrollo');
}

/**
 * Función para mostrar el perfil de forma dinámica
 */
function mostrarPerfil() {
    // Aquí implementaría el mostrar el perfil de manera dinámica
    // Para esta demostración, solo muestro un mensaje
    alert('Funcionalidad de edición de perfil en desarrollo');
}

/**
 * Oculta todas las secciones dinámicas
 */
function ocultarSeccionesDinamicas() {
    const secciones = [
        'seccionPedidos',
        'seccionReservas'
    ];
    
    secciones.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.style.display = 'none';
        }
    });
}

/**
 * Carga los datos de los pedidos desde el servidor (simulado)
 */
function cargarDatosPedidos() {
    const tablaPedidos = document.getElementById('tablaPedidos');
    const noPedidos = document.getElementById('noPedidos');
    
    // En una aplicación real, aquí haría una petición AJAX al servidor
    // para obtener los pedidos del cliente
    
    // Datos de muestra (simulando respuesta del servidor)
    const pedidosMuestra = [
        {
            id: 'P-001245',
            fecha: '12/04/2025',
            productos: 'Hamburguesa Maranatha, Papas fritas, Refresco',
            total: '$12.99',
            estado: 'ENTREGADO'
        },
        {
            id: 'P-001246',
            fecha: '14/04/2025',
            productos: 'Pizza Familiar, 2 Refrescos',
            total: '$18.50',
            estado: 'EN PREPARACIÓN'
        },
        {
            id: 'P-001247',
            fecha: '15/04/2025',
            productos: 'Ensalada César, Pollo a la parrilla, Jugo natural',
            total: '$15.75',
            estado: 'PENDIENTE'
        }
    ];
    
    // Si hay pedidos, los muestro en la tabla
    if (pedidosMuestra.length > 0) {
        // Oculto el mensaje de "no hay pedidos"
        noPedidos.style.display = 'none';
        
        // Limpio la tabla
        tablaPedidos.innerHTML = '';
        
        // Agrego cada pedido a la tabla
        pedidosMuestra.forEach(pedido => {
            // Determino la clase de estado para el badge
            let claseEstado = '';
            switch (pedido.estado) {
                case 'PENDIENTE':
                    claseEstado = 'bg-warning';
                    break;
                case 'EN PREPARACIÓN':
                    claseEstado = 'bg-info';
                    break;
                case 'ENTREGADO':
                    claseEstado = 'bg-success';
                    break;
                case 'CANCELADO':
                    claseEstado = 'bg-danger';
                    break;
                default:
                    claseEstado = 'bg-secondary';
            }
            
            // Creo la fila de la tabla
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${pedido.id}</td>
                <td>${pedido.fecha}</td>
                <td>${pedido.productos}</td>
                <td>${pedido.total}</td>
                <td><span class="badge ${claseEstado}">${pedido.estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="repetirPedido('${pedido.id}')">
                        <i class="fas fa-redo"></i> Repetir
                    </button>
                    ${pedido.estado === 'PENDIENTE' ? `
                        <button class="btn btn-sm btn-outline-danger ms-1" onclick="cancelarPedido('${pedido.id}')">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    ` : ''}
                </td>
            `;
            
            // Agrego la fila a la tabla
            tablaPedidos.appendChild(tr);
        });
    } else {
        // Si no hay pedidos, muestro el mensaje
        noPedidos.style.display = 'block';
        tablaPedidos.innerHTML = '';
    }
}

/**
 * Carga los datos de las reservas desde el servidor (simulado)
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
            fecha: '18/04/2025',
            hora: '20:00',
            personas: '4',
            estado: 'CONFIRMADA'
        },
        {
            id: 'R-00579',
            fecha: '25/04/2025',
            hora: '19:30',
            personas: '2',
            estado: 'PENDIENTE'
        }
    ];
    
    // Si hay reservas, las muestro en la tabla
    if (reservasMuestra.length > 0) {
        // Oculto el mensaje de "no hay reservas"
        noReservas.style.display = 'none';
        
        // Limpio la tabla
        tablaReservas.innerHTML = '';
        
        // Agrego cada reserva a la tabla
        reservasMuestra.forEach(reserva => {
            // Determino la clase de estado para el badge
            let claseEstado = '';
            switch (reserva.estado) {
                case 'CONFIRMADA':
                    claseEstado = 'bg-success';
                    break;
                case 'PENDIENTE':
                    claseEstado = 'bg-warning';
                    break;
                case 'CANCELADA':
                    claseEstado = 'bg-danger';
                    break;
                case 'EN CURSO':
                    claseEstado = 'bg-info';
                    break;
                default:
                    claseEstado = 'bg-secondary';
            }
            
            // Obtengo la fecha actual para comparar
            const hoy = new Date();
            const fechaReserva = new Date(reserva.fecha.split('/').reverse().join('-'));
            
            // Creo la fila de la tabla
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${reserva.id}</td>
                <td>${reserva.fecha}</td>
                <td>${reserva.hora}</td>
                <td>${reserva.personas}</td>
                <td><span class="badge ${claseEstado}">${reserva.estado}</span></td>
                <td>
                    ${fechaReserva > hoy && reserva.estado !== 'CANCELADA' ? `
                        <button class="btn btn-sm btn-outline-primary" onclick="reprogramarReserva('${reserva.id}')">
                            <i class="fas fa-calendar-alt"></i> Reprogramar
                        </button>
                        <button class="btn btn-sm btn-outline-danger ms-1" onclick="cancelarReserva('${reserva.id}')">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    ` : ''}
                </td>
            `;
            
            // Agrego la fila a la tabla
            tablaReservas.appendChild(tr);
        });
    } else {
        // Si no hay reservas, muestro el mensaje
        noReservas.style.display = 'block';
        tablaReservas.innerHTML = '';
    }
}

/**
 * Función para repetir un pedido
 */
function repetirPedido(idPedido) {
    alert(`Repitiendo pedido ${idPedido}. Serás redirigido al carrito.`);
    // En una aplicación real, aquí haría una petición al servidor
    // y luego redirigirías al usuario al carrito
}

/**
 * Función para cancelar un pedido
 */
function cancelarPedido(idPedido) {
    if (confirm(`¿Estás seguro de que deseas cancelar el pedido ${idPedido}?`)) {
        alert(`Pedido ${idPedido} cancelado correctamente.`);
        // En una aplicación real, aquí haría una petición al servidor
        // y luego actualizaría la interfaz
        
        // Actualizo la vista de pedidos
        cargarDatosPedidos();
    }
}

/**
 * Función para reprogramar una reserva
 */
function reprogramarReserva(idReserva) {
    alert(`Reprogramando reserva ${idReserva}. Esta funcionalidad está en desarrollo.`);
    // En una aplicación real, aquí abrirías un modal o redirigirías
    // al usuario a una página para reprogramar
}

/**
 * Función para cancelar una reserva
 */

function cancelarReserva(idReserva) {
    if (confirm(`¿Estás seguro de que deseas cancelar la reserva ${idReserva}?`)) {
        alert(`Reserva ${idReserva} cancelada correctamente.`);
        // En una aplicación real, aquí haría una petición al servidor
        // y luego actualizaría la interfaz
        
        // Actualizo la vista de reservas
        cargarDatosReservas();
    }
}

/**
 * Función para mostrar gráficos con estadísticas del cliente
 * (Esta función sería implementada en una versión futura)
 */
function mostrarEstadisticas() {
    // En una aplicación real, aquí cargaría datos estadísticos
    // como frecuencia de visitas, platos favoritos, etc.
    alert('La función de estadísticas estará disponible próximamente.');
}

/**
 * Función para mostrar las promociones disponibles para el cliente
 */
function mostrarPromociones() {
    // Oculto todas las secciones dinámicas primero
    ocultarSeccionesDinamicas();
    
    // Muestro un mensaje de alerta por ahora (implementación futura)
    alert('¡Próximamente podrás ver promociones exclusivas aquí!');
}

/**
 * Función para actualizar la información del perfil del usuario
 */
function actualizarPerfil(formData) {
    // En una aplicación real, aquí enviaría los datos al servidor mediante AJAX
    // Por ahora, solo mostramos una confirmación
    
    alert('Perfil actualizado correctamente.');
    return false; // Evito que el formulario se envíe (para la demostración)
}

/**
 * Función para agregar un nuevo método de pago
 */
function agregarMetodoPago(formData) {
    // En una aplicación real, aquí enviaría los datos al servidor
    // y actualizaría la interfaz con el nuevo método de pago
    
    alert('Método de pago agregado correctamente.');
    return false; // Evito que el formulario se envíe
}

/**
 * Función para eliminar un método de pago existente
 */
function eliminarMetodoPago(idMetodo) {
    if (confirm(`¿Estás seguro de que deseas eliminar este método de pago?`)) {
        // En una aplicación real, aquí enviaría una petición al servidor
        alert('Método de pago eliminado correctamente.');
        
        // Aquí actualizaría la interfaz para reflejar el cambio
    }
}

/**
 * Función para cargar notificaciones del usuario
 */
function cargarNotificaciones() {
    // Simulando datos de notificaciones
    const notificaciones = [
        {
            id: 1,
            mensaje: 'Tu pedido P-001245 ha sido entregado.',
            fecha: '12/04/2025',
            leida: true
        },
        {
            id: 2,
            mensaje: 'Tu reserva para el 18/04/2025 ha sido confirmada.',
            fecha: '13/04/2025',
            leida: false
        },
        {
            id: 3,
            mensaje: '¡Nueva promoción disponible! 20% de descuento en pizzas.',
            fecha: '15/04/2025',
            leida: false
        }
    ];
    
    // Contador de notificaciones no leídas
    const noLeidas = notificaciones.filter(n => !n.leida).length;
    
    // Actualizo el contador en el ícono de notificaciones (si existe en el HTML)
    const contadorNotificaciones = document.getElementById('contadorNotificaciones');
    if (contadorNotificaciones) {
        contadorNotificaciones.textContent = noLeidas;
        contadorNotificaciones.style.display = noLeidas > 0 ? 'inline-block' : 'none';
    }
    
    return notificaciones;
}

/**
 * Función para marcar una notificación como leída
 */
function marcarNotificacionComoLeida(idNotificacion) {
    // En una aplicación real, aquí enviaría una petición al servidor
    console.log(`Marcando notificación ${idNotificacion} como leída`);
    
    // Actualizo la interfaz (en una implementación real)
    // y recargo las notificaciones
    cargarNotificaciones();
}

/**
 * Función para aplicar un cupón de descuento
 */
function aplicarCupon(codigo) {
    // En una aplicación real, verificaría la validez del cupón con el servidor
    alert(`Verificando cupón ${codigo}...`);
    
    // Simulando una respuesta exitosa
    setTimeout(() => {
        alert('¡Cupón aplicado correctamente! Recibirás un 10% de descuento en tu próximo pedido.');
    }, 1000);
}

/**
 * Función para mostrar los platillos favoritos del cliente
 */
function mostrarFavoritos() {
    // Oculto todas las secciones dinámicas primero
    ocultarSeccionesDinamicas();
    
    // En una versión futura, aquí cargaría los platillos favoritos
    alert('La función de favoritos estará disponible próximamente.');
}

/**
 * Función para buscar pedidos por fecha o estado
 */
function buscarPedidos(criterio, valor) {
    // En una aplicación real, enviaría una petición al servidor
    // con los criterios de búsqueda
    
    console.log(`Buscando pedidos con ${criterio} = ${valor}`);
    
    // Por ahora, solo recargo los pedidos de muestra
    cargarDatosPedidos();
    
    // Añado un mensaje informativo (en una implementación real
    // mostraría resultados filtrados)
    alert('Función de búsqueda en desarrollo. Mostrando todos los pedidos disponibles.');
}

/**
 * Función para dejar una reseña sobre un pedido
 */
function dejarResena(idPedido, calificacion, comentario) {
    // En una aplicación real, enviaría estos datos al servidor
    console.log(`Reseña para pedido ${idPedido}: ${calificacion} estrellas - "${comentario}"`);
    
    alert('¡Gracias por tu reseña! Tu opinión es muy importante para nosotros.');
}

/**
 * Función para actualizar la página de inicio personalizada
 */
function actualizarPreferenciasInicio(preferencias) {
    // En una aplicación real, guardaría estas preferencias en el servidor
    localStorage.setItem('preferenciasInicio', JSON.stringify(preferencias));
    
    alert('Preferencias de página de inicio actualizadas correctamente.');
}

/**
 * Función para cargar las preferencias del usuario
 */
function cargarPreferenciasUsuario() {
    // En una aplicación real, estas preferencias vendrían del servidor
    // Por ahora, uso localStorage como ejemplo
    
    try {
        const preferenciasGuardadas = localStorage.getItem('preferenciasUsuario');
        if (preferenciasGuardadas) {
            const preferencias = JSON.parse(preferenciasGuardadas);
            console.log('Preferencias cargadas:', preferencias);
            return preferencias;
        }
    } catch (error) {
        console.error('Error al cargar preferencias:', error);
    }
    
    // Si no hay preferencias guardadas o hay un error, devuelvo valores predeterminados
    return {
        notificacionesEmail: true,
        notificacionesPush: true,
        temaPrefererido: 'claro',
        idiomaPrefererido: 'es'
    };
}

/**
 * Función para guardar las preferencias del usuario
 */
function guardarPreferenciasUsuario(preferencias) {
    // En una aplicación real, enviaría estas preferencias al servidor
    try {
        localStorage.setItem('preferenciasUsuario', JSON.stringify(preferencias));
        alert('Preferencias guardadas correctamente.');
    } catch (error) {
        console.error('Error al guardar preferencias:', error);
        alert('Error al guardar preferencias. Por favor, intenta nuevamente.');
    }
}

/**
 * Función para mostrar el historial completo de pedidos
 */
function verHistorialCompletoPedidos() {
    // En una aplicación real, cargaría datos históricos desde el servidor
    alert('Accediendo a tu historial completo de pedidos...');
    
    // Por ahora, simplemente muestro los pedidos actuales
    mostrarPedidos();
}

/**
 * Función para verificar si hay pedidos en proceso
 * y actualizar la interfaz según corresponda
 */
function verificarPedidosEnProceso() {
    // En una aplicación real, haría una petición AJAX al servidor
    // para verificar si hay pedidos en proceso
    
    const hayPedidosEnProceso = true; // Esto vendría del servidor
    
    if (hayPedidosEnProceso) {
        // Aquí actualizaría algún indicador en la interfaz
        console.log('Hay pedidos en proceso');
    }
}

// Configuro un intervalo para verificar pedidos en proceso periódicamente
// En una aplicación real, esto podría ser con websockets para actualizaciones en tiempo real
setInterval(verificarPedidosEnProceso, 60000); // Verifico cada minuto

/**
 * Función para inicializar los tooltips y popovers de Bootstrap
 */
function inicializarComponentesBootstrap() {
    // Inicializo todos los tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    
    // Inicializo todos los popovers
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
}

// Verifico que Bootstrap esté disponible y inicializo los componentes
document.addEventListener('DOMContentLoaded', function() {
    if (typeof bootstrap !== 'undefined') {
        inicializarComponentesBootstrap();
    }
    
    // También cargo las notificaciones al iniciar
    cargarNotificaciones();
});