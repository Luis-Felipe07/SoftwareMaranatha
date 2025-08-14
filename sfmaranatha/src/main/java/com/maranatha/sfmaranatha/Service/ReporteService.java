package com.maranatha.sfmaranatha.Service;

import com.maranatha.sfmaranatha.Model.*;
import com.maranatha.sfmaranatha.Repository.*;
import com.maranatha.sfmaranatha.dto.ReporteVentasDTO;
import com.maranatha.sfmaranatha.dto.ReporteVentasDTO.DetallePedidoReporte;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReporteService {

    @Autowired
    private PedidoRepository pedidoRepository;
    
    @Autowired
    private MesaRepository mesaRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Genero el reporte de ventas completo
     */
    public ReporteVentasDTO generarReporteVentas(LocalDate fechaInicio, LocalDate fechaFin) {
        ReporteVentasDTO reporte = new ReporteVentasDTO();
        reporte.setFechaInicio(fechaInicio);
        reporte.setFechaFin(fechaFin);

        // Obtenengo todos los pedidos en el rango de fechas
        List<Pedido> pedidos = obtenerPedidosEnRango(fechaInicio, fechaFin);
        
        // Filtro solo pedidos entregados y ventas completadas
        List<Pedido> pedidosCompletados = pedidos.stream()
            .filter(p -> "ENTREGADO".equals(p.getEstado()))
            .collect(Collectors.toList());

        // Calculo totales
        BigDecimal totalVentas = pedidosCompletados.stream()
            .map(Pedido::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        reporte.setTotalVentas(totalVentas);
        reporte.setTotalPedidos(pedidosCompletados.size());
        
        // Calcular promedio diario
        long diasEnRango = ChronoUnit.DAYS.between(fechaInicio, fechaFin) + 1;
        BigDecimal promedioDiario = diasEnRango > 0 ? 
            totalVentas.divide(BigDecimal.valueOf(diasEnRango), 2, RoundingMode.HALF_UP) : 
            BigDecimal.ZERO;
        reporte.setPromedioVentaDiaria(promedioDiario);

        // Calcular ventas por día
        Map<String, BigDecimal> ventasPorDia = calcularVentasPorDia(pedidosCompletados);
        reporte.setVentasPorDia(ventasPorDia);

        // Calcular ventas por semana
        Map<String, BigDecimal> ventasPorSemana = calcularVentasPorSemana(pedidosCompletados);
        reporte.setVentasPorSemana(ventasPorSemana);

        // Calcular platillos más vendidos
        Map<String, Integer> platillosVendidos = calcularPlatillosVendidos(pedidosCompletados);
        reporte.setPlatillosVendidos(platillosVendidos);
        
        // Encontrar el platillo más vendido
        String platilloMasVendido = platillosVendidos.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("N/A");
        reporte.setPlatilloMasVendido(platilloMasVendido);

        // Generar lista detallada de pedidos
        List<DetallePedidoReporte> detalles = pedidosCompletados.stream()
            .map(this::convertirPedidoADetalle)
            .collect(Collectors.toList());
        reporte.setDetallesPedidos(detalles);

        return reporte;
    }

    /**
     * Generar reporte en Excel
     */
    public byte[] generarReporteExcel(LocalDate fechaInicio, LocalDate fechaFin) throws Exception {
        ReporteVentasDTO reporte = generarReporteVentas(fechaInicio, fechaFin);
        
        try (Workbook workbook = new XSSFWorkbook()) {
            // Hoja de resumen
            Sheet resumenSheet = workbook.createSheet("Resumen");
            crearHojaResumen(resumenSheet, reporte);
            
            // Hoja de ventas diarias
            Sheet ventasDiariasSheet = workbook.createSheet("Ventas Diarias");
            crearHojaVentasDiarias(ventasDiariasSheet, reporte);
            
            // Hoja de platillos vendidos
            Sheet platillosSheet = workbook.createSheet("Platillos Vendidos");
            crearHojaPlatillos(platillosSheet, reporte);
            
            // Hoja de detalle de pedidos
            Sheet detalleSheet = workbook.createSheet("Detalle Pedidos");
            crearHojaDetallePedidos(detalleSheet, reporte);
            
            // Convertir a bytes
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    /**
     * Generar reporte en PDF usando iText
     */
    public byte[] generarReportePDF(LocalDate fechaInicio, LocalDate fechaFin) throws Exception {
        ReporteVentasDTO reporte = generarReporteVentas(fechaInicio, fechaFin);
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        com.itextpdf.text.Document document = new com.itextpdf.text.Document();
        
        try {
            com.itextpdf.text.pdf.PdfWriter.getInstance(document, baos);
            document.open();
            
            // Fuentes
            com.itextpdf.text.Font titleFont = new com.itextpdf.text.Font(
                com.itextpdf.text.Font.FontFamily.HELVETICA, 18, com.itextpdf.text.Font.BOLD);
            com.itextpdf.text.Font headerFont = new com.itextpdf.text.Font(
                com.itextpdf.text.Font.FontFamily.HELVETICA, 14, com.itextpdf.text.Font.BOLD);
            com.itextpdf.text.Font normalFont = new com.itextpdf.text.Font(
                com.itextpdf.text.Font.FontFamily.HELVETICA, 12);
            
            // Título
            com.itextpdf.text.Paragraph title = new com.itextpdf.text.Paragraph(
                "REPORTE DE VENTAS - RESTAURANTE MARANATHA", titleFont);
            title.setAlignment(com.itextpdf.text.Element.ALIGN_CENTER);
            document.add(title);
            
            // Período
            com.itextpdf.text.Paragraph period = new com.itextpdf.text.Paragraph(
                "Período: " + fechaInicio.format(DATE_FORMATTER) + " - " + fechaFin.format(DATE_FORMATTER), 
                normalFont);
            period.setAlignment(com.itextpdf.text.Element.ALIGN_CENTER);
            document.add(period);
            
            document.add(new com.itextpdf.text.Paragraph(" ")); // Espacio
            
            // Resumen
            document.add(new com.itextpdf.text.Paragraph("RESUMEN EJECUTIVO", headerFont));
            document.add(new com.itextpdf.text.Paragraph(
                "Total Ventas: $" + reporte.getTotalVentas(), normalFont));
            document.add(new com.itextpdf.text.Paragraph(
                "Total Pedidos: " + reporte.getTotalPedidos(), normalFont));
            document.add(new com.itextpdf.text.Paragraph(
                "Promedio Diario: $" + reporte.getPromedioVentaDiaria(), normalFont));
            document.add(new com.itextpdf.text.Paragraph(
                "Platillo Más Vendido: " + reporte.getPlatilloMasVendido(), normalFont));
            
            document.add(new com.itextpdf.text.Paragraph(" ")); // Espacio
            
            // Tabla de ventas por día
            document.add(new com.itextpdf.text.Paragraph("VENTAS DIARIAS", headerFont));
            com.itextpdf.text.pdf.PdfPTable tablaDiaria = new com.itextpdf.text.pdf.PdfPTable(2);
            tablaDiaria.setWidthPercentage(100);
            
            // Encabezados
            tablaDiaria.addCell("Fecha");
            tablaDiaria.addCell("Total Ventas");
            
            // Datos
            for (Map.Entry<String, BigDecimal> entry : reporte.getVentasPorDia().entrySet()) {
                tablaDiaria.addCell(entry.getKey());
                tablaDiaria.addCell("$" + entry.getValue());
            }
            
            document.add(tablaDiaria);
            
            document.add(new com.itextpdf.text.Paragraph(" ")); // Espacio
            
            // Tabla de platillos más vendidos
            document.add(new com.itextpdf.text.Paragraph("PLATILLOS MÁS VENDIDOS", headerFont));
            com.itextpdf.text.pdf.PdfPTable tablaPlatillos = new com.itextpdf.text.pdf.PdfPTable(2);
            tablaPlatillos.setWidthPercentage(100);
            
            // Encabezados
            tablaPlatillos.addCell("Platillo");
            tablaPlatillos.addCell("Cantidad");
            
            // Ordenar y mostrar top 10
            List<Map.Entry<String, Integer>> platillosOrdenados = new ArrayList<>(reporte.getPlatillosVendidos().entrySet());
            platillosOrdenados.sort((a, b) -> b.getValue().compareTo(a.getValue()));
            
            platillosOrdenados.stream().limit(10).forEach(entry -> {
                tablaPlatillos.addCell(entry.getKey());
                tablaPlatillos.addCell(entry.getValue().toString());
            });
            
            document.add(tablaPlatillos);
            
            document.close();
            
        } catch (Exception e) {
            throw new Exception("Error generando PDF: " + e.getMessage());
        }
        
        return baos.toByteArray();
    }

    /**
     * Obtener estadísticas para el dashboard
     */
    public Map<String, Object> obtenerEstadisticasDashboard() {
        Map<String, Object> estadisticas = new HashMap<>();
        
        // Pedidos pendientes
        List<Pedido> pedidosPendientes = pedidoRepository.findByEstado("PENDIENTE");
        estadisticas.put("pedidosPendientes", pedidosPendientes.size());
        
        // Ventas de hoy
        BigDecimal ventasHoy = calcularVentasDelDia(LocalDate.now());
        estadisticas.put("ventasHoy", ventasHoy);
        
        // Mesas disponibles
        List<Mesa> mesasDisponibles = mesaRepository.findByEstado("Disponible");
        estadisticas.put("mesasDisponibles", mesasDisponibles.size());
        
        // Reservas de hoy (simulado por ahora)
        estadisticas.put("reservasHoy", 5);
        
        return estadisticas;
    }

    // Métodos auxiliares privados

    private List<Pedido> obtenerPedidosEnRango(LocalDate fechaInicio, LocalDate fechaFin) {
        List<Pedido> todosPedidos = pedidoRepository.findAll();
        
        LocalDateTime inicioDateTime = fechaInicio.atStartOfDay();
        LocalDateTime finDateTime = fechaFin.plusDays(1).atStartOfDay();
        
        return todosPedidos.stream()
            .filter(p -> !p.getFechaPedido().isBefore(inicioDateTime) && 
                        p.getFechaPedido().isBefore(finDateTime))
            .collect(Collectors.toList());
    }

    private Map<String, BigDecimal> calcularVentasPorDia(List<Pedido> pedidos) {
        Map<String, BigDecimal> ventasPorDia = new TreeMap<>();
        
        pedidos.forEach(pedido -> {
            String fecha = pedido.getFechaPedido().toLocalDate().format(DATE_FORMATTER);
            ventasPorDia.merge(fecha, pedido.getTotal(), BigDecimal::add);
        });
        
        return ventasPorDia;
    }

    private Map<String, BigDecimal> calcularVentasPorSemana(List<Pedido> pedidos) {
        Map<String, BigDecimal> ventasPorSemana = new LinkedHashMap<>();
        String[] diasSemana = {"Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"};
        
        // Inicializar con ceros
        for (String dia : diasSemana) {
            ventasPorSemana.put(dia, BigDecimal.ZERO);
        }
        
        // Sumar ventas por día de la semana
        pedidos.forEach(pedido -> {
            int diaSemana = pedido.getFechaPedido().getDayOfWeek().getValue();
            String nombreDia = diasSemana[diaSemana - 1];
            ventasPorSemana.merge(nombreDia, pedido.getTotal(), BigDecimal::add);
        });
        
        return ventasPorSemana;
    }

    private Map<String, Integer> calcularPlatillosVendidos(List<Pedido> pedidos) {
        Map<String, Integer> platillosVendidos = new HashMap<>();
        
        pedidos.forEach(pedido -> {
            if (pedido.getItems() != null) {
                pedido.getItems().forEach(item -> {
                    String nombrePlato = item.getPlato().getNombrePlato();
                    platillosVendidos.merge(nombrePlato, item.getCantidad(), Integer::sum);
                });
            }
        });
        
        return platillosVendidos;
    }

    private BigDecimal calcularVentasDelDia(LocalDate fecha) {
        List<Pedido> pedidosDelDia = obtenerPedidosEnRango(fecha, fecha);
        return pedidosDelDia.stream()
            .filter(p -> "ENTREGADO".equals(p.getEstado()))
            .map(Pedido::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private DetallePedidoReporte convertirPedidoADetalle(Pedido pedido) {
        return new DetallePedidoReporte(
            pedido.getIdPedido(),
            pedido.getFechaPedido().format(DATETIME_FORMATTER),
            pedido.getNombreCliente(),
            pedido.getTotal(),
            pedido.getEstado(),
            pedido.getMetodoPago()
        );
    }

    // Métodos para crear hojas de Excel

    private void crearHojaResumen(Sheet sheet, ReporteVentasDTO reporte) {
        int rowNum = 0;
        
        // Título
        Row titleRow = sheet.createRow(rowNum++);
        titleRow.createCell(0).setCellValue("REPORTE DE VENTAS - RESTAURANTE MARANATHA");
        
        rowNum++; // Fila vacía
        
        // Período
        Row periodRow = sheet.createRow(rowNum++);
        periodRow.createCell(0).setCellValue("Período:");
        periodRow.createCell(1).setCellValue(reporte.getFechaInicio().format(DATE_FORMATTER) + 
            " - " + reporte.getFechaFin().format(DATE_FORMATTER));
        
        rowNum++; // Fila vacía
        
        // Resumen
        createDataRow(sheet, rowNum++, "Total Ventas:", "$" + reporte.getTotalVentas());
        createDataRow(sheet, rowNum++, "Total Pedidos:", reporte.getTotalPedidos().toString());
        createDataRow(sheet, rowNum++, "Promedio Diario:", "$" + reporte.getPromedioVentaDiaria());
        createDataRow(sheet, rowNum++, "Platillo Más Vendido:", reporte.getPlatilloMasVendido());
        
        // Ajustar ancho de columnas
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    private void crearHojaVentasDiarias(Sheet sheet, ReporteVentasDTO reporte) {
        int rowNum = 0;
        
        // Encabezados
        Row headerRow = sheet.createRow(rowNum++);
        headerRow.createCell(0).setCellValue("Fecha");
        headerRow.createCell(1).setCellValue("Total Ventas");
        
        // Datos
        for (Map.Entry<String, BigDecimal> entry : reporte.getVentasPorDia().entrySet()) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(entry.getKey());
            row.createCell(1).setCellValue("$" + entry.getValue());
        }
        
        // Ajustar columnas
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    private void crearHojaPlatillos(Sheet sheet, ReporteVentasDTO reporte) {
        int rowNum = 0;
        
        // Encabezados
        Row headerRow = sheet.createRow(rowNum++);
        headerRow.createCell(0).setCellValue("Platillo");
        headerRow.createCell(1).setCellValue("Cantidad Vendida");
        
        // Ordenar por cantidad vendida (descendente)
        List<Map.Entry<String, Integer>> platillosOrdenados = new ArrayList<>(reporte.getPlatillosVendidos().entrySet());
        platillosOrdenados.sort((a, b) -> b.getValue().compareTo(a.getValue()));
        
        // Datos
        for (Map.Entry<String, Integer> entry : platillosOrdenados) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(entry.getKey());
            row.createCell(1).setCellValue(entry.getValue());
        }
        
        // Ajustar columnas
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    private void crearHojaDetallePedidos(Sheet sheet, ReporteVentasDTO reporte) {
        int rowNum = 0;
        
        // Encabezados
        Row headerRow = sheet.createRow(rowNum++);
        headerRow.createCell(0).setCellValue("ID Pedido");
        headerRow.createCell(1).setCellValue("Fecha");
        headerRow.createCell(2).setCellValue("Cliente");
        headerRow.createCell(3).setCellValue("Total");
        headerRow.createCell(4).setCellValue("Estado");
        headerRow.createCell(5).setCellValue("Método Pago");
        
        // Datos
        for (DetallePedidoReporte detalle : reporte.getDetallesPedidos()) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(detalle.getIdPedido());
            row.createCell(1).setCellValue(detalle.getFecha());
            row.createCell(2).setCellValue(detalle.getCliente());
            row.createCell(3).setCellValue("$" + detalle.getTotal());
            row.createCell(4).setCellValue(detalle.getEstado());
            row.createCell(5).setCellValue(detalle.getMetodoPago());
        }
        
        // Ajustar columnas
        for (int i = 0; i < 6; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void createDataRow(Sheet sheet, int rowNum, String label, String value) {
        Row row = sheet.createRow(rowNum);
        row.createCell(0).setCellValue(label);
        row.createCell(1).setCellValue(value);
    }

    private String generarContenidoTextual(LocalDate fechaInicio, LocalDate fechaFin) {
        ReporteVentasDTO reporte = generarReporteVentas(fechaInicio, fechaFin);
        
        StringBuilder sb = new StringBuilder();
        sb.append("REPORTE DE VENTAS - RESTAURANTE MARANATHA\n");
        sb.append("=========================================\n\n");
        sb.append("Período: ").append(fechaInicio).append(" - ").append(fechaFin).append("\n\n");
        sb.append("RESUMEN:\n");
        sb.append("Total Ventas: $").append(reporte.getTotalVentas()).append("\n");
        sb.append("Total Pedidos: ").append(reporte.getTotalPedidos()).append("\n");
        sb.append("Promedio Diario: $").append(reporte.getPromedioVentaDiaria()).append("\n");
        sb.append("Platillo Más Vendido: ").append(reporte.getPlatilloMasVendido()).append("\n");
        
        return sb.toString();
    }
}