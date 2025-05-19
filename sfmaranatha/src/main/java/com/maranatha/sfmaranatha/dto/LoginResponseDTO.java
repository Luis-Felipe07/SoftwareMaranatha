package com.maranatha.sfmaranatha.dto;


public class LoginResponseDTO {
    private boolean valido; 
    private String rol; 
    private String mensaje; 
    private String nombre; 
    private Integer idUsuario; 

    
    public LoginResponseDTO() {}

    /**
     * 
     * @param valido 
     * @param rol .
     * @param mensaje 
     * @param nombre 
     * @param idUsuario 
     */
    public LoginResponseDTO(boolean valido, String rol, String mensaje, String nombre, Integer idUsuario) {
        this.valido = valido;
        this.rol    = rol;
        this.mensaje= mensaje;
        this.nombre = nombre;
        this.idUsuario = idUsuario;
    }

    // Getters y Setters

    /**
     * 
     * @return 
     */
    public boolean isValido() {
        return valido;
    }

    /**
     * 
     * @param valido 
     */
    public void setValido(boolean valido) {
        this.valido = valido;
    }

    /**
     * 
     * @return 
     */
    public String getRol() {
        return rol;
    }

    /**
     * 
     * @param rol 
     */
    public void setRol(String rol) {
        this.rol = rol;
    }

    /**
     * 
     * @return 
     */
    public String getMensaje() {
        return mensaje;
    }

    /**
     * 
     * @param mensaje 
     */
    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    /**
     * 
     * @return 
     */
    public String getNombre() {
        return nombre;
    }

    /**
     * 
     * @param nombre 
     */
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    /**
     * 
     * @return 
     */
    public Integer getIdUsuario() {
        return idUsuario;
    }

    /**
     * .
     * @param idUsuario 
     */
    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }
}
