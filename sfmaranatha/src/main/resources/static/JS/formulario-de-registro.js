// Mostrar/Ocultar Contraseña
document.getElementById('mostrarContraseña').addEventListener('click', () => {
    const campoContraseña = document.getElementById('contraseña');
    const icono = document.querySelector('#mostrarContraseña i');
    
    if (campoContraseña.type === 'password') {
        campoContraseña.type = 'text';
        icono.classList.remove('fa-eye');
        icono.classList.add('fa-eye-slash');
    } else {
        campoContraseña.type = 'password';
        icono.classList.remove('fa-eye-slash');
        icono.classList.add('fa-eye');
    }
});

// Mostrar/Ocultar Confirmar Contraseña
document.getElementById('mostrarConfirmarContraseña').addEventListener('click', () => {
    const campoConfirmarContraseña = document.getElementById('confirmarContraseña');
    const icono = document.querySelector('#mostrarConfirmarContraseña i');
    
    if (campoConfirmarContraseña.type === 'password') {
        campoConfirmarContraseña.type = 'text';
        icono.classList.remove('fa-eye');
        icono.classList.add('fa-eye-slash');
    } else {
        campoConfirmarContraseña.type = 'password';
        icono.classList.remove('fa-eye-slash');
        icono.classList.add('fa-eye');
    }
});

// Validar que el nombre solo contenga letras y espacios
const campoNombre = document.getElementById('nombre');
campoNombre.addEventListener('input', () => {
    const valor = campoNombre.value;
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    
    if (!regex.test(valor) && valor.length > 0) {
        campoNombre.setCustomValidity('El nombre solo debe contener letras y espacios');
        campoNombre.value = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    } else {
        campoNombre.setCustomValidity('');
    }
});

// Formatear el nombre al perder el foco
campoNombre.addEventListener('blur', () => {
    if (campoNombre.value.trim() !== '') {
        const palabras = campoNombre.value.trim().split(/\s+/);
        const nombreFormateado = palabras.map(palabra => 
            palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase()
        ).join(' ');
        campoNombre.value = nombreFormateado;
    }
});

// Validar Fortaleza de Contraseña
const entradaContraseña = document.getElementById('contraseña');
const barraFortaleza = document.getElementById('barraFortaleza');
const passwordHelp = document.getElementById('passwordHelp');

entradaContraseña.addEventListener('input', () => {
    const valor = entradaContraseña.value;
    
    const tieneMayuscula = /[A-Z]/.test(valor);
    const tieneMinuscula = /[a-z]/.test(valor);
    const tieneNumero = /\d/.test(valor);
    const tieneEspecial = /[@$!%*?&#]/.test(valor);
    const longitudMinima = valor.length >= 8;
    
    const fortaleza = (tieneMayuscula + tieneMinuscula + tieneNumero + tieneEspecial) * (longitudMinima ? 1 : 0.5);
    
    const colores = ['danger', 'warning', 'warning', 'info', 'success'];
    const mensajes = [
        'Contraseña muy débil',
        'Contraseña débil',
        'Contraseña moderada',
        'Contraseña fuerte',
        'Contraseña muy fuerte'
    ];
    
    const indice = Math.min(Math.floor(fortaleza), 4);
    
    barraFortaleza.style.width = `${(fortaleza / 4) * 100}%`;
    barraFortaleza.className = `progress-bar bg-${colores[indice]}`;
    
    if (valor.length > 0) {
        passwordHelp.textContent = mensajes[indice];
        if (!longitudMinima) passwordHelp.textContent += ' - Añade al menos 8 caracteres';
        else if (fortaleza < 4) {
            let requisitos = [];
            if (!tieneMayuscula) requisitos.push('mayúsculas');
            if (!tieneMinuscula) requisitos.push('minúsculas');
            if (!tieneNumero) requisitos.push('números');
            if (!tieneEspecial) requisitos.push('símbolos (@$!%*?&#)');
            if (requisitos.length > 0) {
                passwordHelp.textContent += ' - Añade ' + requisitos.join(', ');
            }
        }
    } else {
        passwordHelp.textContent = 'Usa mayúsculas, números y símbolos para una contraseña segura';
    }
});

// Confirmar Contraseña
const confirmarContraseña = document.getElementById('confirmarContraseña');
confirmarContraseña.addEventListener('input', () => {
    confirmarContraseña.setCustomValidity(
        confirmarContraseña.value !== entradaContraseña.value ? 'Las contraseñas no coinciden.' : ''
    );
});

// Manejo de Envío del Formulario con integración al backend
document.getElementById('formularioRegistro').addEventListener('submit', function(evento) {
    evento.preventDefault(); 
    
    // Recopilar datos del formulario
    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const contrasena = document.getElementById('contraseña').value;
    const rol = document.getElementById('rol').value; 

    // Validar que el formulario sea válido
    if (this.checkValidity()) {
        // Remover alertas previas
        const alertasAnteriores = document.querySelectorAll('.alert');
        alertasAnteriores.forEach(alerta => alerta.remove());
        
        // Crear objeto usuario para enviar al backend
        const usuario = {
            nombreCompleto: nombre,
            correo: correo,
            contrasena: contrasena,
            rol: rol
        };
        
        // Enviar datos al endpoint de registro en el backend
        fetch('/api/usuarios/registrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuario)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            // Mostrar mensaje de éxito
            const mensajeExitoso = document.createElement('div');
            mensajeExitoso.className = 'alert alert-success mt-4 animate__animated animate__fadeIn';
            mensajeExitoso.innerHTML = `
                <i class="fas fa-check-circle mr-2"></i>
                <strong>¡Registro exitoso!</strong><br>
                Bienvenido/a ${nombre}. Tu cuenta ha sido creada con el rol: ${rol}
            `;
            document.getElementById('formularioRegistro').appendChild(mensajeExitoso);
            
            // Deshabilitar el botón para evitar envíos múltiples
            document.querySelector('button[type="submit"]').disabled = true;
            
            // Redirigir al formulario de inicio de sesión después de 3 segundos
            setTimeout(() => {
                window.location.href = '/login.html'; 
            }, 3000);
        })
        .catch(error => {
            console.error('Error:', error);
            const mensajeError = document.createElement('div');
            mensajeError.className = 'alert alert-danger mt-4';
            mensajeError.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i> Ocurrió un error al registrar el usuario. Intenta de nuevo.';
            document.getElementById('formularioRegistro').appendChild(mensajeError);
        });
    } else {
        // Validar campos específicos y mostrar alerta de error
        const camposRequeridos = document.querySelectorAll('[required]');
        let primerCampoInvalido = null;
        
        camposRequeridos.forEach(campo => {
            if (!campo.checkValidity() && !primerCampoInvalido) {
                primerCampoInvalido = campo;
            }
        });
        
        if (primerCampoInvalido) {
            primerCampoInvalido.focus();
        }
        
        const mensajeError = document.createElement('div');
        mensajeError.className = 'alert alert-danger mt-4';
        mensajeError.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i> Por favor, complete todos los campos requeridos correctamente.';
        
        const errorExistente = document.querySelector('.alert-danger');
        if (!errorExistente) {
            document.getElementById('formularioRegistro').appendChild(mensajeError);
            
            setTimeout(() => {
                mensajeError.remove();
            }, 3000);
        }
    }
});
