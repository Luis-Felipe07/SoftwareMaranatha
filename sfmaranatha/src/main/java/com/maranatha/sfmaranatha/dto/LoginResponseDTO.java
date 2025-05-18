package com.maranatha.sfmaranatha.dto;

/**
 * Data Transfer Object for login response.
 * This DTO carries information about the login attempt,
 * including validity, user role, a message, user's name, and user ID.
 */
public class LoginResponseDTO {
    private boolean valido; // Indicates if the login was successful
    private String rol; // The role of the user (e.g., ADMIN, CLIENTE)
    private String mensaje; // A message regarding the login attempt (e.g., success or error message)
    private String nombre; // The first name of the logged-in user
    private Integer idUsuario; // The ID of the logged-in user

    /**
     * Default constructor.
     */
    public LoginResponseDTO() {}

    /**
     * Constructs a new LoginResponseDTO with specified details.
     * @param valido True if the login is valid, false otherwise.
     * @param rol The role of the user.
     * @param mensaje A descriptive message about the login attempt.
     * @param nombre The name of the user.
     * @param idUsuario The ID of the user.
     */
    public LoginResponseDTO(boolean valido, String rol, String mensaje, String nombre, Integer idUsuario) {
        this.valido = valido;
        this.rol    = rol;
        this.mensaje= mensaje;
        this.nombre = nombre;
        this.idUsuario = idUsuario;
    }

    // Getters and Setters

    /**
     * Checks if the login was valid.
     * @return true if valid, false otherwise.
     */
    public boolean isValido() {
        return valido;
    }

    /**
     * Sets the validity of the login.
     * @param valido true if valid, false otherwise.
     */
    public void setValido(boolean valido) {
        this.valido = valido;
    }

    /**
     * Gets the role of the user.
     * @return The user's role.
     */
    public String getRol() {
        return rol;
    }

    /**
     * Sets the role of the user.
     * @param rol The user's role.
     */
    public void setRol(String rol) {
        this.rol = rol;
    }

    /**
     * Gets the login message.
     * @return The login message.
     */
    public String getMensaje() {
        return mensaje;
    }

    /**
     * Sets the login message.
     * @param mensaje The login message.
     */
    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    /**
     * Gets the name of the user.
     * @return The user's name.
     */
    public String getNombre() {
        return nombre;
    }

    /**
     * Sets the name of the user.
     * @param nombre The user's name.
     */
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    /**
     * Gets the ID of the user.
     * @return The user's ID.
     */
    public Integer getIdUsuario() {
        return idUsuario;
    }

    /**
     * Sets the ID of the user.
     * @param idUsuario The user's ID.
     */
    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }
}
