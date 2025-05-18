package com.maranatha.sfmaranatha.dto;

/**
 * Representa un ítem del pedido: un plato y su cantidad.
 */
public class LineaPedidoDTO {

    private Integer platoId;
    private Integer cantidad;

    public LineaPedidoDTO() {}

    public Integer getPlatoId() {
        return platoId;
    }

    public void setPlatoId(Integer platoId) {
        this.platoId = platoId;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }
}
