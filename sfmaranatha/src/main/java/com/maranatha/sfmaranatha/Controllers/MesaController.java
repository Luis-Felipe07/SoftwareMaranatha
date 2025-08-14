package com.maranatha.sfmaranatha.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.maranatha.sfmaranatha.Model.Mesa;
import com.maranatha.sfmaranatha.Repository.MesaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

@RestController
@RequestMapping("/api/mesas")
@Tag(name = "Mesas", description = "Gestiono las mesas del restaurante")
@CrossOrigin(origins = "*")
public class MesaController {

    @Autowired
    private MesaRepository mesaRepository;

    /**
     * Obtener todas las mesas
     */
    @GetMapping
    @Operation(summary = "Obtener todas las mesas",
               description = "Devuelvo todas las mesas del restaurante")
    public ResponseEntity<List<Mesa>> obtenerTodasLasMesas() {
        return ResponseEntity.ok(mesaRepository.findAll());
    }

    /**
     * Obtener mesas disponibles para deshabilitar
     */
    @GetMapping("/disponibles")
    @Operation(summary = "Obtener mesas disponibles",
               description = "Devuelvo las mesas que están disponibles y se pueden deshabilitar")
    public ResponseEntity<List<Mesa>> obtenerMesasDisponibles() {
        List<Mesa> mesasDisponibles = mesaRepository.findByEstado("Disponible");
        return ResponseEntity.ok(mesasDisponibles);
    }

    /**
     * Verificar disponibilidad de todas las mesas
     */
    @GetMapping("/disponibilidad")
    @Operation(summary = "Obtener disponibilidad de mesas",
               description = "Devuelvo el estado de disponibilidad de todas las mesas")
    public ResponseEntity<List<Map<String, Object>>> obtenerDisponibilidadMesas() {
        List<Mesa> mesas = mesaRepository.findAll();
        List<Map<String, Object>> disponibilidad = mesas.stream().map(mesa -> {
            Map<String, Object> mesaInfo = new HashMap<>();
            mesaInfo.put("numero", mesa.getNumero());
            mesaInfo.put("disponible", mesa.getEstado().equals("Disponible"));
            mesaInfo.put("estado", mesa.getEstado());
            return mesaInfo;
        }).toList();
        
        return ResponseEntity.ok(disponibilidad);
    }

    /**
     * Verificar si una mesa específica está disponible
     */
    @GetMapping("/{numeroMesa}/disponible")
    @Operation(summary = "Verificar disponibilidad de una mesa específica",
               description = "Verifico si una mesa específica está disponible")
    public ResponseEntity<Map<String, Object>> verificarDisponibilidadMesa(@PathVariable Integer numeroMesa) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Mesa mesa = mesaRepository.findAll().stream()
                .filter(m -> m.getNumero() == numeroMesa)
                .findFirst()
                .orElse(null);
            
            if (mesa == null) {
                response.put("disponible", false);
                response.put("mensaje", "Mesa no encontrada");
                return ResponseEntity.notFound().build();
            }
            
            boolean disponible = mesa.getEstado().equals("Disponible");
            response.put("disponible", disponible);
            response.put("estado", mesa.getEstado());
            response.put("numero", mesa.getNumero());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("disponible", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Obtener mesas que no están disponibles ocupadas o inactivas
     */
    @GetMapping("/no-disponibles")
    @Operation(summary = "Obtener mesas no disponibles",
               description = "Devuelvo las mesas que están ocupadas o inactivas para poder habilitarlas")
    public ResponseEntity<List<Mesa>> obtenerMesasNoDisponibles() {
        List<Mesa> mesas = mesaRepository.findAll();
        List<Mesa> mesasNoDisponibles = mesas.stream()
            .filter(mesa -> !mesa.getEstado().equals("Disponible"))
            .toList();
        return ResponseEntity.ok(mesasNoDisponibles);
    }

    /**
     * Obtener mesas ocupadas
     */
    @GetMapping("/ocupadas")
    @Operation(summary = "Obtener mesas ocupadas",
               description = "Devuelvo solo las mesas con estado 'Ocupada'")
    public ResponseEntity<List<Mesa>> obtenerMesasOcupadas() {
        return ResponseEntity.ok(mesaRepository.findByEstado("Ocupada"));
    }

    /**
     * Habilitar una mesa cambiar su estado a Disponible
     */
    @PutMapping("/{id}/habilitar")
    @Operation(summary = "Habilitar una mesa",
               description = "Cambio el estado de una mesa a 'Disponible'")
    public ResponseEntity<?> habilitarMesa(@PathVariable Long id) {
        try {
            Optional<Mesa> mesaOpt = mesaRepository.findById(id);
            if (mesaOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Mesa mesa = mesaOpt.get();
            mesa.setEstado("Disponible");
            mesaRepository.save(mesa);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Mesa " + mesa.getNumero() + " habilitada correctamente",
                "mesa", mesa
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al habilitar la mesa: " + e.getMessage()
            ));
        }
    }

    /**
     * Deshabilitar una mesa cambiar su estado a Ocupada
     */
    @PutMapping("/{id}/deshabilitar")
    @Operation(summary = "Deshabilitar una mesa",
               description = "Cambio el estado de una mesa a 'Ocupada' para uso manual")
    public ResponseEntity<?> deshabilitarMesa(@PathVariable Long id) {
        try {
            Optional<Mesa> mesaOpt = mesaRepository.findById(id);
            if (mesaOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Mesa mesa = mesaOpt.get();
            
            if (!mesa.getEstado().equals("Disponible")) {
                return ResponseEntity.badRequest().body(Map.of(
                    "exito", false,
                    "mensaje", "La mesa ya está ocupada o no disponible"
                ));
            }
            
            mesa.setEstado("Ocupada");
            mesaRepository.save(mesa);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Mesa " + mesa.getNumero() + " marcada como ocupada",
                "mesa", mesa
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al deshabilitar la mesa: " + e.getMessage()
            ));
        }
    }

    /**
     * Ocupar una mesa por número para reservas
     */
    @PutMapping("/{numeroMesa}/ocupar")
    @Operation(summary = "Ocupar una mesa",
               description = "Cambio el estado de una mesa a 'Ocupada'")
    public ResponseEntity<?> ocuparMesa(@PathVariable Integer numeroMesa) {
        try {
            Mesa mesa = mesaRepository.findAll().stream()
                .filter(m -> m.getNumero() == numeroMesa)
                .findFirst()
                .orElse(null);
            
            if (mesa == null) {
                return ResponseEntity.notFound().build();
            }
            
            if (!mesa.getEstado().equals("Disponible")) {
                return ResponseEntity.badRequest().body(Map.of(
                    "exito", false,
                    "mensaje", "La mesa no está disponible"
                ));
            }
            
            mesa.setEstado("Ocupada");
            mesaRepository.save(mesa);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Mesa " + mesa.getNumero() + " ocupada correctamente",
                "mesa", mesa
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al ocupar la mesa: " + e.getMessage()
            ));
        }
    }

    /**
     * Cambiar estado de una mesa
     */
    @PutMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado de mesa",
               description = "Cambio el estado de una mesa a cualquier estado válido")
    public ResponseEntity<?> cambiarEstadoMesa(@PathVariable Long id, @RequestParam String nuevoEstado) {
        try {
            Optional<Mesa> mesaOpt = mesaRepository.findById(id);
            if (mesaOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Mesa mesa = mesaOpt.get();
            mesa.setEstado(nuevoEstado);
            mesaRepository.save(mesa);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Estado de Mesa " + mesa.getNumero() + " actualizado a: " + nuevoEstado,
                "mesa", mesa
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al cambiar estado de la mesa: " + e.getMessage()
            ));
        }
    }
}