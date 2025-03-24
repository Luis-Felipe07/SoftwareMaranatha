package com.maranatha.sfmaranatha.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.maranatha.sfmaranatha.Model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Buscar un usuario por su correo 
    Usuario findByCorreo(String correo);
    
    // Buscar un usuario por su nombre completo 
    Usuario findByNombreCompleto(String nombreCompleto);
}
