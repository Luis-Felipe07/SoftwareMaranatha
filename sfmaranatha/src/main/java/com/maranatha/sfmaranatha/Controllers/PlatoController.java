package com.maranatha.sfmaranatha.Controllers;

import com.maranatha.sfmaranatha.Service.PlatoService;
import com.maranatha.sfmaranatha.dto.PlatoDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/platos")
@CrossOrigin(origins = "*")
@Tag(name = "Platos", description = "Yo gestiono la información de los platos del restaurante.")
public class PlatoController {

    @Autowired
    private PlatoService miServicioDePlatos;
    
    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    /**
     * Devuelvo una lista de platos que pertenecen a un menú específico.
     */
    @GetMapping("/menu/{idMenu}")
    @Operation(summary = "Obtener platos por ID de Menú",
               description = "Yo devuelvo todos los platos asociados a un ID de menú específico.")
    public ResponseEntity<List<PlatoDTO>> obtenerPlatosPorMenu(@PathVariable Integer idMenu) {
        List<PlatoDTO> platos = miServicioDePlatos.obtenerPlatosPorIdMenu(idMenu);
        if (platos == null || platos.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(platos);
    }
    
    /**
     * Obtengo todos los platos del sistema.
     */
    @GetMapping
    @Operation(summary = "Obtener todos los platos",
               description = "Devuelvo todos los platos disponibles en el sistema.")
    public ResponseEntity<List<PlatoDTO>> obtenerTodosLosPlatos() {
        List<PlatoDTO> platos = miServicioDePlatos.obtenerTodosLosPlatos();
        return ResponseEntity.ok(platos);
    }
    
    /**
     * Obtengo un plato específico por su ID.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener plato por ID",
               description = "Devuelvo la información de un plato específico.")
    public ResponseEntity<?> obtenerPlatoPorId(@PathVariable Integer id) {
        try {
            PlatoDTO plato = miServicioDePlatos.obtenerPlatoPorId(id);
            return ResponseEntity.ok(plato);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Creo un nuevo plato con imagen.
     */
    @PostMapping(consumes = "multipart/form-data")
    @Operation(summary = "Crear nuevo plato",
               description = "Creo un nuevo plato con todos sus datos e imagen.")
    public ResponseEntity<?> crearPlato(
            @RequestParam("nombrePlato") String nombrePlato,
            @RequestParam("precio") BigDecimal precio,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("idMenu") Integer idMenu,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
        
        try {
            String imagenUrl = null;
            
            // Procesar imagen si se proporciona
            if (imagen != null && !imagen.isEmpty()) {
                imagenUrl = guardarImagen(imagen);
            }
            
            PlatoDTO nuevoPlato = new PlatoDTO();
            nuevoPlato.setNombrePlato(nombrePlato);
            nuevoPlato.setPrecio(precio);
            nuevoPlato.setDescripcion(descripcion);
            nuevoPlato.setImagenUrl(imagenUrl);
            
            PlatoDTO platoCreado = miServicioDePlatos.crearPlato(nuevoPlato, idMenu);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Plato creado exitosamente",
                "plato", platoCreado
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al crear el plato: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Actualizo un plato existente.
     */
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    @Operation(summary = "Actualizar plato",
               description = "Actualizo la información de un plato existente.")
    public ResponseEntity<?> actualizarPlato(
            @PathVariable Integer id,
            @RequestParam("nombrePlato") String nombrePlato,
            @RequestParam("precio") BigDecimal precio,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("idMenu") Integer idMenu,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
        
        try {
            PlatoDTO platoActualizado = new PlatoDTO();
            platoActualizado.setIdPlato(id);
            platoActualizado.setNombrePlato(nombrePlato);
            platoActualizado.setPrecio(precio);
            platoActualizado.setDescripcion(descripcion);
            
            // Si se proporciona nueva imagen, la guardamos
            if (imagen != null && !imagen.isEmpty()) {
                String nuevaImagenUrl = guardarImagen(imagen);
                platoActualizado.setImagenUrl(nuevaImagenUrl);
            }
            
            PlatoDTO resultado = miServicioDePlatos.actualizarPlato(id, platoActualizado, idMenu);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Plato actualizado exitosamente",
                "plato", resultado
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al actualizar el plato: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Elimino un plato.
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar plato",
               description = "Elimino un plato del sistema.")
    public ResponseEntity<?> eliminarPlato(@PathVariable Integer id) {
        try {
            miServicioDePlatos.eliminarPlato(id);
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Plato eliminado exitosamente"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al eliminar el plato: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Método auxiliar para guardar imágenes.
     */
    private String guardarImagen(MultipartFile imagen) throws IOException {
        // Crear directorio si no existe
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generar nombre único para la imagen
        String nombreOriginal = imagen.getOriginalFilename();
        String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
        String nombreUnico = UUID.randomUUID().toString() + extension;
        
        // Guardar archivo
        Path filePath = uploadPath.resolve(nombreUnico);
        Files.write(filePath, imagen.getBytes());
        
        // Retornar URL relativa
        return "/uploads/" + nombreUnico;
    }
}