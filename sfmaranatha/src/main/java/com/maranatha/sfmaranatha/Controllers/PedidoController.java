package com.maranatha.sfmaranatha.Controllers;

import com.maranatha.sfmaranatha.Model.Pedido;
import com.maranatha.sfmaranatha.Model.Usuario; // Necesito Usuario para obtener sus datos
import com.maranatha.sfmaranatha.Repository.PedidoRepository; // Para consultar todos o por estado
import com.maranatha.sfmaranatha.Service.PedidoService;
import com.maranatha.sfmaranatha.Service.UsuarioService; // Para buscar el usuario autenticado
import com.maranatha.sfmaranatha.dto.PedidoRequestDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus; // Para el estado UNAUTHORIZED y FORBIDDEN
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// import java.math.BigDecimal; // No lo uso directamente aquí ahora
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors; // Para el filtro manual en obtenerMisPedidos

@RestController
@RequestMapping("/api/pedidos")
@Tag(name = "Pedidos", description = "Yo me encargo de todo lo relacionado con los pedidos de los clientes.")
public class PedidoController {

    @Autowired
    private PedidoRepository miRepositorioDePedidos; // Lo uso para consultas generales

    @Autowired
    private PedidoService miServicioDePedidos; // Mi lógica principal de pedidos está aquí

    @Autowired
    private UsuarioService miServicioDeUsuarios; // Lo necesito para obtener info del usuario autenticado

    /**
     * Yo creo un nuevo pedido usando el DTO moderno (PedidoRequestDTO).
     * Este es el endpoint que debería usar tu frontend ahora.
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
        } catch (RuntimeException e) { // Capturo RuntimeException para errores de negocio o datos
            // Logueo el error en el servidor para mi diagnóstico
            // e.printStackTrace(); 
            return ResponseEntity.badRequest().body(Map.of("exito", false, "mensaje", "Error al guardar el pedido: " + e.getMessage()));
        } catch (Exception e) { // Captura general para otros errores inesperados
            // e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("exito", false, "mensaje", "Ocurrió un error inesperado procesando tu pedido."));
        }
    }

    /**
     * Yo consulto todos los pedidos del sistema.
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
            // Aquí podrías mapear a un PedidoDTO si no quieres exponer toda la entidad.
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al consultar los pedidos: " + e.getMessage()
            ));
        }
    }

    /**
     * Yo devuelvo todos los pedidos que ha realizado el usuario que está actualmente autenticado.
     * También puedo filtrar por estado si me lo piden.
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
     * Yo me encargo de cancelar un pedido si me dan su ID.
     * Pero solo si el pedido está "PENDIENTE" y quien lo pide tiene permiso.
     * El usuario debe estar autenticado para usarme.
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

    // Mantengo el endpoint original de /crear por si alguna parte antigua del sistema lo usa,
    // pero recomiendo migrar todo a /nuevo con PedidoRequestDTO.
    /**
     * Yo creo un nuevo pedido a partir de un payload genérico (Map).
     * Este es un método más antiguo, es mejor usar el endpoint /nuevo con PedidoRequestDTO.
     */
    @PostMapping("/crear")
    @Operation(summary = "Crear un nuevo pedido (método genérico/antiguo)",
               description = "Yo creo un pedido a partir de un mapa de datos. Se recomienda usar el endpoint '/nuevo'.")
    public ResponseEntity<?> crearPedidoConMap(@RequestBody Map<String, Object> payload) {
        // La lógica aquí es más manual y propensa a errores que usando un DTO.
        // Deberías adaptarla o idealmente eliminarla y usar solo /nuevo.
        // Por ahora, la dejo como estaba en tu código original, pero ten cuidado.
        try {
            // Esta lógica necesitaría una revisión profunda para alinearse con el nuevo flujo de usuarios.
            // Por ejemplo, ¿de dónde saco el usuarioId para asociar este pedido?
            // Si no se pasa, no puedo crear un Pedido porque la relación con Usuario es NOT NULL.
            // Por ahora, voy a asumir que este endpoint ya no se usa o se adaptará por separado.
            // Si se usa, necesitaría recibir un 'usuarioId' o datos para crear/buscar un usuario.

            // Simulación de error si no hay forma de obtener el usuario:
            if (!payload.containsKey("usuarioId") && !payload.containsKey("correoCliente")) { // Ejemplo
                 return ResponseEntity.badRequest().body(Map.of("exito", false, "mensaje", "Falta información del usuario para crear el pedido por este método."));
            }

            // ... (lógica original de tu método crearPedido con Map) ...
            // Esta parte es solo un placeholder de tu lógica original, necesitaría ser adaptada:
            Pedido pedido = new Pedido();
            pedido.setNombreCliente((String) payload.get("nombreCliente"));
            // ... y así sucesivamente.

            // Pedido nuevoPedido = miRepositorioDePedidos.save(pedido); // Guardarías el pedido
            // return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Pedido guardado (Map)", "pedidoId", nuevoPedido.getIdPedido()));
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(Map.of("exito", false, "mensaje", "El endpoint /crear necesita ser adaptado para el nuevo flujo de usuarios. Usa /api/pedidos/nuevo."));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al guardar el pedido (Map): " + e.getMessage()
            ));
        }
    }
}
