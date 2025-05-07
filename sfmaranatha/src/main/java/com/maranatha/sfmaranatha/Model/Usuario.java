package com.maranatha.sfmaranatha.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @Column(length = 100, nullable = false)
    private String nombre;

    @Column(length = 100, nullable = false)
    private String apellido;

    @Column(name = "tipo_documento", length = 50, nullable = false)
    private String tipoDocumento;

    @Column(name = "numero_documento", length = 50, nullable = false, unique = true)
    private String numeroDocumento;

    @Column(length = 20)
    private String telefono;

    @Column(length = 200)
    private String direccion;

    @Column(nullable = false)
    private String contrasena;

    @Column(name = "fue_directamente_en_el_restaurante")
    private Boolean fueDirecto;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @Column(length = 100, nullable = false, unique = true)
    private String correo;

    @Column(name = "tipo_usuario", columnDefinition = "ENUM('ENCARGADO','ADMIN','CLIENTE')", nullable = false)
    private String tipoUsuario;

    public Usuario() {
        // Constructor vacío para JPA
    }

    // Constructor completo (sin id)
    public Usuario(String nombre, String apellido, String tipoDocumento, String numeroDocumento,
                   String telefono, String direccion, String contrasena,
                   Boolean fueDirecto, LocalDateTime fechaRegistro,
                   String correo, String tipoUsuario) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.tipoDocumento = tipoDocumento;
        this.numeroDocumento = numeroDocumento;
        this.telefono = telefono;
        this.direccion = direccion;
        this.contrasena = contrasena;
        this.fueDirecto = fueDirecto;
        this.fechaRegistro = fechaRegistro;
        this.correo = correo;
        this.tipoUsuario = tipoUsuario;
    }

    // Getters y Setters
    public Integer getIdUsuario() {
        return idUsuario;
    }
    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }
    public String getNombre() {
        return nombre;
    }
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    public String getApellido() {
        return apellido;
    }
    public void setApellido(String apellido) {
        this.apellido = apellido;
    }
    public String getTipoDocumento() {
        return tipoDocumento;
    }
    public void setTipoDocumento(String tipoDocumento) {
        this.tipoDocumento = tipoDocumento;
    }
    public String getNumeroDocumento() {
        return numeroDocumento;
    }
    public void setNumeroDocumento(String numeroDocumento) {
        this.numeroDocumento = numeroDocumento;
    }
    public String getTelefono() {
        return telefono;
    }
    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
    public String getDireccion() {
        return direccion;
    }
    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }
    public String getContrasena() {
        return contrasena;
    }
    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }
    public Boolean getFueDirecto() {
        return fueDirecto;
    }
    public void setFueDirecto(Boolean fueDirecto) {
        this.fueDirecto = fueDirecto;
    }
    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }
    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }
    public String getCorreo() {
        return correo;
    }
    public void setCorreo(String correo) {
        this.correo = correo;
    }
    public String getTipoUsuario() {
        return tipoUsuario;
    }
    public void setTipoUsuario(String tipoUsuario) {
        this.tipoUsuario = tipoUsuario;
    }
}