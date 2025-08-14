package com.maranatha.sfmaranatha.Controllers;

import com.maranatha.sfmaranatha.Model.Calificacion;
import com.maranatha.sfmaranatha.Model.RespuestaCalificacion;
import com.maranatha.sfmaranatha.Service.CalificacionService;
import com.maranatha.sfmaranatha.dto.CalificacionDTO;
import com.maranatha.sfmaranatha.dto.EstadisticasCalificacionDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/calificaciones")
@Tag(name = "Calificaciones", description = "Gestiono las calificaciones y comentarios del restaurante")
@CrossOrigin(origins = "*")
public class CalificacionController {

    @Autowired
    private CalificacionService calificacionService;

    /**
     * Crear una nueva calificación 
     */
    @PostMapping("/nueva")
    @Operation(summary = "Crear nueva calificación",
               description = "Recibo y guardo una nueva calificación del restaurante")
    public ResponseEntity<?> crearCalificacion(@RequestBody CalificacionDTO calificacionDTO) {
        try {
            Calificacion nuevaCalificacion = calificacionService.crearCalificacion(calificacionDTO);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "¡Gracias por tu calificación!",
                "idCalificacion", nuevaCalificacion.getIdCalificacion()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al guardar la calificación: " + e.getMessage()
            ));
        }
    }

    /**
     * Crear calificación sin autenticación 
     */
    @PostMapping("/nueva-publica")
    @Operation(summary = "Crear calificación pública",
               description = "Crear calificación sin requerir autenticación")
    public ResponseEntity<?> crearCalificacionPublica(@RequestBody CalificacionDTO calificacionDTO) {
        try {
            Calificacion nuevaCalificacion = calificacionService.crearCalificacionSinAuth(calificacionDTO);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "¡Gracias por tu calificación!",
                "idCalificacion", nuevaCalificacion.getIdCalificacion()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al guardar la calificación: " + e.getMessage()
            ));
        }
    }

    /**
     * Obtener estadísticas de calificaciones
     */
    @GetMapping("/estadisticas")
    @Operation(summary = "Obtener estadísticas",
               description = "Devuelvo las estadísticas generales de calificaciones")
    public ResponseEntity<?> obtenerEstadisticas() {
        try {
            EstadisticasCalificacionDTO estadisticas = calificacionService.obtenerEstadisticas();
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", true,
                "mensaje", "Error al obtener estadísticas: " + e.getMessage()
            ));
        }
    }

    /**
     * Obtener comentarios recientes con paginación
     */
    @GetMapping("/comentarios")
    @Operation(summary = "Obtener comentarios recientes",
               description = "Devuelvo los comentarios más recientes con paginación")
    public ResponseEntity<?> obtenerComentariosRecientes(
            @RequestParam(name = "pagina", defaultValue = "1") int pagina,
            @RequestParam(name = "limite", defaultValue = "5") int limite) {
        
        try {
            Map<String, Object> resultado = calificacionService.obtenerComentariosRecientes(pagina, limite);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", true,
                "mensaje", "Error al obtener comentarios: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Endpoint temporal para debug - obtener todas las calificaciones sin filtros
     */
    @GetMapping("/comentarios-debug")
    @Operation(summary = "Debug - Obtener todos los comentarios sin filtros")
    public ResponseEntity<?> obtenerComentariosDebug(
            @RequestParam(name = "pagina", defaultValue = "1") int pagina,
            @RequestParam(name = "limite", defaultValue = "5") int limite) {
        
        try {
            Map<String, Object> resultado = calificacionService.obtenerComentariosDebug(pagina, limite);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", true,
                "mensaje", "Error al obtener comentarios debug: " + e.getMessage()
            ));
        }
    }

    /**
     * Toggle like en calificación
     */
    @PostMapping("/{id}/like")
    @Operation(summary = "Dar/quitar like a calificación",
               description = "Permite dar o quitar like a una calificación")
    public ResponseEntity<?> toggleLike(@PathVariable Long id) {
        try {
            Map<String, Object> resultado = calificacionService.toggleLike(id);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al procesar like: " + e.getMessage()
            ));
        }
    }

    /**
     * Responder a una calificación
     */
    @PostMapping("/{id}/responder")
    @Operation(summary = "Responder a calificación",
               description = "Permite responder a una calificación de otro usuario")
    public ResponseEntity<?> responderCalificacion(
            @PathVariable Long id,
            @RequestBody Map<String, String> datos) {
        
        try {
            String comentario = datos.get("comentario");
            if (comentario == null || comentario.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "exito", false,
                    "mensaje", "El comentario es requerido"
                ));
            }
            
            RespuestaCalificacion respuesta = calificacionService.responderCalificacion(id, comentario);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Respuesta enviada correctamente",
                "respuesta", respuesta
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al enviar respuesta: " + e.getMessage()
            ));
        }
    }

    /**
     * Obtener calificación específica con detalles
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener calificación específica",
               description = "Obtiene una calificación con todos sus detalles, likes y respuestas")
    public ResponseEntity<?> obtenerCalificacion(@PathVariable Long id) {
        try {
            Map<String, Object> calificacion = calificacionService.obtenerCalificacionConDetalles(id);
            return ResponseEntity.ok(calificacion);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", true,
                "mensaje", "Calificación no encontrada: " + e.getMessage()
            ));
        }
    }

    /**
     * Editar calificación propia
     */
    @PutMapping("/{id}")
    @Operation(summary = "Editar calificación propia",
               description = "Permite editar una calificación propia")
    public ResponseEntity<?> editarCalificacion(
            @PathVariable Long id,
            @RequestBody CalificacionDTO datosActualizados) {
        
        try {
            Calificacion calificacionActualizada = calificacionService.editarCalificacion(id, datosActualizados);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Calificación actualizada exitosamente",
                "calificacion", calificacionActualizada
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al actualizar calificación: " + e.getMessage()
            ));
        }
    }

    /**
     * Eliminar calificación propia
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar calificación propia",
               description = "Permite eliminar una calificación propia")
    public ResponseEntity<?> eliminarCalificacion(@PathVariable Long id) {
        try {
            calificacionService.eliminarCalificacion(id);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Calificación eliminada exitosamente"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al eliminar calificación: " + e.getMessage()
            ));
        }
    }

    /**
     * Eliminar calificación por email método legacy
     */
    @DeleteMapping("/{id}/por-email")
    @Operation(summary = "Eliminar calificación por email",
               description = "Permite eliminar calificación verificando el email (compatibilidad)")
    public ResponseEntity<?> eliminarCalificacionPorEmail(
            @PathVariable Long id,
            @RequestBody Map<String, String> datos) {
        
        try {
            String email = datos.get("email");
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "exito", false,
                    "mensaje", "Email requerido para eliminar la calificación"
                ));
            }
            
            calificacionService.eliminarCalificacion(id, email);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Calificación eliminada exitosamente"
            ));
            
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "exito", false,
                "mensaje", e.getMessage()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "exito", false,
                "mensaje", "Calificación no encontrada"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "exito", false,
                "mensaje", "Error al eliminar la calificación: " + e.getMessage()
            ));
        }
    }

    /**
     * Eliminar respuesta
     */
    @DeleteMapping("/respuesta/{idRespuesta}")
    @Operation(summary = "Eliminar respuesta",
               description = "Permite eliminar una respuesta propia")
    public ResponseEntity<?> eliminarRespuesta(@PathVariable Long idRespuesta) {
        try {
            calificacionService.eliminarRespuesta(idRespuesta);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Respuesta eliminada exitosamente"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al eliminar respuesta: " + e.getMessage()
            ));
        }
    }

    /**
     * Obtener mis calificaciones
     */
    @GetMapping("/mis-calificaciones")
    @Operation(summary = "Obtener mis calificaciones",
               description = "Obtiene las calificaciones del usuario autenticado")
    public ResponseEntity<?> obtenerMisCalificaciones() {
        try {
            List<Calificacion> calificaciones = calificacionService.obtenerMisCalificaciones();
            return ResponseEntity.ok(calificaciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", true,
                "mensaje", "Error al obtener calificaciones: " + e.getMessage()
            ));
        }
    }

    /**
     * Obtener todas las calificaciones solo para admin
     */
    @GetMapping("/todas")
    @Operation(summary = "Obtener todas las calificaciones",
               description = "Devuelvo todas las calificaciones para moderación (solo admin)")
    public ResponseEntity<?> obtenerTodasLasCalificaciones(Principal principal) {
        try {
            
            //  todas las calificaciones
            List<Calificacion> calificaciones = calificacionService.obtenerTodasLasCalificaciones();
            return ResponseEntity.ok(calificaciones);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", true,
                "mensaje", "Error al obtener calificaciones: " + e.getMessage()
            ));
        }
    }

    /**
     * Actualizar estado de calificación aprobar/rechazar
     */
    @PutMapping("/{id}/estado")
    @Operation(summary = "Actualizar estado de calificación",
               description = "Cambio el estado de una calificación (APROBADA/RECHAZADA)")
    public ResponseEntity<?> actualizarEstadoCalificacion(
            @PathVariable Long id,
            @RequestParam String nuevoEstado) {
        
        try {
            // Validar estado
            if (!nuevoEstado.equals("APROBADA") && !nuevoEstado.equals("RECHAZADA") && !nuevoEstado.equals("PENDIENTE")) {
                return ResponseEntity.badRequest().body(Map.of(
                    "exito", false,
                    "mensaje", "Estado no válido. Use: APROBADA, RECHAZADA o PENDIENTE"
                ));
            }
            
            Calificacion calificacionActualizada = calificacionService.actualizarEstadoCalificacion(id, nuevoEstado);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Estado actualizado correctamente",
                "calificacion", calificacionActualizada
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al actualizar estado: " + e.getMessage()
            ));
        }
    }

    /**
     * Obtener calificaciones por email
     */
    @GetMapping("/por-email")
    @Operation(summary = "Obtener calificaciones por email",
               description = "Busco las calificaciones de un cliente específico por su email")
    public ResponseEntity<?> obtenerCalificacionesPorEmail(@RequestParam String email) {
        try {
            List<Calificacion> calificaciones = calificacionService.obtenerCalificacionesPorEmail(email);
            return ResponseEntity.ok(calificaciones);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", true,
                "mensaje", "Error al buscar calificaciones: " + e.getMessage()
            ));
        }
    }
}