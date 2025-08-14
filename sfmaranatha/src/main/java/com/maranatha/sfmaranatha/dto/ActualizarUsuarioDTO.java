package com.maranatha.sfmaranatha.dto;

public class ActualizarUsuarioDTO {
    private String telefono;
    private String direccion;
    
    // Constructor vacío
    public ActualizarUsuarioDTO() {}
    
    // Getters y Setters
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
}