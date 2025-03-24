package com.maranatha.sfmaranatha.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.maranatha.sfmaranatha.Model.Mesa;
import java.util.List;

public interface MesaRepository extends JpaRepository<Mesa, Long> {

   
    List<Mesa> findByEstado(String estado);
}
