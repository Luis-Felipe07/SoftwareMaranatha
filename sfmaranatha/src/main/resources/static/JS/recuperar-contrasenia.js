

document.addEventListener('DOMContentLoaded', () => {
  const formRecuperar = document.getElementById('formRecuperar');
  const nombreInput = document.getElementById('nombre');
  const nuevoCorreoInput = document.getElementById('nuevoCorreo');
  const nuevaContraseñaInput = document.getElementById('nuevaContraseña');
  const confirmarNuevaContraseñaInput = document.getElementById('confirmarNuevaContraseña');
  const mensajeRecuperar = document.getElementById('mensajeRecuperar');

  const mostrarNuevaContraseñaBtn = document.getElementById('mostrarNuevaContraseña');
  const mostrarConfirmarNuevaContraseñaBtn = document.getElementById('mostrarConfirmarNuevaContraseña');

  // Mostrar/Ocultar nueva contraseña
  mostrarNuevaContraseñaBtn.addEventListener('click', () => {
    const icono = mostrarNuevaContraseñaBtn.querySelector('i');
    if (nuevaContraseñaInput.type === 'password') {
      nuevaContraseñaInput.type = 'text';
      icono.classList.remove('fa-eye');
      icono.classList.add('fa-eye-slash');
    } else {
      nuevaContraseñaInput.type = 'password';
      icono.classList.remove('fa-eye-slash');
      icono.classList.add('fa-eye');
    }
  });

  // Mostrar/Ocultar confirmar nueva contraseña
  mostrarConfirmarNuevaContraseñaBtn.addEventListener('click', () => {
    const icono = mostrarConfirmarNuevaContraseñaBtn.querySelector('i');
    if (confirmarNuevaContraseñaInput.type === 'password') {
      confirmarNuevaContraseñaInput.type = 'text';
      icono.classList.remove('fa-eye');
      icono.classList.add('fa-eye-slash');
    } else {
      confirmarNuevaContraseñaInput.type = 'password';
      icono.classList.remove('fa-eye-slash');
      icono.classList.add('fa-eye');
    }
  });

  // Validar que las contraseñas coincidan
  confirmarNuevaContraseñaInput.addEventListener('input', () => {
    if (confirmarNuevaContraseñaInput.value !== nuevaContraseñaInput.value) {
      confirmarNuevaContraseñaInput.setCustomValidity('Las contraseñas no coinciden.');
    } else {
      confirmarNuevaContraseñaInput.setCustomValidity('');
    }
  });

  // Enviar el formulario
  formRecuperar.addEventListener('submit', async (e) => {
    e.preventDefault();
    limpiarMensaje();

    // Validar si coinciden las contraseñas
    if (nuevaContraseñaInput.value !== confirmarNuevaContraseñaInput.value) {
      mostrarError('Las contraseñas no coinciden.');
      return;
    }

    const payload = {
      nombreCompleto: nombreInput.value.trim(),
      nuevoCorreo: nuevoCorreoInput.value.trim(),
      nuevaContrasena: nuevaContraseñaInput.value.trim()
    };

    try {
      const resp = await fetch('/api/usuarios/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();

      // Supongo que el backend responde con  exito: true/false, mensaje
      if (!data.exito) {
        mostrarError(data.mensaje || 'No se pudo actualizar los datos. Revisa tu nombre completo.');
      } else {
        mostrarExito(data.mensaje || '¡Datos actualizados exitosamente!');
        // Redirigir o limpiar campos
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarError('Error al conectar con el servidor. Intenta de nuevo.');
    }
  });

  function mostrarError(msg) {
    mensajeRecuperar.innerHTML = `<div class="alert alert-danger">${msg}</div>`;
  }
  function mostrarExito(msg) {
    mensajeRecuperar.innerHTML = `<div class="alert alert-success">${msg}</div>`;
  }
  function limpiarMensaje() {
    mensajeRecuperar.innerHTML = '';
  }
});
