package com.maranatha.sfmaranatha.Repository;

import com.maranatha.sfmaranatha.Model.Pedido;
import com.maranatha.sfmaranatha.Model.Usuario; 
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List; 


public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    /**
     *  busco todos los pedidos cuyo campo 'estado' coincide con el parámetro que me dan.
     * @param estado  
     * @return 
     */
    List<Pedido> findByEstado(String estado);



    /**
     *busco todos los pedidos que pertenecen a un usuario específico.
     * @param usuario 
     * @return 
     */
    List<Pedido> findByUsuario(Usuario usuario);

    /**
     *  busco todos los pedidos que pertenecen a un usuario específico Y que además
     * tienen un estado particular.
     * @param usuario 
     * @param estado 
     * @return 
     */
    List<Pedido> findByUsuarioAndEstado(Usuario usuario, String estado);
}
