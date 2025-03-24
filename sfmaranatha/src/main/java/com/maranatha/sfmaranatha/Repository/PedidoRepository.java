package com.maranatha.sfmaranatha.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.maranatha.sfmaranatha.Model.Pedido;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    
    List<Pedido> findByEstadoPedido(Pedido.EstadoPedido estadoPedido);
}
