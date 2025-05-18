package com.maranatha.sfmaranatha.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // Importar
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "pedido")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // AÑADIDO
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    private Long idPedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    @JsonBackReference("usuario-pedidos") // Referencia al lado "padre" en Usuario
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reserva") // Puede ser null
    @JsonBackReference("reserva-pedidos") // Referencia al lado "padre" en Reserva
    private Reserva reserva;

    @Column(name = "fecha_pedido", nullable = false)
    private LocalDateTime fechaPedido = LocalDateTime.now();

    @Column(length = 50, nullable = false)
    private String estado;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(name = "nombre_cliente", length = 100)
    private String nombreCliente;

    @Column(name = "correo_cliente", length = 100)
    private String correoCliente;

    @Column(name = "telefono_cliente", length = 20)
    private String telefonoCliente;

    @Column(name = "direccion_entrega", length = 255)
    private String direccionEntrega;

    @Column(name = "hora_entrega_restaurante", length = 50)
    private String horaEntregaRestaurante;

    @Column(name = "metodo_pago", length = 50)
    private String metodoPago;

    @Lob
    private String descripcion;

    @OneToOne(mappedBy = "pedido", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // Si Pago tiene una referencia a Pedido, podría necesitar @JsonManagedReference aquí y @JsonBackReference en Pago
    // Por ahora, asumiendo que Pago no tiene una referencia serializable de vuelta a Pedido o que no se serializa Pago desde Pedido directamente.
    private Pago pago;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("pedido-items") // Lado "padre" de la relación Pedido-PedidoPlato
    private List<PedidoPlato> items;

    public Pedido() {}

    // Getters y Setters (sin cambios)

    public Long getIdPedido() {
        return idPedido;
    }

    public void setIdPedido(Long idPedido) {
        this.idPedido = idPedido;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Reserva getReserva() {
        return reserva;
    }

    public void setReserva(Reserva reserva) {
        this.reserva = reserva;
    }

    public LocalDateTime getFechaPedido() {
        return fechaPedido;
    }

    public void setFechaPedido(LocalDateTime fechaPedido) {
        this.fechaPedido = fechaPedido;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getNombreCliente() {
        return nombreCliente;
    }

    public void setNombreCliente(String nombreCliente) {
        this.nombreCliente = nombreCliente;
    }

    public String getCorreoCliente() {
        return correoCliente;
    }

    public void setCorreoCliente(String correoCliente) {
        this.correoCliente = correoCliente;
    }

    public String getTelefonoCliente() {
        return telefonoCliente;
    }

    public void setTelefonoCliente(String telefonoCliente) {
        this.telefonoCliente = telefonoCliente;
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

    public Pago getPago() {
        return pago;
    }

    public void setPago(Pago pago) {
        this.pago = pago;
    }

    public List<PedidoPlato> getItems() {
        return items;
    }

    public void setItems(List<PedidoPlato> items) {
        this.items = items;
    }
}
