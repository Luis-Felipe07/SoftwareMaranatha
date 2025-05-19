package com.maranatha.sfmaranatha.Service;

import com.maranatha.sfmaranatha.Model.*;
import com.maranatha.sfmaranatha.Repository.*;
import com.maranatha.sfmaranatha.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PedidoService {

    
    @Autowired
    private UsuarioRepository miRepositorioDeUsuarios;
    @Autowired
    private ReservaRepository miRepositorioDeReservas;
    @Autowired
    private PlatoRepository miRepositorioDePlatos;
    @Autowired
    private PedidoRepository miRepositorioDePedidos;
    @Autowired
    private UsuarioService miServicioDeUsuarios; // Lo uso para crear usuarios "invitados"

    
    @Transactional
    public Pedido crearPedido(PedidoRequestDTO datosDelPedido) {
        Usuario usuarioFinalDelPedido; // Este es el usuario que quedará asociado al pedido en la BD.

        if (datosDelPedido.isParaInvitadoPorEncargado()) {
            
            if (datosDelPedido.getSolicitanteUsuarioId() == null) {
                 throw new RuntimeException("Para crear un pedido para un invitado, necesito saber qué encargado lo está haciendo.");
            }
            Optional<Usuario> solicitanteOpt = miRepositorioDeUsuarios.findById(datosDelPedido.getSolicitanteUsuarioId());
            if (solicitanteOpt.isEmpty() || 
                !esEncargadoOAdmin(solicitanteOpt.get().getTipoUsuario())) {
                // Si no es un encargado o admin, no le permito esta acción.
                throw new SecurityException("Acción no permitida: Solo un encargado o administrador puede crear pedidos para invitados de esta forma.");
            }
            // Como es un encargado, creo un usuario "invitado" con el nombre opcional que me dieron.
            usuarioFinalDelPedido = miServicioDeUsuarios.crearUsuarioInvitadoLocal(datosDelPedido.getNombreInvitadoOpcional());
        } else {
            // Este es un pedido normal hecho por un cliente.
            if (datosDelPedido.getSolicitanteUsuarioId() == null) {
                
                throw new RuntimeException("El ID del usuario solicitante es necesario para procesar este pedido.");
            }
            usuarioFinalDelPedido = miRepositorioDeUsuarios.findById(datosDelPedido.getSolicitanteUsuarioId())
                .orElseThrow(() -> new RuntimeException("No encontré al usuario solicitante con el ID: " + datosDelPedido.getSolicitanteUsuarioId()));
        }

        // Busco la reserva si es que el pedido está asociado a una.
        Reserva reservaAsociada = null;
        if (datosDelPedido.getReservaId() != null) {
            reservaAsociada = miRepositorioDeReservas.findById(datosDelPedido.getReservaId().longValue())
                .orElseThrow(() -> new RuntimeException("La reserva que me indicaste no es válida"));
        }

        // Ahora sí, creo el objeto Pedido.
        Pedido nuevoPedido = new Pedido();
        nuevoPedido.setUsuario(usuarioFinalDelPedido); 
        nuevoPedido.setReserva(reservaAsociada);
        nuevoPedido.setEstado("PENDIENTE"); 
        nuevoPedido.setFechaPedido(LocalDateTime.now()); 

        // Tomo los datos del cliente del objeto Usuario para guardarlos en el pedido.
        String apellidoCliente = (usuarioFinalDelPedido.getApellido() != null && usuarioFinalDelPedido.getApellido().equals(".")) 
                               ? "" 
                               : usuarioFinalDelPedido.getApellido();
        nuevoPedido.setNombreCliente((usuarioFinalDelPedido.getNombre() + " " + apellidoCliente).trim());
        nuevoPedido.setCorreoCliente(usuarioFinalDelPedido.getCorreo()); 
        nuevoPedido.setTelefonoCliente(usuarioFinalDelPedido.getTelefono()); 
        
        nuevoPedido.setMetodoPago(datosDelPedido.getMetodoPago());
        nuevoPedido.setDescripcion(datosDelPedido.getDescripcion());

        // Si me dieron dirección de entrega o hora para restaurante, las guardo.
        if (datosDelPedido.getDireccionEntrega() != null && !datosDelPedido.getDireccionEntrega().isEmpty()) {
            nuevoPedido.setDireccionEntrega(datosDelPedido.getDireccionEntrega());
        }
        if (datosDelPedido.getHoraEntregaRestaurante() != null && !datosDelPedido.getHoraEntregaRestaurante().isEmpty()) {
            nuevoPedido.setHoraEntregaRestaurante(datosDelPedido.getHoraEntregaRestaurante());
        }
        
        // Proceso cada plato del pedido.
        List<PedidoPlato> lineasDelPedido = datosDelPedido.getItems().stream().map(itemDto -> {
            Plato platoDelItem = miRepositorioDePlatos.findById(itemDto.getPlatoId()) // Uso el ID de plato (Integer)
                .orElseThrow(() -> new RuntimeException("El plato con ID " + itemDto.getPlatoId() + " no existe."));
    
            PedidoPlato unaLinea = new PedidoPlato(); // Mi constructor de PedidoPlato ya inicializa la clave PedidoPlatoKey.
            unaLinea.setPedido(nuevoPedido); 
            unaLinea.setPlato(platoDelItem);
            unaLinea.setCantidad(itemDto.getCantidad());
            unaLinea.setPrecioUnitario(platoDelItem.getPrecio()); 
            return unaLinea;
        }).collect(Collectors.toList());
    
        nuevoPedido.setItems(lineasDelPedido); 
    
        // Calculo el total sumando el precio de cada línea.
        BigDecimal totalDelPedido = lineasDelPedido.stream()
            .map(linea -> linea.getPrecioUnitario().multiply(BigDecimal.valueOf(linea.getCantidad())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        nuevoPedido.setTotal(totalDelPedido); 
    
        
        return miRepositorioDePedidos.save(nuevoPedido); 
    }
    
    /**
     *  verifico si un tipo de usuario es ENCARGADO o ADMIN.
     */
    private boolean esEncargadoOAdmin(String tipoUsuario) {
        return "ENCARGADO".equalsIgnoreCase(tipoUsuario) || "ADMIN".equalsIgnoreCase(tipoUsuario);
    }

    /**
     *  cancelar un pedido.
     * Pero primero verifico que quien lo pide sea el dueño o un trabajador con permiso,
     * y que el pedido todavía esté "PENDIENTE".
     */
    @Transactional
    public Pedido cancelarPedido(Long idDelPedidoACancelar, Integer idUsuarioAutenticado, String rolUsuarioAutenticado) throws Exception {
        Pedido pedidoParaCancelar = miRepositorioDePedidos.findById(idDelPedidoACancelar)
            .orElseThrow(() -> new Exception("No encontré el pedido que quieres cancelar (ID: " + idDelPedidoACancelar + ")."));

        boolean tienePermiso = false;
        // Verifico si el usuario autenticado es el dueño del pedido
        if (pedidoParaCancelar.getUsuario() != null && pedidoParaCancelar.getUsuario().getIdUsuario().equals(idUsuarioAutenticado)) {
            tienePermiso = true;
        } else if (esEncargadoOAdmin(rolUsuarioAutenticado)) { 
            tienePermiso = true;
        }

        if (!tienePermiso) {
            throw new SecurityException("Lo siento, pero no tienes permiso para cancelar este pedido.");
        }

        if (!"PENDIENTE".equalsIgnoreCase(pedidoParaCancelar.getEstado())) {
            throw new Exception("No puedo cancelar este pedido. Su estado actual es: " + pedidoParaCancelar.getEstado() + ". Solo puedo cancelar los que están PENDIENTES.");
        }

        pedidoParaCancelar.setEstado("CANCELADO");
        return miRepositorioDePedidos.save(pedidoParaCancelar);
    }
}
