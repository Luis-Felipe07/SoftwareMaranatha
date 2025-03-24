package com.maranatha.sfmaranatha.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pedidos")
public class Pedido {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombreCliente;
    private String correo;
    private String telefono;

    @Enumerated(EnumType.STRING)
    private TipoPedido tipoPedido; 

    
    private String direccion;

    
    private String horaReserva;
    
    private String metodoPago;
    
    
    @Lob
    private String detallePedido;
    
    private Double montoTotal;
    
    @Enumerated(EnumType.STRING)
    private EstadoPedido estadoPedido = EstadoPedido.PENDIENTE;
    
    private LocalDateTime fechaPedido = LocalDateTime.now();

    public enum TipoPedido {
        DOMICILIO,
        RESTAURANTE
    }
    
    public enum EstadoPedido {
        PENDIENTE,
        ENTREGADO,
        CANCELADO
    }

    // Constructores
    public Pedido() {
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public String getNombreCliente() {
        return nombreCliente;
    }
    public void setNombreCliente(String nombreCliente) {
        this.nombreCliente = nombreCliente;
    }
    
    public String getCorreo() {
        return correo;
    }
    public void setCorreo(String correo) {
        this.correo = correo;
    }
    
    public String getTelefono() {
        return telefono;
    }
    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
    
    public TipoPedido getTipoPedido() {
        return tipoPedido;
    }
    public void setTipoPedido(TipoPedido tipoPedido) {
        this.tipoPedido = tipoPedido;
    }
    
    public String getDireccion() {
        return direccion;
    }
    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }
    
    public String getHoraReserva() {
        return horaReserva;
    }
    public void setHoraReserva(String horaReserva) {
        this.horaReserva = horaReserva;
    }
    
    public String getMetodoPago() {
        return metodoPago;
    }
    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }
    
    public String getDetallePedido() {
        return detallePedido;
    }
    public void setDetallePedido(String detallePedido) {
        this.detallePedido = detallePedido;
    }
    
    public Double getMontoTotal() {
        return montoTotal;
    }
    public void setMontoTotal(Double montoTotal) {
        this.montoTotal = montoTotal;
    }
    
    public EstadoPedido getEstadoPedido() {
        return estadoPedido;
    }
    public void setEstadoPedido(EstadoPedido estadoPedido) {
        this.estadoPedido = estadoPedido;
    }
    
    public LocalDateTime getFechaPedido() {
        return fechaPedido;
    }
    public void setFechaPedido(LocalDateTime fechaPedido) {
        this.fechaPedido = fechaPedido;
    }
}
