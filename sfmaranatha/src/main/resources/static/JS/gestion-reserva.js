document.addEventListener('DOMContentLoaded', function () {
    cargarPedidos("PENDIENTE", "listaPendientes");
    cargarPedidos("ENTREGADO", "listaEntregados");
    cargarPedidos("CANCELADO", "listaCancelados");
    cargarMesasOcupadas();

    // Cargar pedidos por estado
    function cargarPedidos(estado, listaId) {
        fetch(`/api/pedidos?estado=${estado}`)
            .then(response => response.json())
            .then(pedidos => {
                const lista = document.getElementById(listaId);
                lista.innerHTML = "";
                pedidos.forEach(pedido => {
                    const item = document.createElement("li");
                    item.classList.add("list-group-item");
                    let texto = `${pedido.nombreCliente} - ${pedido.tipoPedido} - ${pedido.montoTotal} COP`;
                    if (pedido.detallePedido) {
                        try {
                            const detalle = JSON.parse(pedido.detallePedido);
                            const itemsDescripcion = detalle.map(i => `${i.nombre} x ${i.cantidad}`).join(", ");
                            if (itemsDescripcion) {
                                texto += ` | [${itemsDescripcion}]`;
                            }
                        } catch (e) {
                            console.error("Error parseando detallePedido:", e);
                        }
                    }
                    item.textContent = texto;
                    lista.appendChild(item);
                });
            });
    }

    // Cargar mesas ocupadas
    function cargarMesasOcupadas() {
        fetch("/api/mesas/ocupadas")
            .then(response => response.json())
            .then(mesas => {
                const listaMesas = document.getElementById("listaMesas");
                listaMesas.innerHTML = "";
                mesas.forEach(mesa => {
                    const option = document.createElement("option");
                    option.value = mesa.id;
                    option.textContent = `Mesa ${mesa.numero}`;
                    listaMesas.appendChild(option);
                });
            });
    }

    // Habilitar mesa seleccionada
    document.getElementById("habilitarMesa").addEventListener("click", function () {
        const mesaId = document.getElementById("listaMesas").value;
        fetch(`/api/mesas/${mesaId}/habilitar`, { method: "PUT" })
            .then(() => cargarMesasOcupadas());
    });

    // Subir imagen de menú
    document.getElementById("subirImagen").addEventListener("change", function (event) {
        const file = event.target.files[0];
        alert(`Imagen seleccionada: ${file.name}`);
        // pendiente de integrar el backend
    });
});
