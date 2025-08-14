package com.maranatha.sfmaranatha.Service;

import com.maranatha.sfmaranatha.Model.*;
import com.maranatha.sfmaranatha.Repository.*;
import com.maranatha.sfmaranatha.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservaService {

    @Autowired
    private ReservaRepository reservaRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private MesaRepository mesaRepository;
    
    @Autowired
    private PedidoService pedidoService;
    
    @Autowired
    private PlatoRepository platoRepository;

    /**
     * Crear una nueva reserva
     */
    @Transactional
    public Reserva crearReserva(ReservaRequestDTO datosReserva) throws Exception {
        // Buscar el usuario
        Usuario usuario = usuarioRepository.findById(datosReserva.getIdUsuario())
            .orElseThrow(() -> new Exception("Usuario no encontrado"));

        // Verificar disponibilidad de la mesa
        Mesa mesa = mesaRepository.findAll().stream()
            .filter(m -> m.getNumero() == datosReserva.getNumeroMesa())
            .findFirst()
            .orElseThrow(() -> new Exception("Mesa no encontrada"));

        if (!mesa.getEstado().equals("Disponible")) {
            throw new Exception("La mesa no está disponible");
        }

        // Crear la reserva
        Reserva nuevaReserva = new Reserva();
        nuevaReserva.setUsuario(usuario);
        nuevaReserva.setFechaReserva(datosReserva.getFechaReserva());
        nuevaReserva.setHoraReserva(datosReserva.getHoraReserva());
        nuevaReserva.setNumeroPersonas(datosReserva.getNumeroPersonas());
        nuevaReserva.setEstado("CONFIRMADA");
        nuevaReserva.setIdRestaurante(1); // Por defecto
        nuevaReserva.setNumeroMesa(datosReserva.getNumeroMesa());

        // Guardar la reserva
        Reserva reservaGuardada = reservaRepository.save(nuevaReserva);

        // Si hay pedido anticipado, crearlo
        if (datosReserva.getPlatos() != null && !datosReserva.getPlatos().isEmpty()) {
            crearPedidoAnticipado(reservaGuardada, usuario, datosReserva);
        }

        // Marcar la mesa como ocupada
        mesa.setEstado("Ocupada");
        mesaRepository.save(mesa);

        return reservaGuardada;
    }

    /**
     * Crear pedido anticipado para la reserva
     */
    private void crearPedidoAnticipado(Reserva reserva, Usuario usuario, ReservaRequestDTO datosReserva) {
        try {
            // Convertir los platos del DTO de reserva al formato esperado por PedidoRequestDTO
            List<LineaPedidoDTO> items = datosReserva.getPlatos().stream()
                .map(plato -> {
                    LineaPedidoDTO item = new LineaPedidoDTO();
                    item.setPlatoId(plato.getPlatoId());
                    item.setCantidad(plato.getCantidad());
                    return item;
                })
                .toList();

            // Crear el DTO del pedido
            PedidoRequestDTO pedidoDTO = new PedidoRequestDTO();
            pedidoDTO.setSolicitanteUsuarioId(usuario.getIdUsuario());
            pedidoDTO.setReservaId(reserva.getIdReserva().intValue());
            pedidoDTO.setItems(items);
            pedidoDTO.setMetodoPago(datosReserva.getMetodoPago());
            pedidoDTO.setDescripcion("Pedido anticipado para reserva #" + reserva.getIdReserva());
            pedidoDTO.setHoraEntregaRestaurante(datosReserva.getHoraReserva().toString());
            pedidoDTO.setParaInvitadoPorEncargado(false);

            // Crear el pedido
            pedidoService.crearPedido(pedidoDTO);
        } catch (Exception e) {
            // Log del error pero no fallar la reserva
            System.err.println("Error al crear pedido anticipado: " + e.getMessage());
        }
    }

    /**
     * Obtener todas las reservas para administradores
     */
    public List<Reserva> obtenerTodasLasReservas() {
        return reservaRepository.findAll();
    }

    /**
     * Obtener todas las reservas en formato detallado para la interfaz de gestión
     */
    public List<ReservaDetalladaDTO> obtenerReservasDetalladas() {
        List<Reserva> reservas = reservaRepository.findAll();
        return reservas.stream()
                .map(this::convertirAReservaDetallada)
                .collect(Collectors.toList());
    }

    /**
     * Convertir una reserva a DTO detallado
     */
    private ReservaDetalladaDTO convertirAReservaDetallada(Reserva reserva) {
        ReservaDetalladaDTO dto = new ReservaDetalladaDTO();
        
        dto.setIdReserva(reserva.getIdReserva());
        dto.setFechaReserva(reserva.getFechaReserva());
        dto.setHoraReserva(reserva.getHoraReserva());
        dto.setNumeroPersonas(reserva.getNumeroPersonas());
        dto.setEstado(reserva.getEstado());
        dto.setNumeroMesa(reserva.getNumeroMesa());
        
        // Datos del usuario
        if (reserva.getUsuario() != null) {
            Usuario usuario = reserva.getUsuario();
            String nombreCompleto = usuario.getNombre() + " " + usuario.getApellido();
            dto.setNombreCompleto(nombreCompleto);
            dto.setCorreoUsuario(usuario.getCorreo());
            dto.setTelefonoUsuario(usuario.getTelefono());
        } else {
            dto.setNombreCompleto("Sin nombre");
            dto.setCorreoUsuario("Sin correo");
            dto.setTelefonoUsuario("Sin teléfono");
        }
        
        return dto;
    }

    /**
     * Obtener reservas por usuario
     */
    public List<Reserva> obtenerReservasPorUsuario(Integer idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario).orElse(null);
        if (usuario != null) {
            return usuario.getReservas();
        }
        return List.of();
    }

    /**
     * Obtener reserva por ID
     */
    public Reserva obtenerReservaPorId(Long idReserva) throws Exception {
        return reservaRepository.findById(idReserva)
            .orElseThrow(() -> new Exception("Reserva no encontrada"));
    }

    /**
     * Actualizar estado de reserva
     */
    @Transactional
    public Reserva actualizarEstadoReserva(Long idReserva, String nuevoEstado) throws Exception {
        Reserva reserva = obtenerReservaPorId(idReserva);
        reserva.setEstado(nuevoEstado);
        return reservaRepository.save(reserva);
    }

    /**
     * Cancelar reserva
     */
    @Transactional
    public void cancelarReserva(Long idReserva) throws Exception {
        Reserva reserva = obtenerReservaPorId(idReserva);
        
        // Cambiar estado a cancelada
        reserva.setEstado("CANCELADA");
        reservaRepository.save(reserva);
        
        // Liberar la mesa
        List<Mesa> mesas = mesaRepository.findAll();
        Mesa mesa = mesas.stream()
            .filter(m -> m.getNumero() == reserva.getNumeroMesa())
            .findFirst()
            .orElse(null);
            
        if (mesa != null) {
            mesa.setEstado("Disponible");
            mesaRepository.save(mesa);
        }
        
        // Cancelar pedidos asociados si existen
        if (reserva.getPedidos() != null) {
            for (Pedido pedido : reserva.getPedidos()) {
                if (pedido.getEstado().equals("PENDIENTE")) {
                    pedido.setEstado("CANCELADO");
                }
            }
        }
    }
}