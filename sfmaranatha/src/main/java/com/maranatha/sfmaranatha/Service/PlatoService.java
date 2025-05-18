package com.maranatha.sfmaranatha.Service;

import com.maranatha.sfmaranatha.Model.Plato;
import com.maranatha.sfmaranatha.Repository.PlatoRepository; // Asegúrate que PlatoRepository usa <Plato, Integer>
import com.maranatha.sfmaranatha.dto.PlatoDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlatoService {

    @Autowired
    private PlatoRepository miRepositorioDePlatos;

    /**
    *  me encargo de buscar todos los platos de un menú específico
    * y los transformo a PlatoDTO para enviarlos al frontend.
    * Para esto, yo utilizo el método 'findByMenu_IdMenu' que debe estar definido
    * en mi PlatoRepository.
    */
    public List<PlatoDTO> obtenerPlatosPorIdMenu(Integer idMenu) {
        
        //  utilizo directamente el método del repositorio para obtener los platos filtrados.
        // Esto es mucho más eficiente que traer todos los platos y filtrarlos en Java.
        List<Plato> platosDelMenu = miRepositorioDePlatos.findByMenu_IdMenu(idMenu);

        // Luego, yo transformo la lista de entidades Plato a una lista de PlatoDTO.
        return platosDelMenu.stream()
            .map(plato -> new PlatoDTO(
                plato.getIdPlato(),
                plato.getNombrePlato(),
                plato.getPrecio(),
                plato.getDescripcion(),
                plato.getImagenUrl()
            ))
            .collect(Collectors.toList());
    }
}