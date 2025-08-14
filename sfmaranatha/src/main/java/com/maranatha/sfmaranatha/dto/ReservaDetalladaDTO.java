package com.maranatha.sfmaranatha.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class ReservaDetalladaDTO {
    
    private Long idReserva;
    private LocalDate fechaReserva;
    private LocalTime horaReserva;
    private Integer numeroPersonas;
    private String estado;
    private Integer numeroMesa;
    private String observaciones;
    
    // Datos del usuario
    private String nombreCompleto;
    private String correoUsuario;
    private String telefonoUsuario;
    
    public ReservaDetalladaDTO() {}

    public ReservaDetalladaDTO(Long idReserva, LocalDate fechaReserva, LocalTime horaReserva, 
                              Integer numeroPersonas, String estado, Integer numeroMesa, 
                              String observaciones, String nombreCompleto, String correoUsuario, 
                              String telefonoUsuario) {
        this.idReserva = idReserva;
        this.fechaReserva = fechaReserva;
        this.horaReserva = horaReserva;
        this.numeroPersonas = numeroPersonas;
        this.estado = estado;
        this.numeroMesa = numeroMesa;
        this.observaciones = observaciones;
        this.nombreCompleto = nombreCompleto;
        this.correoUsuario = correoUsuario;
        this.telefonoUsuario = telefonoUsuario;
    }

    // Getters y Setters

    public Long getIdReserva() {
        return idReserva;
    }

    public void setIdReserva(Long idReserva) {
        this.idReserva = idReserva;
    }

    public LocalDate getFechaReserva() {
        return fechaReserva;
    }

    public void setFechaReserva(LocalDate fechaReserva) {
        this.fechaReserva = fechaReserva;
    }

    public LocalTime getHoraReserva() {
        return horaReserva;
    }

    public void setHoraReserva(LocalTime horaReserva) {
        this.horaReserva = horaReserva;
    }

    public Integer getNumeroPersonas() {
        return numeroPersonas;
    }

    public void setNumeroPersonas(Integer numeroPersonas) {
        this.numeroPersonas = numeroPersonas;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Integer getNumeroMesa() {
        return numeroMesa;
    }

    public void setNumeroMesa(Integer numeroMesa) {
        this.numeroMesa = numeroMesa;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getCorreoUsuario() {
        return correoUsuario;
    }

    public void setCorreoUsuario(String correoUsuario) {
        this.correoUsuario = correoUsuario;
    }

    public String getTelefonoUsuario() {
        return telefonoUsuario;
    }

    public void setTelefonoUsuario(String telefonoUsuario) {
        this.telefonoUsuario = telefonoUsuario;
    }
}