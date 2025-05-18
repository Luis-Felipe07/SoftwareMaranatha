package com.maranatha.sfmaranatha.dto;

import java.util.List;

/**
 * Yo soy el DTO que uso para recibir los datos de un nuevo pedido desde el frontend.
 * Contengo toda la información necesaria, ya sea un pedido de un cliente
 * o un pedido que un encargado toma para un invitado en el restaurante.
 */
public class PedidoRequestDTO {

    private Integer solicitanteUsuarioId; // ID del usuario que HACE LA SOLICITUD (cliente o encargado)
    private Integer reservaId;           // ID de la reserva (puede ser null)
    // private Integer restauranteId;    // ID del restaurante (actualmente no lo uso activamente en PedidoService para crear el pedido, pero lo mantengo por si acaso)
    private List<LineaPedidoDTO> items;  // La lista de platos y sus cantidades
    private String metodoPago;           // Cómo va a pagar el cliente (EFECTIVO, TARJETA, etc.)
    private String descripcion;          // Alguna observación adicional para el pedido

    // Campos específicos para diferentes tipos de pedido
    private String direccionEntrega;       // Si es a domicilio, aquí va la dirección
    private String horaEntregaRestaurante; // Si es para recoger o consumir en el restaurante, la hora

    // Campos para cuando un encargado crea un pedido para un invitado que no se quiere registrar
    private boolean paraInvitadoPorEncargado; // Será 'true' si un encargado crea el pedido para un nuevo invitado
    private String nombreInvitadoOpcional;   // El nombre (opcional) que el invitado quiera dar

    // Mi constructor vacío, necesario para la deserialización
    public PedidoRequestDTO() {}

    // A continuación, todos mis getters y setters para que puedan acceder y modificar mis datos

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

    // public Integer getRestauranteId() {
    //     return restauranteId;
    // }

    // public void setRestauranteId(Integer restauranteId) {
    //     this.restauranteId = restauranteId;
    // }

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
