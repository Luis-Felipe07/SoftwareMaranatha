package com.maranatha.sfmaranatha.Controllers;

import com.maranatha.sfmaranatha.Service.ReporteService;
import com.maranatha.sfmaranatha.dto.ReporteVentasDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
@Tag(name = "Reportes", description = "Gestiono los reportes de ventas del restaurante")
@CrossOrigin(origins = "*")
public class ReporteController {

    @Autowired
    private ReporteService reporteService;

    /**
     * Obtener reporte de ventas por rango de fechas
     */
    @GetMapping("/ventas")
    @Operation(summary = "Obtener reporte de ventas",
               description = "Devuelvo un reporte de ventas filtrado por fechas")
    public ResponseEntity<?> obtenerReporteVentas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        
        try {
            // Si no se proporcionan fechas, usar el mes actual
            if (fechaInicio == null) {
                fechaInicio = LocalDate.now().withDayOfMonth(1);
            }
            if (fechaFin == null) {
                fechaFin = LocalDate.now();
            }
            
            ReporteVentasDTO reporte = reporteService.generarReporteVentas(fechaInicio, fechaFin);
            return ResponseEntity.ok(reporte);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", true,
                "mensaje", "Error al generar reporte: " + e.getMessage()
            ));
        }
    }

    /**
     * Descargar reporte en Excel
     */
    @GetMapping("/ventas/excel")
    @Operation(summary = "Descargar reporte en Excel",
               description = "Genero y descargo un reporte de ventas en formato Excel")
    public ResponseEntity<byte[]> descargarReporteExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        
        try {
            // Si no se proporcionan fechas, usar el mes actual
            if (fechaInicio == null) {
                fechaInicio = LocalDate.now().withDayOfMonth(1);
            }
            if (fechaFin == null) {
                fechaFin = LocalDate.now();
            }
            
            byte[] excelBytes = reporteService.generarReporteExcel(fechaInicio, fechaFin);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", 
                "reporte_ventas_" + fechaInicio + "_" + fechaFin + ".xlsx");
            
            return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Descargar reporte en PDF
     */
    @GetMapping("/ventas/pdf")
    @Operation(summary = "Descargar reporte en PDF",
               description = "Genero y descargo un reporte de ventas en formato PDF")
    public ResponseEntity<byte[]> descargarReportePDF(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        
        try {
            // Si no se proporcionan fechas, usar el mes actual
            if (fechaInicio == null) {
                fechaInicio = LocalDate.now().withDayOfMonth(1);
            }
            if (fechaFin == null) {
                fechaFin = LocalDate.now();
            }
            
            byte[] pdfBytes = reporteService.generarReportePDF(fechaInicio, fechaFin);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("inline", 
                "reporte_ventas_" + fechaInicio + "_" + fechaFin + ".pdf");
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Obtener estadísticas del dashboard
     */
    @GetMapping("/estadisticas/dashboard")
    @Operation(summary = "Obtener estadísticas del dashboard",
               description = "Devuelvo estadísticas rápidas para el dashboard administrativo")
    public ResponseEntity<?> obtenerEstadisticasDashboard() {
        try {
            Map<String, Object> estadisticas = reporteService.obtenerEstadisticasDashboard();
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", true,
                "mensaje", "Error al obtener estadísticas: " + e.getMessage()
            ));
        }
    }
}