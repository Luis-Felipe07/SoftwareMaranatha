package com.maranatha.sfmaranatha.Repository;

import com.maranatha.sfmaranatha.Model.LikeCalificacion;
import com.maranatha.sfmaranatha.Model.Usuario;
import com.maranatha.sfmaranatha.Model.Calificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeCalificacionRepository extends JpaRepository<LikeCalificacion, Long> {
    
    // Buscar like por usuario y calificación
    Optional<LikeCalificacion> findByUsuarioAndCalificacion(Usuario usuario, Calificacion calificacion);
    
    // Contar likes de una calificación
    Long countByCalificacion(Calificacion calificacion);
    
    // Verificar si existe un like
    Boolean existsByUsuarioAndCalificacion(Usuario usuario, Calificacion calificacion);
}