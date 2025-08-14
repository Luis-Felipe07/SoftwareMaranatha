package com.maranatha.sfmaranatha.Service;

import com.maranatha.sfmaranatha.Model.Menu;
import com.maranatha.sfmaranatha.Model.Plato;
import com.maranatha.sfmaranatha.Repository.MenuRepository;
import com.maranatha.sfmaranatha.Repository.PlatoRepository;
import com.maranatha.sfmaranatha.dto.PlatoDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlatoService {

    @Autowired
    private PlatoRepository miRepositorioDePlatos;
    
    @Autowired
    private MenuRepository miRepositorioDeMenus;

    /**
     * Me encargo de buscar todos los platos de un menú específico
     * y los transformo a PlatoDTO para enviarlos al frontend.
     */
    public List<PlatoDTO> obtenerPlatosPorIdMenu(Integer idMenu) {
        List<Plato> platosDelMenu = miRepositorioDePlatos.findByMenu_IdMenu(idMenu);
        return platosDelMenu.stream()
            .map(this::convertirAPlatoDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtengo todos los platos del sistema.
     */
    public List<PlatoDTO> obtenerTodosLosPlatos() {
        List<Plato> todosLosPlatos = miRepositorioDePlatos.findAll();
        return todosLosPlatos.stream()
            .map(this::convertirAPlatoDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtengo un plato específico por su ID.
     */
    public PlatoDTO obtenerPlatoPorId(Integer id) throws Exception {
        Plato plato = miRepositorioDePlatos.findById(id)
            .orElseThrow(() -> new Exception("Plato no encontrado con ID: " + id));
        return convertirAPlatoDTO(plato);
    }
    
    /**
     * Creo un nuevo plato.
     */
    @Transactional
    public PlatoDTO crearPlato(PlatoDTO platoDTO, Integer idMenu) throws Exception {
        Menu menu = miRepositorioDeMenus.findById(idMenu)
            .orElseThrow(() -> new Exception("Menú no encontrado con ID: " + idMenu));
        
        Plato nuevoPlato = new Plato();
        nuevoPlato.setNombrePlato(platoDTO.getNombrePlato());
        nuevoPlato.setPrecio(platoDTO.getPrecio());
        nuevoPlato.setDescripcion(platoDTO.getDescripcion());
        nuevoPlato.setImagenUrl(platoDTO.getImagenUrl());
        nuevoPlato.setMenu(menu);
        
        Plato platoGuardado = miRepositorioDePlatos.save(nuevoPlato);
        return convertirAPlatoDTO(platoGuardado);
    }
    
    /**
     * Actualizo un plato existente.
     */
    @Transactional
    public PlatoDTO actualizarPlato(Integer id, PlatoDTO platoDTO, Integer idMenu) throws Exception {
        Plato platoExistente = miRepositorioDePlatos.findById(id)
            .orElseThrow(() -> new Exception("Plato no encontrado con ID: " + id));
        
        // Actualizar campos
        platoExistente.setNombrePlato(platoDTO.getNombrePlato());
        platoExistente.setPrecio(platoDTO.getPrecio());
        platoExistente.setDescripcion(platoDTO.getDescripcion());
        
        // Solo actualizar imagen si se proporciona una nueva
        if (platoDTO.getImagenUrl() != null) {
            platoExistente.setImagenUrl(platoDTO.getImagenUrl());
        }// Actualizar menú si cambió
       if (idMenu != null && !idMenu.equals(platoExistente.getMenu().getIdMenu())) {
           Menu nuevoMenu = miRepositorioDeMenus.findById(idMenu)
               .orElseThrow(() -> new Exception("Menú no encontrado con ID: " + idMenu));
           platoExistente.setMenu(nuevoMenu);
       }
       
       Plato platoActualizado = miRepositorioDePlatos.save(platoExistente);
       return convertirAPlatoDTO(platoActualizado);
   }
   
   /**
    * Elimino un plato.
    */
   @Transactional
   public void eliminarPlato(Integer id) throws Exception {
       if (!miRepositorioDePlatos.existsById(id)) {
           throw new Exception("Plato no encontrado con ID: " + id);
       }
       miRepositorioDePlatos.deleteById(id);
   }
   
   /**
    * Método auxiliar para convertir entidad a DTO.
    */
   private PlatoDTO convertirAPlatoDTO(Plato plato) {
       return new PlatoDTO(
           plato.getIdPlato(),
           plato.getNombrePlato(),
           plato.getPrecio(),
           plato.getDescripcion(),
           plato.getImagenUrl()
       );
   }
}