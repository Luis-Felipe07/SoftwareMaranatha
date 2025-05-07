/**
 * Archivo JavaScript para el formulario de registro de clientes
 * del Restaurante Maranatha
 */

document.addEventListener('DOMContentLoaded', function() {
    const formRegistro = document.getElementById('formRegistroCliente');
    const inputClave = document.getElementById('clave');
    const inputConfirmarClave = document.getElementById('confirmarClave');
    const passwordStrength = document.getElementById('passwordStrength');
    const mensajeRegistro = document.getElementById('mensajeRegistro');
    
    // Ahora apunta al endpoint de usuarios
    const URL_API = '/api/usuarios/registrar';
    
    function evaluarFortalezaContrasena(password) {
        let score = 0;
        if (!password) return score;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;
        return Math.min(score, 4);
    }
    
    function actualizarIndicadorFortaleza() {
        const strength = evaluarFortalezaContrasena(inputClave.value);
        passwordStrength.className = 'password-strength';
        switch (strength) {
            case 0: passwordStrength.textContent = 'Muy débil'; passwordStrength.classList.add('very-weak'); break;
            case 1: passwordStrength.textContent = 'Débil';      passwordStrength.classList.add('weak');      break;
            case 2: passwordStrength.textContent = 'Media';      passwordStrength.classList.add('medium');    break;
            case 3: passwordStrength.textContent = 'Fuerte';     passwordStrength.classList.add('strong');    break;
            case 4: passwordStrength.textContent = 'Muy fuerte';passwordStrength.classList.add('very-strong');break;
        }
    }
    
    function mostrarMensaje(mensaje, tipo) {
        mensajeRegistro.textContent = mensaje;
        mensajeRegistro.className = 'alert-container mt-3 alert-' + tipo;
        mensajeRegistro.style.display = 'block';
        mensajeRegistro.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (tipo === 'success') {
            setTimeout(() => mensajeRegistro.style.display = 'none', 5000);
        }
    }
    
    function validarFormulario() {
        const nombre  = document.getElementById('nombre').value.trim();
        const apellido= document.getElementById('apellido').value.trim();
        const tipoDoc = document.getElementById('tipoDocumento').value;
        const numDoc  = document.getElementById('numeroDocumento').value.trim();
        const email   = document.getElementById('email').value.trim();
        const tel     = document.getElementById('telefono').value.trim();
        const pass    = inputClave.value;
        const pass2   = inputConfirmarClave.value;
        const terminos= document.getElementById('aceptarTerminos').checked;
        
        if (!nombre||!apellido||!tipoDoc||!numDoc||!email||!tel||!pass) {
            mostrarMensaje('Complete todos los campos obligatorios.', 'danger');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            mostrarMensaje('Correo inválido.', 'danger');
            return false;
        }
        if (!/^\d{7,15}$/.test(tel)) {
            mostrarMensaje('Teléfono inválido.', 'danger');
            return false;
        }
        if (evaluarFortalezaContrasena(pass) < 3) {
            mostrarMensaje('Contraseña demasiado débil.', 'danger');
            return false;
        }
        if (pass !== pass2) {
            mostrarMensaje('Las contraseñas no coinciden.', 'danger');
            return false;
        }
        if (!terminos) {
            mostrarMensaje('Debe aceptar términos y condiciones.', 'danger');
            return false;
        }
        return true;
    }
    
    async function enviarDatosRegistro(datosCliente) {
        try {
            const btn = document.querySelector('.btn-register');
            const origText = btn.innerHTML;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Procesando...';
            btn.disabled = true;
            
            const resp = await fetch(URL_API, {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(datosCliente)
            });
            
            btn.innerHTML = origText;
            btn.disabled = false;
            
            if (resp.ok) {
                mostrarMensaje('¡Registro exitoso! Redirigiendo al login...', 'success');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            } else {
                const error = await resp.json();
                mostrarMensaje(error.mensaje || 'Error en registro.', 'danger');
            }
        } catch (err) {
            console.error('Error al enviar datos:', err);
            mostrarMensaje('Error de conexión, inténtalo más tarde.', 'danger');
        }
    }
    
    if (formRegistro) {
        formRegistro.addEventListener('submit', async e => {
            e.preventDefault();
            if (!validarFormulario()) return;
            
            const datosCliente = {
                nombre:        document.getElementById('nombre').value.trim(),
                apellido:      document.getElementById('apellido').value.trim(),
                tipoDocumento: document.getElementById('tipoDocumento').value,
                numeroDocumento: document.getElementById('numeroDocumento').value.trim(),
                correo:        document.getElementById('email').value.trim(),
                telefono:      document.getElementById('telefono').value.trim(),
                direccion:     document.getElementById('direccion').value.trim(),
                contrasena:    inputClave.value,
                tipoUsuario:   'CLIENTE'  // fuerza rol cliente
            };
            
            await enviarDatosRegistro(datosCliente);
        });
        
        inputClave.addEventListener('input', actualizarIndicadorFortaleza);
        inputConfirmarClave.addEventListener('input', actualizarIndicadorFortaleza);
    }
    
    // Toggle password (si tienes íconos)
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.target);
            input.type = input.type === 'password' ? 'text' : 'password';
            btn.querySelector('i').classList.toggle('fa-eye');
            btn.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });
});
