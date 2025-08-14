package com.maranatha.sfmaranatha.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "likes_calificacion",
       uniqueConstraints = @UniqueConstraint(columnNames = {"id_usuario", "id_calificacion"}))
public class LikeCalificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_like")
    private Long idLike;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_calificacion", nullable = false)
    private Calificacion calificacion;

    @Column(name = "fecha_like", nullable = false)
    private LocalDateTime fechaLike;

    // Constructor
    public LikeCalificacion() {
        this.fechaLike = LocalDateTime.now();
    }

    // Getters y Setters
    public Long getIdLike() {
        return idLike;
    }

    public void setIdLike(Long idLike) {
        this.idLike = idLike;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Calificacion getCalificacion() {
        return calificacion;
    }

    public void setCalificacion(Calificacion calificacion) {
        this.calificacion = calificacion;
    }

    public LocalDateTime getFechaLike() {
        return fechaLike;
    }

    public void setFechaLike(LocalDateTime fechaLike) {
        this.fechaLike = fechaLike;
    }
}