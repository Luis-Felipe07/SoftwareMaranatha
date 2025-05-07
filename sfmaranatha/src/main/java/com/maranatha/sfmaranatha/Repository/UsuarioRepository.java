package com.maranatha.sfmaranatha.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.maranatha.sfmaranatha.Model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByCorreo(String correo);
    Optional<Usuario> findByNumeroDocumento(String numeroDocumento);
}
