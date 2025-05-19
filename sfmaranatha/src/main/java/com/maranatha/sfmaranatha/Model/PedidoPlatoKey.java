package com.maranatha.sfmaranatha.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

/**
 *  defino la clave compuesta para la tabla pedido_plato,
 * combinando el ID de pedido y el ID de plato.
 */
@Embeddable
public class PedidoPlatoKey implements Serializable {

    @Column(name = "id_pedido")
    private Long pedidoId;

    @Column(name = "id_plato")
    private Integer platoId;

    // Constructor vacío para JPA
    public PedidoPlatoKey() {}

    //  creo la clave compuesta con ambos IDs
    public PedidoPlatoKey(Long pedidoId, Integer platoId) {
        this.pedidoId = pedidoId;
        this.platoId  = platoId;
    }

    // Getters y setters
    public Long getPedidoId() {
        return pedidoId;
    }

    public void setPedidoId(Long pedidoId) {
        this.pedidoId = pedidoId;
    }

    public Integer getPlatoId() {
        return platoId;
    }

    public void setPlatoId(Integer platoId) {
        this.platoId = platoId;
    }

    

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PedidoPlatoKey)) return false;
        PedidoPlatoKey that = (PedidoPlatoKey) o;
        return Objects.equals(pedidoId, that.pedidoId) &&
               Objects.equals(platoId, that.platoId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(pedidoId, platoId);
    }
}
