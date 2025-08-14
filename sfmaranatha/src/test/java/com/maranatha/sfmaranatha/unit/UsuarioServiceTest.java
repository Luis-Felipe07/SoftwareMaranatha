package com.maranatha.sfmaranatha.unit;

import com.maranatha.sfmaranatha.Model.Usuario;
import com.maranatha.sfmaranatha.Repository.UsuarioRepository;
import com.maranatha.sfmaranatha.Service.UsuarioService;
import com.maranatha.sfmaranatha.dto.RegistroUsuarioDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService usuarioService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("Debe registrar un nuevo cliente exitosamente")
    void testRegistrarClienteExitoso() {
        // Arrange
        RegistroUsuarioDTO dto = new RegistroUsuarioDTO();
        dto.setNombre("Juan");
        dto.setApellido("Pérez");
        dto.setCorreo("juan@test.com");
        dto.setNumeroDocumento("12345678");
        dto.setTipoDocumento("CC");
        dto.setContrasena("password123");
        dto.setTipoUsuario("CLIENTE");

        when(usuarioRepository.findByCorreo(anyString())).thenReturn(Optional.empty());
        when(usuarioRepository.findByNumeroDocumento(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        Usuario resultado = usuarioService.registrarUsuario(dto);

        // Assert
        assertNotNull(resultado);
        assertEquals("Juan", resultado.getNombre());
        assertEquals("juan@test.com", resultado.getCorreo());
        assertEquals("CLIENTE", resultado.getTipoUsuario());
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
    }

    @Test
    @DisplayName("Debe fallar al registrar usuario con correo duplicado")
    void testRegistrarUsuarioCorreoDuplicado() {
        // Arrange
        RegistroUsuarioDTO dto = new RegistroUsuarioDTO();
        dto.setCorreo("existente@test.com");
        
        Usuario usuarioExistente = new Usuario();
        when(usuarioRepository.findByCorreo("existente@test.com"))
            .thenReturn(Optional.of(usuarioExistente));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            usuarioService.registrarUsuario(dto);
        });
    }

    @Test
    @DisplayName("Debe crear usuario invitado local correctamente")
    void testCrearUsuarioInvitadoLocal() {
        // Arrange
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        Usuario invitado = usuarioService.crearUsuarioInvitadoLocal("Mesa 3");

        // Assert
        assertNotNull(invitado);
        assertEquals("Mesa 3", invitado.getNombre());
        assertEquals(".", invitado.getApellido());
        assertTrue(invitado.getCorreo().contains("@restaurantemaranatha.local"));
        assertTrue(invitado.getFueDirecto());
        assertEquals("CLIENTE", invitado.getTipoUsuario());
    }
}