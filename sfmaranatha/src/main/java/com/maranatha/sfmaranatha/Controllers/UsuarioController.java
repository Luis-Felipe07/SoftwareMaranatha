package com.maranatha.sfmaranatha.Controllers;

import com.maranatha.sfmaranatha.Model.Usuario;
import com.maranatha.sfmaranatha.Service.UsuarioService;
import com.maranatha.sfmaranatha.dto.LoginRequestDTO;
import com.maranatha.sfmaranatha.dto.LoginResponseDTO;
import com.maranatha.sfmaranatha.dto.RegistroUsuarioDTO;
import com.maranatha.sfmaranatha.dto.RespuestaRegistroDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @PostMapping("/registrar")
    public ResponseEntity<RespuestaRegistroDTO> registrar(@RequestBody RegistroUsuarioDTO dto) {
        try {
            Usuario usuarioCreado = usuarioService.registrarUsuario(dto);
            // Tras registro, siempre redirijo al login
            RespuestaRegistroDTO respuesta =
                    new RespuestaRegistroDTO("Usuario registrado con éxito", "/login.html");
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException ex) {
            RespuestaRegistroDTO error =
                    new RespuestaRegistroDTO("Error: " + ex.getMessage(), null);
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/validar")
    public ResponseEntity<LoginResponseDTO> validarCredenciales(@RequestBody LoginRequestDTO req) {
        Optional<Usuario> optUsuario = usuarioService.buscarPorCorreo(req.getCorreo());
        if (optUsuario.isEmpty()) {
            LoginResponseDTO resp = new LoginResponseDTO(false, null, "Usuario no encontrado");
            return ResponseEntity.status(404).body(resp);
        }

        Usuario usuario = optUsuario.get();
        if (!encoder.matches(req.getContrasena(), usuario.getContrasena())) {
            LoginResponseDTO resp = new LoginResponseDTO(false, null, "Contraseña incorrecta");
            return ResponseEntity.status(401).body(resp);
        }

        // Login exitoso
        LoginResponseDTO resp = new LoginResponseDTO(true, usuario.getTipoUsuario(), "Login correcto");
        return ResponseEntity.ok(resp);
    }
}
