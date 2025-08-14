package com.maranatha.sfmaranatha.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PedidoDetalladoDTO {
    private Long idPedido;
    private String nombreCliente;
    private BigDecimal total;
    private String metodoPago;
    private String estado;
    private LocalDateTime fechaPedido;
    private String direccionEntrega;
    private String horaEntregaRestaurante;
    private String descripcion;
    private List<ItemPedidoDTO> items;

    // Constructor vacío
    public PedidoDetalladoDTO() {}

    // Constructor completo
    public PedidoDetalladoDTO(Long idPedido, String nombreCliente, BigDecimal total, 
                             String metodoPago, String estado, LocalDateTime fechaPedido,
                             String direccionEntrega, String horaEntregaRestaurante, 
                             String descripcion, List<ItemPedidoDTO> items) {
        this.idPedido = idPedido;
        this.nombreCliente = nombreCliente;
        this.total = total;
        this.metodoPago = metodoPago;
        this.estado = estado;
        this.fechaPedido = fechaPedido;
        this.direccionEntrega = direccionEntrega;
        this.horaEntregaRestaurante = horaEntregaRestaurante;
        this.descripcion = descripcion;
        this.items = items;
    }

    // Getters y Setters
    public Long getIdPedido() { return idPedido; }
    public void setIdPedido(Long idPedido) { this.idPedido = idPedido; }
    
    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }
    
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    
    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
    
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    
    public LocalDateTime getFechaPedido() { return fechaPedido; }
    public void setFechaPedido(LocalDateTime fechaPedido) { this.fechaPedido = fechaPedido; }
    
    public String getDireccionEntrega() { return direccionEntrega; }
    public void setDireccionEntrega(String direccionEntrega) { this.direccionEntrega = direccionEntrega; }
    
    public String getHoraEntregaRestaurante() { return horaEntregaRestaurante; }
    public void setHoraEntregaRestaurante(String horaEntregaRestaurante) { this.horaEntregaRestaurante = horaEntregaRestaurante; }
    
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    
    public List<ItemPedidoDTO> getItems() { return items; }
    public void setItems(List<ItemPedidoDTO> items) { this.items = items; }

    // Clase interna para los items
    public static class ItemPedidoDTO {
        private String nombrePlato;
        private Integer cantidad;
        private BigDecimal precioUnitario;

        public ItemPedidoDTO() {}

        public ItemPedidoDTO(String nombrePlato, Integer cantidad, BigDecimal precioUnitario) {
            this.nombrePlato = nombrePlato;
            this.cantidad = cantidad;
            this.precioUnitario = precioUnitario;
        }

        // Getters y Setters
        public String getNombrePlato() { return nombrePlato; }
        public void setNombrePlato(String nombrePlato) { this.nombrePlato = nombrePlato; }
        
        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
        
        public BigDecimal getPrecioUnitario() { return precioUnitario; }
        public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }
    }
}