package com.maranatha.sfmaranatha.dto;

import java.math.BigDecimal;
import java.util.Map;

public class EstadisticasCalificacionDTO {
    private BigDecimal promedioGeneral;
    private Long totalResenas;
    private Map<Integer, Integer> distribucion; 
    private Map<String, BigDecimal> promediosPorCategoria;
    private Integer porcentajeRecomendacion;

    // Constructor vacío
    public EstadisticasCalificacionDTO() {}

    // Getters y Setters
    public BigDecimal getPromedioGeneral() {
        return promedioGeneral;
    }

    public void setPromedioGeneral(BigDecimal promedioGeneral) {
        this.promedioGeneral = promedioGeneral;
    }

    public Long getTotalResenas() {
        return totalResenas;
    }

    public void setTotalResenas(Long totalResenas) {
        this.totalResenas = totalResenas;
    }

    public Map<Integer, Integer> getDistribucion() {
        return distribucion;
    }

    public void setDistribucion(Map<Integer, Integer> distribucion) {
        this.distribucion = distribucion;
    }

    public Map<String, BigDecimal> getPromediosPorCategoria() {
        return promediosPorCategoria;
    }

    public void setPromediosPorCategoria(Map<String, BigDecimal> promediosPorCategoria) {
        this.promediosPorCategoria = promediosPorCategoria;
    }

    public Integer getPorcentajeRecomendacion() {
        return porcentajeRecomendacion;
    }

    public void setPorcentajeRecomendacion(Integer porcentajeRecomendacion) {
        this.porcentajeRecomendacion = porcentajeRecomendacion;
    }
}