package com.maranatha.sfmaranatha.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "mesas")  
public class Mesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int numero;

    
    private String estado;

    public Mesa() {
    }

    public Mesa(int numero, String estado) {
        this.numero = numero;
        this.estado = estado;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public int getNumero() {
        return numero;
    }

    public void setNumero(int numero) {
        this.numero = numero;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
