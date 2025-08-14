package com.maranatha.sfmaranatha.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class ReservaRequestDTO {
    private Integer idUsuario;
    private Integer numeroMesa;
    private String telefono;
    private Integer numeroPersonas;
    private LocalDate fechaReserva;
    private LocalTime horaReserva;
    private String estado;
    private Integer idRestaurante;
    private String metodoPago;
    private List<PlatoReservaDTO> platos;

    // Constructor vacío
    public ReservaRequestDTO() {}

    // Getters y Setters
    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }
    
    public Integer getNumeroMesa() { return numeroMesa; }
    public void setNumeroMesa(Integer numeroMesa) { this.numeroMesa = numeroMesa; }
    
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    
    public Integer getNumeroPersonas() { return numeroPersonas; }
    public void setNumeroPersonas(Integer numeroPersonas) { this.numeroPersonas = numeroPersonas; }
    
    public LocalDate getFechaReserva() { return fechaReserva; }
    public void setFechaReserva(LocalDate fechaReserva) { this.fechaReserva = fechaReserva; }
    
    public LocalTime getHoraReserva() { return horaReserva; }
    public void setHoraReserva(LocalTime horaReserva) { this.horaReserva = horaReserva; }
    
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    
    public Integer getIdRestaurante() { return idRestaurante; }
    public void setIdRestaurante(Integer idRestaurante) { this.idRestaurante = idRestaurante; }
    
    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
    
    public List<PlatoReservaDTO> getPlatos() { return platos; }
    public void setPlatos(List<PlatoReservaDTO> platos) { this.platos = platos; }

    // Clase interna para los platos de la reserva
    public static class PlatoReservaDTO {
        private Integer platoId;
        private Integer cantidad;

        public PlatoReservaDTO() {}

        public Integer getPlatoId() { return platoId; }
        public void setPlatoId(Integer platoId) { this.platoId = platoId; }
        
        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    }
}