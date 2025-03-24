package com.maranatha.sfmaranatha.Controllers;

import com.maranatha.sfmaranatha.Model.Pedido;
import com.maranatha.sfmaranatha.Model.Pedido.TipoPedido;
import com.maranatha.sfmaranatha.Repository.PedidoRepository;
import com.maranatha.sfmaranatha.Service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    @Autowired
    private PedidoRepository pedidoRepository;
    
    @Autowired
    private PedidoService pedidoService;

    @PostMapping("/crear")
    public ResponseEntity<?> crearPedido(@RequestBody Map<String, Object> payload) {
        try {
            Pedido pedido = new Pedido();
            pedido.setNombreCliente((String) payload.get("nombreCliente"));
            pedido.setCorreo((String) payload.get("correo"));
            pedido.setTelefono((String) payload.get("telefono"));
            
            String tipo = (String) payload.get("tipoPedido");
            if (tipo.equalsIgnoreCase("DOMICILIO")) {
                pedido.setTipoPedido(TipoPedido.DOMICILIO);
                // Combino la dirección y el barrio en un solo campo
                String direccion = (String) payload.get("direccion");
                String barrio = (String) payload.get("barrio");
                pedido.setDireccion(direccion + ", " + barrio);
            } else {
                pedido.setTipoPedido(TipoPedido.RESTAURANTE);
                pedido.setHoraReserva((String) payload.get("horaReserva"));
            }
            
            pedido.setMetodoPago((String) payload.get("metodoPago"));
            pedido.setDetallePedido((String) payload.get("detallePedido"));
            pedido.setMontoTotal(Double.valueOf(payload.get("montoTotal").toString()));

            Pedido nuevoPedido = pedidoRepository.save(pedido);
            return ResponseEntity.ok(Map.of(
                    "exito", true,
                    "mensaje", "Pedido guardado correctamente",
                    "pedidoId", nuevoPedido.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "exito", false,
                    "mensaje", "Error al guardar el pedido: " + e.getMessage()
            ));
        }
    }

    @GetMapping
    public ResponseEntity<?> consultarPedidos(@RequestParam(required = false) String estado) {
        List<Pedido> pedidos;
        try {
            if (estado != null && !estado.isEmpty()) {
                Pedido.EstadoPedido estadoPedido = Pedido.EstadoPedido.valueOf(estado.toUpperCase());
                pedidos = pedidoRepository.findByEstadoPedido(estadoPedido);
            } else {
                pedidos = pedidoRepository.findAll();
            }
            return ResponseEntity.ok(pedidos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Estado no válido. Use PENDIENTE, ENTREGADO o CANCELADO."));
        }
    }
    
    // Endpoint para cancelar un pedido
    @PutMapping("/cancelar/{id}")
    public ResponseEntity<?> cancelarPedido(@PathVariable("id") Long id) {
        try {
            Pedido pedidoCancelado = pedidoService.cancelarPedido(id);
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Pedido cancelado exitosamente",
                "pedidoId", pedidoCancelado.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", e.getMessage()
            ));
        }
    }
}
