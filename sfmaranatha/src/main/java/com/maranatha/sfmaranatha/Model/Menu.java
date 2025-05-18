package com.maranatha.sfmaranatha.Model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // Importar
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "menu")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // AÑADIDO
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_menu")
    private Integer idMenu;

    @Column(name = "nombre_menu", length = 100, nullable = false)
    private String nombreMenu;

    @Column(name = "id_restaurante", nullable = false)
    private Integer idRestaurante;

    @OneToMany(mappedBy = "menu", cascade = CascadeType.ALL, fetch = FetchType.LAZY) // Buena práctica usar LAZY
    @JsonManagedReference("menu-platos") // Lado "padre" de la relación Menu-Plato
    private List<Plato> platos;

    public Menu() {}

    // Getters y setters (sin cambios)
    public Integer getIdMenu() { return idMenu; }
    public void setIdMenu(Integer idMenu) { this.idMenu = idMenu; }
    public String getNombreMenu() { return nombreMenu; }
    public void setNombreMenu(String nombreMenu) { this.nombreMenu = nombreMenu; }
    public Integer getIdRestaurante() { return idRestaurante; }
    public void setIdRestaurante(Integer idRestaurante) { this.idRestaurante = idRestaurante; }
    public List<Plato> getPlatos() { return platos; }
    public void setPlatos(List<Plato> platos) { this.platos = platos; }
}
