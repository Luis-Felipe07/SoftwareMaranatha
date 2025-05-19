
let mesaSeleccionada = null;
let platosSeleccionados = [];
let precioTotal = 0;
let usuarioActual = null;
let menuItems = { entradas: [], principales: [], postres: [], bebidas: [] };

/**
 
 * Configuro los valores mínimos para las fechas y eventos iniciales
 */
document.addEventListener('DOMContentLoaded', () => {
   
    verificarAutenticacion();

    // Establezco la fecha mínima como hoy
    const fechaInput = document.getElementById('fecha');
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    const fechaActual = `${year}-${month}-${day}`;
    
    fechaInput.setAttribute('min', fechaActual);
    
    // Evento para el checkbox de pedido adelantado
    document.getElementById('pedidoAdelantado').addEventListener('change', toggleSeccionPedidos);
});

/**
 * Función para verificar si el usuario está autenticado
 
 */
function verificarAutenticacion() {
    // Realizo la petición al endpoint de verificación de sesión
    fetch('/api/usuario/sesion', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include' 
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('No autenticado');
        }
        return response.json();
    })
    .then(data => {
        // Guardo los datos del usuario autenticado
        usuarioActual = data;
        
        // Muestro sección de usuario y oculto mensaje de no autenticado
        document.getElementById('infoUsuario').classList.remove('d-none');
        document.getElementById('nombreUsuario').textContent = data.nombres;
        document.getElementById('correoUsuario').textContent = data.correo;
        document.getElementById('mensajeNoAutenticado').classList.add('d-none');
        document.getElementById('seccionMesas').classList.remove('d-none');
        
        // Cargo el menú de platos para tenerlos disponibles
        cargarMenuPlatos();
    })
    .catch(error => {
        console.error('Error de autenticación:', error);
        
        // Muestro mensaje de no autenticado y oculto secciones de reserva
        document.getElementById('mensajeNoAutenticado').classList.remove('d-none');
        document.getElementById('infoUsuario').classList.add('d-none');
        document.getElementById('seccionMesas').classList.add('d-none');
    });
}

/**
 * Función para cerrar la sesión del usuario
 
 */
function cerrarSesion() {
    fetch('/api/usuario/logout', {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cerrar sesión');
        }
        // Recargo la página para reiniciar el estado
        window.location.reload();
    })
    .catch(error => {
        console.error('Error al cerrar sesión:', error);
        alert('Hubo un problema al cerrar la sesión. Intente nuevamente.');
    });
}

/**
 * Función para cargar los platos del menú desde el backend
 * 
 */
function cargarMenuPlatos() {
    fetch('/api/platos', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar el menú');
        }
        return response.json();
    })
    .then(platos => {
        // Clasifico los platos por categoría
        menuItems.entradas = platos.filter(plato => plato.id_menu === 1);
        menuItems.principales = platos.filter(plato => plato.id_menu === 2);
        menuItems.postres = platos.filter(plato => plato.id_menu === 3);
        menuItems.bebidas = platos.filter(plato => plato.id_menu === 4);
        
        // Tengo los platos cargados 
        console.log('Menú cargado exitosamente');
    })
    .catch(error => {
        console.error('Error al cargar el menú de platos:', error);
    });
}

/**
 * Función para mostrar los platos en la interfaz según su categoría
 * 
 */
function mostrarPlatos() {
   
    mostrarPlatosPorCategoria('listaEntradas', menuItems.entradas);
    
    mostrarPlatosPorCategoria('listaPlatos', menuItems.principales);
    
    mostrarPlatosPorCategoria('listaPostres', menuItems.postres);
   
    mostrarPlatosPorCategoria('listaBebidas', menuItems.bebidas);
}

/**
 * Función auxiliar para mostrar platos de una categoría en su contenedor
 * @param {String} 
 * @param {Array} 
 */
function mostrarPlatosPorCategoria(containerId, platos) {
    const container = document.getElementById(containerId);
    
    // Limpio el contenedor
    container.innerHTML = '';
    
    if (platos.length === 0) {
        container.innerHTML = '<div class="col-12 text-center py-3">No hay platos disponibles en esta categoría</div>';
        return;
    }
    
    // Añado cada plato al contenedor
    platos.forEach(plato => {
        const col = document.createElement('div');
        col.className = 'col-md-6';
        
        col.innerHTML = `
            <div class="menu-item">
                <div class="form-check">
                    <input class="form-check-input item-pedido" type="checkbox" 
                           value="${plato.id_plato}" 
                           id="plato_${plato.id_plato}" 
                           data-nombre="${plato.nombre_plato}" 
                           data-precio="${plato.precio}">
                    <label class="form-check-label" for="plato_${plato.id_plato}">
                        ${plato.nombre_plato} - $${plato.precio.toLocaleString()}
                    </label>
                </div>
            </div>
        `;
        
        container.appendChild(col);
    });
    
    // Añado el evento change a todos los checkboxes nuevos
    const checkboxes = container.querySelectorAll('.item-pedido');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', actualizarListaPlatos);
    });
}

/**
 * Función para seleccionar una mesa y mostrar el formulario de reserva
 * @param {Number} numeroMesa - Número de la mesa seleccionada
 */
function seleccionarMesa(numeroMesa) {
    if (!usuarioActual) {
        alert('Debe iniciar sesión para seleccionar una mesa.');
        return;
    }
    
    // Verifico si la mesa está disponible consultando al backend
    fetch(`/api/mesas/${numeroMesa}/disponible`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al verificar disponibilidad');
        }
        return response.json();
    })
    .then(data => {
        if (!data.disponible) {
            alert('Esta mesa no está disponible. Por favor seleccione otra.');
            return;
        }
        
        // La mesa está disponible, procedo con la selección
        mesaSeleccionada = numeroMesa;
        
        
        document.getElementById('mesaNumero').textContent = numeroMesa;
        
        
        document.getElementById('formReserva').classList.remove('d-none');
        
        
        document.getElementById('telefono').value = usuarioActual.telefono || '';
        
        // Hago scroll al formulario
        document.getElementById('formReserva').scrollIntoView({
            behavior: 'smooth'
        });
    })
    .catch(error => {
        console.error('Error al verificar disponibilidad de mesa:', error);
        alert('Hubo un problema al verificar la disponibilidad de la mesa. Intente nuevamente.');
    });
}

/**
 * Función para mostrar u ocultar la sección de pedidos
 * dependiendo del estado del checkbox
 */
function toggleSeccionPedidos() {
    const checkbox = document.getElementById('pedidoAdelantado');
    const seccionPedidos = document.getElementById('seccionPedidos');
    
    if (checkbox.checked) {
        seccionPedidos.classList.remove('d-none');
        
        mostrarPlatos();
    } else {
        seccionPedidos.classList.add('d-none');
        
        limpiarPedidos();
    }
}

/**
 * Función para limpiar los pedidos seleccionados
 * 
 */
function limpiarPedidos() {
    
    const itemsPedido = document.querySelectorAll('.item-pedido');
    itemsPedido.forEach(item => {
        item.checked = false;
    });
    
    
    platosSeleccionados = [];
    precioTotal = 0;
    
    
    actualizarVisualizacionPlatos();
}

/**
 * Función para actualizar la lista de platos cuando se selecciona o deselecciona un ítem
 * @param {Event} 
 */
function actualizarListaPlatos(event) {
    const checkbox = event.target;
    const idPlato = parseInt(checkbox.value);
    const nombrePlato = checkbox.dataset.nombre;
    const precio = parseFloat(checkbox.dataset.precio);
    
    if (checkbox.checked) {
        // Añado el plato a la lista de seleccionados
        platosSeleccionados.push({
            id: idPlato,
            nombre: nombrePlato,
            precio: precio
        });
    } else {
        // Elimino el plato de la lista de seleccionados
        platosSeleccionados = platosSeleccionados.filter(plato => plato.id !== idPlato);
    }
    
    // Actualizo la visualización y el precio total
    actualizarVisualizacionPlatos();
}

/**
 * Función para actualizar la visualización de los platos seleccionados
 * 
 */
function actualizarVisualizacionPlatos() {
    const listaPlatos = document.getElementById('listaPlatosSeleccionados');
    
    // Limpio la lista actual
    listaPlatos.innerHTML = '';
    
    // Recalculo el precio total
    precioTotal = 0;
    
    if (platosSeleccionados.length === 0) {
       
        listaPlatos.innerHTML = '<li class="list-group-item text-center">No hay platos seleccionados</li>';
    } else {
        // Añado cada plato a la lista con su precio
        platosSeleccionados.forEach(plato => {
            const item = document.createElement('li');
            item.className = 'list-group-item d-flex justify-content-between align-items-center';
            
            item.innerHTML = `
                ${plato.nombre}
                <span class="badge bg-primary rounded-pill">$${plato.precio.toLocaleString()}</span>
            `;
            
            listaPlatos.appendChild(item);
            
            // Sumo al precio total
            precioTotal += plato.precio;
        });
        
        // Añado el total al final
        const totalItem = document.createElement('li');
        totalItem.className = 'list-group-item d-flex justify-content-between align-items-center fw-bold';
        
        totalItem.innerHTML = `
            Total
            <span class="badge bg-success rounded-pill">$${precioTotal.toLocaleString()}</span>
        `;
        
        listaPlatos.appendChild(totalItem);
    }
}

/**
 * Función para cancelar la reserva actual
 * 
 */
function cancelarReserva() {
    
    document.getElementById('formReserva').classList.add('d-none');
    
    // Reseteo la mesa seleccionada
    mesaSeleccionada = null;
    
    // Limpio los pedidos si hay alguno
    if (document.getElementById('pedidoAdelantado').checked) {
        document.getElementById('pedidoAdelantado').checked = false;
        document.getElementById('seccionPedidos').classList.add('d-none');
        limpiarPedidos();
    }
    
    // Reseteo los valores del formulario
    document.getElementById('reservaForm').reset();
    
    // Hago scroll arriba para que el usuario pueda seleccionar otra mesa
    document.getElementById('seccionMesas').scrollIntoView({
        behavior: 'smooth'
    });
}

/**
 * Función para continuar al proceso de pago
 * 
 */
function continuarAPago() {
   
    const telefono = document.getElementById('telefono').value;
    const numPersonas = document.getElementById('numPersonas').value;
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    
    if (!telefono || !numPersonas || !fecha || !hora) {
        alert('Por favor complete todos los campos requeridos.');
        return;
    }
    
    // Preparo el resumen para mostrar en el modal
    document.getElementById('resumenNombre').textContent = usuarioActual.nombres + ' ' + usuarioActual.apellidos;
    document.getElementById('resumenTelefono').textContent = telefono;
    document.getElementById('resumenMesa').textContent = mesaSeleccionada;
    document.getElementById('resumenFecha').textContent = formatearFecha(fecha);
    document.getElementById('resumenHora').textContent = hora;
    document.getElementById('resumenPersonas').textContent = numPersonas;
    
    // Preparo la sección de pedidos en el resumen
    const pedidoAdelantado = document.getElementById('pedidoAdelantado').checked;
    
    if (pedidoAdelantado && platosSeleccionados.length > 0) {
        // Muestro la sección de pedidos
        document.getElementById('resumenSinPedido').classList.add('d-none');
        document.getElementById('resumenConPedido').classList.remove('d-none');
        
        // Genero la lista de platos
        const resumenPlatos = document.getElementById('resumenPlatos');
        resumenPlatos.innerHTML = '';
        
        platosSeleccionados.forEach(plato => {
            const item = document.createElement('li');
            item.innerHTML = `${plato.nombre} - $${plato.precio.toLocaleString()}`;
            resumenPlatos.appendChild(item);
        });
        
        // Muestro el total
        document.getElementById('resumenTotal').textContent = precioTotal.toLocaleString();
    } else {
        // Oculto la lista de pedidos y muestro mensaje de que no hay pedido
        document.getElementById('resumenSinPedido').classList.remove('d-none');
        document.getElementById('resumenConPedido').classList.add('d-none');
    }
    
    // Abro el modal de pago
    const modalPago = new bootstrap.Modal(document.getElementById('modalPago'));
    modalPago.show();
}

/**
 * Función para formatear la fecha en formato legible
 * @param {String} 
 * @returns {String} 
 */
function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    
    return `${dia}/${mes}/${anio}`;
}

/**
 * Función para confirmar la reserva final
 * 
 */
function confirmarReserva() {
    
    const metodoPago = document.querySelector('input[name="metodoPago"]:checked');
    
    if (!metodoPago) {
        alert('Por favor seleccione un método de pago.');
        return;
    }
    
    // Preparo los datos de la reserva
    const datosReserva = {
        id_usuario: usuarioActual.id_usuario,
        id_mesa: mesaSeleccionada,
        telefono: document.getElementById('telefono').value,
        personas: parseInt(document.getElementById('numPersonas').value),
        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value,
        metodo_pago: metodoPago.value,
        platos: platosSeleccionados.map(plato => ({
            id_plato: plato.id,
            cantidad: 1 
        }))
    };
    
    // Envío la reserva al backend
    fetch('/api/reservas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(datosReserva)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al procesar la reserva');
        }
        return response.json();
    })
    .then(data => {
        
        const modalPago = bootstrap.Modal.getInstance(document.getElementById('modalPago'));
        modalPago.hide();
        
        
        const numeroConfirmacion = data.id_reserva || generarNumeroConfirmacion();
        document.getElementById('numeroConfirmacion').textContent = numeroConfirmacion;
        
        
        const modalConfirmacion = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
        modalConfirmacion.show();
    })
    .catch(error => {
        console.error('Error al procesar la reserva:', error);
        alert('Hubo un problema al procesar su reserva. Intente nuevamente.');
    });
}

/**
 * Función para generar un número de confirmación simulado
 * @returns {String} 
 */
function generarNumeroConfirmacion() {
    
    const aleatorio = Math.floor(10000000 + Math.random() * 90000000);
    return `RES-${aleatorio}`;
}

/**
 * Función para finalizar el proceso después de la reserva exitosa
 * 
 */
function finalizarProceso() {
    // Reseteo todas las variables
    mesaSeleccionada = null;
    platosSeleccionados = [];
    precioTotal = 0;
    
    // Oculto formulario de reserva
    document.getElementById('formReserva').classList.add('d-none');
    
    // Reseteo el formulario
    document.getElementById('reservaForm').reset();
    
    // Hago scroll al inicio
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Recargo la información de mesas para actualizar disponibilidad
    verificarAutenticacion();
}

/**
 * Función para verificar la disponibilidad de mesas en tiempo real
 * Se puede usar para refrescar el estado de las mesas periódicamente
 */
function actualizarDisponibilidadMesas() {
    fetch('/api/mesas/disponibilidad', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al verificar disponibilidad');
        }
        return response.json();
    })
    .then(disponibilidad => {
        // Actualizo visualmente el estado de cada mesa
        disponibilidad.forEach(mesa => {
            const boton = document.querySelector(`button[onclick="seleccionarMesa(${mesa.numero})"]`);
            
            if (boton) {
                if (!mesa.disponible) {
                    boton.classList.add('btn-reservada');
                    boton.textContent = 'Mesa Reservada';
                    boton.disabled = true;
                } else {
                    boton.classList.remove('btn-reservada');
                    boton.textContent = 'Seleccionar Mesa';
                    boton.disabled = false;
                }
            }
        });
    })
    .catch(error => {
        console.error('Error al actualizar disponibilidad de mesas:', error);
    });
}


setInterval(actualizarDisponibilidadMesas, 5 * 60 * 1000);
    