document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('login-formulario');
    const inputContraseña = document.getElementById('contraseña');
    const inputCorreo = document.getElementById('email');
    const togglePass = document.getElementById('mostrar-contraseña');
    const mensajeLogin = document.getElementById('login-mensaje');
    const recordarCheckbox = document.getElementById('recordar');
    const botonGoogle = document.getElementById('google-login-btn');

    // Mostrar/Ocultar Contraseña
    togglePass.addEventListener('click', () => {
        const tipo = inputContraseña.type === 'password' ? 'text' : 'password';
        inputContraseña.type = tipo;
        togglePass.classList.toggle('fa-eye');
        togglePass.classList.toggle('fa-eye-slash');
    });

    // Cargar datos si se marcó "Recordar"
    window.addEventListener('load', () => {
        const c = localStorage.getItem('correoRecordado');
        const p = localStorage.getItem('contraseñaRecordada');
        if (c && p) {
            inputCorreo.value = c;
            inputContraseña.value = p;
            recordarCheckbox.checked = true;
        }
    });

    formulario.addEventListener('submit', async evento => {
        evento.preventDefault();
        mensajeLogin.textContent = '';
        mensajeLogin.style.display = 'none';

        // Validaciones básicas
        if (!inputCorreo.value.trim()) {
            mostrarError('Por favor, ingresa tu correo');
            return;
        }
        if (!inputContraseña.value.trim()) {
            mostrarError('Por favor, ingresa tu contraseña');
            return;
        }

        // Animación de carga
        const botonAcceder = formulario.querySelector('button[type="submit"]');
        const textoBoton = botonAcceder.textContent;
        botonAcceder.disabled = true;
        botonAcceder.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Accediendo...';

        try {
            const credenciales = {
                correo: inputCorreo.value.trim(),
                contrasena: inputContraseña.value
            };

            const respuesta = await fetch('/api/usuarios/validar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credenciales)
            });

            const data = await respuesta.json();

            if (!respuesta.ok || data.valido === false) {
                mostrarError(data.mensaje || 'Credenciales incorrectas');
                return;
            }

            // Guardar/limpiar "Recordar"
            if (recordarCheckbox.checked) {
                localStorage.setItem('correoRecordado', inputCorreo.value.trim());
                localStorage.setItem('contraseñaRecordada', inputContraseña.value);
            } else {
                localStorage.removeItem('correoRecordado');
                localStorage.removeItem('contraseñaRecordada');
            }

            // Redirigir según rol
            switch (data.rol) {
                case 'ADMIN':
                    window.location.href = '/pantalla-admin.html';
                    break;
                case 'ENCARGADO':
                    window.location.href = '/Gestion-de-reservas.html';
                    break;
                case 'CLIENTE':
                    window.location.href = '/dashboard-cliente.html';
                    break;
                default:
                    mostrarError('Rol no reconocido');
            }

        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error de conexión con el servidor');
        } finally {
            botonAcceder.disabled = false;
            botonAcceder.innerHTML = textoBoton;
        }
    });

    function mostrarError(mensaje) {
        mensajeLogin.textContent = mensaje;
        mensajeLogin.className = 'alert alert-danger mt-3';
        mensajeLogin.style.display = 'block';
        mensajeLogin.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Inicio sesión con Google (placeholder)
    botonGoogle?.addEventListener('click', () => {
        alert('Inicio de sesión con Google en desarrollo');
    });
});
