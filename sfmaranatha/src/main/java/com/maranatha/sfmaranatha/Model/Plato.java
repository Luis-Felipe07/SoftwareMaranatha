package com.maranatha.sfmaranatha.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties; 
import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * Representa la entidad Plato, que forma parte de un Menú
 * y puede incluirse en varios pedidos.
 */
@Entity
@Table(name = "plato")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) 
public class Plato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_plato")
    private Integer idPlato;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "id_menu", nullable = false)
    @JsonBackReference("menu-platos") // Referencia al lado "padre" en Menu
    private Menu menu;

    @Column(name = "nombre_plato", length = 100, nullable = false)
    private String nombrePlato;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(length = 255)
    private String descripcion;

    @Column(name = "imagen_url", length = 255)
    private String imagenUrl;

    public Plato() {}

    // Getters y Setters 

    public Integer getIdPlato() {
        return idPlato;
    }

    public void setIdPlato(Integer idPlato) {
        this.idPlato = idPlato;
    }

    public Menu getMenu() {
        return menu;
    }

    public void setMenu(Menu menu) {
        this.menu = menu;
    }

    public String getNombrePlato() {
        return nombrePlato;
    }

    public void setNombrePlato(String nombrePlato) {
        this.nombrePlato = nombrePlato;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }
}
