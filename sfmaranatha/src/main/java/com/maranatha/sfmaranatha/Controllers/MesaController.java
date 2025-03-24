package com.maranatha.sfmaranatha.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.maranatha.sfmaranatha.Model.Mesa;
import com.maranatha.sfmaranatha.Repository.MesaRepository;
import java.util.List;

@RestController
@RequestMapping("/api/mesas")
public class MesaController {

    @Autowired
    private MesaRepository mesaRepository;

    // Obtener mesas ocupadas
    @GetMapping("/ocupadas")
    public ResponseEntity<List<Mesa>> obtenerMesasOcupadas() {
        return ResponseEntity.ok(mesaRepository.findByEstado("Ocupada"));
    }
}
