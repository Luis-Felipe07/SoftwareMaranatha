
let graficoSemanal = null;
let graficoDiario = null;
let reporteActual = null;

// Inicialización
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticación
    await verificarAutenticacion();
    
    // Establecer fechas por defecto (mes actual)
    establecerFechasPorDefecto();
    
    // Configurar eventos
    configurarEventos();
    
    // Cargar reporte inicial
    await cargarReporte();
});

// Verificar que el usuario sea administrador
async function verificarAutenticacion() {
    try {
        const response = await fetch('/api/usuarios/sesion-actual');
        const data = await response.json();
        
        if (!data.autenticado || data.tipoUsuario !== 'ADMIN') {
            alert('Acceso denegado. Solo administradores pueden ver los reportes.');
            window.location.href = '/login.html';
            return;
        }
        
        // Mostrar nombre del usuario
        document.getElementById('usuarioNombre').textContent = data.nombre || 'Administrador';
        
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        window.location.href = '/login.html';
    }
}

// Establecer fechas por defecto
function establecerFechasPorDefecto() {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    document.getElementById('fechaInicio').value = formatearFecha(primerDiaMes);
    document.getElementById('fechaFin').value = formatearFecha(hoy);
}

// Configurar eventos
function configurarEventos() {
    // Botón actualizar reporte
    document.getElementById('actualizarReporte').addEventListener('click', cargarReporte);
    
    // Botón descargar Excel
    document.getElementById('descargarExcel').addEventListener('click', descargarExcel);
    
    // Botón descargar PDF
    document.getElementById('descargarPDF').addEventListener('click', descargarPDF);
}

// Cargar reporte desde el backend
async function cargarReporte() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    
    if (!fechaInicio || !fechaFin) {
        alert('Por favor seleccione ambas fechas');
        return;
    }
    
    if (fechaInicio > fechaFin) {
        alert('La fecha de inicio no puede ser mayor que la fecha fin');
        return;
    }
    
    mostrarCargando(true);
    
    try {
        const response = await fetch(`/api/reportes/ventas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar el reporte');
        }
        
        reporteActual = await response.json();
        
        // Actualizar interfaz con los datos
        actualizarResumen();
        actualizarGraficos();
        actualizarTablaPlatillos();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el reporte de ventas');
    } finally {
        mostrarCargando(false);
    }
}

// Actualizar resumen de ventas
function actualizarResumen() {
    if (!reporteActual) return;
    
    // Total ventas
    document.getElementById('totalVentas').textContent = 
        `$${formatearNumero(reporteActual.totalVentas || 0)}`;
    
    // Total pedidos
    document.getElementById('totalPedidos').textContent = 
        reporteActual.totalPedidos || 0;
    
    // Promedio diario
    document.getElementById('promedioDiario').textContent = 
        `$${formatearNumero(reporteActual.promedioVentaDiaria || 0)}`;
    
    // Platillo estrella
    document.getElementById('platilloEstrella').textContent = 
        reporteActual.platilloMasVendido || 'Sin datos';
}

// Actualizar gráficos
function actualizarGraficos() {
    if (!reporteActual) return;
    
    // Destruir gráficos anteriores si existen
    if (graficoSemanal) graficoSemanal.destroy();
    if (graficoDiario) graficoDiario.destroy();
    
    // Gráfico semanal
    const ctxSemanal = document.getElementById('graficoSemanal').getContext('2d');
    const datosSemanales = reporteActual.ventasPorSemana || {};
    
    graficoSemanal = new Chart(ctxSemanal, {
        type: 'bar',
        data: {
            labels: Object.keys(datosSemanales),
            datasets: [{
                label: 'Ventas por Día de la Semana',
                data: Object.values(datosSemanales),
                backgroundColor: '#d62828',
                borderColor: '#b71c1c',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Distribución de Ventas Semanales'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + formatearNumero(value);
                        }
                    }
                }
            }
        }
    });
    
    // Gráfico diario
    const ctxDiario = document.getElementById('graficoDiario').getContext('2d');
    const datosDiarios = reporteActual.ventasPorDia || {};
    
    // Limitar a los últimos 15 días para mejor visualización
    const fechasOrdenadas = Object.keys(datosDiarios).sort().slice(-15);
    const valoresDiarios = fechasOrdenadas.map(fecha => datosDiarios[fecha]);
    
    graficoDiario = new Chart(ctxDiario, {
        type: 'line',
        data: {
            labels: fechasOrdenadas,
            datasets: [{
                label: 'Ventas Diarias',
                data: valoresDiarios,
                borderColor: '#d62828',
                backgroundColor: 'rgba(214, 40, 40, 0.1)',
                tension: 0.2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Tendencia de Ventas Diarias'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + formatearNumero(value);
                        }
                    }
                }
            }
        }
    });
}

// Actualizar tabla de platillos más vendidos
function actualizarTablaPlatillos() {
    if (!reporteActual || !reporteActual.platillosVendidos) return;
    
    const tbody = document.querySelector('#tablaPlatillos tbody');
    tbody.innerHTML = '';
    
    // Convertir objeto a array y ordenar por cantidad
    const platillos = Object.entries(reporteActual.platillosVendidos)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10
    
    // Calcular total para porcentajes
    const totalPlatillos = platillos.reduce((sum, [_, cantidad]) => sum + cantidad, 0);
    
    platillos.forEach(([nombre, cantidad], index) => {
        const porcentaje = ((cantidad / totalPlatillos) * 100).toFixed(1);
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${nombre}</td>
            <td>${cantidad}</td>
            <td>
                <div class="progress">
                    <div class="progress-bar bg-warning" style="width: ${porcentaje}%">
                        ${porcentaje}%
                    </div>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Descargar Excel
async function descargarExcel() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    
    if (!fechaInicio || !fechaFin) {
        alert('Por favor seleccione las fechas del reporte');
        return;
    }
    
    mostrarCargando(true);
    
    try {
        const response = await fetch(`/api/reportes/ventas/excel?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
        
        if (!response.ok) {
            throw new Error('Error al generar Excel');
        }
        
        // Descargar el archivo
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_ventas_${fechaInicio}_${fechaFin}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al descargar el reporte en Excel');
    } finally {
        mostrarCargando(false);
    }
}

// Descargar PDF
async function descargarPDF() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    
    if (!fechaInicio || !fechaFin) {
        alert('Por favor seleccione las fechas del reporte');
        return;
    }
    
    mostrarCargando(true);
    
    try {
        const response = await fetch(`/api/reportes/ventas/pdf?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
        
        if (!response.ok) {
            throw new Error('Error al generar PDF');
        }
        
        // Descargar el archivo
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_ventas_${fechaInicio}_${fechaFin}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al descargar el reporte en PDF');
    } finally {
        mostrarCargando(false);
    }
}

// Funciones para filtros rápidos
function setFiltroHoy() {
    const hoy = new Date();
    document.getElementById('fechaInicio').value = formatearFecha(hoy);
    document.getElementById('fechaFin').value = formatearFecha(hoy);
    cargarReporte();
}

function setFiltroSemana() {
    const hoy = new Date();
    const primerDiaSemana = new Date(hoy);
    primerDiaSemana.setDate(hoy.getDate() - hoy.getDay());
    
    document.getElementById('fechaInicio').value = formatearFecha(primerDiaSemana);
    document.getElementById('fechaFin').value = formatearFecha(hoy);
    cargarReporte();
}

function setFiltroMes() {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    document.getElementById('fechaInicio').value = formatearFecha(primerDiaMes);
    document.getElementById('fechaFin').value = formatearFecha(hoy);
    cargarReporte();
}

function setFiltroAnio() {
    const hoy = new Date();
    const primerDiaAnio = new Date(hoy.getFullYear(), 0, 1);
    
    document.getElementById('fechaInicio').value = formatearFecha(primerDiaAnio);
    document.getElementById('fechaFin').value = formatearFecha(hoy);
    cargarReporte();
}

// Utilidades
function formatearFecha(fecha) {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatearNumero(numero) {
    if (typeof numero === 'number') {
        return numero.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return parseFloat(numero || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function mostrarCargando(mostrar) {
    const loading = document.getElementById('loading');
    const contenido = document.getElementById('contenidoReporte');
    
    if (mostrar) {
        loading.classList.remove('d-none');
        contenido.style.opacity = '0.5';
    } else {
        loading.classList.add('d-none');
        contenido.style.opacity = '1';
    }
}

function cerrarSesion() {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login.html';
    }
}

// Manejo de errores globales
window.addEventListener('error', function(event) {
    console.error('Error global:', event.error);
    mostrarCargando(false);
});