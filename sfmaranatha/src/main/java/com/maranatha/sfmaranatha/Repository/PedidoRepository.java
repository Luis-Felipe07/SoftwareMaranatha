package com.maranatha.sfmaranatha.Repository;

import com.maranatha.sfmaranatha.Model.Pedido;
import com.maranatha.sfmaranatha.Model.Usuario; // Asegúrate de tener este import
import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository; // @Repository es opcional para interfaces que extienden JpaRepository

import java.util.List; // Asegúrate de tener este import


public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    /**
     *  busco todos los pedidos cuyo campo 'estado' coincide con el parámetro que me dan.
     * @param estado el estado del pedido 
     * @return una lista de pedidos que tienen ese estado.
     */
    List<Pedido> findByEstado(String estado); // Este método ya lo tenías y está bien.



    /**
     * Yo busco todos los pedidos que pertenecen a un usuario específico.
     * @param usuario El objeto Usuario del cual quiero los pedidos.
     * @return Una lista de pedidos para ese usuario.
     */
    List<Pedido> findByUsuario(Usuario usuario);

    /**
     * Yo busco todos los pedidos que pertenecen a un usuario específico Y que además
     * tienen un estado particular.
     * @param usuario El objeto Usuario.
     * @param estado El estado del pedido que me interesa (ej. "PENDIENTE").
     * @return Una lista de pedidos para ese usuario con ese estado.
     */
    List<Pedido> findByUsuarioAndEstado(Usuario usuario, String estado);
}
