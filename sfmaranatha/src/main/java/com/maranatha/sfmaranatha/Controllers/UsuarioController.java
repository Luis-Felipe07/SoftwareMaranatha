package com.maranatha.sfmaranatha.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.maranatha.sfmaranatha.Model.Usuario;
import com.maranatha.sfmaranatha.Repository.UsuarioRepository;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Endpoint para registrar un nuevo usuario
    @PostMapping("/registrar")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {
        
        Usuario nuevoUsuario = usuarioRepository.save(usuario);
        return ResponseEntity.ok(nuevoUsuario);
    }

    // Endpoint para validar credenciales de inicio de sesión
    @PostMapping("/validar")
    public ResponseEntity<?> validarUsuario(@RequestBody Map<String, String> credenciales) {
        String correo = credenciales.get("correo");
        String contrasena = credenciales.get("contrasena");

        Usuario usuario = usuarioRepository.findByCorreo(correo);

        if (usuario == null) {
            // Si no se encuentra el correo
            return ResponseEntity.badRequest().body(Map.of("valido", false, "mensaje", "correo incorrecto"));
        }
        if (!usuario.getContrasena().equals(contrasena)) {
            // Si la contraseña no coincide
            return ResponseEntity.badRequest().body(Map.of("valido", false, "mensaje", "contraseña incorrecta"));
        }
        // Si ambos datos son correctos, se devuelve el rol del usuario
        return ResponseEntity.ok(Map.of("valido", true, "mensaje", "ok", "rol", usuario.getRol().toString()));
    }

    // Endpoint para recuperar/editar correo y contraseña
    @PostMapping("/recuperar")
    public ResponseEntity<?> recuperarDatos(@RequestBody Map<String, String> payload) {
        String nombreCompleto = payload.get("nombreCompleto");
        String nuevoCorreo = payload.get("nuevoCorreo");
        String nuevaContrasena = payload.get("nuevaContrasena");

        // Buscar el usuario que el nombre completo coincida exactamente
        Usuario usuario = usuarioRepository.findByNombreCompleto(nombreCompleto);

        if (usuario == null) {
            return ResponseEntity.badRequest().body(Map.of("exito", false, "mensaje", "El nombre no coincide con ningún usuario"));
        }

        // Actualizar correo y contraseña 
        usuario.setCorreo(nuevoCorreo);
        usuario.setContrasena(nuevaContrasena);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Datos actualizados correctamente"));
    }
}
