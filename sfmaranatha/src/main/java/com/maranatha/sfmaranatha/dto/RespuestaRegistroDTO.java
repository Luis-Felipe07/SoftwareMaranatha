package com.maranatha.sfmaranatha.dto;

public class RespuestaRegistroDTO {
    private String mensaje;
    private String redirectUrl;

    public RespuestaRegistroDTO() {}

    public RespuestaRegistroDTO(String mensaje, String redirectUrl) {
        this.mensaje = mensaje;
        this.redirectUrl = redirectUrl;
    }

    // Getters y setters
    public String getMensaje() {
        return mensaje;
    }
    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
    public String getRedirectUrl() {
        return redirectUrl;
    }
    public void setRedirectUrl(String redirectUrl) {
        this.redirectUrl = redirectUrl;
    }
}