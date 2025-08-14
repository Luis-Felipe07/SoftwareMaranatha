package com.maranatha.sfmaranatha.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.maranatha.sfmaranatha.dto.LineaPedidoDTO;
import com.maranatha.sfmaranatha.dto.PedidoRequestDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
class PedidoControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Cliente autenticado puede crear pedido a domicilio")
    @WithMockUser(username = "cliente@test.com", roles = {"CLIENTE"})
    void testCrearPedidoDomicilio() throws Exception {
        // Arrange
        PedidoRequestDTO pedido = new PedidoRequestDTO();
        pedido.setSolicitanteUsuarioId(1);
        pedido.setMetodoPago("EFECTIVO");
        pedido.setDireccionEntrega("Calle 123");
        
        LineaPedidoDTO item = new LineaPedidoDTO();
        item.setPlatoId(1);
        item.setCantidad(2);
        pedido.setItems(Arrays.asList(item));

        // Act & Assert
        mockMvc.perform(post("/api/pedidos/nuevo")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(pedido)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").exists())
                .andExpect(jsonPath("$.pedidoId").exists());
    }

    @Test
    @DisplayName("Usuario no autenticado no puede ver pedidos")
    void testVerPedidosSinAutenticacion() throws Exception {
        mockMvc.perform(get("/api/pedidos/mis-pedidos"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Admin puede ver todos los pedidos")
    @WithMockUser(username = "admin@test.com", roles = {"ADMIN"})
    void testAdminVerTodosPedidos() throws Exception {
        mockMvc.perform(get("/api/pedidos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}