package com.maranatha.sfmaranatha.dto;

public class LoginResponseDTO {
    private boolean valido;
    private String rol;
    private String mensaje;

    public LoginResponseDTO() {}
    public LoginResponseDTO(boolean valido, String rol, String mensaje) {
        this.valido = valido;
        this.rol    = rol;
        this.mensaje= mensaje;
    }

    public boolean isValido() { return valido; }
    public void setValido(boolean valido) { this.valido = valido; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
}