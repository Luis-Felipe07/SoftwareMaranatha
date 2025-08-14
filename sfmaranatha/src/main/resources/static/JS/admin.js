// Variables globales
let platillosCache = [];
let mesasCache = [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    verificarAutenticacion();
    cargarPlatillos();
    cargarTodasLasMesas();
    configurarEventListeners();
});

// Verificar autenticación
async function verificarAutenticacion() {
    try {
        const response = await fetch('/api/usuarios/sesion-actual');
        const data = await response.json();
        
        if (!data.autenticado) {
            window.location.href = '/login';
            return;
        }
        
        // Si es encargado, preguntar a dónde quiere ir
        if (data.tipoUsuario === 'ENCARGADO') {
            const destino = confirm('¿Desea ir a Gestión de Reservas? (Aceptar = Sí, Cancelar = Quedarse aquí)');
            if (destino) {
                window.location.href = '/gestion-de-reservas';
            }
        }
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        window.location.href = '/login';
    }
}

// Configurar event listeners
function configurarEventListeners() {
    // Formulario crear platillo
    document.getElementById('formCrearPlatillo').addEventListener('submit', crearPlatillo);
    
    // Formulario editar platillo
    document.getElementById('formEditarPlatillo').addEventListener('submit', actualizarPlatillo);
    
    // Select de platillo para editar
    document.getElementById('selectPlatilloEditar').addEventListener('change', cargarPlatilloParaEditar);
    
    // Select de platillo para eliminar
    document.getElementById('selectPlatilloEliminar').addEventListener('change', mostrarInfoPlatilloEliminar);
    
    // Botón eliminar platillo
    document.getElementById('btnEliminarPlatillo').addEventListener('click', eliminarPlatillo);
    
    // Vista previa de imágenes
    document.getElementById('imagenPlatillo').addEventListener('change', function(e) {
        mostrarVistaPrevia(e.target.files[0], 'vistaPrevia');
    });
    
    document.getElementById('imagenPlatilloEditar').addEventListener('change', function(e) {
        mostrarVistaPrevia(e.target.files[0], 'vistaPreviaEditar');
    });
    
    // Botones de mesas
    document.getElementById('btnHabilitarMesa').addEventListener('click', habilitarMesa);
    document.getElementById('btnDeshabilitarMesa').addEventListener('click', deshabilitarMesa);
    document.getElementById('btnRefrescarEstado').addEventListener('click', cargarEstadoMesas);
    
    // Eventos de tabs de mesas
    document.getElementById('habilitar-mesa-tab').addEventListener('shown.bs.tab', cargarMesasNoDisponibles);
    document.getElementById('deshabilitar-mesa-tab').addEventListener('shown.bs.tab', cargarMesasDisponibles);
    document.getElementById('estado-mesas-tab').addEventListener('shown.bs.tab', cargarEstadoMesas);
}

// ========== GESTIÓN DE PLATILLOS ==========

// Cargar todos los platillos
async function cargarPlatillos() {
    try {
        const response = await fetch('/api/platos');
        if (!response.ok) throw new Error('Error al cargar platillos');
        
        platillosCache = await response.json();
        actualizarSelectsPlatillos();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar los platillos', 'danger');
    }
}

// Actualizar selects de platillos
function actualizarSelectsPlatillos() {
    const selectEditar = document.getElementById('selectPlatilloEditar');
    const selectEliminar = document.getElementById('selectPlatilloEliminar');
    
    // Limpiar selects
    selectEditar.innerHTML = '<option value="">-- Seleccione un platillo --</option>';
    selectEliminar.innerHTML = '<option value="">-- Seleccione un platillo --</option>';
    
    // Agregar platillos
    platillosCache.forEach(platillo => {
        const optionEditar = new Option(`${platillo.nombrePlato} - $${formatearPrecio(platillo.precio)}`, platillo.idPlato);
        const optionEliminar = new Option(`${platillo.nombrePlato} - $${formatearPrecio(platillo.precio)}`, platillo.idPlato);
        
        selectEditar.appendChild(optionEditar);
        selectEliminar.appendChild(optionEliminar);
    });
}

// Crear nuevo platillo
async function crearPlatillo(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('nombrePlato', document.getElementById('nombrePlatillo').value);
    formData.append('precio', document.getElementById('precioPlatillo').value);
    formData.append('descripcion', document.getElementById('descripcionPlatillo').value);
    formData.append('idMenu', document.getElementById('menuPlatillo').value);
    
    const imagenInput = document.getElementById('imagenPlatillo');
    if (imagenInput.files[0]) {
        formData.append('imagen', imagenInput.files[0]);
    }
    
    try {
        console.log('Enviando datos del platillo...', {
            nombrePlato: formData.get('nombrePlato'),
            precio: formData.get('precio'),
            descripcion: formData.get('descripcion'),
            idMenu: formData.get('idMenu'),
            tieneImagen: formData.get('imagen') ? 'Sí' : 'No'
        });
        
        const response = await fetch('/api/platos', {
            method: 'POST',
            body: formData
        });
        
        console.log('Respuesta recibida:', response.status, response.statusText);
        
        if (!response.ok) {
            // Intentar obtener el mensaje de error del backend
            try {
                const errorData = await response.json();
                throw new Error(`HTTP Error ${response.status}: ${errorData.mensaje || response.statusText}`);
            } catch (jsonError) {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }
        }
        
        const data = await response.json();
        console.log('Datos de respuesta:', data);
        
        if (data.exito) {
            mostrarAlerta('Platillo creado exitosamente', 'success');
            document.getElementById('formCrearPlatillo').reset();
            document.getElementById('vistaPrevia').innerHTML = '';
            cargarPlatillos(); // Recargo lista
        } else {
            mostrarAlerta(data.mensaje || 'Error al crear el platillo', 'danger');
        }
    } catch (error) {
        console.error('Error completo:', error);
        if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
            mostrarAlerta('Error de red: No se puede conectar al servidor. Verifique que el backend esté funcionando.', 'danger');
        } else {
            mostrarAlerta(`Error al crear el platillo: ${error.message}`, 'danger');
        }
    }
}

// Cargar platillo para editar
async function cargarPlatilloParaEditar() {
    const platilloId = document.getElementById('selectPlatilloEditar').value;
    
    if (!platilloId) {
        document.getElementById('formEditarPlatillo').style.display = 'none';
        return;
    }
    
    try {
        const response = await fetch(`/api/platos/${platilloId}`);
        if (!response.ok) throw new Error('Error al cargar platillo');
        
        const platillo = await response.json();
        
        // Llenar formulario
        document.getElementById('idPlatilloEditar').value = platillo.idPlato;
        document.getElementById('nombrePlatilloEditar').value = platillo.nombrePlato;
        document.getElementById('precioPlatilloEditar').value = platillo.precio;
        document.getElementById('descripcionPlatilloEditar').value = platillo.descripcion;
        document.getElementById('menuPlatilloEditar').value = '1'; // Por defecto
        
        // Mostrar imagen actual
        if (platillo.imagenUrl) {
            document.getElementById('imagenActual').innerHTML = `
                <p>Imagen actual:</p>
                <img src="${platillo.imagenUrl}" alt="${platillo.nombrePlato}" style="max-width: 200px;">
            `;
        } else {
            document.getElementById('imagenActual').innerHTML = '<p>No hay imagen actual</p>';
       }
       
       document.getElementById('formEditarPlatillo').style.display = 'block';
   } catch (error) {
       console.error('Error:', error);
       mostrarAlerta('Error al cargar el platillo', 'danger');
   }
}

// Actualizar platillo
async function actualizarPlatillo(e) {
   e.preventDefault();
   
   const platilloId = document.getElementById('idPlatilloEditar').value;
   const formData = new FormData();
   
   formData.append('nombrePlato', document.getElementById('nombrePlatilloEditar').value);
   formData.append('precio', document.getElementById('precioPlatilloEditar').value);
   formData.append('descripcion', document.getElementById('descripcionPlatilloEditar').value);
   formData.append('idMenu', document.getElementById('menuPlatilloEditar').value);
   
   const imagenInput = document.getElementById('imagenPlatilloEditar');
   if (imagenInput.files[0]) {
       formData.append('imagen', imagenInput.files[0]);
   }
   
   try {
       const response = await fetch(`/api/platos/${platilloId}`, {
           method: 'PUT',
           body: formData
       });
       
       const data = await response.json();
       
       if (data.exito) {
           mostrarAlerta('Platillo actualizado exitosamente', 'success');
           document.getElementById('formEditarPlatillo').reset();
           document.getElementById('formEditarPlatillo').style.display = 'none';
           document.getElementById('vistaPreviaEditar').innerHTML = '';
           document.getElementById('imagenActual').innerHTML = '';
           cargarPlatillos();
       } else {
           mostrarAlerta(data.mensaje || 'Error al actualizar el platillo', 'danger');
       }
   } catch (error) {
       console.error('Error:', error);
       mostrarAlerta('Error al actualizar el platillo', 'danger');
   }
}

// Mostrar info del platillo a eliminar
function mostrarInfoPlatilloEliminar() {
   const platilloId = document.getElementById('selectPlatilloEliminar').value;
   const infoDiv = document.getElementById('infoPlatilloEliminar');
   const btnEliminar = document.getElementById('btnEliminarPlatillo');
   
   if (!platilloId) {
       infoDiv.style.display = 'none';
       btnEliminar.style.display = 'none';
       return;
   }
   
   const platillo = platillosCache.find(p => p.idPlato == platilloId);
   
   if (platillo) {
       infoDiv.innerHTML = `
           <div class="alert alert-warning">
               <h5>¿Está seguro de eliminar este platillo?</h5>
               <p><strong>Nombre:</strong> ${platillo.nombrePlato}</p>
               <p><strong>Precio:</strong> $${formatearPrecio(platillo.precio)}</p>
               <p><strong>Descripción:</strong> ${platillo.descripcion}</p>
               ${platillo.imagenUrl ? `<img src="${platillo.imagenUrl}" style="max-width: 150px;">` : ''}
           </div>
       `;
       infoDiv.style.display = 'block';
       btnEliminar.style.display = 'block';
   }
}

// Eliminar platillo
async function eliminarPlatillo() {
   const platilloId = document.getElementById('selectPlatilloEliminar').value;
   
   if (!platilloId) return;
   
   if (!confirm('¿Está seguro de eliminar este platillo? Esta acción no se puede deshacer.')) {
       return;
   }
   
   try {
       const response = await fetch(`/api/platos/${platilloId}`, {
           method: 'DELETE'
       });
       
       const data = await response.json();
       
       if (data.exito) {
           mostrarAlerta('Platillo eliminado exitosamente', 'success');
           document.getElementById('selectPlatilloEliminar').value = '';
           document.getElementById('infoPlatilloEliminar').style.display = 'none';
           document.getElementById('btnEliminarPlatillo').style.display = 'none';
           cargarPlatillos();
       } else {
           mostrarAlerta(data.mensaje || 'Error al eliminar el platillo', 'danger');
       }
   } catch (error) {
       console.error('Error:', error);
       mostrarAlerta('Error al eliminar el platillo', 'danger');
   }
}

// ========== GESTIÓN DE MESAS ==========

// Cargar todas las mesas
async function cargarTodasLasMesas() {
   try {
       const response = await fetch('/api/mesas');
       if (!response.ok) throw new Error('Error al cargar mesas');
       
       mesasCache = await response.json();
       // Cargar las mesas según la pestaña activa
       const tabActiva = document.querySelector('#mesasTabs .nav-link.active').id;
       if (tabActiva === 'habilitar-mesa-tab') {
           cargarMesasNoDisponibles();
       } else if (tabActiva === 'deshabilitar-mesa-tab') {
           cargarMesasDisponibles();
       } else {
           cargarEstadoMesas();
       }
   } catch (error) {
       console.error('Error al cargar mesas:', error);
       mostrarAlerta('Error al cargar las mesas', 'danger');
   }
}

// Cargar mesas no disponibles (para habilitar)
async function cargarMesasNoDisponibles() {
   try {
       const response = await fetch('/api/mesas/no-disponibles');
       const mesas = await response.json();
       
       const selectMesas = document.getElementById('selectMesasHabilitar');
       selectMesas.innerHTML = '<option value="" selected disabled>-- Elija una mesa --</option>';
       
       mesas.forEach(mesa => {
           const option = new Option(`Mesa ${mesa.numero} - ${mesa.estado}`, mesa.id);
           selectMesas.appendChild(option);
       });
       
       if (mesas.length === 0) {
           selectMesas.innerHTML = '<option value="" disabled>Todas las mesas están disponibles</option>';
           mostrarMensaje('Todas las mesas están disponibles actualmente', 'info', 'mensajeHabilitar');
       }
   } catch (error) {
       console.error('Error al cargar mesas:', error);
       mostrarError('Error al cargar las mesas', 'mensajeHabilitar');
   }
}

// Cargar mesas disponibles (para deshabilitar)
async function cargarMesasDisponibles() {
   try {
       const response = await fetch('/api/mesas/disponibles');
       const mesas = await response.json();
       
       const selectMesas = document.getElementById('selectMesasDeshabilitar');
       selectMesas.innerHTML = '<option value="" selected disabled>-- Elija una mesa --</option>';
       
       mesas.forEach(mesa => {
           const option = new Option(`Mesa ${mesa.numero} - Disponible`, mesa.id);
           selectMesas.appendChild(option);
       });
       
       if (mesas.length === 0) {
           selectMesas.innerHTML = '<option value="" disabled>No hay mesas disponibles</option>';
           mostrarMensaje('No hay mesas disponibles para deshabilitar', 'info', 'mensajeDeshabilitar');
       }
   } catch (error) {
       console.error('Error al cargar mesas disponibles:', error);
       mostrarError('Error al cargar las mesas disponibles', 'mensajeDeshabilitar');
   }
}

// Cargar estado de todas las mesas
async function cargarEstadoMesas() {
   try {
       const response = await fetch('/api/mesas');
       const mesas = await response.json();
       
       const container = document.getElementById('estadoMesasContainer');
       container.innerHTML = '';
       
       mesas.sort((a, b) => a.numero - b.numero); 
       
       mesas.forEach(mesa => {
           const estadoColor = mesa.estado === 'Disponible' ? 'success' : 'danger';
           const icono = mesa.estado === 'Disponible' ? 'bi-check-circle-fill' : 'bi-x-circle-fill';
           
           const mesaCard = document.createElement('div');
           mesaCard.className = 'col-md-3 col-sm-6 mb-3';
           mesaCard.innerHTML = `
               <div class="card text-center">
                   <div class="card-body">
                       <h5 class="card-title">Mesa ${mesa.numero}</h5>
                       <p class="card-text">
                           <i class="bi ${icono} text-${estadoColor}" style="font-size: 2rem;"></i>
                       </p>
                       <span class="badge bg-${estadoColor}">${mesa.estado}</span>
                   </div>
               </div>
           `;
           container.appendChild(mesaCard);
       });
   } catch (error) {
       console.error('Error al cargar estado de mesas:', error);
       mostrarAlerta('Error al cargar el estado de las mesas', 'danger');
   }
}

// Habilitar mesa
async function habilitarMesa() {
   const mesaId = document.getElementById('selectMesasHabilitar').value;
   
   if (!mesaId) {
       mostrarError('Por favor seleccione una mesa', 'mensajeHabilitar');
       return;
   }
   
   try {
       const response = await fetch(`/api/mesas/${mesaId}/habilitar`, {
           method: 'PUT'
       });
       
       const data = await response.json();
       
       if (data.exito) {
           mostrarMensaje(data.mensaje, 'success', 'mensajeHabilitar');
           cargarMesasNoDisponibles(); // Recargar lista
           cargarTodasLasMesas(); // Actualizar cache
       } else {
           mostrarError(data.mensaje || 'Error al habilitar la mesa', 'mensajeHabilitar');
       }
   } catch (error) {
       console.error('Error:', error);
       mostrarError('Error al habilitar la mesa', 'mensajeHabilitar');
   }
}

// Deshabilitar mesa (nueva función)
async function deshabilitarMesa() {
   const mesaId = document.getElementById('selectMesasDeshabilitar').value;
   
   if (!mesaId) {
       mostrarError('Por favor seleccione una mesa', 'mensajeDeshabilitar');
       return;
   }
   
   if (!confirm('¿Está seguro de marcar esta mesa como ocupada? Esto impedirá que los clientes la reserven desde la aplicación.')) {
       return;
   }
   
   try {
       const response = await fetch(`/api/mesas/${mesaId}/deshabilitar`, {
           method: 'PUT'
       });
       
       const data = await response.json();
       
       if (data.exito) {
           mostrarMensaje(data.mensaje, 'success', 'mensajeDeshabilitar');
           cargarMesasDisponibles(); // Recargar lista
           cargarTodasLasMesas(); // Actualizar cache
       } else {
           mostrarError(data.mensaje || 'Error al deshabilitar la mesa', 'mensajeDeshabilitar');
       }
   } catch (error) {
       console.error('Error:', error);
       mostrarError('Error al deshabilitar la mesa', 'mensajeDeshabilitar');
   }
}

// ========== UTILIDADES ==========

function mostrarVistaPrevia(file, contenedorId) {
   const contenedor = document.getElementById(contenedorId);
   
   if (!file) {
       contenedor.innerHTML = '';
       return;
   }
   
   const reader = new FileReader();
   reader.onload = function(e) {
       contenedor.innerHTML = `
           <p>Vista previa:</p>
           <img src="${e.target.result}" style="max-width: 200px;">
       `;
   };
   reader.readAsDataURL(file);
}

function mostrarAlerta(mensaje, tipo = 'info') {
   const alertaDiv = document.getElementById('mensajeAlerta');
   const alerta = document.createElement('div');
   alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
   alerta.innerHTML = `
       ${mensaje}
       <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
   `;
   
   alertaDiv.appendChild(alerta);
   
   // Auto-cerrar después de 5 segundos
   setTimeout(() => {
       alerta.remove();
   }, 5000);
}

function mostrarMensaje(mensaje, tipo = 'success', contenedorId) {
   const contenedor = document.getElementById(contenedorId);
   contenedor.innerHTML = `
       <div class="alert alert-${tipo} alert-dismissible fade show mt-2" role="alert">
           ${mensaje}
           <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
       </div>
   `;
}

function mostrarError(mensaje, contenedorId) {
   mostrarMensaje(mensaje, 'danger', contenedorId);
}

function formatearPrecio(precio) {
   return new Intl.NumberFormat('es-CO').format(precio);
}

function cerrarSesion() {
   localStorage.clear();
   sessionStorage.clear();
   window.location.href = '/login';
}

function irAGestionReservas() {
   window.location.href = '/gestion-de-reservas';
}

// Actualizar estado de mesas cada 30 segundos cuando se está en esa pestaña
setInterval(() => {
   const tabActiva = document.querySelector('#mesasTabs .nav-link.active');
   if (tabActiva && tabActiva.id === 'estado-mesas-tab') {
       cargarEstadoMesas();
   }
}, 30000);