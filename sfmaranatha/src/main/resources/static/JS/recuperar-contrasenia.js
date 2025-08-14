document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM
  const formRecuperar = document.getElementById('formRecuperar');
  const numeroDocumentoInput = document.getElementById('numeroDocumento');
  const nuevoCorreoInput = document.getElementById('nuevoCorreo');
  const nuevaContraseñaInput = document.getElementById('nuevaContraseña');
  const confirmarNuevaContraseñaInput = document.getElementById('confirmarNuevaContraseña');
  const mensajeRecuperar = document.getElementById('mensajeRecuperar');
  const btnRecuperar = document.getElementById('btnRecuperar');
  const btnText = btnRecuperar.querySelector('.btn-text');
  const btnLoading = btnRecuperar.querySelector('.btn-loading');

  // Elementos para mostrar/ocultar contraseñas
  const mostrarNuevaContraseñaBtn = document.getElementById('mostrarNuevaContraseña');
  const mostrarConfirmarNuevaContraseñaBtn = document.getElementById('mostrarConfirmarNuevaContraseña');

  // Elementos para indicadores de fortaleza
  const strengthFill = document.getElementById('strengthFill');
  const strengthText = document.getElementById('strengthText');
  const passwordMatch = document.getElementById('passwordMatch');

  /**
   * Configurar eventos para mostrar/ocultar contraseñas
   */
  function configurarTogglePassword() {
    mostrarNuevaContraseñaBtn?.addEventListener('click', () => {
      togglePasswordVisibility(nuevaContraseñaInput, mostrarNuevaContraseñaBtn);
    });

    mostrarConfirmarNuevaContraseñaBtn?.addEventListener('click', () => {
      togglePasswordVisibility(confirmarNuevaContraseñaInput, mostrarConfirmarNuevaContraseñaBtn);
    });
  }

  /**
   * Alternar visibilidad de contraseña
   */
  function togglePasswordVisibility(input, button) {
    const icon = button.querySelector('i');
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  }

  /**
   * Validar número de documento (solo números)
   */
  function validarNumeroDocumento() {
    numeroDocumentoInput?.addEventListener('input', (e) => {
      // Permitir solo números
      e.target.value = e.target.value.replace(/\D/g, '');
      
      if (e.target.value.length >= 6) {
        e.target.classList.remove('is-invalid');
        e.target.classList.add('is-valid');
      } else {
        e.target.classList.remove('is-valid');
        e.target.classList.add('is-invalid');
      }
    });
  }

  /**
   * Evaluar fortaleza de la contraseña
   */
  function evaluarFortalezaContrasena(password) {
    if (!password) return 0;
    
    let score = 0;
    
    // Criterios de fortaleza
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    return Math.min(score, 4);
  }

  /**
   * Actualizar indicador de fortaleza
   */
  function actualizarIndicadorFortaleza() {
    nuevaContraseñaInput?.addEventListener('input', () => {
      const password = nuevaContraseñaInput.value;
      const strength = evaluarFortalezaContrasena(password);
      
      // Limpiar clases previas
      strengthFill.className = 'strength-fill';
      
      // Aplicar nueva clase según fortaleza
      switch (strength) {
        case 0:
        case 1:
          strengthFill.classList.add('weak');
          strengthText.textContent = 'Contraseña débil';
          strengthText.style.color = '#d62828';
          break;
        case 2:
          strengthFill.classList.add('fair');
          strengthText.textContent = 'Contraseña regular';
          strengthText.style.color = '#f9a825';
          break;
        case 3:
          strengthFill.classList.add('good');
          strengthText.textContent = 'Contraseña buena';
          strengthText.style.color = '#17a2b8';
          break;
        case 4:
          strengthFill.classList.add('strong');
          strengthText.textContent = 'Contraseña fuerte';
          strengthText.style.color = '#28a745';
          break;
      }

      // Validación visual del input
      if (password.length >= 8 && strength >= 2) {
        nuevaContraseñaInput.classList.remove('is-invalid');
        nuevaContraseñaInput.classList.add('is-valid');
      } else if (password.length > 0) {
        nuevaContraseñaInput.classList.remove('is-valid');
        nuevaContraseñaInput.classList.add('is-invalid');
      } else {
        nuevaContraseñaInput.classList.remove('is-valid', 'is-invalid');
      }
    });
  }

  /**
   * Validar coincidencia de contraseñas
   */
  function validarCoincidenciaContrasenas() {
    const validar = () => {
      const password1 = nuevaContraseñaInput.value;
      const password2 = confirmarNuevaContraseñaInput.value;
      
      if (password2.length === 0) {
        passwordMatch.textContent = '';
        passwordMatch.className = 'password-match';
        confirmarNuevaContraseñaInput.classList.remove('is-valid', 'is-invalid');
      } else if (password1 === password2) {
        passwordMatch.textContent = '✓ Las contraseñas coinciden';
        passwordMatch.className = 'password-match match';
        confirmarNuevaContraseñaInput.classList.remove('is-invalid');
        confirmarNuevaContraseñaInput.classList.add('is-valid');
      } else {
        passwordMatch.textContent = '✗ Las contraseñas no coinciden';
        passwordMatch.className = 'password-match no-match';
        confirmarNuevaContraseñaInput.classList.remove('is-valid');
        confirmarNuevaContraseñaInput.classList.add('is-invalid');
      }
    };

    nuevaContraseñaInput?.addEventListener('input', validar);
    confirmarNuevaContraseñaInput?.addEventListener('input', validar);
  }

  /**
   * Validar correo electrónico
   */
  function validarCorreo() {
    nuevoCorreoInput?.addEventListener('input', (e) => {
      const email = e.target.value;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (email.length === 0) {
        e.target.classList.remove('is-valid', 'is-invalid');
      } else if (emailRegex.test(email)) {
        e.target.classList.remove('is-invalid');
        e.target.classList.add('is-valid');
      } else {
        e.target.classList.remove('is-valid');
        e.target.classList.add('is-invalid');
      }
    });
  }

  /**
   * Mostrar mensaje de respuesta
   */
  function mostrarMensaje(mensaje, tipo) {
    if (!mensajeRecuperar) return;
    
    const tipoBootstrap = tipo === 'error' ? 'danger' : tipo;
    mensajeRecuperar.innerHTML = `
      <div class="alert alert-${tipoBootstrap} alert-dismissible fade show" role="alert">
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' || tipo === 'danger' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${mensaje}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    `;

    // Auto-cerrar mensajes de éxito después de 5 segundos
    if (tipo === 'success') {
      setTimeout(() => {
        const alert = mensajeRecuperar.querySelector('.alert');
        if (alert) {
          alert.classList.remove('show');
          setTimeout(() => alert.remove(), 150);
        }
      }, 5000);
    }
  }

  /**
   * Limpiar mensajes existentes
   */
  function limpiarMensajes() {
    if (mensajeRecuperar) {
      mensajeRecuperar.innerHTML = '';
    }
  }

  /**
   * Validar formulario completo
   */
  function validarFormulario() {
    const numeroDocumento = numeroDocumentoInput.value.trim();
    const nuevoCorreo = nuevoCorreoInput.value.trim();
    const nuevaContrasena = nuevaContraseñaInput.value;
    const confirmarContrasena = confirmarNuevaContraseñaInput.value;

    // Validaciones
    if (!numeroDocumento || numeroDocumento.length < 6) {
      mostrarMensaje('El número de documento debe tener al menos 6 dígitos.', 'danger');
      numeroDocumentoInput.focus();
      return false;
    }

    if (!/^\d+$/.test(numeroDocumento)) {
      mostrarMensaje('El número de documento solo debe contener números.', 'danger');
      numeroDocumentoInput.focus();
      return false;
    }

    if (!nuevoCorreo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoCorreo)) {
      mostrarMensaje('Por favor ingrese un correo electrónico válido.', 'danger');
      nuevoCorreoInput.focus();
      return false;
    }

    if (!nuevaContrasena || nuevaContrasena.length < 8) {
      mostrarMensaje('La contraseña debe tener al menos 8 caracteres.', 'danger');
      nuevaContraseñaInput.focus();
      return false;
    }

    if (evaluarFortalezaContrasena(nuevaContrasena) < 2) {
      mostrarMensaje('La contraseña es demasiado débil. Incluya mayúsculas, minúsculas y números.', 'danger');
      nuevaContraseñaInput.focus();
      return false;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      mostrarMensaje('Las contraseñas no coinciden.', 'danger');
      confirmarNuevaContraseñaInput.focus();
      return false;
    }

    return true;
  }

  /**
   * Enviar solicitud de recuperación al backend
   */
  async function enviarSolicitudRecuperacion(datosRecuperacion) {
    try {
      const response = await fetch('/api/usuarios/recuperar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosRecuperacion)
      });

      const data = await response.json();

      if (response.ok && data.exito) {
        mostrarMensaje(
          '¡Contraseña actualizada exitosamente! Serás redirigido al login en unos segundos...', 
          'success'
        );
        
        // Limpiar formulario
        formRecuperar.reset();
        
        // Limpiar clases de validación
        document.querySelectorAll('.form-control').forEach(input => {
          input.classList.remove('is-valid', 'is-invalid');
        });
        
        // Limpiar indicadores
        passwordMatch.textContent = '';
        strengthText.textContent = 'Fortaleza de la contraseña';
        strengthFill.className = 'strength-fill';
        
        // Redirigir después de 3 segundos
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 3000);
        
      } else {
        mostrarMensaje(
          data.mensaje || 'No se pudo actualizar la contraseña. Verifique que el número de documento sea correcto.',
          'danger'
        );
      }
    } catch (error) {
      console.error('Error en solicitud de recuperación:', error);
      mostrarMensaje(
        'Error de conexión con el servidor. Por favor, intente nuevamente.',
        'danger'
      );
    }
  }

  /**
   * Manejar envío del formulario
   */
  function manejarEnvioFormulario() {
    formRecuperar?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      limpiarMensajes();

      // Validar formulario
      if (!validarFormulario()) {
        return;
      }

      // Mostrar estado de carga
      btnRecuperar.disabled = true;
      btnText.classList.add('d-none');
      btnLoading.classList.remove('d-none');

      try {
        const datosRecuperacion = {
          numeroDocumento: numeroDocumentoInput.value.trim(),
          nuevoCorreo: nuevoCorreoInput.value.trim().toLowerCase(),
          nuevaContrasena: nuevaContraseñaInput.value
        };

        await enviarSolicitudRecuperacion(datosRecuperacion);

      } catch (error) {
        console.error('Error procesando formulario:', error);
        mostrarMensaje('Error inesperado. Por favor, intente nuevamente.', 'danger');
      } finally {
        // Restaurar estado del botón
        btnRecuperar.disabled = false;
        btnText.classList.remove('d-none');
        btnLoading.classList.add('d-none');
      }
    });
  }

  /**
   * Configurar eventos de teclado para mejorar UX
   */
  function configurarEventosTeclado() {
    // Enter en campos de texto para pasar al siguiente
    numeroDocumentoInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        nuevoCorreoInput.focus();
      }
    });

    nuevoCorreoInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        nuevaContraseñaInput.focus();
      }
    });

    nuevaContraseñaInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        confirmarNuevaContraseñaInput.focus();
      }
    });

    confirmarNuevaContraseñaInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        formRecuperar.dispatchEvent(new Event('submit'));
      }
    });
  }

  /**
   * Inicializar todas las funcionalidades
   */
  function inicializar() {
    configurarTogglePassword();
    validarNumeroDocumento();
    actualizarIndicadorFortaleza();
    validarCoincidenciaContrasenas();
    validarCorreo();
    manejarEnvioFormulario();
    configurarEventosTeclado();

    // Focus inicial en el primer campo
    if (numeroDocumentoInput) {
      numeroDocumentoInput.focus();
    }

    // Añadir animación de entrada
    document.body.classList.add('loaded');
  }

  // Inicializar cuando el DOM esté listo
  inicializar();
});