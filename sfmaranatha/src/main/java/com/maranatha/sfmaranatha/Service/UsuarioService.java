package com.maranatha.sfmaranatha.Service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.maranatha.sfmaranatha.Model.Usuario;
import com.maranatha.sfmaranatha.Repository.UsuarioRepository;
import com.maranatha.sfmaranatha.dto.RegistroUsuarioDTO;
@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepo;

    @Autowired
    private BCryptPasswordEncoder encoder;

    // Yo registro un nuevo usuario, validando duplicados y hasheando contraseña
    public Usuario registrarUsuario(RegistroUsuarioDTO dto) {
        if (usuarioRepo.findByCorreo(dto.getCorreo()).isPresent()) {
            throw new RuntimeException("El correo ya está registrado");
        }
        if (usuarioRepo.findByNumeroDocumento(dto.getNumeroDocumento()).isPresent()) {
            throw new RuntimeException("El número de documento ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(dto.getNombre());
        usuario.setApellido(dto.getApellido());
        usuario.setTipoDocumento(dto.getTipoDocumento());
        usuario.setNumeroDocumento(dto.getNumeroDocumento());
        usuario.setCorreo(dto.getCorreo());
        usuario.setTelefono(dto.getTelefono());
        usuario.setDireccion(dto.getDireccion());
        usuario.setContrasena(encoder.encode(dto.getContrasena()));
        usuario.setFueDirecto(false);
        usuario.setFechaRegistro(LocalDateTime.now());
        usuario.setTipoUsuario(dto.getTipoUsuario());

        return usuarioRepo.save(usuario);
    }

    // Yo busco un usuario por correo para el login
    public Optional<Usuario> buscarPorCorreo(String correo) {
        return usuarioRepo.findByCorreo(correo);
    }
}
