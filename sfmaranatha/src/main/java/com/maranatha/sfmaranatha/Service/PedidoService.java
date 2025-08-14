package com.maranatha.sfmaranatha.Service;

import com.maranatha.sfmaranatha.Model.*;
import com.maranatha.sfmaranatha.Repository.*;
import com.maranatha.sfmaranatha.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private UsuarioRepository miRepositorioDeUsuarios;
    @Autowired
    private ReservaRepository miRepositorioDeReservas;
    @Autowired
    private PlatoRepository miRepositorioDePlatos;
    @Autowired
    private PedidoRepository miRepositorioDePedidos;
    @Autowired
    private UsuarioService miServicioDeUsuarios;

    public List<PedidoDetalladoDTO> listarDetallados() {
    return pedidoRepository.findAll()
            .stream()
            .map(this::convertirAPedidoDetallado)
            .collect(Collectors.toList());
}
    @Transactional
    public Pedido crearPedido(PedidoRequestDTO datosDelPedido) {
        Usuario usuarioFinalDelPedido;

        if (datosDelPedido.isParaInvitadoPorEncargado()) {
            if (datosDelPedido.getSolicitanteUsuarioId() == null) {
                throw new RuntimeException("Para crear un pedido para un invitado, necesito saber qué encargado lo está haciendo.");
            }
            Optional<Usuario> solicitanteOpt = miRepositorioDeUsuarios.findById(datosDelPedido.getSolicitanteUsuarioId());
            if (solicitanteOpt.isEmpty() || 
                !esEncargadoOAdmin(solicitanteOpt.get().getTipoUsuario())) {
                throw new SecurityException("Acción no permitida: Solo un encargado o administrador puede crear pedidos para invitados de esta forma.");
            }
            usuarioFinalDelPedido = miServicioDeUsuarios.crearUsuarioInvitadoLocal(datosDelPedido.getNombreInvitadoOpcional());
        } else {
            if (datosDelPedido.getSolicitanteUsuarioId() == null) {
                throw new RuntimeException("El ID del usuario solicitante es necesario para procesar este pedido.");
            }
            usuarioFinalDelPedido = miRepositorioDeUsuarios.findById(datosDelPedido.getSolicitanteUsuarioId())
                .orElseThrow(() -> new RuntimeException("No encontré al usuario solicitante con el ID: " + datosDelPedido.getSolicitanteUsuarioId()));
        }

        Reserva reservaAsociada = null;
        if (datosDelPedido.getReservaId() != null) {
            reservaAsociada = miRepositorioDeReservas.findById(datosDelPedido.getReservaId().longValue())
                .orElseThrow(() -> new RuntimeException("La reserva que me indicaste no es válida"));
        }

        Pedido nuevoPedido = new Pedido();
        nuevoPedido.setUsuario(usuarioFinalDelPedido);
        nuevoPedido.setReserva(reservaAsociada);
        nuevoPedido.setEstado("PENDIENTE");
        nuevoPedido.setFechaPedido(LocalDateTime.now());

        String apellidoCliente = (usuarioFinalDelPedido.getApellido() != null && usuarioFinalDelPedido.getApellido().equals(".")) 
                               ? "" 
                               : usuarioFinalDelPedido.getApellido();
        nuevoPedido.setNombreCliente((usuarioFinalDelPedido.getNombre() + " " + apellidoCliente).trim());
        nuevoPedido.setCorreoCliente(usuarioFinalDelPedido.getCorreo());
        nuevoPedido.setTelefonoCliente(usuarioFinalDelPedido.getTelefono());
        
        nuevoPedido.setMetodoPago(datosDelPedido.getMetodoPago());
        nuevoPedido.setDescripcion(datosDelPedido.getDescripcion());

        if (datosDelPedido.getDireccionEntrega() != null && !datosDelPedido.getDireccionEntrega().isEmpty()) {
            nuevoPedido.setDireccionEntrega(datosDelPedido.getDireccionEntrega());
        }
        if (datosDelPedido.getHoraEntregaRestaurante() != null && !datosDelPedido.getHoraEntregaRestaurante().isEmpty()) {
            nuevoPedido.setHoraEntregaRestaurante(datosDelPedido.getHoraEntregaRestaurante());
        }
        
        List<PedidoPlato> lineasDelPedido = datosDelPedido.getItems().stream().map(itemDto -> {
            Plato platoDelItem = miRepositorioDePlatos.findById(itemDto.getPlatoId())
                .orElseThrow(() -> new RuntimeException("El plato con ID " + itemDto.getPlatoId() + " no existe."));
    
            PedidoPlato unaLinea = new PedidoPlato();
            unaLinea.setPedido(nuevoPedido);
            unaLinea.setPlato(platoDelItem);
            unaLinea.setCantidad(itemDto.getCantidad());
            unaLinea.setPrecioUnitario(platoDelItem.getPrecio());
            return unaLinea;
        }).collect(Collectors.toList());
    
        nuevoPedido.setItems(lineasDelPedido);
    
        BigDecimal totalDelPedido = lineasDelPedido.stream()
            .map(linea -> linea.getPrecioUnitario().multiply(BigDecimal.valueOf(linea.getCantidad())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        nuevoPedido.setTotal(totalDelPedido);
    
        return miRepositorioDePedidos.save(nuevoPedido);
    }

    /**
     * Actualizo el estado de un pedido.
     */
    @Transactional
    public Pedido actualizarEstadoPedido(Long idPedido, String nuevoEstado) throws Exception {
        Pedido pedido = miRepositorioDePedidos.findById(idPedido)
            .orElseThrow(() -> new Exception("No encontré el pedido con ID: " + idPedido));

        // Valido los estados permitidos
        if (!nuevoEstado.equals("ENTREGADO") && !nuevoEstado.equals("CANCELADO") && !nuevoEstado.equals("PENDIENTE")) {
            throw new Exception("Estado no válido. Los estados permitidos son: PENDIENTE, ENTREGADO, CANCELADO");
        }

        // Solo permito cambios desde PENDIENTE
        if (!pedido.getEstado().equals("PENDIENTE") && !nuevoEstado.equals("PENDIENTE")) {
            throw new Exception("Solo se pueden actualizar pedidos en estado PENDIENTE");
        }

        pedido.setEstado(nuevoEstado);
        return miRepositorioDePedidos.save(pedido);
    }

    /**
     * Convierto un Pedido a PedidoDetalladoDTO para incluir información de los items.
     */
   public PedidoDetalladoDTO convertirAPedidoDetallado(Pedido pedido) {
        // Evito NullPointer: uso lista vacía si es null
        List<PedidoPlato> lineaSegura = Optional.ofNullable(pedido.getItems())
                                                .orElse(Collections.emptyList());

        List<PedidoDetalladoDTO.ItemPedidoDTO> itemsDTO = lineaSegura.stream()
                .map(item -> new PedidoDetalladoDTO.ItemPedidoDTO(
                        item.getPlato().getNombrePlato(),
                        item.getCantidad(),
                        item.getPrecioUnitario()))
                .collect(Collectors.toList());

        return new PedidoDetalladoDTO(
                pedido.getIdPedido(),
                pedido.getNombreCliente(),
                pedido.getTotal(),
                pedido.getMetodoPago(),
                pedido.getEstado(),
                pedido.getFechaPedido(),
                pedido.getDireccionEntrega(),
                pedido.getHoraEntregaRestaurante(),
                pedido.getDescripcion(),
                itemsDTO);
    }
    
    private boolean esEncargadoOAdmin(String tipoUsuario) {
        return "ENCARGADO".equalsIgnoreCase(tipoUsuario) || "ADMIN".equalsIgnoreCase(tipoUsuario);
    }

    @Transactional
    public Pedido cancelarPedido(Long idDelPedidoACancelar, Integer idUsuarioAutenticado, String rolUsuarioAutenticado) throws Exception {
        Pedido pedidoParaCancelar = miRepositorioDePedidos.findById(idDelPedidoACancelar)
            .orElseThrow(() -> new Exception("No encontré el pedido que quieres cancelar (ID: " + idDelPedidoACancelar + ")."));

        boolean tienePermiso = false;
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