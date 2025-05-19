
document.addEventListener('DOMContentLoaded', () => {
    
    const formulario = document.getElementById('login-formulario'); 
    const inputContraseña = document.getElementById('contraseña'); 
    const inputCorreo = document.getElementById('email'); 
    const togglePass = document.getElementById('mostrar-contraseña'); 
    const mensajeLogin = document.getElementById('login-mensaje'); 
    const recordarCheckbox = document.getElementById('recordar'); 
    const botonGoogle = document.getElementById('google-login-btn'); 

    
    if (togglePass) {
        togglePass.addEventListener('click', () => {
            const tipo = inputContraseña.type === 'password' ? 'text' : 'password';
            inputContraseña.type = tipo;
            togglePass.classList.toggle('fa-eye'); 
            togglePass.classList.toggle('fa-eye-slash');
        });
    }

    
    window.addEventListener('load', () => {
        const c = localStorage.getItem('correoRecordado'); 
        const p = localStorage.getItem('contraseñaRecordada'); 
        if (c && p) {
            inputCorreo.value = c;
            inputContraseña.value = p;
            recordarCheckbox.checked = true;
        }
    });

   
    if (formulario) {
        formulario.addEventListener('submit', async evento => {
            evento.preventDefault(); 
            mensajeLogin.textContent = ''; 
            mensajeLogin.style.display = 'none'; 

            
            if (!inputCorreo.value.trim()) {
                mostrarError('Por favor, ingresa tu correo');
                return;
            }
            if (!inputContraseña.value.trim()) {
                mostrarError('Por favor, ingresa tu contraseña');
                return;
            }

            
            const botonAcceder = formulario.querySelector('button[type="submit"]');
            const textoBotonOriginal = botonAcceder.innerHTML; 
            botonAcceder.disabled = true;
            botonAcceder.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Accediendo...';

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
                    botonAcceder.disabled = false; 
                    botonAcceder.innerHTML = textoBotonOriginal; 
                    return;
                }

                
                if (data.nombre) {
                    localStorage.setItem('nombreUsuario', data.nombre);
                }
                if (data.idUsuario) {
                    localStorage.setItem('idUsuario', data.idUsuario.toString());
                }
                if (data.rol) {
                    localStorage.setItem('tipoUsuario', data.rol);
                }
                
                localStorage.setItem('token', 'sesion_activa_maranatha');
                // --- END UPDATED ---

                
                if (recordarCheckbox.checked) {
                    localStorage.setItem('correoRecordado', inputCorreo.value.trim());
                    localStorage.setItem('contraseñaRecordada', inputContraseña.value);
                } else {
                    localStorage.removeItem('correoRecordado');
                    localStorage.removeItem('contraseñaRecordada');
                }

                
                switch (data.rol) {
                    case 'ADMIN':
                        window.location.href = '/pantalla-admin.html';
                        break;
                    case 'ENCARGADO':
                        window.location.href = '/Gestion-de-reservas.html';
                        break;
                    case 'CLIENTE':
                        
                        const params = new URLSearchParams(window.location.search);
                        const redirectUrl = params.get('redirect');
                        if (redirectUrl) {
                            window.location.href = redirectUrl;
                        } else {
                            window.location.href = '/dashboard-cliente.html';
                        }
                        break;
                    default:
                        mostrarError('Rol no reconocido');
                        botonAcceder.disabled = false; 
                        botonAcceder.innerHTML = textoBotonOriginal; 
                }

            } catch (error) {
                console.error('Error en el proceso de login:', error);
                mostrarError('Error de conexión con el servidor. Inténtalo de nuevo más tarde.');
                botonAcceder.disabled = false; 
                botonAcceder.innerHTML = textoBotonOriginal; 
            }
            
        });
    }

    /**
     * 
     * @param {string} 
     */
    function mostrarError(mensaje) {
        if (mensajeLogin) {
            mensajeLogin.textContent = mensaje;
            mensajeLogin.className = 'alert alert-danger mt-3'; 
            mensajeLogin.style.display = 'block';
            
            mensajeLogin.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

   
    if (botonGoogle) {
        botonGoogle.addEventListener('click', () => {
            alert('Inicio de sesión con Google está en desarrollo.');
           
        });
    }
});
