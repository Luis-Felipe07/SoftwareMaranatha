document.addEventListener('DOMContentLoaded', function () {
    const carrito = [];
    let pedidoActualId = null; 
    const modal = new bootstrap.Modal(document.getElementById('opcionModal'));
    const formularioDomicilio = document.getElementById('pedidoForm');
    const formularioRestaurante = document.getElementById('pedidoForm2');
    const contenedorFormulario = document.getElementById('formularioPedidoContainer');
    const botonCancelarPedido = document.getElementById('cancelarPedido');

    // Inicializar formularios ocultos
    formularioDomicilio.style.display = 'none';
    formularioRestaurante.style.display = 'none';

    // Gestión del carrito
    const botonIrApago = document.getElementById('ir-A-pago');
    botonIrApago.addEventListener('click', function () {
        if (carrito.length === 0) {
            alert('El carrito está vacío. Por favor, añada productos antes de proceder.');
        } else {
            modal.show();
        }
    });

    // Agregar productos al carrito
    const botones = document.querySelectorAll('.add-to-cart');
    botones.forEach(boton => {
        boton.addEventListener('click', function () {
            const nombreProducto = this.getAttribute('data-name');
            const precioProducto = this.getAttribute('data-price');
            const cantidadProducto = this.previousElementSibling.value;

            const item = {
                nombre: nombreProducto,
                precio: parseInt(precioProducto),
                cantidad: parseInt(cantidadProducto)
            };

            const itemExistente = carrito.find(producto => producto.nombre === item.nombre);
            if (itemExistente) {
                itemExistente.cantidad += item.cantidad;
            } else {
                carrito.push(item);
            }

            actualizarCarrito();
            alert(`${cantidadProducto} x ${nombreProducto} añadido(s) al carrito`);
        });
    });

    // Selección de tipo de pedido
    document.getElementById('comerRestaurante').addEventListener('click', function () {
        contenedorFormulario.classList.remove('d-none');
        formularioDomicilio.style.display = 'none';
        formularioRestaurante.style.display = 'block';
        modal.hide();

        const metodoPagoRestaurante = formularioRestaurante.querySelector('#metodoPago');
        agregarOpcionEfectivo(metodoPagoRestaurante);
    });

    document.getElementById('pedidoDomicilio').addEventListener('click', function () {
        contenedorFormulario.classList.remove('d-none');
        formularioDomicilio.style.display = 'block';
        formularioRestaurante.style.display = 'none';
        modal.hide();

        const metodoPagoDomicilio = formularioDomicilio.querySelector('#metodoPago');
        eliminarOpcionEfectivo(metodoPagoDomicilio);
    });

    // Funciones para manipular opciones de método de pago
    function eliminarOpcionEfectivo(selectElement) {
        const opcionEfectivo = selectElement.querySelector('option[value="efectivo"]');
        if (opcionEfectivo) {
            opcionEfectivo.remove();
        }
    }

    function agregarOpcionEfectivo(selectElement) {
        const existeEfectivo = selectElement.querySelector('option[value="efectivo"]');
        if (!existeEfectivo) {
            const opcion = document.createElement('option');
            opcion.value = 'efectivo';
            opcion.textContent = 'Efectivo';
            selectElement.appendChild(opcion);
        }
    }

    // Validación de hora para pedido en restaurante
    const horaReserva = document.getElementById('horaReserva');
    if (horaReserva) {
        horaReserva.addEventListener('change', function () {
            const hora = this.value;
            const [horas] = hora.split(':');
            if (horas < 11 || horas >= 22) {
                alert('Por favor seleccione un horario entre 11:00 AM y 10:00 PM');
                this.value = '';
            }
        });
    }

    // Función para enviar el pedido al backend
    function enviarPedido(form, tipoOrden) {
        const nombreCliente = form.querySelector('#nombre').value;
        const correo = form.querySelector('#email').value;
        const telefono = form.querySelector('#telefono').value;
        const metodoPago = form.querySelector('#metodoPago').value;

        let payload = {
            nombreCliente: nombreCliente,
            correo: correo,
            telefono: telefono,
            metodoPago: metodoPago,
            tipoPedido: tipoOrden.toUpperCase(), 
            detallePedido: JSON.stringify(carrito),
            montoTotal: calcularTotal()
        };

        if (tipoOrden === 'domicilio') {
            const direccion = form.querySelector('#direccion').value;
            const barrio = form.querySelector('#barrio').value;
            payload.direccion = direccion + ", " + barrio;
        } else if (tipoOrden === 'restaurante') {
            payload.horaReserva = form.querySelector('#horaReserva').value;
        }

        return fetch('/api/pedidos/crear', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.exito) {
                alert(data.mensaje);
                //  el backend devuelve el id del pedido creado
                pedidoActualId = data.pedidoId; 
                // Mostrar el botón de cancelar pedido
                botonCancelarPedido.style.display = 'block';
                // Limpiar el carrito después de un pedido exitoso
                vaciarCarrito();
                return true;
            } else {
                alert("Error: " + data.mensaje);
                throw new Error(data.mensaje);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Error de conexión con el servidor.");
            throw error;
        });
    }

    // Función para vaciar el carrito
    function vaciarCarrito() {
        carrito.length = 0;
        actualizarCarrito();
    }

    // Procesamiento de formularios
    function procesarFormulario(e, tipoOrden) {
        e.preventDefault();
        const form = e.target;
        
        enviarPedido(form, tipoOrden)
            .then(() => {
                // Si el pedido se envía correctamente, limpio el formulario
                form.reset();
                // Oculto el contenedor del formulario después de enviar con éxito
                contenedorFormulario.classList.add('d-none');
            })
            .catch(error => {
                console.error(error);
               
            });
    }

    formularioDomicilio.addEventListener('submit', e => procesarFormulario(e, 'domicilio'));
    formularioRestaurante.addEventListener('submit', e => procesarFormulario(e, 'restaurante'));

    // Listener para el botón de cancelar pedido
    botonCancelarPedido.addEventListener('click', function () {
        if (!pedidoActualId) {
            alert('No hay ningún pedido activo para cancelar.');
            return;
        }
        // Confirmar la cancelación
        if (confirm('¿Está seguro que desea cancelar su pedido?')) {
            cancelarPedido(pedidoActualId);
        }
    });

    // Función para cancelar el pedido
    function cancelarPedido(idPedido) {
        console.log("ID del pedido a cancelar:", idPedido);
        fetch(`/api/pedidos/cancelar/${idPedido}`, { 
            method: 'PUT',
            headers: {'Content-Type': 'application/json'}
        })
        .then(response => response.json())
        .then(data => {
            if (data.exito) {
                alert('Pedido cancelado exitosamente.');
                // Oculto el botón y limpio el id
                botonCancelarPedido.style.display = 'none';
                pedidoActualId = null;
            } else {
                alert("Error: " + data.mensaje);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Error al conectar con el servidor para cancelar el pedido.");
        });
    }

    // Funciones auxiliares
    function calcularTotal() {
        return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    }

    function actualizarCarrito() {
        const total = calcularTotal();
        console.log(`Total del carrito: $${total}`);
    }

    function generarResumenPedido(detallesPedido) {
        return detallesPedido.items.map(item =>
            `<p>${item.cantidad}x ${item.nombre} - $${item.precio * item.cantidad}</p>`
        ).join('') + `<p><strong>Total: $${detallesPedido.total}</strong></p>`;
    }
});

// Función global para envío de factura 
function enviarFactura(email) {
    console.log(`Enviando factura a ${email}`);
    alert('¡Gracias por su compra! La factura ha sido enviada a su correo.');
    location.reload(); 
}
