document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('login-formulario');
    const inputContraseña = document.getElementById('contraseña');
    const inputCorreo = document.getElementById('email');
    const mostrarContraseña = document.getElementById('mostrar-contraseña');
    const mensajeLogin = document.getElementById('login-mensaje');
    const recordarCheckbox = document.getElementById('recordar');
    const botonGoogle = document.getElementById('google-login-btn');

    // Mostrar/Ocultar Contraseña
    mostrarContraseña.addEventListener('click', () => {
        if (inputContraseña.type === 'password') {
            inputContraseña.type = 'text';
            mostrarContraseña.classList.remove('fa-eye');
            mostrarContraseña.classList.add('fa-eye-slash');
        } else {
            inputContraseña.type = 'password';
            mostrarContraseña.classList.remove('fa-eye-slash');
            mostrarContraseña.classList.add('fa-eye');
        }
    });

    // Cargar datos si se marcó "Recordar" antes
    window.addEventListener('load', () => {
        const recordadoCorreo = localStorage.getItem('correoRecordado');
        const recordadoContraseña = localStorage.getItem('contraseñaRecordada');
        if (recordadoCorreo && recordadoContraseña) {
            inputCorreo.value = recordadoCorreo;
            inputContraseña.value = recordadoContraseña;
            recordarCheckbox.checked = true;
        }
    });

    // Manejo de Envío del Formulario
    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        
        // Ocultar mensajes previos
        mensajeLogin.textContent = '';
        mensajeLogin.style.display = 'none'; 

        // Simulación de carga
        const botonAcceder = document.querySelector('.boton-acceder');
        const textoBoton = botonAcceder?.querySelector('span');
        const indicadorCarga = document.querySelector('.cargando');

        // Validar campos vacíos en el frontend
        if (!inputCorreo.value.trim()) {
            mostrarError('Por favor, ingresa tu correo');
            return;
        }
        if (!inputContraseña.value.trim()) {
            mostrarError('Por favor, ingresa tu contraseña');
            return;
        }

        try {
            // Animación de carga
            if (textoBoton) textoBoton.style.display = 'none';
            if (indicadorCarga) indicadorCarga.style.display = 'block';

            // Petición al backend para validar
            const credenciales = {
                correo: inputCorreo.value,
                contrasena: inputContraseña.value
            };

            const respuesta = await fetch('/api/usuarios/validar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credenciales)
            });

            const data = await respuesta.json();

            if (!respuesta.ok || !data.valido) {
                // Si "valido" = false, muestro el mensaje que devuelva el servidor
                mostrarError(data.mensaje || 'Error al validar credenciales');
            } else {
                // Si "valido" = true, el servidor debe mandar "rol"
                if (recordarCheckbox.checked) {
                    // Guardar en localStorage
                    localStorage.setItem('correoRecordado', inputCorreo.value);
                    localStorage.setItem('contraseñaRecordada', inputContraseña.value);
                } else {
                    // Limpiar localStorage
                    localStorage.removeItem('correoRecordado');
                    localStorage.removeItem('contraseñaRecordada');
                }

                // Redirigir según el rol
                if (data.rol === 'ENCARGADO') {
                    window.location.href = '/Gestion-de-reservas.html';
                } else if (data.rol === 'ADMIN') {
                    window.location.href = '/pantalla-admin.html';
                } else {
                    
                    mostrarError('Rol no reconocido');
                }
            }

        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error de conexión con el servidor');
        } finally {
            if (textoBoton) textoBoton.style.display = 'block';
            if (indicadorCarga) indicadorCarga.style.display = 'none';
        }
    });

    function mostrarError(mensaje) {
        mensajeLogin.textContent = mensaje;
        mensajeLogin.classList.add('alert', 'alert-danger');
        mensajeLogin.style.display = 'block'; 
    }

    // Botón "Iniciar sesión con Google"
    if (botonGoogle) {
        botonGoogle.addEventListener('click', () => {
           
            alert('Función de inicio de sesión con Google en desarrollo');
        });
    }
});