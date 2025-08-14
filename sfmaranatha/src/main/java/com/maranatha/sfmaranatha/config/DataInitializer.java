package com.maranatha.sfmaranatha.config;

import com.maranatha.sfmaranatha.Model.Mesa;
import com.maranatha.sfmaranatha.Model.Menu;
import com.maranatha.sfmaranatha.Repository.MesaRepository;
import com.maranatha.sfmaranatha.Repository.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private MesaRepository mesaRepository;
    
    @Autowired
    private MenuRepository menuRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🚀 Iniciando DataInitializer...");
        
        // Crear menús iniciales si no existen
        long menuCount = menuRepository.count();
        System.out.println("📋 Menús existentes en BD: " + menuCount);
        
        if (menuCount == 0) {
            System.out.println("🔧 Creando menús iniciales...");
            crearMenusIniciales();
            System.out.println("✅ Menús iniciales creados correctamente");
        } else {
            System.out.println("✅ Los menús ya existen, saltando creación");
        }
        
        // Verificar si ya hay mesas
        long mesaCount = mesaRepository.count();
        System.out.println("🪑 Mesas existentes en BD: " + mesaCount);
        
        if (mesaCount == 0) {
            System.out.println("🔧 Creando mesas iniciales...");
            // Crear 5 mesas iniciales
            for (int i = 1; i <= 5; i++) {
                Mesa mesa = new Mesa();
                mesa.setNumero(i);
                mesa.setEstado("Disponible");
                mesaRepository.save(mesa);
            }
            System.out.println("✅ Mesas iniciales creadas correctamente");
        } else {
            System.out.println("✅ Las mesas ya existen, saltando creación");
        }
        
        // Verificar que todos los menús fueron creados correctamente
        verificarMenusCreados();
    }
    
    private void crearMenusIniciales() {
        // Crear las categorías de menú estándar
        String[] nombresMenus = {
            "Menú del Día",      
            "Menú Especial",     
            "Postres",           
            "Bebidas"            
        };
        
        for (String nombreMenu : nombresMenus) {
            try {
                Menu menu = new Menu();
                menu.setNombreMenu(nombreMenu);
                menu.setIdRestaurante(1);
                Menu menuGuardado = menuRepository.save(menu);
                System.out.println("🍽️ Menú creado: " + nombreMenu + " (ID: " + menuGuardado.getIdMenu() + ")");
            } catch (Exception e) {
                System.err.println("❌ Error al crear menú " + nombreMenu + ": " + e.getMessage());
            }
        }
    }
    
    private void verificarMenusCreados() {
        System.out.println("🔍 Verificando menús creados:");
        List<Menu> todosLosMenus = menuRepository.findAll();
        for (Menu menu : todosLosMenus) {
            System.out.println("📋 Menu ID: " + menu.getIdMenu() + " - Nombre: " + menu.getNombreMenu());
        }
        
        if (todosLosMenus.size() >= 4) {
            System.out.println("✅ Todos los menús necesarios están disponibles");
        } else {
            System.err.println("⚠️ ADVERTENCIA: Solo se encontraron " + todosLosMenus.size() + " menús, se esperaban 4");
        }
    }
}