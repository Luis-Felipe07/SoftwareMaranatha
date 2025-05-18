package com.maranatha.sfmaranatha.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.maranatha.sfmaranatha.Model.Reserva;


@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    // Aquí puedes declarar métodos de consulta personalizados, por ejemplo:
    // List<Reserva> findByFechaReserva(LocalDate fecha);
}
