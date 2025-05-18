package com.maranatha.sfmaranatha.dto;

public class RespuestaRegistroDTO {
    private String mensaje;
    private String redirectUrl;
    private Integer usuarioId; // Nuevo campo para devolver el ID del usuario registrado

    public RespuestaRegistroDTO() {}

    // Constructor actualizado para incluir usuarioId
    public RespuestaRegistroDTO(String mensaje, String redirectUrl, Integer usuarioId) {
        this.mensaje = mensaje;
        this.redirectUrl = redirectUrl;
        this.usuarioId = usuarioId;
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

    public Integer getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Integer usuarioId) {
        this.usuarioId = usuarioId;
    }
}