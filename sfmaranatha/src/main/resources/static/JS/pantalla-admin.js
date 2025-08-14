
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación y cargar datos del usuario
    verificarAutenticacion();
    
    // Cargar estadísticas iniciales
    cargarEstadisticas();
    
    // Configurar evento de cerrar sesión
    configurarCerrarSesion();
    
    // Actualizar estadísticas cada 30 segundos
    setInterval(cargarEstadisticas, 30000);
});

/**
 * Verificar si el usuario está autenticado y es administrador
 */
async function verificarAutenticacion() {
    try {
        const response = await fetch('/api/usuarios/sesion-actual');
        
        if (!response.ok) {
            redirigirALogin();
            return;
        }
        
        const data = await response.json();
        
        // Verificar que esté autenticado y sea ADMIN
        if (!data.autenticado || data.tipoUsuario !== 'ADMIN') {
            alert('Acceso denegado. Solo los administradores pueden acceder a esta sección.');
            redirigirALogin();
            return;
        }
        
        // Mostrar nombre del administrador
        document.getElementById('nombreAdmin').textContent = data.nombre || 'Administrador';
        
        // Guardar datos en localStorage para uso posterior
        localStorage.setItem('adminData', JSON.stringify(data));
        
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        redirigirALogin();
    }
}

/**
 * Cargar estadísticas del dashboard
 */
async function cargarEstadisticas() {
    try {
        // Cargar pedidos pendientes
        cargarPedidosPendientes();
        
        // Cargar reservas de hoy
        cargarReservasHoy();
        
        // Cargar mesas disponibles
        cargarMesasDisponibles();
        
        // Cargar ventas del día 
        cargarVentasHoy();
        
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

/**
 * Cargar cantidad de pedidos pendientes
 */
async function cargarPedidosPendientes() {
    try {
        const response = await fetch('/api/pedidos?estado=PENDIENTE');
        if (response.ok) {
            const pedidos = await response.json();
            document.getElementById('pedidosPendientes').textContent = pedidos.length;
            
            // Agregar animación si hay pedidos pendientes
            if (pedidos.length > 0) {
                document.querySelector('.stat-card').classList.add('animate__animated', 'animate__pulse');
            }
        }
    } catch (error) {
        console.error('Error cargando pedidos pendientes:', error);
        document.getElementById('pedidosPendientes').textContent = '0';
    }
}

/**
 * Cargar reservas de hoy
 */
async function cargarReservasHoy() {
    try {
        // Por ahora simulamos el conteo
        const reservasHoy = Math.floor(Math.random() * 10) + 1;
        document.getElementById('reservasHoy').textContent = reservasHoy;
    } catch (error) {
        console.error('Error cargando reservas:', error);
        document.getElementById('reservasHoy').textContent = '0';
    }
}

/**
 * Cargar mesas disponibles
 */
async function cargarMesasDisponibles() {
    try {
        const response = await fetch('/api/mesas/disponibles');
        if (response.ok) {
            const mesas = await response.json();
            document.getElementById('mesasDisponibles').textContent = mesas.length;
        }
    } catch (error) {
        console.error('Error cargando mesas disponibles:', error);
        document.getElementById('mesasDisponibles').textContent = '0';
    }
}

/**
 * Cargar ventas del día 
 */
async function cargarVentasHoy() {
    try {
        // Simulamos las ventas del día
        const ventasHoy = Math.floor(Math.random() * 1000000) + 500000;
        document.getElementById('ventasHoy').textContent = `$${ventasHoy.toLocaleString('es-CO')}`;
    } catch (error) {
        console.error('Error cargando ventas:', error);
        document.getElementById('ventasHoy').textContent = '$0';
    }
}

/**
 * Configurar evento de cerrar sesión
 */
function configurarCerrarSesion() {
    const btnCerrarSesion = document.getElementById('cerrarSesion');
    
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', function() {
            const confirmar = confirm('¿Está seguro de que desea cerrar sesión?');
            
            if (confirmar) {
                // Limpiar localStorage
                localStorage.clear();
                sessionStorage.clear();
                
                // Mostrar mensaje de despedida
                mostrarMensajeDespedida();
            }
        });
    }
}

/**
 * Mostrar mensaje de despedida antes de redirigir
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
    
    // Crear mensaje
    const mensaje = document.createElement('div');
    mensaje.style.cssText = `
        background-color: white;
        padding: 2rem 3rem;
        border-radius: 10px;
        text-align: center;
        animation: fadeIn 0.5s ease;
    `;
    mensaje.innerHTML = `
        <h3 style="color: #d62828; margin-bottom: 1rem;">Sesión cerrada exitosamente</h3>
        <p>Gracias por usar el sistema de administración</p>
        <div class="loading" style="margin: 1rem auto;"></div>
    `;
    
    overlay.appendChild(mensaje);
    document.body.appendChild(overlay);
    
    // Redirigir después de 2 segundos
    setTimeout(() => {
        window.location.href = '/login.html';
    }, 2000);
}

/**
 * Redirigir a login
 */
function redirigirALogin() {
    window.location.href = '/login.html';
}

/**
 * Agregar efectos hover a las tarjetas
 */
document.querySelectorAll('.admin-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

/**
 * Verificar y manejar notificaciones (si hay pedidos pendientes)
 */
async function verificarNotificaciones() {
    try {
        const response = await fetch('/api/pedidos?estado=PENDIENTE');
        if (response.ok) {
            const pedidos = await response.json();
            
            if (pedidos.length > 0) {
                // Mostrar notificación en el título de la página
                document.title = `(${pedidos.length}) Panel de Administración - Restaurante Maranatha`;
                
                // Opcional: Mostrar notificación del navegador
                if (Notification.permission === "granted") {
                    new Notification("Pedidos Pendientes", {
                        body: `Tienes ${pedidos.length} pedidos pendientes por atender`,
                        icon: "/IMG/logo-maranatha.png"
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error verificando notificaciones:', error);
    }
}

// Solicitar permisos de notificación al cargar
if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
}

// Verificar notificaciones cada minuto
setInterval(verificarNotificaciones, 60000);

// Manejo de teclas de acceso rápido
document.addEventListener('keydown', function(event) {
    // Alt + P: Ir a pedidos
    if (event.altKey && event.key === 'p') {
        window.location.href = '/Gestion-de-reservas.html';
    }
    // Alt + M: Ir a menús
    else if (event.altKey && event.key === 'm') {
        window.location.href = '/admin.html';
    }
    // Alt + R: Ir a reportes
    else if (event.altKey && event.key === 'r') {
        window.location.href = '/reporte-de-ventas.html';
    }
    // Alt + L: Cerrar sesión
    else if (event.altKey && event.key === 'l') {
        document.getElementById('cerrarSesion').click();
    }
});