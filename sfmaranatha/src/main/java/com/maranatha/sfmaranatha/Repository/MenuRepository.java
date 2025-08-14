package com.maranatha.sfmaranatha.Repository;

import com.maranatha.sfmaranatha.Model.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Integer> {
    // Métodos básicos heredados de JpaRepository
}