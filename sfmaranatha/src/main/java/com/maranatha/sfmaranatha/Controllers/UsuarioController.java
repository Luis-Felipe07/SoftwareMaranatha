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
import org.springframework.security.web.context.HttpSessionSecurityContextRepository; 
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest; 
import jakarta.servlet.http.HttpSession;      

import java.util.ArrayList;
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
     *
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
     * 
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
     * 
     * 
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
     * 
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
}
