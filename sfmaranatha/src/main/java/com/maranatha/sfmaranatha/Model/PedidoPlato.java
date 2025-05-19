package com.maranatha.sfmaranatha.Model;

import com.fasterxml.jackson.annotation.JsonBackReference; 
import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 *  defino la entidad intermedia PedidoPlato
 * para la relación N-M entre Pedido y Plato.
 */
@Entity
@Table(name = "pedido_plato")
public class PedidoPlato {

    @Embeddable
    public static class PedidoPlatoKey implements Serializable {

        @Column(name = "id_pedido")
        private Long pedidoId;

        @Column(name = "id_plato")
        private Integer platoId;

        public PedidoPlatoKey() {}

        public PedidoPlatoKey(Long pedidoId, Integer platoId) {
            this.pedidoId = pedidoId;
            this.platoId = platoId;
        }

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

    @EmbeddedId
    private PedidoPlatoKey id;

    @ManyToOne(fetch = FetchType.LAZY) 
    @MapsId("pedidoId") 
    @JoinColumn(name = "id_pedido", nullable = false)
    @JsonBackReference 
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY) 
    @MapsId("platoId")  
    @JoinColumn(name = "id_plato", nullable = false)
    private Plato plato;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    public PedidoPlato() {
        this.id = new PedidoPlatoKey(); 
    }

    public PedidoPlato(Pedido pedido, Plato plato, Integer cantidad, BigDecimal precioUnitario) {
        this(); 
        this.pedido = pedido;
        this.plato = plato;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        // JPA poblará los campos de this.id a partir de this.pedido y this.plato debido a @MapsId
    }

    // Getters y Setters (sin cambios)

    public PedidoPlatoKey getId() {
        return id;
    }

    public void setId(PedidoPlatoKey id) {
        this.id = id;
    }

    public Pedido getPedido() {
        return pedido;
    }

    public void setPedido(Pedido pedido) {
        this.pedido = pedido;
    }

    public Plato getPlato() {
        return plato;
    }

    public void setPlato(Plato plato) {
        this.plato = plato;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(BigDecimal precioUnitario) {
        this.precioUnitario = precioUnitario;
    }
}
