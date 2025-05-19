
package com.maranatha.sfmaranatha.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.maranatha.sfmaranatha.Model.Plato;
import java.util.List; 

@Repository
public interface PlatoRepository extends JpaRepository<Plato, Integer> {
    
    
    
    List<Plato> findByMenu_IdMenu(Integer idMenu);


}