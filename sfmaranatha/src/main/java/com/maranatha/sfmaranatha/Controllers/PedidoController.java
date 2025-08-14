package com.maranatha.sfmaranatha.Controllers;

import com.itextpdf.text.log.LoggerFactory;
import com.maranatha.sfmaranatha.Model.Pedido;
import com.maranatha.sfmaranatha.Model.Usuario;
import com.maranatha.sfmaranatha.Repository.PedidoRepository;
import com.maranatha.sfmaranatha.Service.PedidoService;
import com.maranatha.sfmaranatha.Service.UsuarioService;
import com.maranatha.sfmaranatha.dto.PedidoRequestDTO;

import ch.qos.logback.classic.Logger;

import com.maranatha.sfmaranatha.dto.PedidoDetalladoDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pedidos")
@Tag(name = "Pedidos", description = "Yo me encargo de todo lo relacionado con los pedidos de los clientes.")
@CrossOrigin(origins = "*")
public class PedidoController {

    private static final com.itextpdf.text.log.Logger log = LoggerFactory.getLogger(PedidoController.class);
    @Autowired private PedidoService pedidoService;

    @Autowired
    private PedidoRepository miRepositorioDePedidos;

    @Autowired
    private PedidoService miServicioDePedidos;

    @Autowired
    private UsuarioService miServicioDeUsuarios;

    
public ResponseEntity<List<PedidoDetalladoDTO>> listarPedidos() {
        try {
            List<PedidoDetalladoDTO> lista = pedidoService.listarDetallados();
            return ResponseEntity.ok(lista);
        } catch (Exception ex) {
            log.error("Error al listar pedidos", ex);   
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Creo un nuevo pedido usando el DTO  PedidoRequestDTO.
     */
    @PostMapping("/nuevo")
    @Operation(summary = "Crear un nuevo pedido con DTO",
               description = "Yo recibo un PedidoRequestDTO y creo un nuevo pedido en el sistema.")
    public ResponseEntity<?> crearPedidoConDTO(@RequestBody PedidoRequestDTO datosDelPedido) {
        try {
            Pedido pedidoCreado = miServicioDePedidos.crearPedido(datosDelPedido);
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "¡Tu pedido ha sido guardado correctamente!",
                "pedidoId", pedidoCreado.getIdPedido(),
                "total", pedidoCreado.getTotal()
            ));
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("exito", false, "mensaje", se.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("exito", false, "mensaje", "Error al guardar el pedido: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("exito", false, "mensaje", "Ocurrió un error inesperado procesando tu pedido."));
        }
    }

    /**
     * Consulto todos los pedidos del sistema con información detallada.
     */
    @GetMapping
    @Operation(summary = "Consultar todos los pedidos (Admin)",
               description = "Yo devuelvo todos los pedidos con información detallada, o los filtro por estado si se especifica.")
    public ResponseEntity<?> consultarTodosLosPedidos(@RequestParam(required = false) String estado) {
        try {
            List<Pedido> pedidos;
            if (estado != null && !estado.isEmpty()) {
                pedidos = miRepositorioDePedidos.findByEstado(estado.toUpperCase());
            } else {
                pedidos = miRepositorioDePedidos.findAll();
            }
            
            // Convierto a DTO detallado para incluir información de items
            List<PedidoDetalladoDTO> pedidosDetallados = pedidos.stream()
                .map(miServicioDePedidos::convertirAPedidoDetallado)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(pedidosDetallados);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al consultar los pedidos: " + e.getMessage()
            ));
        }
    }

    /**
     * Actualizo el estado de un pedido.
     */
    @PutMapping("/actualizar-estado/{id}")
    @Operation(summary = "Actualizar estado de pedido",
               description = "Yo actualizo el estado de un pedido (PENDIENTE -> ENTREGADO o CANCELADO).")
    public ResponseEntity<?> actualizarEstadoPedido(
            @PathVariable Long id, 
            @RequestParam String nuevoEstado,
            java.security.Principal principal) {
        
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("exito", false, "mensaje", "No estás autenticado para realizar esta acción."));
        }

        try {
            Optional<Usuario> usuarioOpt = miServicioDeUsuarios.buscarPorCorreo(principal.getName());
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("exito", false, "mensaje", "Usuario autenticado no encontrado en el sistema."));
            }
            
            Usuario usuarioAutenticado = usuarioOpt.get();
            
            // Verifico que sea ADMIN o ENCARGADO
            if (!usuarioAutenticado.getTipoUsuario().equals("ADMIN") && 
                    !usuarioAutenticado.getTipoUsuario().equals("ENCARGADO")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("exito", false, "mensaje", "No tienes permisos para actualizar estados de pedidos."));
            }

            Pedido pedidoActualizado = miServicioDePedidos.actualizarEstadoPedido(id, nuevoEstado);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Estado del pedido actualizado correctamente.",
                "pedidoId", pedidoActualizado.getIdPedido(),
                "nuevoEstado", pedidoActualizado.getEstado()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("exito", false, "mensaje", e.getMessage()));
        }
    }

    /**
     * Devuelvo todos los pedidos que ha realizado el usuario que está actualmente autenticado.
     */
    @GetMapping("/mis-pedidos")
    @Operation(summary = "Consultar mis pedidos (Cliente)",
               description = "Yo devuelvo una lista de todos tus pedidos, opcionalmente filtrados por estado.")
    public ResponseEntity<?> obtenerMisPedidos(
            @RequestParam(required = false) String estado,
            java.security.Principal principal) {
        
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("exito", false, "mensaje", "Debes iniciar sesión para ver tus pedidos."));
        }

        try {
            Optional<Usuario> usuarioOpt = miServicioDeUsuarios.buscarPorCorreo(principal.getName());
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("exito", false, "mensaje", "Usuario autenticado no encontrado en el sistema."));
            }
            Usuario usuarioActual = usuarioOpt.get();

            List<Pedido> pedidosDelUsuario;
            if (estado != null && !estado.isEmpty()) {
                pedidosDelUsuario = miRepositorioDePedidos.findByUsuarioAndEstadoOrderByFechaPedidoDesc(usuarioActual, estado.toUpperCase());
            } else {
                pedidosDelUsuario = miRepositorioDePedidos.findByUsuarioOrderByFechaPedidoDesc(usuarioActual);
            }
            
            // Convertir a DTO detallado
            List<PedidoDetalladoDTO> pedidosDetallados = pedidosDelUsuario.stream()
                .map(miServicioDePedidos::convertirAPedidoDetallado)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(pedidosDetallados);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Tuve un error al consultar tus pedidos: " + e.getMessage()
            ));
        }
    }

    /**
     * Me encargo de cancelar un pedido por su ID.
     */
    @PutMapping("/cancelar/{id}")
    @Operation(summary = "Cancelar un pedido existente",
               description = "Yo cambio el estado de un pedido a 'CANCELADO'. Verifico que esté 'PENDIENTE' y que quien lo pide sea el dueño o un admin/encargado.")
    public ResponseEntity<?> cancelarPedido(@PathVariable Long id, java.security.Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("exito", false, "mensaje", "No estás autenticado para realizar esta acción."));
        }

        try {
            Optional<Usuario> usuarioOpt = miServicioDeUsuarios.buscarPorCorreo(principal.getName());
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("exito", false, "mensaje", "Usuario autenticado no encontrado en el sistema."));
            }
            Usuario usuarioAutenticado = usuarioOpt.get();

            Pedido pedidoCancelado = miServicioDePedidos.cancelarPedido(id, usuarioAutenticado.getIdUsuario(), usuarioAutenticado.getTipoUsuario());
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "¡Pedido cancelado con éxito!",
                "pedidoId", pedidoCancelado.getIdPedido()
            ));
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("exito", false, "mensaje", se.getMessage()));
        }
        catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("exito", false, "mensaje", e.getMessage()));
        }
    }
}