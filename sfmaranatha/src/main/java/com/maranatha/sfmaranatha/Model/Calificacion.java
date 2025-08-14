package com.maranatha.sfmaranatha.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;


@Entity
@Table(name = "calificaciones")
public class Calificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_calificacion")
    private Long idCalificacion;

    @Column(name = "nombre_cliente", nullable = false, length = 100)
    private String nombreCliente;

    @Column(name = "email_cliente", nullable = false, length = 100)
    private String emailCliente;

    @Column(name = "telefono_cliente", length = 20)
    private String telefonoCliente;

    @Column(name = "tipo_visita", nullable = false, length = 50)
    private String tipoVisita;

    @Column(name = "calificacion_comida", nullable = false)
    private Integer calificacionComida;

    @Column(name = "calificacion_servicio", nullable = false)
    private Integer calificacionServicio;

    @Column(name = "calificacion_limpieza", nullable = false)
    private Integer calificacionLimpieza;

    @Column(name = "calificacion_precio", nullable = false)
    private Integer calificacionPrecio;

    @Column(name = "calificacion_ambiente", nullable = false)
    private Integer calificacionAmbiente;

    @Column(name = "promedio_general", nullable = false, precision = 3, scale = 2)
    private BigDecimal promedioGeneral;

    @Column(name = "comentario", columnDefinition = "TEXT")
    private String comentario;

    @Column(name = "recomendaria", nullable = false)
    private Boolean recomendaria;

    @Column(name = "fecha_calificacion", nullable = false)
    private LocalDateTime fechaCalificacion;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado = "PENDIENTE"; // PENDIENTE, APROBADA, RECHAZADA

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pedido")
    private Pedido pedido;

    @OneToMany(mappedBy = "calificacionPadre", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RespuestaCalificacion> respuestas = new ArrayList<>();

    @OneToMany(mappedBy = "calificacion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LikeCalificacion> likes = new ArrayList<>();

    @Column(name = "editado", nullable = false)
    private Boolean editado = false;

    @Column(name = "fecha_edicion")
    private LocalDateTime fechaEdicion;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "likes", nullable = false)
    private Integer likesCount = 0;

    // Constructor vacío
    public Calificacion() {
        this.fechaCalificacion = LocalDateTime.now();
        this.activo = true; 
        this.likesCount = 0; 
    }

    // Getters y Setters
    public Long getIdCalificacion() {
        return idCalificacion;
    }

    public void setIdCalificacion(Long idCalificacion) {
        this.idCalificacion = idCalificacion;
    }

    public String getNombreCliente() {
        return nombreCliente;
    }

    public void setNombreCliente(String nombreCliente) {
        this.nombreCliente = nombreCliente;
    }

    public String getEmailCliente() {
        return emailCliente;
    }

    public void setEmailCliente(String emailCliente) {
        this.emailCliente = emailCliente;
    }

    public String getTelefonoCliente() {
        return telefonoCliente;
    }

    public void setTelefonoCliente(String telefonoCliente) {
        this.telefonoCliente = telefonoCliente;
    }

    public String getTipoVisita() {
        return tipoVisita;
    }

    public void setTipoVisita(String tipoVisita) {
        this.tipoVisita = tipoVisita;
    }

    public Integer getCalificacionComida() {
        return calificacionComida;
    }

    public void setCalificacionComida(Integer calificacionComida) {
        this.calificacionComida = calificacionComida;
    }

    public Integer getCalificacionServicio() {
        return calificacionServicio;
    }

    public void setCalificacionServicio(Integer calificacionServicio) {
        this.calificacionServicio = calificacionServicio;
    }

    public Integer getCalificacionLimpieza() {
        return calificacionLimpieza;
    }

    public void setCalificacionLimpieza(Integer calificacionLimpieza) {
        this.calificacionLimpieza = calificacionLimpieza;
    }

    public Integer getCalificacionPrecio() {
        return calificacionPrecio;
    }

    public void setCalificacionPrecio(Integer calificacionPrecio) {
        this.calificacionPrecio = calificacionPrecio;
    }

    public Integer getCalificacionAmbiente() {
        return calificacionAmbiente;
    }

    public void setCalificacionAmbiente(Integer calificacionAmbiente) {
        this.calificacionAmbiente = calificacionAmbiente;
    }

    public BigDecimal getPromedioGeneral() {
        return promedioGeneral;
    }

    public void setPromedioGeneral(BigDecimal promedioGeneral) {
        this.promedioGeneral = promedioGeneral;
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

    public LocalDateTime getFechaCalificacion() {
        return fechaCalificacion;
    }

    public void setFechaCalificacion(LocalDateTime fechaCalificacion) {
        this.fechaCalificacion = fechaCalificacion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Pedido getPedido() {
        return pedido;
    }

    public void setPedido(Pedido pedido) {
        this.pedido = pedido;
    }

    public List<RespuestaCalificacion> getRespuestas() {
        return respuestas;
    }

    public void setRespuestas(List<RespuestaCalificacion> respuestas) {
        this.respuestas = respuestas;
    }

    public List<LikeCalificacion> getLikes() {
        return likes;
    }

    public void setLikes(List<LikeCalificacion> likes) {
        this.likes = likes;
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

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Integer getLikesCount() {
        return likesCount;
    }

    public void setLikesCount(Integer likesCount) {
        this.likesCount = likesCount;
    }

    // Método para calcular el promedio automáticamente
    public void calcularPromedioGeneral() {
        double suma = calificacionComida + calificacionServicio + calificacionLimpieza + 
                     calificacionPrecio + calificacionAmbiente;
        double promedio = suma / 5.0;
        this.promedioGeneral = BigDecimal.valueOf(promedio).setScale(2, BigDecimal.ROUND_HALF_UP);
    }
    
    // Método para sincronizar el contador de likes con la relación
    public void sincronizarLikesCount() {
        if (this.likes != null) {
            this.likesCount = this.likes.size();
        }
    }
    
    // Método que se ejecuta antes de persistir la entidad
    @PrePersist
    public void prePersist() {
        if (this.activo == null) {
            this.activo = true;
        }
        if (this.editado == null) {
            this.editado = false;
        }
        if (this.likesCount == null) {
            this.likesCount = 0;
        }
    }
}