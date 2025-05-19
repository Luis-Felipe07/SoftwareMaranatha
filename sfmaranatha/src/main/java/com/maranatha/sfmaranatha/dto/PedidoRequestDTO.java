package com.maranatha.sfmaranatha.dto;

import java.util.List;


public class PedidoRequestDTO {

    private Integer solicitanteUsuarioId; 
    private Integer reservaId;           
     
    private List<LineaPedidoDTO> items; 
    private String metodoPago;         
    private String descripcion;        

    // Campos específicos para diferentes tipos de pedido
    private String direccionEntrega;      
    private String horaEntregaRestaurante; 

    
    private boolean paraInvitadoPorEncargado; 
    private String nombreInvitadoOpcional;  

    //  constructor vacío necesario para la deserialización
    public PedidoRequestDTO() {}

    // Getters y Setters 

    public Integer getSolicitanteUsuarioId() {
        return solicitanteUsuarioId;
    }

    public void setSolicitanteUsuarioId(Integer solicitanteUsuarioId) {
        this.solicitanteUsuarioId = solicitanteUsuarioId;
    }

    public Integer getReservaId() {
        return reservaId;
    }

    public void setReservaId(Integer reservaId) {
        this.reservaId = reservaId;
    }

    

    public List<LineaPedidoDTO> getItems() {
        return items;
    }

    public void setItems(List<LineaPedidoDTO> items) {
        this.items = items;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDireccionEntrega() {
        return direccionEntrega;
    }

    public void setDireccionEntrega(String direccionEntrega) {
        this.direccionEntrega = direccionEntrega;
    }

    public String getHoraEntregaRestaurante() {
        return horaEntregaRestaurante;
    }

    public void setHoraEntregaRestaurante(String horaEntregaRestaurante) {
        this.horaEntregaRestaurante = horaEntregaRestaurante;
    }

    public boolean isParaInvitadoPorEncargado() {
        return paraInvitadoPorEncargado;
    }

    public void setParaInvitadoPorEncargado(boolean paraInvitadoPorEncargado) {
        this.paraInvitadoPorEncargado = paraInvitadoPorEncargado;
    }

    public String getNombreInvitadoOpcional() {
        return nombreInvitadoOpcional;
    }

    public void setNombreInvitadoOpcional(String nombreInvitadoOpcional) {
        this.nombreInvitadoOpcional = nombreInvitadoOpcional;
    }
}
