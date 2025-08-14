package com.maranatha.sfmaranatha.Controllers;

import com.maranatha.sfmaranatha.Model.Usuario;
import com.maranatha.sfmaranatha.Service.UsuarioService;
import com.maranatha.sfmaranatha.dto.LoginRequestDTO;
import com.maranatha.sfmaranatha.dto.LoginResponseDTO;
import com.maranatha.sfmaranatha.dto.RegistroUsuarioDTO;
import com.maranatha.sfmaranatha.dto.RespuestaRegistroDTO;
import com.maranatha.sfmaranatha.dto.ActualizarUsuarioDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository; 
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest; 
import jakarta.servlet.http.HttpSession;      

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@Tag(name = "Usuarios", description = "Manages operations related to clients and system users.")
public class UsuarioController {

    @Autowired
    private UsuarioService miServicioDeUsuarios; 

    @Autowired
    private BCryptPasswordEncoder miCodificador; 

    /**
     * Registrar un nuevo usuario
     * @param datosDeRegistro 
     * @return 
     */
    @PostMapping(
        value = "/registrar",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    @Operation(
        summary = "Register a new user",
        description = "Creates a new user account with the provided details."
    )
    public ResponseEntity<RespuestaRegistroDTO> registrar(
            @RequestBody RegistroUsuarioDTO datosDeRegistro) {
        try {
            Usuario usuarioQueSeCreo = miServicioDeUsuarios.registrarUsuario(datosDeRegistro);
            
            RespuestaRegistroDTO miRespuestaPositiva =
                new RespuestaRegistroDTO("¡Usuario registrado con éxito!", "/login.html", usuarioQueSeCreo.getIdUsuario());
            return ResponseEntity.ok(miRespuestaPositiva);
        } catch (RuntimeException ex) {
            RespuestaRegistroDTO miRespuestaDeError =
                new RespuestaRegistroDTO("Error: " + ex.getMessage(), null, null);
            return ResponseEntity.badRequest().body(miRespuestaDeError);
        }
    }

    /**
     * Validar credenciales e iniciar sesión
     * @param credenciales 
     * @param request 
     * @return 
     */
    @PostMapping(
        value = "/validar",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    @Operation(
        summary = "Validate user credentials and log in",
        description = "Validates email and password. If correct, initiates a Spring Security session and returns status."
    )
    public ResponseEntity<LoginResponseDTO> validarCredenciales(
            @RequestBody LoginRequestDTO credenciales, HttpServletRequest request) {
        
        Optional<Usuario> usuarioEncontradoOpt = miServicioDeUsuarios.buscarPorCorreo(credenciales.getCorreo());
        if (usuarioEncontradoOpt.isEmpty()) {
            LoginResponseDTO respuestaNoEncontrado = new LoginResponseDTO(false, null, "Usuario no encontrado", null, null);
            return ResponseEntity.status(404).body(respuestaNoEncontrado);
        }

        Usuario usuario = usuarioEncontradoOpt.get();
       
        if (!miCodificador.matches(credenciales.getContrasena(), usuario.getContrasena())) {
            LoginResponseDTO respuestaClaveIncorrecta = new LoginResponseDTO(false, null, "Contraseña incorrecta", null, null);
            return ResponseEntity.status(401).body(respuestaClaveIncorrecta);
        }

        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + usuario.getTipoUsuario().toUpperCase()));

        Authentication authentication = new UsernamePasswordAuthenticationToken(usuario.getCorreo(), null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        HttpSession session = request.getSession(true); 
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, SecurityContextHolder.getContext());

        LoginResponseDTO respuestaExitosa =
            new LoginResponseDTO(true, usuario.getTipoUsuario(), "Login correcto y sesión iniciada", usuario.getNombre(), usuario.getIdUsuario());
        return ResponseEntity.ok(respuestaExitosa);
    }

    /**
     * Obtener usuario en sesión actual
     * @param principal 
     * @param request 
     * @return 
     */
    @GetMapping("/sesion-actual")
    @Operation(
        summary = "Get current session user data",
        description = "Returns basic data of the authenticated user, if one exists."
    )
    public ResponseEntity<?> obtenerUsuarioEnSesion(java.security.Principal principal, HttpServletRequest request) {
        if (principal != null && principal.getName() != null) {
            Optional<Usuario> usuarioOpt = miServicioDeUsuarios.buscarPorCorreo(principal.getName());
            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                
                return ResponseEntity.ok(Map.of(
                    "autenticado", true,
                    "idUsuario", usuario.getIdUsuario(),
                    "nombre", usuario.getNombre(),
                    "apellido", usuario.getApellido(),
                    "correo", usuario.getCorreo(),
                    "telefono", usuario.getTelefono(),
                    "direccion", usuario.getDireccion(),
                    "tipoUsuario", usuario.getTipoUsuario() 
                ));
            } else {
                return ResponseEntity.ok(Map.of("autenticado", false, "mensaje", "Principal encontrado pero usuario no en BD."));
            }
        }
        
        return ResponseEntity.ok(Map.of("autenticado", false));
    }

    /**
     * Obtener perfil del usuario autenticado (agrego método adicional para el sistema de calificaciones)
     */
    @GetMapping("/perfil")
    @Operation(
        summary = "Obtener perfil del usuario",
        description = "Devuelve la información del usuario autenticado para el sistema de calificaciones"
    )
    public ResponseEntity<?> obtenerPerfil() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || 
                "anonymousUser".equals(authentication.getPrincipal())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", true,
                    "mensaje", "Usuario no autenticado"
                ));
            }
            
            String email = authentication.getName();
            Optional<Usuario> usuarioOpt = miServicioDeUsuarios.buscarPorCorreo(email);
            
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", true,
                    "mensaje", "Usuario no encontrado"
                ));
            }
            
            Usuario usuario = usuarioOpt.get();
            
            // Crear respuesta sin datos sensibles
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("idUsuario", usuario.getIdUsuario());
            respuesta.put("nombre", usuario.getNombre());
            respuesta.put("apellido", usuario.getApellido());
            respuesta.put("correo", usuario.getCorreo());
            respuesta.put("telefono", usuario.getTelefono());
            respuesta.put("direccion", usuario.getDireccion());
            respuesta.put("tipoUsuario", usuario.getTipoUsuario());
            respuesta.put("autenticado", true);
            
            return ResponseEntity.ok(respuesta);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", true,
                "mensaje", "Error al obtener perfil: " + e.getMessage()
            ));
        }
    }

    /**
     * Obtener información básica de usuario por ID para comentarios 
     */
    @GetMapping("/{id}/publico")
    @Operation(
        summary = "Obtener información pública de usuario",
        description = "Devuelve información básica de un usuario (para mostrar en comentarios)"
    )
    public ResponseEntity<?> obtenerInfoPublica(@PathVariable Integer id) {
        try {
            Optional<Usuario> usuarioOpt = miServicioDeUsuarios.buscarPorId(id);
            
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", true,
                    "mensaje", "Usuario no encontrado"
                ));
            }
            
            Usuario usuario = usuarioOpt.get();
            
            // Solo información pública
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("idUsuario", usuario.getIdUsuario());
            respuesta.put("nombre", usuario.getNombre());
            respuesta.put("apellido", usuario.getApellido());
            // No incluiyo email ni teléfono por privacidad
            
            return ResponseEntity.ok(respuesta);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", true,
                "mensaje", "Error al obtener información: " + e.getMessage()
            ));
        }
    }

    /**
     * Verificar existencia de usuario por email
     * @param correo 
     * @return 
     */
    @GetMapping("/check")
    @Operation(
        summary = "Check user existence by email",
        description = "Checks if an email is already registered and returns its status and ID if it exists."
    )
    public ResponseEntity<?> verificarUsuarioPorEmail(@RequestParam String correo) {
        Optional<Usuario> usuarioOpt = miServicioDeUsuarios.buscarPorCorreo(correo);
        if (usuarioOpt.isPresent()) {
            return ResponseEntity.ok(Map.of("existe", true, "usuarioId", usuarioOpt.get().getIdUsuario()));
        } else {
            return ResponseEntity.ok(Map.of("existe", false, "usuarioId", null));
        }
    }

    /**
     * Recuperar contraseña usando número de documento
     */
    @PostMapping(
        value = "/recuperar",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    @Operation(
        summary = "Recuperar contraseña por número de documento",
        description = "Permite a un usuario recuperar su contraseña usando su número de documento"
    )
    public ResponseEntity<?> recuperarContrasena(@RequestBody Map<String, String> datosRecuperacion) {
        try {
            String numeroDocumento = datosRecuperacion.get("numeroDocumento");
            String nuevoCorreo = datosRecuperacion.get("nuevoCorreo");
            String nuevaContrasena = datosRecuperacion.get("nuevaContrasena");

            // Validar datos recibidos
            if (numeroDocumento == null || numeroDocumento.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "exito", false,
                    "mensaje", "El número de documento es obligatorio"
                ));
            }

            if (nuevoCorreo == null || nuevoCorreo.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "exito", false,
                    "mensaje", "El nuevo correo es obligatorio"
                ));
            }

            if (nuevaContrasena == null || nuevaContrasena.length() < 8) {
                return ResponseEntity.badRequest().body(Map.of(
                    "exito", false,
                    "mensaje", "La nueva contraseña debe tener al menos 8 caracteres"
                ));
            }

            // Buscar usuario por número de documento
            Optional<Usuario> usuarioOpt = miServicioDeUsuarios.buscarPorNumeroDocumento(numeroDocumento.trim());
            
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(
                    "exito", false,
                    "mensaje", "No se encontró ningún usuario con ese número de documento"
                ));
            }

            Usuario usuario = usuarioOpt.get();

            // Verificar que el nuevo correo no esté en uso por otro usuario
            Optional<Usuario> usuarioConCorreo = miServicioDeUsuarios.buscarPorCorreo(nuevoCorreo.trim().toLowerCase());
            if (usuarioConCorreo.isPresent() && !usuarioConCorreo.get().getIdUsuario().equals(usuario.getIdUsuario())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "exito", false,
                    "mensaje", "El correo electrónico ya está en uso por otro usuario"
                ));
            }

            // Actualizar correo y contraseña
            usuario.setCorreo(nuevoCorreo.trim().toLowerCase());
            usuario.setContrasena(miCodificador.encode(nuevaContrasena));

            // Guardar cambios
            miServicioDeUsuarios.actualizarUsuario(usuario);

            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Contraseña y correo actualizados exitosamente"
            ));

        } catch (Exception e) {
            System.err.println("Error en recuperación de contraseña: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "exito", false,
                "mensaje", "Error interno del servidor. Intente nuevamente más tarde."
            ));
        }
    }

    /**
     * Actualizar perfil del usuario solo teléfono y dirección
     */
    @PutMapping(
        value = "/actualizar-perfil",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    @Operation(
        summary = "Actualizar perfil del usuario",
        description = "Permite al usuario actualizar su teléfono y dirección"
    )
    public ResponseEntity<?> actualizarPerfil(
            @RequestBody ActualizarUsuarioDTO datosActualizacion,
            java.security.Principal principal) {
        
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "exito", false,
                "mensaje", "Debe iniciar sesión para actualizar su perfil"
            ));
        }
        
        try {
            Optional<Usuario> usuarioOpt = miServicioDeUsuarios.buscarPorCorreo(principal.getName());
            
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "exito", false,
                    "mensaje", "Usuario no encontrado"
                ));
            }
            
            Usuario usuario = usuarioOpt.get();
            
            // Actualizar solo los campos permitidos
            if (datosActualizacion.getTelefono() != null) {
                usuario.setTelefono(datosActualizacion.getTelefono().trim());
            }
            
            if (datosActualizacion.getDireccion() != null) {
                usuario.setDireccion(datosActualizacion.getDireccion().trim());
            }
            
            // Guardar cambios
            Usuario usuarioActualizado = miServicioDeUsuarios.actualizarUsuario(usuario);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Perfil actualizado exitosamente",
                "usuario", Map.of(
                    "idUsuario", usuarioActualizado.getIdUsuario(),
                    "nombre", usuarioActualizado.getNombre(),
                    "apellido", usuarioActualizado.getApellido(),
                    "correo", usuarioActualizado.getCorreo(),
                    "telefono", usuarioActualizado.getTelefono(),
                    "direccion", usuarioActualizado.getDireccion(),
                    "tipoDocumento", usuarioActualizado.getTipoDocumento(),
                    "numeroDocumento", usuarioActualizado.getNumeroDocumento()
                )
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "exito", false,
                "mensaje", "Error al actualizar el perfil: " + e.getMessage()
            ));
        }
    }

    /**
     * Obtener estadísticas del usuario
     */
    @GetMapping("/estadisticas")
    @Operation(
        summary = "Obtener estadísticas del usuario",
        description = "Devuelve estadísticas de pedidos y reservas del usuario autenticado"
    )
    public ResponseEntity<?> obtenerEstadisticasUsuario(java.security.Principal principal) {
        
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "exito", false,
                "mensaje", "Debe iniciar sesión para ver sus estadísticas"
            ));
        }
        
        try {
            Optional<Usuario> usuarioOpt = miServicioDeUsuarios.buscarPorCorreo(principal.getName());
            
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "exito", false,
                    "mensaje", "Usuario no encontrado"
                ));
            }
            
            Usuario usuario = usuarioOpt.get();
            
            // Obtener estadísticas
            Map<String, Object> estadisticas = miServicioDeUsuarios.obtenerEstadisticasUsuario(usuario.getIdUsuario());
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "estadisticas", estadisticas
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "exito", false,
                "mensaje", "Error al obtener estadísticas: " + e.getMessage()
            ));
        }
    }
}