package com.maranatha.sfmaranatha.Service;

import com.maranatha.sfmaranatha.Model.*;
import com.maranatha.sfmaranatha.Repository.*;
import com.maranatha.sfmaranatha.dto.CalificacionDTO;
import com.maranatha.sfmaranatha.dto.EstadisticasCalificacionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CalificacionService {

    @Autowired
    private CalificacionRepository calificacionRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private PedidoRepository pedidoRepository;
    
    @Autowired
    private RespuestaCalificacionRepository respuestaRepository;
    
    @Autowired
    private LikeCalificacionRepository likeRepository;

    /**
     * Crear una nueva calificación con usuario autenticado
     */
    @Transactional
    public Calificacion crearCalificacion(CalificacionDTO calificacionDTO) throws Exception {
        // Obtener usuario autenticado
        Usuario usuario = obtenerUsuarioAutenticado();
        
        // Convertir el ID del pedido de Integer a Long
        Long pedidoId = calificacionDTO.getIdPedido().longValue();
    
        // Verificar que el pedido existe y pertenece al usuario
        Optional<Pedido> pedidoOpt = pedidoRepository.findById(pedidoId);
        if (pedidoOpt.isEmpty()) {
            throw new Exception("Pedido no encontrado");
        }
        
        Pedido pedido = pedidoOpt.get();
        if (!pedido.getUsuario().getIdUsuario().equals(usuario.getIdUsuario())) {
            throw new Exception("El pedido no pertenece al usuario actual");
        }
        
        if (!"ENTREGADO".equals(pedido.getEstado())) {
            throw new Exception("Solo se pueden calificar pedidos entregados");
        }
        
        // Verificar que no haya calificado este pedido antes
        Optional<Calificacion> calificacionExistente = calificacionRepository.findByPedido(pedido);
        if (calificacionExistente.isPresent()) {
            throw new Exception("Este pedido ya ha sido calificado");
        }
        
        Calificacion nuevaCalificacion = new Calificacion();
        
        // Mapear datos del usuario
        nuevaCalificacion.setNombreCliente(usuario.getNombre() + " " + usuario.getApellido());
        nuevaCalificacion.setEmailCliente(usuario.getCorreo());
        nuevaCalificacion.setTelefonoCliente(usuario.getTelefono());
        nuevaCalificacion.setUsuario(usuario);
        nuevaCalificacion.setPedido(pedido);
        
        // Mapear datos del DTO
        nuevaCalificacion.setTipoVisita(calificacionDTO.getTipoVisita());
        
        // Mapear calificaciones por categoría
        Map<String, Integer> calificaciones = calificacionDTO.getCalificaciones();
        nuevaCalificacion.setCalificacionComida(calificaciones.get("comida"));
        nuevaCalificacion.setCalificacionServicio(calificaciones.get("servicio"));
        nuevaCalificacion.setCalificacionLimpieza(calificaciones.get("limpieza"));
        nuevaCalificacion.setCalificacionPrecio(calificaciones.get("precio"));
        nuevaCalificacion.setCalificacionAmbiente(calificaciones.get("ambiente"));
        
        // Calcular promedio automáticamente
        nuevaCalificacion.calcularPromedioGeneral();
        
        // Establecer otros campos
        nuevaCalificacion.setComentario(calificacionDTO.getComentario());
        nuevaCalificacion.setRecomendaria(calificacionDTO.getRecomendaria());
        nuevaCalificacion.setEstado("APROBADA");
        nuevaCalificacion.setActivo(true); 
        nuevaCalificacion.setLikesCount(0); 
        
        return calificacionRepository.save(nuevaCalificacion);
    }

    /**
     * Crear calificación sin autenticación (método legacy para compatibilidad)
     */
    @Transactional
    public Calificacion crearCalificacionSinAuth(CalificacionDTO calificacionDTO) {
        Calificacion nuevaCalificacion = new Calificacion();
        
        // Mapear datos básicos
        nuevaCalificacion.setNombreCliente(calificacionDTO.getNombre());
        nuevaCalificacion.setEmailCliente(calificacionDTO.getEmail());
        nuevaCalificacion.setTelefonoCliente(calificacionDTO.getTelefono());
        nuevaCalificacion.setTipoVisita(calificacionDTO.getTipoVisita());
        
        // Mapear calificaciones por categoría
        Map<String, Integer> calificaciones = calificacionDTO.getCalificaciones();
        nuevaCalificacion.setCalificacionComida(calificaciones.get("comida"));
        nuevaCalificacion.setCalificacionServicio(calificaciones.get("servicio"));
        nuevaCalificacion.setCalificacionLimpieza(calificaciones.get("limpieza"));
        nuevaCalificacion.setCalificacionPrecio(calificaciones.get("precio"));
        nuevaCalificacion.setCalificacionAmbiente(calificaciones.get("ambiente"));
        
        // Establecer otros campos
        nuevaCalificacion.setComentario(calificacionDTO.getComentario());
        nuevaCalificacion.setRecomendaria(calificacionDTO.getRecomendaria());
        nuevaCalificacion.setPromedioGeneral(calificacionDTO.getPromedioGeneral());
        nuevaCalificacion.setEstado("APROBADA");
        nuevaCalificacion.setActivo(true); 
        nuevaCalificacion.setLikesCount(0); 
        
        return calificacionRepository.save(nuevaCalificacion);
    }

    /**
     * Obtener estadísticas de calificaciones
     */
    public EstadisticasCalificacionDTO obtenerEstadisticas() {
        EstadisticasCalificacionDTO estadisticas = new EstadisticasCalificacionDTO();
        
        // Obtener total de reseñas aprobadas y activas
        Long totalResenas = calificacionRepository.countByEstadoAndActivo("APROBADA", true);
        estadisticas.setTotalResenas(totalResenas);
        
        if (totalResenas == 0) {
            // Si no hay reseñas, devolver valores por defecto
            estadisticas.setPromedioGeneral(BigDecimal.valueOf(4.5));
            estadisticas.setDistribucion(crearDistribucionEjemplo());
            estadisticas.setPromediosPorCategoria(crearPromediosEjemplo());
            estadisticas.setPorcentajeRecomendacion(90);
            return estadisticas;
        }
        
        // Calcular promedio general
        BigDecimal promedioGeneral = calificacionRepository.calcularPromedioGeneral();
        if (promedioGeneral != null) {
            estadisticas.setPromedioGeneral(promedioGeneral.setScale(1, RoundingMode.HALF_UP));
        } else {
            estadisticas.setPromedioGeneral(BigDecimal.valueOf(4.5));
        }
        
        // Calcular distribución de calificaciones
        Map<Integer, Integer> distribucion = calcularDistribucion();
        estadisticas.setDistribucion(distribucion);
        
        // Calcular promedios por categoría
        Map<String, BigDecimal> promediosPorCategoria = calcularPromediosPorCategoria();
        estadisticas.setPromediosPorCategoria(promediosPorCategoria);
        
        // Calcular porcentaje de recomendación
        Long recomendaciones = calificacionRepository.countByEstadoAndRecomendariaAndActivo("APROBADA", true, true);
        int porcentajeRecomendacion = (int) ((recomendaciones * 100) / totalResenas);
        estadisticas.setPorcentajeRecomendacion(porcentajeRecomendacion);
        
        return estadisticas;
    }

    /**
     * Obtener comentarios recientes con paginación
     */
    public Map<String, Object> obtenerComentariosRecientes(int pagina, int limite) {
        try {
            Pageable pageable = PageRequest.of(pagina - 1, limite);
            Page<Calificacion> paginaCalificaciones = calificacionRepository
                .findAllConDetalles(pageable);
            
            List<Map<String, Object>> comentarios = paginaCalificaciones.getContent().stream()
                .map(this::convertirAComentarioConDetalles)
                .collect(Collectors.toList());
            
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("comentarios", comentarios);
            resultado.put("hayMas", paginaCalificaciones.hasNext());
            resultado.put("paginaActual", pagina);
            resultado.put("totalPaginas", paginaCalificaciones.getTotalPages());
            resultado.put("totalElementos", paginaCalificaciones.getTotalElements());
            
            return resultado;
        } catch (Exception e) {
            // En caso de error, devolver estructura vacía
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("comentarios", new ArrayList<>());
            resultado.put("hayMas", false);
            resultado.put("paginaActual", pagina);
            resultado.put("totalPaginas", 0);
            resultado.put("totalElementos", 0);
            resultado.put("error", "Error al obtener comentarios: " + e.getMessage());
            
            return resultado;
        }
    }

    /**
     * Método temporal para debug - obtener comentarios sin filtros
     */
    public Map<String, Object> obtenerComentariosDebug(int pagina, int limite) {
        try {
            Pageable pageable = PageRequest.of(pagina - 1, limite);
            Page<Calificacion> paginaCalificaciones = calificacionRepository
                .findAllConDetallesDebug(pageable);
            
            List<Map<String, Object>> comentarios = paginaCalificaciones.getContent().stream()
                .map(calificacion -> {
                    Map<String, Object> debug = new HashMap<>();
                    debug.put("id", calificacion.getIdCalificacion());
                    debug.put("comentario", calificacion.getComentario());
                    debug.put("estado", calificacion.getEstado());
                    debug.put("activo", calificacion.getActivo());
                    debug.put("fecha", calificacion.getFechaCalificacion());
                    debug.put("usuario", calificacion.getUsuario() != null ? calificacion.getUsuario().getNombre() : "Sin usuario");
                    debug.put("nombreCliente", calificacion.getNombreCliente());
                    return debug;
                })
                .collect(Collectors.toList());
            
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("comentarios", comentarios);
            resultado.put("total", paginaCalificaciones.getTotalElements());
            resultado.put("hayMas", paginaCalificaciones.hasNext());
            
            return resultado;
        } catch (Exception e) {
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("error", "Error en debug: " + e.getMessage());
            resultado.put("comentarios", new ArrayList<>());
            return resultado;
        }
    }

    /**
     * Toggle like en calificación
     */
    @Transactional
    public Map<String, Object> toggleLike(Long idCalificacion) throws Exception {
        Usuario usuario = obtenerUsuarioAutenticado();
        
        Calificacion calificacion = calificacionRepository.findById(idCalificacion)
            .orElseThrow(() -> new Exception("Calificación no encontrada"));
        
        Optional<LikeCalificacion> likeExistente = likeRepository
            .findByUsuarioAndCalificacion(usuario, calificacion);
        
        boolean liked;
        if (likeExistente.isPresent()) {
            // Quitar like
            likeRepository.delete(likeExistente.get());
            liked = false;
        } else {
            // Agregar like
            LikeCalificacion nuevoLike = new LikeCalificacion();
            nuevoLike.setUsuario(usuario);
            nuevoLike.setCalificacion(calificacion);
            likeRepository.save(nuevoLike);
            liked = true;
        }
        
        // Contar likes actuales
        Long totalLikes = likeRepository.countByCalificacion(calificacion);
        
        // Actualizar el contador en la entidad
        calificacion.setLikesCount(totalLikes.intValue());
        calificacionRepository.save(calificacion);
        
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("liked", liked);
        resultado.put("totalLikes", totalLikes);
        
        return resultado;
    }

    /**
     * Responder a una calificación
     */
    @Transactional
    public RespuestaCalificacion responderCalificacion(Long idCalificacion, String comentario) throws Exception {
        Usuario usuario = obtenerUsuarioAutenticado();
        
        Calificacion calificacion = calificacionRepository.findById(idCalificacion)
            .orElseThrow(() -> new Exception("Calificación no encontrada"));
        
        // Verificar que no sea respuesta a su propia calificación
        if (calificacion.getUsuario() != null && 
            calificacion.getUsuario().getIdUsuario().equals(usuario.getIdUsuario())) {
            throw new Exception("No puedes responder a tu propia calificación");
        }
        
        RespuestaCalificacion respuesta = new RespuestaCalificacion();
        respuesta.setCalificacionPadre(calificacion);
        respuesta.setUsuario(usuario);
        respuesta.setComentario(comentario);
        
        return respuestaRepository.save(respuesta);
    }

    /**
     * Editar calificación propia
     */
    @Transactional
    public Calificacion editarCalificacion(Long idCalificacion, CalificacionDTO datosActualizados) throws Exception {
        Usuario usuario = obtenerUsuarioAutenticado();
        
        Calificacion calificacion = calificacionRepository.findById(idCalificacion)
            .orElseThrow(() -> new Exception("Calificación no encontrada"));
        
        // Verificar que sea el propietario
        if (!calificacion.getUsuario().getIdUsuario().equals(usuario.getIdUsuario())) {
            throw new Exception("Solo puedes editar tus propias calificaciones");
        }
        
        // Actualizar calificaciones
        Map<String, Integer> calificaciones = datosActualizados.getCalificaciones();
        calificacion.setCalificacionComida(calificaciones.get("comida"));
        calificacion.setCalificacionServicio(calificaciones.get("servicio"));
        calificacion.setCalificacionLimpieza(calificaciones.get("limpieza"));
        calificacion.setCalificacionPrecio(calificaciones.get("precio"));
        calificacion.setCalificacionAmbiente(calificaciones.get("ambiente"));
        
        // Recalcular promedio
        calificacion.calcularPromedioGeneral();
        
        // Actualizar otros campos
        calificacion.setComentario(datosActualizados.getComentario());
        calificacion.setRecomendaria(datosActualizados.getRecomendaria());
        calificacion.setEditado(true);
        calificacion.setFechaEdicion(LocalDateTime.now());
        
        return calificacionRepository.save(calificacion);
    }

    /**
     * Eliminar calificación propia
     */
    @Transactional
    public void eliminarCalificacion(Long idCalificacion) throws Exception {
        Usuario usuario = obtenerUsuarioAutenticado();
        
        Calificacion calificacion = calificacionRepository.findById(idCalificacion)
            .orElseThrow(() -> new Exception("Calificación no encontrada"));
        
        // Verificar que sea el propietario
        if (!calificacion.getUsuario().getIdUsuario().equals(usuario.getIdUsuario())) {
            throw new Exception("Solo puedes eliminar tus propias calificaciones");
        }
        
        calificacionRepository.delete(calificacion);
    }

    /**
     * Eliminar respuesta
     */
    @Transactional
    public void eliminarRespuesta(Long idRespuesta) throws Exception {
        Usuario usuario = obtenerUsuarioAutenticado();
        
        RespuestaCalificacion respuesta = respuestaRepository.findById(idRespuesta)
            .orElseThrow(() -> new Exception("Respuesta no encontrada"));
        
        // Verificar que sea el autor de la respuesta o el dueño de la calificación original
        if (!respuesta.getUsuario().getIdUsuario().equals(usuario.getIdUsuario()) &&
            !respuesta.getCalificacionPadre().getUsuario().getIdUsuario().equals(usuario.getIdUsuario())) {
            throw new Exception("No tienes permiso para eliminar esta respuesta");
        }
        
        respuestaRepository.delete(respuesta);
    }

    /**
     * Obtener calificación específica con detalles
     */
    public Map<String, Object> obtenerCalificacionConDetalles(Long idCalificacion) throws Exception {
        Calificacion calificacion = calificacionRepository.findById(idCalificacion)
            .orElseThrow(() -> new Exception("Calificación no encontrada"));
        
        return convertirAComentarioConDetalles(calificacion);
    }

    /**
     * Obtener calificaciones del usuario actual
     */
    public List<Calificacion> obtenerMisCalificaciones() throws Exception {
        Usuario usuario = obtenerUsuarioAutenticado();
        return calificacionRepository.findByUsuarioOrderByFechaCalificacionDesc(usuario);
    }

    /**
     * Eliminar calificación por ID y email (método legacy)
     */
    @Transactional
    public void eliminarCalificacion(Long idCalificacion, String email) throws Exception {
        Calificacion calificacion = calificacionRepository.findById(idCalificacion)
            .orElseThrow(() -> new RuntimeException("Calificación no encontrada"));
        
        // Verificar que el email coincida
        if (!calificacion.getEmailCliente().equalsIgnoreCase(email)) {
            throw new SecurityException("No tienes permiso para eliminar esta calificación");
        }
        
        calificacionRepository.delete(calificacion);
    }

    /**
     * Obtener todas las calificaciones (para admin)
     */
    public List<Calificacion> obtenerTodasLasCalificaciones() {
        return calificacionRepository.findAll();
    }

    /**
     * Actualizar estado de calificación aprobar o rechazar
     */
    @Transactional
    public Calificacion actualizarEstadoCalificacion(Long idCalificacion, String nuevoEstado) {
        Calificacion calificacion = calificacionRepository.findById(idCalificacion)
            .orElseThrow(() -> new RuntimeException("Calificación no encontrada"));
        
        calificacion.setEstado(nuevoEstado);
        return calificacionRepository.save(calificacion);
    }

    /**
     * Obtener calificaciones por email
     */
    public List<Calificacion> obtenerCalificacionesPorEmail(String email) {
        return calificacionRepository.findByEmailClienteOrderByFechaCalificacionDesc(email);
    }

    // ========================= MÉTODOS PRIVADOS =========================

    /**
     * Obtener usuario autenticado desde Spring Security
     */
    private Usuario obtenerUsuarioAutenticado() throws Exception {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getPrincipal())) {
            throw new Exception("Usuario no autenticado");
        }
        
        String email = authentication.getName(); 
        
        return usuarioRepository.findByCorreo(email)
            .orElseThrow(() -> new Exception("Usuario no encontrado"));
    }

    /**
     * Convertir calificación a formato detallado para frontend
     */
    private Map<String, Object> convertirAComentarioConDetalles(Calificacion calificacion) {
        Map<String, Object> comentario = new HashMap<>();
        
        // Datos básicos
        comentario.put("idCalificacion", calificacion.getIdCalificacion());
        comentario.put("comentario", calificacion.getComentario());
        comentario.put("fecha", calificacion.getFechaCalificacion());
        comentario.put("recomendaria", calificacion.getRecomendaria());
        comentario.put("editado", calificacion.getEditado());
        
        // Usuario
        Map<String, Object> usuario = new HashMap<>();
        if (calificacion.getUsuario() != null) {
            usuario.put("idUsuario", calificacion.getUsuario().getIdUsuario());
            usuario.put("nombre", calificacion.getUsuario().getNombre());
            usuario.put("apellido", calificacion.getUsuario().getApellido());
        } else {
            // Para calificaciones legacy sin usuario
            usuario.put("idUsuario", null);
            if (calificacion.getNombreCliente() != null && !calificacion.getNombreCliente().trim().isEmpty()) {
                String[] nombreParts = calificacion.getNombreCliente().split(" ");
                usuario.put("nombre", nombreParts[0]);
                usuario.put("apellido", nombreParts.length > 1 ? 
                    calificacion.getNombreCliente().substring(calificacion.getNombreCliente().indexOf(" ") + 1) : "");
            } else {
                usuario.put("nombre", "Usuario");
                usuario.put("apellido", "Anónimo");
            }
        }
        comentario.put("usuario", usuario);
        
        // Calificaciones por categoría
        Map<String, Integer> calificaciones = new HashMap<>();
        calificaciones.put("comida", calificacion.getCalificacionComida());
        calificaciones.put("servicio", calificacion.getCalificacionServicio());
        calificaciones.put("limpieza", calificacion.getCalificacionLimpieza());
        calificaciones.put("precio", calificacion.getCalificacionPrecio());
        calificaciones.put("ambiente", calificacion.getCalificacionAmbiente());
        comentario.put("calificaciones", calificaciones);
        
        // Likes - usar el campo likesCount para mejor rendimiento
        Integer totalLikes = calificacion.getLikesCount() != null ? calificacion.getLikesCount() : 0;
        comentario.put("totalLikes", totalLikes);
        
        // Obtener likes de forma segura -  lista vacía ya que no hacemos fetch
        List<Map<String, Object>> likes = new ArrayList<>();
        comentario.put("likes", likes);
        
        // Respuestas -  lista vacía ya que no hacemos fetch
        List<Map<String, Object>> respuestas = new ArrayList<>();
        comentario.put("respuestas", respuestas);
        
        return comentario;
    }

    private Map<Integer, Integer> calcularDistribucion() {
        Map<Integer, Integer> distribucion = crearDistribucionVacia();
        List<Object[]> conteos = calificacionRepository.contarPorCalificacion();
        
        Long total = calificacionRepository.countByEstadoAndActivo("APROBADA", true);
        
        if (total > 0) {
            for (Object[] conteo : conteos) {
                int estrellas = ((Number) conteo[0]).intValue();
                long cantidad = ((Number) conteo[1]).longValue();
                int porcentaje = (int) ((cantidad * 100) / total);
                distribucion.put(estrellas, porcentaje);
            }
        }
        
        return distribucion;
    }

    private Map<String, BigDecimal> calcularPromediosPorCategoria() {
        Map<String, BigDecimal> promedios = new HashMap<>();
        List<Object[]> resultados = calificacionRepository.obtenerPromediosPorCategoria();
        
        if (resultados != null && !resultados.isEmpty()) {
            Object[] resultado = resultados.get(0);
            promedios.put("comida", toBigDecimal(resultado[0]));
            promedios.put("servicio", toBigDecimal(resultado[1]));
            promedios.put("limpieza", toBigDecimal(resultado[2]));
            promedios.put("precio", toBigDecimal(resultado[3]));
            promedios.put("ambiente", toBigDecimal(resultado[4]));
        } else {
            promedios = crearPromediosEjemplo();
        }
        
        return promedios;
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal) return (BigDecimal) value;
        return new BigDecimal(value.toString()).setScale(1, RoundingMode.HALF_UP);
    }

    private Map<Integer, Integer> crearDistribucionVacia() {
        Map<Integer, Integer> distribucion = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            distribucion.put(i, 0);
        }
        return distribucion;
    }

    private Map<Integer, Integer> crearDistribucionEjemplo() {
        Map<Integer, Integer> distribucion = new HashMap<>();
        distribucion.put(5, 60);
        distribucion.put(4, 25);
        distribucion.put(3, 10);
        distribucion.put(2, 3);
        distribucion.put(1, 2);
        return distribucion;
    }

    private Map<String, BigDecimal> crearPromediosEjemplo() {
        Map<String, BigDecimal> promedios = new HashMap<>();
        promedios.put("comida", BigDecimal.valueOf(4.6));
        promedios.put("servicio", BigDecimal.valueOf(4.4));
        promedios.put("limpieza", BigDecimal.valueOf(4.5));
        promedios.put("precio", BigDecimal.valueOf(4.3));
        promedios.put("ambiente", BigDecimal.valueOf(4.4));
        return promedios;
    }
}