let mesaSeleccionada = null;

// Reservar una mesa
function reservarMesa(numeroMesa) {
    mesaSeleccionada = numeroMesa;

    
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;

    // Validación de ingreso de fecha y hora
    if (!fecha || !hora) {
        alert("Por favor, seleccione una fecha y hora antes de reservar la mesa.");
        return;
    }

    const fechaSeleccionada = new Date(fecha);
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0); 

    if (fechaSeleccionada < fechaActual) {
        alert("La fecha seleccionada no puede ser anterior a la fecha actual.");
        return;
    }

    // Mostrar fecha, hora y mesa en el modal
    document.getElementById('numeroMesa').textContent = `Mesa ${mesaSeleccionada}`;
    document.getElementById('fechaReserva').textContent = fecha;
    document.getElementById('horaReserva').textContent = hora;

    
    const modal = new bootstrap.Modal(document.getElementById('modalPago'));
    modal.show();
}

// Pago confirmado
function confirmarPago() {
    const metodoPago = document.querySelector('input[name="metodoPago"]:checked');

    // Validar método de pago
    if (!metodoPago) {
        alert("Por favor, seleccione un método de pago para confirmar la reserva.");
        return;
    }

    // Obtener información del pago
    const metodoSeleccionado = metodoPago.value;

    // Confirmo reserva
    alert(`Reserva confirmada para la Mesa ${mesaSeleccionada}.\nMétodo de pago: ${metodoSeleccionado}.`);

    // Borró valores
    mesaSeleccionada = null;
    document.getElementById('fecha').value = '';
    document.getElementById('hora').value = '';

    // Cierro el modal
    const modal = document.getElementById('modalPago');
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();

    // Mostrar mensaje de éxito después del cierre del modal
    modal.addEventListener('hidden.bs.modal', () => {
        alert('¡Reserva realizada con éxito!');
    }, { once: true });
}

//  que la fecha no sea pasada
document.addEventListener('DOMContentLoaded', () => {
    const fechaInput = document.getElementById('fecha');
    const hoy = new Date(); // Fecha actual
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0'); 
    const day = String(hoy.getDate()).padStart(2, '0'); 
    const fechaActual = `${year}-${month}-${day}`;

    fechaInput.setAttribute('min', fechaActual);
});
