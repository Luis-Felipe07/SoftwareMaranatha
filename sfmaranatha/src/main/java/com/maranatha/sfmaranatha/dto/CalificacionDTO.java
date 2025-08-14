package com.maranatha.sfmaranatha.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

public class CalificacionDTO {
    private Long idCalificacion;
    private String nombre;
    private String email;
    private String telefono;
    private String tipoVisita;
    private Map<String, Integer> calificaciones;
    private String comentario;
    private Boolean recomendaria;
    private BigDecimal promedioGeneral;
    private LocalDateTime fecha;
    
    // Nuevos campos para integración con usuarios autenticados
    private Integer idPedido;
    private Integer idUsuario;
    private String estado;
    private Boolean editado;
    private LocalDateTime fechaEdicion;

    // Constructor vacío
    public CalificacionDTO() {}

    // Constructor con campos básicos
    public CalificacionDTO(String nombre, String email, String telefono, String tipoVisita, 
                          Map<String, Integer> calificaciones, String comentario, Boolean recomendaria) {
        this.nombre = nombre;
        this.email = email;
        this.telefono = telefono;
        this.tipoVisita = tipoVisita;
        this.calificaciones = calificaciones;
        this.comentario = comentario;
        this.recomendaria = recomendaria;
    }

    // Getters y Setters
    public Long getIdCalificacion() {
        return idCalificacion;
    }

    public void setIdCalificacion(Long idCalificacion) {
        this.idCalificacion = idCalificacion;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getTipoVisita() {
        return tipoVisita;
    }

    public void setTipoVisita(String tipoVisita) {
        this.tipoVisita = tipoVisita;
    }

    public Map<String, Integer> getCalificaciones() {
        return calificaciones;
    }

    public void setCalificaciones(Map<String, Integer> calificaciones) {
        this.calificaciones = calificaciones;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public Boolean getRecomendaria() {
        return recomendaria;
    }

    public void setRecomendaria(Boolean recomendaria) {
        this.recomendaria = recomendaria;
    }

    public BigDecimal getPromedioGeneral() {
        return promedioGeneral;
    }

    public void setPromedioGeneral(BigDecimal promedioGeneral) {
        this.promedioGeneral = promedioGeneral;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public Integer getIdPedido() {
        return idPedido;
    }

    public void setIdPedido(Integer idPedido) {
        this.idPedido = idPedido;
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Boolean getEditado() {
        return editado;
    }

    public void setEditado(Boolean editado) {
        this.editado = editado;
    }

    public LocalDateTime getFechaEdicion() {
        return fechaEdicion;
    }

    public void setFechaEdicion(LocalDateTime fechaEdicion) {
        this.fechaEdicion = fechaEdicion;
    }

    @Override
    public String toString() {
        return "CalificacionDTO{" +
                "idCalificacion=" + idCalificacion +
                ", nombre='" + nombre + '\'' +
                ", email='" + email + '\'' +
                ", tipoVisita='" + tipoVisita + '\'' +
                ", comentario='" + comentario + '\'' +
                ", recomendaria=" + recomendaria +
                ", promedioGeneral=" + promedioGeneral +
                ", idPedido=" + idPedido +
                '}';
    }
}