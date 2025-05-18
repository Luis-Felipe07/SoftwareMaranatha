// En com.maranatha.sfmaranatha.Repository.PlatoRepository.java
package com.maranatha.sfmaranatha.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.maranatha.sfmaranatha.Model.Plato;
import java.util.List; // Asegúrate de importar List

@Repository
public interface PlatoRepository extends JpaRepository<Plato, Integer> {
    // Yo buscaré todos los platos que pertenezcan a un menú con el idMenu que me pases.
    // Spring Data JPA creará la consulta automáticamente por el nombre del método.
    
    
    List<Plato> findByMenu_IdMenu(Integer idMenu);


}