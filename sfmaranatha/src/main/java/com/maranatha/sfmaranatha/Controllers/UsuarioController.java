package com.maranatha.sfmaranatha.Controllers;

import com.maranatha.sfmaranatha.Model.Usuario;
import com.maranatha.sfmaranatha.Service.UsuarioService;
import com.maranatha.sfmaranatha.dto.LoginRequestDTO;
import com.maranatha.sfmaranatha.dto.LoginResponseDTO;
import com.maranatha.sfmaranatha.dto.RegistroUsuarioDTO;
import com.maranatha.sfmaranatha.dto.RespuestaRegistroDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@Tag(name = "Usuarios", description = "Operaciones sobre clientes y usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @PostMapping(
        value = "/registrar",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    @Operation(
        summary = "Registrar nuevo cliente",
        description = "Crea un nuevo usuario de tipo CLIENTE con la información provista en el cuerpo de la petición."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Registro exitoso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = RespuestaRegistroDTO.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Error en datos de entrada o usuario ya existente",
            content = @Content
        )
    })
    public ResponseEntity<RespuestaRegistroDTO> registrar(
            @RequestBody RegistroUsuarioDTO dto) {
        try {
            Usuario usuarioCreado = usuarioService.registrarUsuario(dto);
            RespuestaRegistroDTO respuesta =
                new RespuestaRegistroDTO("Usuario registrado con éxito", "/login.html");
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException ex) {
            RespuestaRegistroDTO error =
                new RespuestaRegistroDTO("Error: " + ex.getMessage(), null);
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping(
        value = "/validar",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    @Operation(
        summary = "Validar credenciales de usuario",
        description = "Valida el correo y contraseña, y devuelve el estado de la autenticación."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Login correcto",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = LoginResponseDTO.class)
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Contraseña incorrecta",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Usuario no encontrado",
            content = @Content
        )
    })
    public ResponseEntity<LoginResponseDTO> validarCredenciales(
            @RequestBody LoginRequestDTO req) {
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

        LoginResponseDTO resp =
            new LoginResponseDTO(true, usuario.getTipoUsuario(), "Login correcto");
        return ResponseEntity.ok(resp);
    }
}
