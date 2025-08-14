package com.maranatha.sfmaranatha.Repository;

import com.maranatha.sfmaranatha.Model.Calificacion;
import com.maranatha.sfmaranatha.Model.Pedido;
import com.maranatha.sfmaranatha.Model.Usuario;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CalificacionRepository extends JpaRepository<Calificacion, Long> {
    
    // Encontrar todas las calificaciones aprobadas
    List<Calificacion> findByEstadoOrderByFechaCalificacionDesc(String estado);
    
    // Encontrar calificaciones aprobadas con paginación
    Page<Calificacion> findByEstadoOrderByFechaCalificacionDesc(String estado, Pageable pageable);
    
    // Contar calificaciones aprobadas
    Long countByEstado(String estado);
    
    // Contar calificaciones aprobadas y activas
    Long countByEstadoAndActivo(String estado, Boolean activo);
    
    // Calcular promedio general de todas las calificaciones aprobadas y activas
    @Query("SELECT AVG(c.promedioGeneral) FROM Calificacion c WHERE c.estado = 'APROBADA' AND c.activo = true")
    BigDecimal calcularPromedioGeneral();
    
    // Contar calificaciones por valor  para el promedio general
    @Query("SELECT ROUND(c.promedioGeneral), COUNT(c) FROM Calificacion c WHERE c.estado = 'APROBADA' AND c.activo = true GROUP BY ROUND(c.promedioGeneral)")
    List<Object[]> contarPorCalificacion();
    
    // Obtener promedios por categoría
    @Query("SELECT AVG(c.calificacionComida), AVG(c.calificacionServicio), AVG(c.calificacionLimpieza), " +
           "AVG(c.calificacionPrecio), AVG(c.calificacionAmbiente) FROM Calificacion c WHERE c.estado = 'APROBADA' AND c.activo = true")
    List<Object[]> obtenerPromediosPorCategoria();
    
    // Contar recomendaciones
    Long countByEstadoAndRecomendaria(String estado, Boolean recomendaria);
    
    // Contar recomendaciones activas
    Long countByEstadoAndRecomendariaAndActivo(String estado, Boolean recomendaria, Boolean activo);
    
    // Buscar por email
    List<Calificacion> findByEmailClienteOrderByFechaCalificacionDesc(String email);
    
    // Buscar calificaciones de un usuario
    List<Calificacion> findByUsuarioOrderByFechaCalificacionDesc(Usuario usuario);
    
    // Buscar calificación por pedido
    Optional<Calificacion> findByPedido(Pedido pedido);
    
    // Buscar calificaciones con usuario solamente (sin múltiples bags)
    @Query("SELECT c FROM Calificacion c " +
           "LEFT JOIN FETCH c.usuario u " +
           "WHERE c.estado = 'APROBADA' AND c.activo = true " +
           "ORDER BY c.fechaCalificacion DESC")
    Page<Calificacion> findAllConDetalles(Pageable pageable);
    
    // Método temporal para debug - buscar todas las calificaciones sin filtros
    @Query("SELECT c FROM Calificacion c " +
           "LEFT JOIN FETCH c.usuario u " +
           "ORDER BY c.fechaCalificacion DESC")
    Page<Calificacion> findAllConDetallesDebug(Pageable pageable);
}