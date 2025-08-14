package com.maranatha.sfmaranatha.Controllers;

import com.maranatha.sfmaranatha.Model.Menu;
import com.maranatha.sfmaranatha.Repository.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.Map;

@Controller
public class WebController {
    
    @Autowired
    private MenuRepository menuRepository;
    
    @GetMapping("/")
    public String index() {
        return "primera-pagina.html";
    }
    
    @GetMapping("/login")
    public String login() {
        return "login.html";
    }
    
    @GetMapping("/admin")
    public String admin() {
        return "admin.html";
    }
    
    @GetMapping("/dashboard-cliente")
    public String dashboardCliente() {
        return "dashboard-cliente.html";
    }
    
    @GetMapping("/mesas")
    public String mesas() {
        return "mesas.html";
    }
    
    @GetMapping("/gestion-de-menus")
    public String gestionMenus() {
        return "gestion-de-menus.html";
    }
    
    @GetMapping("/gestion-de-reservas")
    public String gestionReservas() {
        return "Gestion-de-reservas.html";
    }
    
    @GetMapping("/formulario-de-registro")
    public String formularioRegistro() {
        return "formulario-de-registro.html";
    }
    
    @GetMapping("/registro-cliente")
    public String registroCliente() {
        return "registro-cliente.html";
    }
    
    @GetMapping("/recuperar-contrasenia")
    public String recuperarContrasenia() {
        return "recuperar-contrasenia.html";
    }
    
    @GetMapping("/pantalla-admin")
    public String pantallaAdmin() {
        return "pantalla-admin.html";
    }
    
    @GetMapping("/redes")
    public String redes() {
        return "redes.html";
    }
    
    @GetMapping("/calificaciones")
public String calificaciones() {
    return "redes.html";  
}

@GetMapping("/pqr")
public String pqr() {
    return "redes.html";  
}

    @GetMapping("/reporte-de-ventas")
    public String reporteVentas() {
        return "reporte-de-ventas.html";
    }
    
    /**
     * Endpoint para verificar el estado de los menús (para debugging)
     */
    @GetMapping("/api/debug/menus")
    public ResponseEntity<?> verificarMenus() {
        try {
            List<Menu> menus = menuRepository.findAll();
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "totalMenus", menus.size(),
                "menus", menus.stream().map(m -> Map.of(
                    "id", m.getIdMenu(),
                    "nombre", m.getNombreMenu(),
                    "idRestaurante", m.getIdRestaurante()
                )).toList()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al verificar menús: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Creo este Endpoint de emergencia para crear menús manualmente
     */
    @GetMapping("/api/debug/crear-menus")
    public ResponseEntity<?> crearMenusEmergencia() {
        try {
            String[] nombresMenus = {
                "Menú del Día",      // ID: 1
                "Menú Especial",     // ID: 2
                "Postres",           // ID: 3
                "Bebidas"            // ID: 4
            };
            
            int menusCreados = 0;
            StringBuilder resultado = new StringBuilder();
            
            for (String nombreMenu : nombresMenus) {
                // Verifico si ya existe
                boolean existe = menuRepository.findAll().stream()
                    .anyMatch(m -> m.getNombreMenu().equals(nombreMenu));
                
                if (!existe) {
                    Menu menu = new Menu();
                    menu.setNombreMenu(nombreMenu);
                    menu.setIdRestaurante(1);
                    Menu guardado = menuRepository.save(menu);
                    menusCreados++;
                    resultado.append("✅ Creado: ").append(nombreMenu)
                            .append(" (ID: ").append(guardado.getIdMenu()).append(")\n");
                } else {
                    resultado.append("⚠️ Ya existe: ").append(nombreMenu).append("\n");
                }
            }
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Proceso completado",
                "menusCreados", menusCreados,
                "detalle", resultado.toString(),
                "totalMenus", menuRepository.count()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al crear menús: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Endpoint público para obtener todos los menús... para la interfaz de cliente
     */
    @GetMapping("/api/menus")
    public ResponseEntity<?> obtenerTodosLosMenus() {
        try {
            List<Menu> menus = menuRepository.findAll();
            return ResponseEntity.ok(menus.stream().map(m -> Map.of(
                "idMenu", m.getIdMenu(),
                "nombreMenu", m.getNombreMenu(),
                "idRestaurante", m.getIdRestaurante()
            )).toList());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "Error al obtener menús: " + e.getMessage()
            ));
        }
    }
}