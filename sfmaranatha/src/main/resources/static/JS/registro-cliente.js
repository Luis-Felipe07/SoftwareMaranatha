
/*


document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const formRegistro = document.getElementById('formRegistroCliente');
    const mensajeRegistro = document.getElementById('mensajeRegistro');
    const passwordInput = document.getElementById('clave');
    const confirmPasswordInput = document.getElementById('confirmarClave');
    const strengthIndicator = document.getElementById('passwordStrength');
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    // Configuración para la comunicación con el backend
    const API_URL = '/api/clientes'; 
    
    // Función para mostrar/ocultar contraseña
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // Validación de fortaleza de contraseña
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        let strength = 0;
        let message = '';
        
        if (password.length >= 8) strength += 1;
        if (password.match(/[A-Z]/)) strength += 1;
        if (password.match(/[0-9]/)) strength += 1;
        if (password.match(/[^A-Za-z0-9]/)) strength += 1;
        
        switch(strength) {
            case 0:
                message = '<span class="text-danger">Muy débil</span>';
                break;
            case 1:
                message = '<span class="text-danger">Débil</span>';
                break;
            case 2:
                message = '<span class="text-warning">Media</span>';
                break;
            case 3:
                message = '<span class="text-success">Fuerte</span>';
                break;
            case 4:
                message = '<span class="text-success">Muy fuerte</span>';
                break;
        }
        
        strengthIndicator.innerHTML = message;
    });
    
    // Validación del formulario completo
    function validarFormulario() {
        const nombre = document.getElementById('nombre').value.trim();
        const apellido = document.getElementById('apellido').value.trim();
        const tipoDocumento = document.getElementById('tipoDocumento').value;
        const numeroDocumento = document.getElementById('numeroDocumento').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const direccion = document.getElementById('direccion').value.trim();
        const clave = passwordInput.value;
        const confirmarClave = confirmPasswordInput.value;
        const aceptarTerminos = document.getElementById('aceptarTerminos').checked;
        
        // Validar campos obligatorios
        if (!nombre || !apellido || !tipoDocumento || !numeroDocumento || !email || !telefono || !clave || !confirmarClave) {
            mostrarMensaje('Por favor complete todos los campos obligatorios.', 'danger');
            return false;
        }
        
        // Validar formato de correo electrónico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            mostrarMensaje('Por favor ingrese un correo electrónico válido.', 'danger');
            return false;
        }
        
        // Validar número de teléfono (solo números)
        const telefonoRegex = /^\d{7,15}$/;
        if (!telefonoRegex.test(telefono)) {
            mostrarMensaje('El número de teléfono debe contener entre 7 y 15 dígitos.', 'danger');
            return false;
        }
        
        // Validar que las contraseñas coincidan
        if (clave !== confirmarClave) {
            mostrarMensaje('Las contraseñas no coinciden.', 'danger');
            return false;
        }
        
        // Validar fortaleza de contraseña
        if (clave.length < 8) {
            mostrarMensaje('La contraseña debe tener al menos 8 caracteres.', 'danger');
            return false;
        }
        
        // Validar aceptación de términos y condiciones
        if (!aceptarTerminos) {
            mostrarMensaje('Debe aceptar los términos y condiciones para continuar.', 'danger');
            return false;
        }
        
        return true;
    }
    
    // Función para mostrar mensajes
    function mostrarMensaje(mensaje, tipo) {
        mensajeRegistro.innerHTML = `<div class="alert alert-${tipo}">${mensaje}</div>`;
        
        // Hacer scroll hasta el mensaje
        mensajeRegistro.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Limpiar el mensaje después de 5 segundos si es de éxito
        if (tipo === 'success') {
            setTimeout(() => {
                mensajeRegistro.innerHTML = '';
            }, 5000);
        }
    }
    
    // Manejar el envío del formulario
    formRegistro.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (validarFormulario()) {
            // Preparar los datos para enviar al backend
            const clienteData = {
                nombre: document.getElementById('nombre').value.trim(),
                apellido: document.getElementById('apellido').value.trim(),
                tipoDocumento: document.getElementById('tipoDocumento').value,
                numeroDocumento: document.getElementById('numeroDocumento').value.trim(),
                email: document.getElementById('email').value.trim(),
                telefono: document.getElementById('telefono').value.trim(),
                direccion: document.getElementById('direccion').value.trim(),
                clave: document.getElementById('clave').value,
                confirmarClave: document.getElementById('confirmarClave').value,
            };
            
            // Enviar datos al backend usando fetch API
            registrarCliente(clienteData);
        }
    });
    
    // Función para enviar datos al backend
    function registrarCliente(clienteData) {
        // Mostrar indicador de carga
        mostrarMensaje('Procesando registro...', 'info');
        
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                
            },
            body: JSON.stringify(clienteData)
        })
        .then(response => {
            if (!response.ok) {
                // Si el servidor responde con un error, convertir la respuesta a JSON para ver el mensaje
                return response.json().then(errData => {
                    throw new Error(errData.message || 'Error en el servidor');
                });
            }
            return response.json();
        })
        .then(data => {
            // Registro exitoso
            mostrarMensaje('¡Registro exitoso! Redirigiendo...', 'success');
            
            // Limpiar el formulario
            formRegistro.reset();
            
            // Redireccionar al usuario después de un breve delay 
            setTimeout(() => {
                window.location.href = '/login.html'; 
            }, 2000);
        })
        .catch(error => {
            // Manejar errores
            mostrarMensaje(`Error: ${error.message}`, 'danger');
            console.error('Error:', error);
        });
    }
    
    // Validaciones en tiempo real 
    
    // Validar coincidencia de contraseñas en tiempo real
    confirmPasswordInput.addEventListener('input', function() {
        if (this.value && passwordInput.value !== this.value) {
            this.classList.add('is-invalid');
            if (!document.getElementById('passwordMatchError')) {
                const errorDiv = document.createElement('div');
                errorDiv.id = 'passwordMatchError';
                errorDiv.className = 'invalid-feedback';
                errorDiv.textContent = 'Las contraseñas no coinciden';
                this.parentNode.appendChild(errorDiv);
            }
        } else {
            this.classList.remove('is-invalid');
            const errorDiv = document.getElementById('passwordMatchError');
            if (errorDiv) errorDiv.remove();
        }
    });
    
    // Validar formato de email en tiempo real
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('blur', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value && !emailRegex.test(this.value)) {
            this.classList.add('is-invalid');
            if (!document.getElementById('emailError')) {
                const errorDiv = document.createElement('div');
                errorDiv.id = 'emailError';
                errorDiv.className = 'invalid-feedback';
                errorDiv.textContent = 'Formato de email inválido';
                this.parentNode.appendChild(errorDiv);
            }
        } else {
            this.classList.remove('is-invalid');
            const errorDiv = document.getElementById('emailError');
            if (errorDiv) errorDiv.remove();
        }
    });
    
    // Evitar caracteres no numéricos en el teléfono
    const telefonoInput = document.getElementById('telefono');
    telefonoInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    // Evitar caracteres no numéricos en el documento (ACTUALIZADO)
    const documentoInput = document.getElementById('numeroDocumento');
    documentoInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
}); */