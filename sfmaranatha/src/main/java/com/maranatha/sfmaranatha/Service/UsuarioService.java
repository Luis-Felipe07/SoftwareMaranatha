package com.maranatha.sfmaranatha.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; 

import com.maranatha.sfmaranatha.Model.Pedido;
import com.maranatha.sfmaranatha.Model.Reserva;
import com.maranatha.sfmaranatha.Model.Usuario;
import com.maranatha.sfmaranatha.Repository.UsuarioRepository;
import com.maranatha.sfmaranatha.dto.RegistroUsuarioDTO;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository miRepositorioDeUsuarios;

    @Autowired
    private BCryptPasswordEncoder miCodificadorDeContrasenas;

    /**
     * Registrar un nuevo usuario .
     * Valido si el correo o el número de documento ya existen.
     * Codifico la contraseña y considero si el registro fue directo en el restaurante.
     */
    @Transactional
    public Usuario registrarUsuario(RegistroUsuarioDTO datosDelNuevoUsuario) {
        
        if (datosDelNuevoUsuario.getCorreo() != null && !datosDelNuevoUsuario.getCorreo().trim().isEmpty() &&
            miRepositorioDeUsuarios.findByCorreo(datosDelNuevoUsuario.getCorreo().trim()).isPresent()) {
            throw new RuntimeException("El correo que me diste ('" + datosDelNuevoUsuario.getCorreo() + "') ya está registrado. Intenta con otro.");
        }
        
        if (datosDelNuevoUsuario.getNumeroDocumento() != null && !datosDelNuevoUsuario.getNumeroDocumento().trim().isEmpty() &&
            miRepositorioDeUsuarios.findByNumeroDocumento(datosDelNuevoUsuario.getNumeroDocumento().trim()).isPresent()) {
            throw new RuntimeException("El número de documento que me diste ya está registrado.");
        }

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre(datosDelNuevoUsuario.getNombre());
        nuevoUsuario.setApellido(datosDelNuevoUsuario.getApellido());
        nuevoUsuario.setTipoDocumento(datosDelNuevoUsuario.getTipoDocumento());
        nuevoUsuario.setNumeroDocumento(datosDelNuevoUsuario.getNumeroDocumento());
        nuevoUsuario.setCorreo(datosDelNuevoUsuario.getCorreo());
        nuevoUsuario.setTelefono(datosDelNuevoUsuario.getTelefono());
        nuevoUsuario.setDireccion(datosDelNuevoUsuario.getDireccion());
        
        // Si me dan una contraseña, la codifico. Si no (como para invitados), se generará una temporal.
        if (datosDelNuevoUsuario.getContrasena() != null && !datosDelNuevoUsuario.getContrasena().isEmpty()) {
            nuevoUsuario.setContrasena(miCodificadorDeContrasenas.encode(datosDelNuevoUsuario.getContrasena()));
        } else {
            // Genero una contraseña temporal segura 
            String contrasenaTemporalMuySegura = "InvitadoPass" + System.currentTimeMillis() + UUID.randomUUID().toString();
            nuevoUsuario.setContrasena(miCodificadorDeContrasenas.encode(contrasenaTemporalMuySegura));
        }
        
        nuevoUsuario.setFueDirecto(datosDelNuevoUsuario.getFueDirecto() != null ? datosDelNuevoUsuario.getFueDirecto() : false);
        nuevoUsuario.setFechaRegistro(LocalDateTime.now());
        
        String tipoUsuarioAAsignar = datosDelNuevoUsuario.getTipoUsuario();
        if (tipoUsuarioAAsignar == null || tipoUsuarioAAsignar.trim().isEmpty()) {
            tipoUsuarioAAsignar = "CLIENTE"; 
        }
        nuevoUsuario.setTipoUsuario(tipoUsuarioAAsignar);

        return miRepositorioDeUsuarios.save(nuevoUsuario);
    }

    /**
     * Creo un usuario "invitado" muy básico para esos pedidos rápidos en el local.
     * @param nombreOpcional 
     * @return 
     */
    @Transactional
    public Usuario crearUsuarioInvitadoLocal(String nombreOpcional) {
        Usuario invitado = new Usuario();
        
        String nombreBase = (nombreOpcional != null && !nombreOpcional.trim().isEmpty()) ? nombreOpcional.trim() : "Cliente Local";
        long timestamp = System.currentTimeMillis(); // Para generar datos únicos

        invitado.setNombre(nombreBase);
        invitado.setApellido("."); // Pongo un punto como apellido por defecto, ya que es NOT NULL en la BD.
        
        invitado.setCorreo("invitado_" + timestamp + "@restaurantemaranatha.local"); // Uso .local para diferenciar
        invitado.setNumeroDocumento("INV-" + timestamp);
        invitado.setTipoDocumento("NA"); 

        invitado.setTelefono(""); 
        invitado.setDireccion("");
        
        // Genero una contraseña muy segura y aleatoria que nadie ni el invitado usará para login.
        String contrasenaTemporalInvitado = "InvitadoPass_" + UUID.randomUUID().toString() + "_" + timestamp;
        invitado.setContrasena(miCodificadorDeContrasenas.encode(contrasenaTemporalInvitado)); 
        
        invitado.setFueDirecto(true); // ¡Importante! Marco que este usuario se creó directamente en el restaurante.
        invitado.setFechaRegistro(LocalDateTime.now());
        invitado.setTipoUsuario("CLIENTE"); // Aunque sea "invitado", sigue siendo un tipo de cliente para el sistema.

        return miRepositorioDeUsuarios.save(invitado);
    }

    /**
     * Buscar un usuario por su correo electrónico.
     */
    public Optional<Usuario> buscarPorCorreo(String correo) {
        return miRepositorioDeUsuarios.findByCorreo(correo);
    }

    /**
     * Buscar usuario por correo electrónico (método directo que devuelve Usuario o null)
     * Para compatibilidad con el sistema de calificaciones
     */
    public Usuario buscarPorCorreoDirecto(String correo) {
        Optional<Usuario> usuario = miRepositorioDeUsuarios.findByCorreo(correo);
        return usuario.orElse(null);
    }

    /**
     * Buscar un usuario por su número de documento.
     */
    public Optional<Usuario> buscarPorNumeroDocumento(String numeroDocumento) {
        return miRepositorioDeUsuarios.findByNumeroDocumento(numeroDocumento);
    }

    /**
     * Buscar usuario por ID
     */
    public Optional<Usuario> buscarPorId(Integer id) {
        return miRepositorioDeUsuarios.findById(id);
    }

    /**
     * Buscar usuario por ID (método directo que devuelve Usuario o null)
     * Para compatibilidad con el sistema de calificaciones
     */
    public Usuario buscarPorIdDirecto(Integer id) {
        Optional<Usuario> usuario = miRepositorioDeUsuarios.findById(id);
        return usuario.orElse(null);
    }

    /**
     * Verificar si un usuario existe por correo
     */
    public boolean existePorCorreo(String correo) {
        return miRepositorioDeUsuarios.findByCorreo(correo).isPresent();
    }

    /**
     * Verificar si un usuario existe por número de documento
     */
    public boolean existePorNumeroDocumento(String numeroDocumento) {
        return miRepositorioDeUsuarios.findByNumeroDocumento(numeroDocumento).isPresent();
    }

    /**
     * Actualizar usuario
     */
    @Transactional
    public Usuario actualizarUsuario(Usuario usuario) {
        return miRepositorioDeUsuarios.save(usuario);
    }

    /**
     * Guardar o actualizar usuario (alias para actualizarUsuario)
     */
    @Transactional
    public Usuario guardar(Usuario usuario) {
        return miRepositorioDeUsuarios.save(usuario);
    }

    /**
     * Obtener estadísticas del usuario
     */
    public Map<String, Object> obtenerEstadisticasUsuario(Integer idUsuario) {
        Map<String, Object> estadisticas = new HashMap<>();
        
        try {
            Usuario usuario = miRepositorioDeUsuarios.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            // Total de pedidos
            List<Pedido> pedidos = usuario.getPedidos();
            estadisticas.put("totalPedidos", pedidos != null ? pedidos.size() : 0);
            
            // Pedidos por estado
            Map<String, Long> pedidosPorEstado = new HashMap<>();
            if (pedidos != null) {
                pedidosPorEstado = pedidos.stream()
                    .collect(Collectors.groupingBy(Pedido::getEstado, Collectors.counting()));
            }
            estadisticas.put("pedidosPorEstado", pedidosPorEstado);
            
            // Total de reservas
            List<Reserva> reservas = usuario.getReservas();
            estadisticas.put("totalReservas", reservas != null ? reservas.size() : 0);
            
            // Próxima reserva
            LocalDateTime ahora = LocalDateTime.now();
            Optional<Reserva> proximaReserva = reservas != null ? 
                reservas.stream()
                    .filter(r -> r.getEstado().equals("CONFIRMADA"))
                    .filter(r -> {
                        LocalDateTime fechaReserva = LocalDateTime.of(r.getFechaReserva(), r.getHoraReserva());
                        return fechaReserva.isAfter(ahora);
                    })
                    .min(Comparator.comparing(r -> LocalDateTime.of(r.getFechaReserva(), r.getHoraReserva())))
                : Optional.empty();
            
            if (proximaReserva.isPresent()) {
                Reserva reserva = proximaReserva.get();
                estadisticas.put("proximaReserva", Map.of(
                    "fecha", reserva.getFechaReserva(),
                    "hora", reserva.getHoraReserva(),
                    "personas", reserva.getNumeroPersonas(),
                    "mesa", reserva.getNumeroMesa()
                ));
            } else {
                estadisticas.put("proximaReserva", null);
            }
            
            // Último pedido
            Optional<Pedido> ultimoPedido = pedidos != null ?
                pedidos.stream()
                    .max(Comparator.comparing(Pedido::getFechaPedido))
                : Optional.empty();
            
            if (ultimoPedido.isPresent()) {
                Pedido pedido = ultimoPedido.get();
                estadisticas.put("ultimoPedido", Map.of(
                    "id", pedido.getIdPedido(),
                    "fecha", pedido.getFechaPedido(),
                    "total", pedido.getTotal(),
                    "estado", pedido.getEstado()
                ));
            } else {
                estadisticas.put("ultimoPedido", null);
            }
            
            // Total gastado
            BigDecimal totalGastado = pedidos != null ?
                pedidos.stream()
                    .filter(p -> p.getEstado().equals("ENTREGADO"))
                    .map(Pedido::getTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                : BigDecimal.ZERO;
            estadisticas.put("totalGastado", totalGastado);
            
            // Pedidos entregados (para calificaciones)
            long pedidosEntregados = pedidos != null ?
                pedidos.stream()
                    .filter(p -> p.getEstado().equals("ENTREGADO"))
                    .count()
                : 0;
            estadisticas.put("pedidosEntregados", pedidosEntregados);
            
            // Reservas por estado
            Map<String, Long> reservasPorEstado = new HashMap<>();
            if (reservas != null) {
                reservasPorEstado = reservas.stream()
                    .collect(Collectors.groupingBy(Reserva::getEstado, Collectors.counting()));
            }
            estadisticas.put("reservasPorEstado", reservasPorEstado);
            
        } catch (Exception e) {
            System.err.println("Error obteniendo estadísticas del usuario: " + e.getMessage());
        }
        
        return estadisticas;
    }

    /**
     * Obtener pedidos entregados de un usuario (para el sistema de calificaciones)
     */
    public List<Pedido> obtenerPedidosEntregados(Integer idUsuario) {
        try {
            Usuario usuario = miRepositorioDeUsuarios.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            List<Pedido> pedidos = usuario.getPedidos();
            if (pedidos != null) {
                return pedidos.stream()
                    .filter(p -> "ENTREGADO".equals(p.getEstado()))
                    .sorted(Comparator.comparing(Pedido::getFechaPedido).reversed())
                    .collect(Collectors.toList());
            }
            
            return List.of();
        } catch (Exception e) {
            System.err.println("Error obteniendo pedidos entregados: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Verificar si un usuario tiene pedidos entregados
     */
    public boolean tienePedidosEntregados(Integer idUsuario) {
        try {
            Usuario usuario = miRepositorioDeUsuarios.findById(idUsuario)
                .orElse(null);
            
            if (usuario == null || usuario.getPedidos() == null) {
                return false;
            }
            
            return usuario.getPedidos().stream()
                .anyMatch(p -> "ENTREGADO".equals(p.getEstado()));
        } catch (Exception e) {
            System.err.println("Error verificando pedidos entregados: " + e.getMessage());
            return false;
        }
    }

    /**
     * Contar pedidos entregados sin calificar de un usuario
     */
    public long contarPedidosSinCalificar(Integer idUsuario) {
        try {
            Usuario usuario = miRepositorioDeUsuarios.findById(idUsuario)
                .orElse(null);
            
            if (usuario == null || usuario.getPedidos() == null) {
                return 0;
            }
            
            return usuario.getPedidos().stream()
                .filter(p -> "ENTREGADO".equals(p.getEstado()))
                .filter(p -> p.getCalificacion() == null) 
                .count();
        } catch (Exception e) {
            System.err.println("Error contando pedidos sin calificar: " + e.getMessage());
            return 0;
        }
    }
}