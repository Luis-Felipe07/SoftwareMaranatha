package com.maranatha.sfmaranatha.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "respuestas_calificacion")
public class RespuestaCalificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_respuesta")
    private Long idRespuesta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_calificacion", nullable = false)
    private Calificacion calificacionPadre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "comentario", columnDefinition = "TEXT", nullable = false)
    private String comentario;

    @Column(name = "fecha_respuesta", nullable = false)
    private LocalDateTime fechaRespuesta;

    @Column(name = "editado", nullable = false)
    private Boolean editado = false;

    @Column(name = "fecha_edicion")
    private LocalDateTime fechaEdicion;

    // Constructor
    public RespuestaCalificacion() {
        this.fechaRespuesta = LocalDateTime.now();
    }

    // Getters y Setters
    public Long getIdRespuesta() {
        return idRespuesta;
    }

    public void setIdRespuesta(Long idRespuesta) {
        this.idRespuesta = idRespuesta;
    }

    public Calificacion getCalificacionPadre() {
        return calificacionPadre;
    }

    public void setCalificacionPadre(Calificacion calificacionPadre) {
        this.calificacionPadre = calificacionPadre;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public LocalDateTime getFechaRespuesta() {
        return fechaRespuesta;
    }

    public void setFechaRespuesta(LocalDateTime fechaRespuesta) {
        this.fechaRespuesta = fechaRespuesta;
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
}