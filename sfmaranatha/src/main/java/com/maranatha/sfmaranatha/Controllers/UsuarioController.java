package com.maranatha.sfmaranatha.Controllers;

import com.maranatha.sfmaranatha.Model.Usuario;
import com.maranatha.sfmaranatha.Service.UsuarioService;
import com.maranatha.sfmaranatha.dto.LoginRequestDTO;
import com.maranatha.sfmaranatha.dto.LoginResponseDTO;
import com.maranatha.sfmaranatha.dto.RegistroUsuarioDTO;
import com.maranatha.sfmaranatha.dto.RespuestaRegistroDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository; // For HTTP session storage
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest; // For HTTP session
import jakarta.servlet.http.HttpSession;      // For HTTP session

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controller for managing user-related operations such as registration, login,
 * and session management.
 */
@RestController
@RequestMapping("/api/usuarios")
@Tag(name = "Usuarios", description = "Manages operations related to clients and system users.")
public class UsuarioController {

    @Autowired
    private UsuarioService miServicioDeUsuarios; // Service for user-related business logic

    @Autowired
    private BCryptPasswordEncoder miCodificador; // Password encoder

    /**
     * Registers a new user in the system.
     * @param datosDeRegistro DTO containing registration data.
     * @return ResponseEntity with registration status and user ID.
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
            // Attempt to register the user
            Usuario usuarioQueSeCreo = miServicioDeUsuarios.registrarUsuario(datosDeRegistro);
            // Prepare a positive response
            RespuestaRegistroDTO miRespuestaPositiva =
                new RespuestaRegistroDTO("¡Usuario registrado con éxito!", "/login.html", usuarioQueSeCreo.getIdUsuario());
            return ResponseEntity.ok(miRespuestaPositiva);
        } catch (RuntimeException ex) {
            // Prepare an error response if registration fails
            RespuestaRegistroDTO miRespuestaDeError =
                new RespuestaRegistroDTO("Error: " + ex.getMessage(), null, null);
            return ResponseEntity.badRequest().body(miRespuestaDeError);
        }
    }


    /**
     * Validates user credentials and initiates a session upon successful login.
     * It checks the email and password. If valid, it establishes a Spring Security session.
     * @param credenciales DTO containing login credentials (email and password).
     * @param request HttpServletRequest to manage the HTTP session.
     * @return ResponseEntity with login status, user role, name, and ID.
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
        // Find user by email
        Optional<Usuario> usuarioEncontradoOpt = miServicioDeUsuarios.buscarPorCorreo(credenciales.getCorreo());
        if (usuarioEncontradoOpt.isEmpty()) {
            // User not found
            LoginResponseDTO respuestaNoEncontrado = new LoginResponseDTO(false, null, "Usuario no encontrado", null, null);
            return ResponseEntity.status(404).body(respuestaNoEncontrado);
        }

        Usuario usuario = usuarioEncontradoOpt.get();
        // Check if the provided password matches the stored hashed password
        if (!miCodificador.matches(credenciales.getContrasena(), usuario.getContrasena())) {
            // Incorrect password
            LoginResponseDTO respuestaClaveIncorrecta = new LoginResponseDTO(false, null, "Contraseña incorrecta", null, null);
            return ResponseEntity.status(401).body(respuestaClaveIncorrecta);
        }

        // Authentication successful! Now, set up the Spring Security context.
        // Create a list of authorities (roles). Spring Security usually expects roles prefixed with "ROLE_".
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + usuario.getTipoUsuario().toUpperCase()));
        // More roles or permissions could be added if the system is more complex.

        // Create the authentication object. The principal is the email (username); password is not needed here.
        Authentication authentication = new UsernamePasswordAuthenticationToken(usuario.getCorreo(), null, authorities);

        // Set the authentication in the security context.
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Store the security context in the HTTP session to persist it across requests.
        // This creates the JSESSIONID cookie and keeps the user logged in.
        HttpSession session = request.getSession(true); // true creates the session if it doesn't exist
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, SecurityContextHolder.getContext());

        // The user is now authenticated in Spring Security.
        // UPDATED: Include user's name and ID in the successful response.
        LoginResponseDTO respuestaExitosa =
            new LoginResponseDTO(true, usuario.getTipoUsuario(), "Login correcto y sesión iniciada", usuario.getNombre(), usuario.getIdUsuario());
        return ResponseEntity.ok(respuestaExitosa);
    }

    /**
     * Retrieves data for the currently authenticated user.
     * Uses java.security.Principal, which Spring Security should populate if the user is authenticated.
     * @param principal The authenticated principal (user).
     * @param request HttpServletRequest to access session details (for debugging or advanced scenarios).
     * @return ResponseEntity with user data if authenticated, or an "unauthenticated" status.
     */
    @GetMapping("/sesion-actual")
    @Operation(
        summary = "Get current session user data",
        description = "Returns basic data of the authenticated user, if one exists."
    )
    public ResponseEntity<?> obtenerUsuarioEnSesion(java.security.Principal principal, HttpServletRequest request) {
        // Debugging logs (can be removed in production)
        // System.out.println("Sesion-actual: Principal is " + (principal != null ? principal.getName() : "null"));
        // HttpSession session = request.getSession(false);
        // if (session != null) {
        //     System.out.println("Sesion-actual: ID de sesión HTTP: " + session.getId());
        //     Object context = session.getAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY);
        //     System.out.println("Sesion-actual: Contexto de Spring Security en sesión: " + (context != null ? "Presente" : "Ausente"));
        //     if(context != null && SecurityContextHolder.getContext().getAuthentication() != null) {
        //          System.out.println("Sesion-actual: Autenticación en SecurityContextHolder: " + SecurityContextHolder.getContext().getAuthentication().getName());
        //     }
        // } else {
        //     System.out.println("Sesion-actual: No hay sesión HTTP.");
        // }

        if (principal != null && principal.getName() != null) {
            // If a principal exists, find the user in the database by email (which is the principal's name)
            Optional<Usuario> usuarioOpt = miServicioDeUsuarios.buscarPorCorreo(principal.getName());
            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                // Return authenticated user's data
                return ResponseEntity.ok(Map.of(
                    "autenticado", true,
                    "idUsuario", usuario.getIdUsuario(),
                    "nombre", usuario.getNombre(),
                    "apellido", usuario.getApellido(),
                    "correo", usuario.getCorreo(),
                    "telefono", usuario.getTelefono(),
                    "direccion", usuario.getDireccion(),
                    "tipoUsuario", usuario.getTipoUsuario() // Important for JavaScript logic on the client-side
                ));
            } else {
                 // This would be unusual if 'principal' is not null and has a name, but handle it just in case.
                return ResponseEntity.ok(Map.of("autenticado", false, "mensaje", "Principal encontrado pero usuario no en BD."));
            }
        }
        // If there's no 'principal' or the user is not found,
        // indicate that the user is not authenticated.
        return ResponseEntity.ok(Map.of("autenticado", false));
    }

    /**
     * Quickly checks if a user already exists based on their email address.
     * @param correo The email address to check.
     * @return ResponseEntity indicating if the user exists and their ID if they do.
     */
    @GetMapping("/check")
    @Operation(
        summary = "Check user existence by email",
        description = "Checks if an email is already registered and returns its status and ID if it exists."
    )
    public ResponseEntity<?> verificarUsuarioPorEmail(@RequestParam String correo) {
        Optional<Usuario> usuarioOpt = miServicioDeUsuarios.buscarPorCorreo(correo);
        if (usuarioOpt.isPresent()) {
            // User exists
            return ResponseEntity.ok(Map.of("existe", true, "usuarioId", usuarioOpt.get().getIdUsuario()));
        } else {
            // User does not exist
            return ResponseEntity.ok(Map.of("existe", false, "usuarioId", null));
        }
    }
}
