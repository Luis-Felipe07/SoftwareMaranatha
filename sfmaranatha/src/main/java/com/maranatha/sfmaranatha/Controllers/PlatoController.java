package com.maranatha.sfmaranatha.Controllers;

import com.maranatha.sfmaranatha.Service.PlatoService;
import com.maranatha.sfmaranatha.dto.PlatoDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections; // Para Collections.emptyList()
import java.util.List;

@RestController
@RequestMapping("/api/platos")
@Tag(name = "Platos", description = "Yo gestiono la información de los platos del restaurante.")
public class PlatoController {

    @Autowired
    private PlatoService miServicioDePlatos;

    /**
    * Yo devuelvo una lista de platos que pertenecen a un menú específico.
    * El frontend me llamará para poblar dinámicamente el menú del día.
    * @param idMenu El ID del menú del cual se quieren obtener los platos.
    */
    @GetMapping("/menu/{idMenu}")
    @Operation(summary = "Obtener platos por ID de Menú",
               description = "Yo devuelvo todos los platos asociados a un ID de menú específico.")
    public ResponseEntity<List<PlatoDTO>> obtenerPlatosPorMenu(@PathVariable Integer idMenu) {
        List<PlatoDTO> platos = miServicioDePlatos.obtenerPlatosPorIdMenu(idMenu);
        if (platos == null || platos.isEmpty()) { // Verificación adicional por si el servicio devuelve null
            return ResponseEntity.ok(Collections.emptyList()); // Devuelve lista vacía en lugar de NoContent para JS
        }
        return ResponseEntity.ok(platos);
    }
}