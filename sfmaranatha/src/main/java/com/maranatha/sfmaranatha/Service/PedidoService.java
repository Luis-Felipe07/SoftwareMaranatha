package com.maranatha.sfmaranatha.Service;

import com.maranatha.sfmaranatha.Model.Pedido;
import com.maranatha.sfmaranatha.Repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    public Pedido cancelarPedido(Long id) throws Exception {
        Optional<Pedido> pedidoOpt = pedidoRepository.findById(id);
        if (!pedidoOpt.isPresent()) {
            throw new Exception("Pedido no encontrado");
        }
        
        Pedido pedido = pedidoOpt.get();
        
        // Solo se puede cancelar si el estado es PENDIENTE
        if (pedido.getEstadoPedido() != Pedido.EstadoPedido.PENDIENTE) {
            throw new Exception("El pedido no se puede cancelar. Estado actual: " + pedido.getEstadoPedido());
        }
        
        pedido.setEstadoPedido(Pedido.EstadoPedido.CANCELADO);
        return pedidoRepository.save(pedido);
    }
}
