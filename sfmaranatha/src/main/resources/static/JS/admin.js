// 1. Subir imagen del menú
const inputImagenMenu = document.getElementById('inputImagenMenu');
const btnCargarImagen = document.getElementById('btnCargarImagen');
const vistaPrevia = document.getElementById('vistaPrevia');

btnCargarImagen.addEventListener('click', () => {
  if (!inputImagenMenu.files || inputImagenMenu.files.length === 0) {
    alert('Por favor, seleccione una imagen antes de cargar.');
    return;
  }
  
  
  const archivo = inputImagenMenu.files[0];
  vistaPrevia.innerHTML = `<p>Imagen cargada: <strong>${archivo.name}</strong></p>`;
});

//  Habilitar mesa
const selectMesas = document.getElementById('selectMesas');
const btnHabilitarMesa = document.getElementById('btnHabilitarMesa');

btnHabilitarMesa.addEventListener('click', () => {
  const mesaSeleccionada = selectMesas.value;
  if (!mesaSeleccionada) {
    alert('Por favor, seleccione una mesa para habilitar.');
    return;
  }
  
  // Aquí pondré la lógica para habilitar la mesa en el sistema 
  alert(`La ${mesaSeleccionada} ha sido habilitada con éxito.`);
});

// 3. Ver pedidos 
const btnPedidosRealizados = document.getElementById('btnPedidosRealizados');
const btnPedidosPendientes = document.getElementById('btnPedidosPendientes');
const btnPedidosCancelados = document.getElementById('btnPedidosCancelados');

btnPedidosRealizados.addEventListener('click', () => {
  // aqui pondré la Lógica para mostrar pedidos realizados
  alert('Mostrando pedidos realizados...');
});

btnPedidosPendientes.addEventListener('click', () => {
  // aqui pondré la Lógica mostrar pedidos pendientes
  alert('Mostrando pedidos pendientes...');
});

btnPedidosCancelados.addEventListener('click', () => {
  // aqui pondré la Lógica para mostrar pedidos cancelados
  alert('Mostrando pedidos cancelados...');
});

//  Eliminar menú
const selectEliminarMenu = document.getElementById('selectEliminarMenu');
const btnEliminarMenu = document.getElementById('btnEliminarMenu');

btnEliminarMenu.addEventListener('click', () => {
  const menuSeleccionado = selectEliminarMenu.value;
  if (!menuSeleccionado) {
    alert('Por favor, seleccione un menú para eliminar.');
    return;
  }
  
  // aqui pondré la Lógica para eliminar el menú en el backend
  alert(`El menú "${menuSeleccionado}" ha sido eliminado con éxito.`);
});
