package com.maranatha.sfmaranatha.dto;

import java.math.BigDecimal;

public class PlatoDTO {
    private Integer idPlato;
    private String nombrePlato;
    private BigDecimal precio;
    private String descripcion;
    private String imagenUrl;

    public PlatoDTO() {}

    public PlatoDTO(Integer idPlato, String nombrePlato, BigDecimal precio, String descripcion, String imagenUrl) {
        this.idPlato = idPlato;
        this.nombrePlato = nombrePlato;
        this.precio = precio;
        this.descripcion = descripcion;
        this.imagenUrl = imagenUrl;
    }

    // Getters y Setters
    public Integer getIdPlato() { return idPlato; }
    public void setIdPlato(Integer idPlato) { this.idPlato = idPlato; }
    public String getNombrePlato() { return nombrePlato; }
    public void setNombrePlato(String nombrePlato) { this.nombrePlato = nombrePlato; }
    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }
}