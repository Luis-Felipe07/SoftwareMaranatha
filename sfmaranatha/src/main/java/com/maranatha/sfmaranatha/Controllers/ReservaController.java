package com.maranatha.sfmaranatha.Controllers;

import com.maranatha.sfmaranatha.Model.Reserva;
import com.maranatha.sfmaranatha.Model.Usuario;
import com.maranatha.sfmaranatha.Service.ReservaService;
import com.maranatha.sfmaranatha.Service.UsuarioService;
import com.maranatha.sfmaranatha.dto.ReservaRequestDTO;
import com.maranatha.sfmaranatha.dto.ReservaDetalladaDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reservas")
@Tag(name = "Reservas", description = "Gestiono las reservas de mesas del restaurante")
@CrossOrigin(origins = "*")
public class ReservaController {

    @Autowired
    private ReservaService reservaService;
    
    @Autowired
    private UsuarioService usuarioService;

    /**
     * Crear una nueva reserva
     */
    @PostMapping
    @Operation(summary = "Crear nueva reserva",
               description = "Creo una nueva reserva de mesa con o sin pedido anticipado")
    public ResponseEntity<?> crearReserva(@RequestBody ReservaRequestDTO datosReserva) {
        try {
            Reserva nuevaReserva = reservaService.crearReserva(datosReserva);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Reserva creada exitosamente",
                "idReserva", nuevaReserva.getIdReserva(),
                "numeroConfirmacion", "RES-" + nuevaReserva.getIdReserva()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al crear la reserva: " + e.getMessage()
            ));
        }
    }

    /**
     * Obtener todas las reservas solo para ADMIN o ENCARGADO
     */
    @GetMapping
    @Operation(summary = "Obtener todas las reservas",
               description = "Devuelvo todas las reservas del sistema (solo ADMIN/ENCARGADO)")
    public ResponseEntity<?> obtenerTodasLasReservas(java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("exito", false, "mensaje", "Debe iniciar sesión"));
        }

        try {
            Optional<Usuario> usuarioOpt = usuarioService.buscarPorCorreo(principal.getName());
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("exito", false, "mensaje", "Usuario no encontrado"));
            }

            Usuario usuario = usuarioOpt.get();
            // Verificar que sea ADMIN o ENCARGADO
            if (!usuario.getTipoUsuario().equals("ADMIN") && !usuario.getTipoUsuario().equals("ENCARGADO")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("exito", false, "mensaje", "No tiene permisos para ver todas las reservas"));
            }

            // Usar el nuevo método que devuelve DTOs con datos completos
            List<ReservaDetalladaDTO> reservas = reservaService.obtenerReservasDetalladas();
            return ResponseEntity.ok(reservas);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al obtener reservas: " + e.getMessage()
            ));
        }
    }

    /**
     * Obtener todas las reservas del usuario actual
     */
    @GetMapping("/mis-reservas")
    @Operation(summary = "Obtener mis reservas",
               description = "Devuelvo todas las reservas del usuario autenticado")
    public ResponseEntity<?> obtenerMisReservas(java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("exito", false, "mensaje", "Debe iniciar sesión"));
        }

        try {
            Optional<Usuario> usuarioOpt = usuarioService.buscarPorCorreo(principal.getName());
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("exito", false, "mensaje", "Usuario no encontrado"));
            }

            List<Reserva> reservas = reservaService.obtenerReservasPorUsuario(usuarioOpt.get().getIdUsuario());
            return ResponseEntity.ok(reservas);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al obtener reservas: " + e.getMessage()
            ));
        }
    }

    /**
     * Obtener una reserva específica
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener reserva por ID",
               description = "Devuelvo los detalles de una reserva específica")
    public ResponseEntity<?> obtenerReserva(@PathVariable Long id) {
        try {
            Reserva reserva = reservaService.obtenerReservaPorId(id);
            return ResponseEntity.ok(reserva);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Actualizar estado de reserva
     */
    @PutMapping("/{id}/estado")
    @Operation(summary = "Actualizar estado de reserva",
               description = "Actualizo el estado de una reserva (CONFIRMADA, CANCELADA, etc.)")
    public ResponseEntity<?> actualizarEstadoReserva(
            @PathVariable Long id,
            @RequestParam String nuevoEstado) {
        try {
            Reserva reservaActualizada = reservaService.actualizarEstadoReserva(id, nuevoEstado);
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Estado actualizado correctamente",
                "reserva", reservaActualizada
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al actualizar estado: " + e.getMessage()
            ));
        }
    }

    /**
     * Cancelar una reserva
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Cancelar reserva",
               description = "Cancelo una reserva y libero la mesa")
    public ResponseEntity<?> cancelarReserva(@PathVariable Long id) {
        try {
            reservaService.cancelarReserva(id);
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Reserva cancelada exitosamente"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al cancelar reserva: " + e.getMessage()
            ));
        }
    }
}