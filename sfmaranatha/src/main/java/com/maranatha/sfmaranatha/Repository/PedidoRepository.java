package com.maranatha.sfmaranatha.Repository;

import com.maranatha.sfmaranatha.Model.Pedido;
import com.maranatha.sfmaranatha.Model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    
    // Buscar pedidos por usuario
    List<Pedido> findByUsuarioOrderByFechaPedidoDesc(Usuario usuario);
    
    // Buscar pedidos por usuario y estado
    List<Pedido> findByUsuarioAndEstadoOrderByFechaPedidoDesc(Usuario usuario, String estado);
    
    // Buscar pedidos por estado
    List<Pedido> findByEstadoOrderByFechaPedidoDesc(String estado);
    List<Pedido> findByEstado(String estado);
    
    // Buscar pedidos entregados de un usuario
    @Query("SELECT p FROM Pedido p WHERE p.usuario = :usuario AND p.estado = 'ENTREGADO' ORDER BY p.fechaPedido DESC")
    List<Pedido> findPedidosEntregadosByUsuario(@Param("usuario") Usuario usuario);
    
    // Buscar pedidos sin calificar de un usuario
    @Query("SELECT p FROM Pedido p WHERE p.usuario = :usuario AND p.estado = 'ENTREGADO' " +
           "AND p.calificacion IS NULL")
    List<Pedido> findPedidosSinCalificar(@Param("usuario") Usuario usuario);
    
    // Contar pedidos por estado
    Long countByEstado(String estado);
    
    // Contar pedidos de un usuario por estado
    Long countByUsuarioAndEstado(Usuario usuario, String estado);
    
    // Buscar pedido por ID y usuario (para verificar propiedad)
    Optional<Pedido> findByIdPedidoAndUsuario(Long idPedido, Usuario usuario);
    
    // Buscar pedidos por rango de fechas
    @Query("SELECT p FROM Pedido p WHERE p.fechaPedido BETWEEN :fechaInicio AND :fechaFin ORDER BY p.fechaPedido DESC")
    List<Pedido> findByFechaPedidoBetween(@Param("fechaInicio") LocalDateTime fechaInicio, 
                                         @Param("fechaFin") LocalDateTime fechaFin);
    
    // Contar pedidos por estado y fecha
    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.estado = :estado AND DATE(p.fechaPedido) = DATE(:fecha)")
    Long countByEstadoAndFecha(@Param("estado") String estado, @Param("fecha") LocalDateTime fecha);
    
    // Obtener total de ventas por estado
    @Query("SELECT SUM(p.total) FROM Pedido p WHERE p.estado = :estado")
    java.math.BigDecimal sumTotalByEstado(@Param("estado") String estado);
    
    // Buscar pedidos del día actual
    @Query("SELECT p FROM Pedido p WHERE DATE(p.fechaPedido) = CURRENT_DATE ORDER BY p.fechaPedido DESC")
    List<Pedido> findPedidosDelDia();
    
    // Buscar pedidos pendientes (diferentes estados)
    @Query("SELECT p FROM Pedido p WHERE p.estado IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO') ORDER BY p.fechaPedido ASC")
    List<Pedido> findPedidosPendientes();
    
    // Buscar últimos N pedidos
    @Query("SELECT p FROM Pedido p ORDER BY p.fechaPedido DESC")
    List<Pedido> findTopNByOrderByFechaPedidoDesc(org.springframework.data.domain.Pageable pageable);
    
    // Buscar pedidos por método de pago
    List<Pedido> findByMetodoPagoOrderByFechaPedidoDesc(String metodoPago);
    
    // Buscar pedidos por cliente (email)
    List<Pedido> findByCorreoClienteOrderByFechaPedidoDesc(String correoCliente);
    
    // Estadísticas: Contar pedidos agrupados por estado
    @Query("SELECT p.estado, COUNT(p) FROM Pedido p GROUP BY p.estado")
    List<Object[]> countPedidosByEstado();
    
    // Estadísticas: Total de ventas por día
    @Query("SELECT DATE(p.fechaPedido), SUM(p.total) FROM Pedido p WHERE p.estado = 'ENTREGADO' GROUP BY DATE(p.fechaPedido) ORDER BY DATE(p.fechaPedido) DESC")
    List<Object[]> getVentasPorDia();

    Long countByUsuario(Usuario usuario);
}