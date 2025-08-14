package com.maranatha.sfmaranatha.Repository;

import com.maranatha.sfmaranatha.Model.RespuestaCalificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RespuestaCalificacionRepository extends JpaRepository<RespuestaCalificacion, Long> {
    // Métodos básicos heredados de JpaRepository
}