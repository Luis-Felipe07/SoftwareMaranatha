package com.maranatha.sfmaranatha.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID; 

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; 

import com.maranatha.sfmaranatha.Model.Usuario;
import com.maranatha.sfmaranatha.Repository.UsuarioRepository;
import com.maranatha.sfmaranatha.dto.RegistroUsuarioDTO;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository miRepositorioDeUsuarios;

    @Autowired
    private BCryptPasswordEncoder miCodificadorDeContrasenas;

    /**
     * me encargo de registrar un nuevo usuario .
     * Valido si el correo o el número de documento ya existen.
     * Codifico la contraseña y considero si el registro fue directo en el restaurante.
     */
    @Transactional
    public Usuario registrarUsuario(RegistroUsuarioDTO datosDelNuevoUsuario) {
        
        if (datosDelNuevoUsuario.getCorreo() != null && !datosDelNuevoUsuario.getCorreo().trim().isEmpty() &&
            miRepositorioDeUsuarios.findByCorreo(datosDelNuevoUsuario.getCorreo().trim()).isPresent()) {
            throw new RuntimeException("El correo que me diste ('" + datosDelNuevoUsuario.getCorreo() + "') ya está registrado. Intenta con otro.");
        }
        
        if (datosDelNuevoUsuario.getNumeroDocumento() != null && !datosDelNuevoUsuario.getNumeroDocumento().trim().isEmpty() &&
            miRepositorioDeUsuarios.findByNumeroDocumento(datosDelNuevoUsuario.getNumeroDocumento().trim()).isPresent()) {
            throw new RuntimeException("El número de documento que me diste ya está registrado.");
        }

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre(datosDelNuevoUsuario.getNombre());
        nuevoUsuario.setApellido(datosDelNuevoUsuario.getApellido());
        nuevoUsuario.setTipoDocumento(datosDelNuevoUsuario.getTipoDocumento());
        nuevoUsuario.setNumeroDocumento(datosDelNuevoUsuario.getNumeroDocumento());
        nuevoUsuario.setCorreo(datosDelNuevoUsuario.getCorreo());
        nuevoUsuario.setTelefono(datosDelNuevoUsuario.getTelefono());
        nuevoUsuario.setDireccion(datosDelNuevoUsuario.getDireccion());
        
        // Si me dan una contraseña, la codifico. Si no (como para invitados), se generará una temporal.
        if (datosDelNuevoUsuario.getContrasena() != null && !datosDelNuevoUsuario.getContrasena().isEmpty()) {
            nuevoUsuario.setContrasena(miCodificadorDeContrasenas.encode(datosDelNuevoUsuario.getContrasena()));
        } else {
            // Genero una contraseña temporal segura 
            String contrasenaTemporalMuySegura = "InvitadoPass" + System.currentTimeMillis() + UUID.randomUUID().toString();
            nuevoUsuario.setContrasena(miCodificadorDeContrasenas.encode(contrasenaTemporalMuySegura));
        }
        
        nuevoUsuario.setFueDirecto(datosDelNuevoUsuario.getFueDirecto() != null ? datosDelNuevoUsuario.getFueDirecto() : false);
        nuevoUsuario.setFechaRegistro(LocalDateTime.now());
        
        String tipoUsuarioAAsignar = datosDelNuevoUsuario.getTipoUsuario();
        if (tipoUsuarioAAsignar == null || tipoUsuarioAAsignar.trim().isEmpty()) {
            tipoUsuarioAAsignar = "CLIENTE"; 
        }
        nuevoUsuario.setTipoUsuario(tipoUsuarioAAsignar);

        return miRepositorioDeUsuarios.save(nuevoUsuario);
    }

    /**
     * creo un usuario "invitado" muy básico para esos pedidos rápidos en el local.
    
     * @param nombreOpcional 
     * @return 
     */
    @Transactional
    public Usuario crearUsuarioInvitadoLocal(String nombreOpcional) {
        Usuario invitado = new Usuario();
        
        String nombreBase = (nombreOpcional != null && !nombreOpcional.trim().isEmpty()) ? nombreOpcional.trim() : "Cliente Local";
        long timestamp = System.currentTimeMillis(); // Para generar datos únicos

        invitado.setNombre(nombreBase);
        invitado.setApellido("."); // Pongo un punto como apellido por defecto, ya que es NOT NULL en la BD.
        
        
        invitado.setCorreo("invitado_" + timestamp + "@restaurantemaranatha.local"); // Uso .local para diferenciar
        invitado.setNumeroDocumento("INV-" + timestamp);
        invitado.setTipoDocumento("NA"); 

        invitado.setTelefono(""); 
        invitado.setDireccion("");
        
        // Genero una contraseña muy segura y aleatoria que nadie ni el invitado usará para login.
        String contrasenaTemporalInvitado = "InvitadoPass_" + UUID.randomUUID().toString() + "_" + timestamp;
        invitado.setContrasena(miCodificadorDeContrasenas.encode(contrasenaTemporalInvitado)); 
        
        invitado.setFueDirecto(true); // ¡Importante! Marco que este usuario se creó directamente en el restaurante.
        invitado.setFechaRegistro(LocalDateTime.now());
        invitado.setTipoUsuario("CLIENTE"); // Aunque sea "invitado", sigue siendo un tipo de cliente para el sistema.

        return miRepositorioDeUsuarios.save(invitado);
    }

    /**
     * busco un usuario por su correo electrónico.
     */
    public Optional<Usuario> buscarPorCorreo(String correo) {
        return miRepositorioDeUsuarios.findByCorreo(correo);
    }

    /**
     *busco un usuario por su número de documento.
     */
    public Optional<Usuario> buscarPorNumeroDocumento(String numeroDocumento) {
        return miRepositorioDeUsuarios.findByNumeroDocumento(numeroDocumento);
    }
}
