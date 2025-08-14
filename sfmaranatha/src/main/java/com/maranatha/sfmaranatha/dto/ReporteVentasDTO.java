package com.maranatha.sfmaranatha.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class ReporteVentasDTO {
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private BigDecimal totalVentas;
    private Integer totalPedidos;
    private BigDecimal promedioVentaDiaria;
    private String platilloMasVendido;
    private Map<String, BigDecimal> ventasPorDia;
    private Map<String, BigDecimal> ventasPorSemana;
    private Map<String, Integer> platillosVendidos;
    private List<DetallePedidoReporte> detallesPedidos;

    // Constructor vacío
    public ReporteVentasDTO() {}

    // Getters y Setters
    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }
    
    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }
    
    public BigDecimal getTotalVentas() { return totalVentas; }
    public void setTotalVentas(BigDecimal totalVentas) { this.totalVentas = totalVentas; }
    
    public Integer getTotalPedidos() { return totalPedidos; }
    public void setTotalPedidos(Integer totalPedidos) { this.totalPedidos = totalPedidos; }
    
    public BigDecimal getPromedioVentaDiaria() { return promedioVentaDiaria; }
    public void setPromedioVentaDiaria(BigDecimal promedioVentaDiaria) { this.promedioVentaDiaria = promedioVentaDiaria; }
    
    public String getPlatilloMasVendido() { return platilloMasVendido; }
    public void setPlatilloMasVendido(String platilloMasVendido) { this.platilloMasVendido = platilloMasVendido; }
    
    public Map<String, BigDecimal> getVentasPorDia() { return ventasPorDia; }
    public void setVentasPorDia(Map<String, BigDecimal> ventasPorDia) { this.ventasPorDia = ventasPorDia; }
    
    public Map<String, BigDecimal> getVentasPorSemana() { return ventasPorSemana; }
    public void setVentasPorSemana(Map<String, BigDecimal> ventasPorSemana) { this.ventasPorSemana = ventasPorSemana; }
    
    public Map<String, Integer> getPlatillosVendidos() { return platillosVendidos; }
    public void setPlatillosVendidos(Map<String, Integer> platillosVendidos) { this.platillosVendidos = platillosVendidos; }
    
    public List<DetallePedidoReporte> getDetallesPedidos() { return detallesPedidos; }
    public void setDetallesPedidos(List<DetallePedidoReporte> detallesPedidos) { this.detallesPedidos = detallesPedidos; }

    // Clase interna para detalles de pedidos
    public static class DetallePedidoReporte {
        private Long idPedido;
        private String fecha;
        private String cliente;
        private BigDecimal total;
        private String estado;
        private String metodoPago;

        // Constructor
        public DetallePedidoReporte() {}

        public DetallePedidoReporte(Long idPedido, String fecha, String cliente, 
                                   BigDecimal total, String estado, String metodoPago) {
            this.idPedido = idPedido;
            this.fecha = fecha;
            this.cliente = cliente;
            this.total = total;
            this.estado = estado;
            this.metodoPago = metodoPago;
        }

        // Getters y Setters
        public Long getIdPedido() { return idPedido; }
        public void setIdPedido(Long idPedido) { this.idPedido = idPedido; }
        
        public String getFecha() { return fecha; }
        public void setFecha(String fecha) { this.fecha = fecha; }
        
        public String getCliente() { return cliente; }
        public void setCliente(String cliente) { this.cliente = cliente; }
        
        public BigDecimal getTotal() { return total; }
        public void setTotal(BigDecimal total) { this.total = total; }
        
        public String getEstado() { return estado; }
        public void setEstado(String estado) { this.estado = estado; }
        
        public String getMetodoPago() { return metodoPago; }
        public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
    }
}