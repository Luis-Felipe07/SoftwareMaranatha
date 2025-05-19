package com.maranatha.sfmaranatha.Controllers;

import com.maranatha.sfmaranatha.Model.Pedido;
import com.maranatha.sfmaranatha.Model.Usuario;
import com.maranatha.sfmaranatha.Repository.PedidoRepository; 
import com.maranatha.sfmaranatha.Service.PedidoService;
import com.maranatha.sfmaranatha.Service.UsuarioService; 
import com.maranatha.sfmaranatha.dto.PedidoRequestDTO;

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
public class PedidoController {

    @Autowired
    private PedidoRepository miRepositorioDePedidos; 

    @Autowired
    private PedidoService miServicioDePedidos; 

    @Autowired
    private UsuarioService miServicioDeUsuarios; 

    /**
     *  creo un nuevo pedido usando el DTO moderno PedidoRequestDTO.
     * 
     */
    @PostMapping("/nuevo")
    @Operation(summary = "Crear un nuevo pedido con DTO",
               description = "Yo recibo un PedidoRequestDTO y creo un nuevo pedido en el sistema.")
    public ResponseEntity<?> crearPedidoConDTO(@RequestBody PedidoRequestDTO datosDelPedido) {
        try {
            Pedido pedidoCreado = miServicioDePedidos.crearPedido(datosDelPedido);
            // Devuelvo una respuesta más completa, incluyendo el ID y el total del pedido.
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "¡Tu pedido ha sido guardado correctamente!",
                "pedidoId", pedidoCreado.getIdPedido(),
                "total", pedidoCreado.getTotal() // Es bueno devolver el total calculado por el backend
            ));
        } catch (SecurityException se) {
            // Si el servicio lanza una SecurityException (ej. encargado no válido)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("exito", false, "mensaje", se.getMessage()));
        } catch (RuntimeException e) { 
             
            return ResponseEntity.badRequest().body(Map.of("exito", false, "mensaje", "Error al guardar el pedido: " + e.getMessage()));
        } catch (Exception e) { 
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("exito", false, "mensaje", "Ocurrió un error inesperado procesando tu pedido."));
        }
    }

    /**
     * consulto todos los pedidos del sistema.
     * Opcionalmente, puedo filtrar por un estado específico si me lo pasan como parámetro.
     * Este endpoint es más para un administrador.
     */
    @GetMapping
    @Operation(summary = "Consultar todos los pedidos (Admin)",
               description = "Yo devuelvo todos los pedidos, o los filtro por estado si se especifica. Ideal para administradores.")
    public ResponseEntity<?> consultarTodosLosPedidos(@RequestParam(required = false) String estado) {
        try {
            List<Pedido> pedidos;
            if (estado != null && !estado.isEmpty()) {
                pedidos = miRepositorioDePedidos.findByEstado(estado.toUpperCase());
            } else {
                pedidos = miRepositorioDePedidos.findAll();
            }
            
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al consultar los pedidos: " + e.getMessage()
            ));
        }
    }

    /**
     * devuelvo todos los pedidos que ha realizado el usuario que está actualmente autenticado.
     * También puedo filtrar por estado .
     */
    @GetMapping("/mis-pedidos")
    @Operation(summary = "Consultar mis pedidos (Cliente)",
               description = "Yo devuelvo una lista de todos tus pedidos, opcionalmente filtrados por estado.")
    public ResponseEntity<?> obtenerMisPedidos(
            @RequestParam(required = false) String estado,
            java.security.Principal principal) { // Uso 'Principal' para saber quién está logueado.
        
        if (principal == null || principal.getName() == null) {
            // Si nadie está logueado, no puedo mostrar "mis pedidos".
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("exito", false, "mensaje", "Debes iniciar sesión para ver tus pedidos."));
        }

        try {
            // Busco al usuario en mi base de datos usando el correo que viene en 'Principal'.
            Optional<Usuario> usuarioOpt = miServicioDeUsuarios.buscarPorCorreo(principal.getName());
             if (usuarioOpt.isEmpty()) {
                 // Esto sería raro si 'Principal' existe, pero por si acaso.
                 return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("exito", false, "mensaje", "Usuario autenticado no encontrado en el sistema."));
            }
            Usuario usuarioActual = usuarioOpt.get();

            List<Pedido> pedidosDelUsuario;
            if (estado != null && !estado.isEmpty()) {
                // Uso el método del repositorio que busca por usuario Y estado.
                pedidosDelUsuario = miRepositorioDePedidos.findByUsuarioAndEstado(usuarioActual, estado.toUpperCase());
            } else {
                // Uso el método del repositorio que busca todos los pedidos de un usuario.
                pedidosDelUsuario = miRepositorioDePedidos.findByUsuario(usuarioActual);
            }
            
            // Aquí también podría mapear a un DTO si quiero controlar qué información envío.
            return ResponseEntity.ok(pedidosDelUsuario);

        } catch (Exception e) {
            // e.printStackTrace(); // Para mi diagnóstico en el servidor
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Tuve un error al consultar tus pedidos: " + e.getMessage()
            ));
        }
    }


    /**
     * me encargo de cancelar un pedido si me dan su ID.
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
                 return ResponseEntity.status(HttpStatus.FORBIDDEN) // O 401 si se considera un fallo de autenticación
                    .body(Map.of("exito", false, "mensaje", "Usuario autenticado no encontrado en el sistema."));
            }
            Usuario usuarioAutenticado = usuarioOpt.get();

            // Le paso al servicio el ID del pedido, el ID del usuario que lo pide y su rol.
            Pedido pedidoCancelado = miServicioDePedidos.cancelarPedido(id, usuarioAutenticado.getIdUsuario(), usuarioAutenticado.getTipoUsuario());
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "¡Pedido cancelado con éxito!",
                "pedidoId", pedidoCancelado.getIdPedido()
            ));
        } catch (SecurityException se) { // Si el servicio dice que no tiene permiso.
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("exito", false, "mensaje", se.getMessage()));
        }
        catch (Exception e) { // Otros errores (ej. pedido no encontrado, no está pendiente).
            // e.printStackTrace(); // Para mi diagnóstico
            return ResponseEntity.badRequest().body(Map.of("exito", false, "mensaje", e.getMessage()));
        }
    }

    
    /**
     *  creo un nuevo pedido a partir de un payload genérico (Map).
     */
    @PostMapping("/crear")
    @Operation(summary = "Crear un nuevo pedido (método genérico/antiguo)",
               description = "Yo creo un pedido a partir de un mapa de datos. Se recomienda usar el endpoint '/nuevo'.")
    public ResponseEntity<?> crearPedidoConMap(@RequestBody Map<String, Object> payload) {
        
        try {
            

            // Simulación de error si no hay forma de obtener el usuario:
            if (!payload.containsKey("usuarioId") && !payload.containsKey("correoCliente")) { // Ejemplo
                return ResponseEntity.badRequest().body(Map.of("exito", false, "mensaje", "Falta información del usuario para crear el pedido por este método."));
            }

        
            Pedido pedido = new Pedido();
            pedido.setNombreCliente((String) payload.get("nombreCliente"));
            

        
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(Map.of("exito", false, "mensaje", "El endpoint /crear necesita ser adaptado para el nuevo flujo de usuarios. Usa /api/pedidos/nuevo."));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al guardar el pedido (Map): " + e.getMessage()
            ));
        }
    }
}
