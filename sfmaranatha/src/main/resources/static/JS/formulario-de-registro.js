document.addEventListener('DOMContentLoaded', () => {
    const formularioRegistro = document.getElementById('formularioRegistroAdmin');
    const mensajeRegistroDiv = document.getElementById('mensajeRegistroAdmin');
    const contraseñaInput = document.getElementById('contraseña');
    const confirmarContraseñaInput = document.getElementById('confirmarContraseña');
    const nombreInput = document.getElementById('nombre');
    const apellidoInput = document.getElementById('apellido');
    const numDocInput = document.getElementById('numeroDocumento');
    const telInput = document.getElementById('telefono');
    const selectTipoUsuario = document.getElementById('tipoUsuarioSelect');

    // Validar coincidencia y longitud de contraseñas
    function validarCoincidenciaContraseñas() {
        const pass1 = contraseñaInput.value;
        const pass2 = confirmarContraseñaInput.value;
        let valido = true;

        if (pass1 && pass1.length < 8) {
            valido = false;
            contraseñaInput.classList.add('is-invalid');
            contraseñaInput.classList.remove('is-valid');
        } else if (pass1.length >= 8) {
            contraseñaInput.classList.remove('is-invalid');
            contraseñaInput.classList.add('is-valid');
        }

        if (pass2) {
            if (pass1 !== pass2 || pass1.length < 8) {
                valido = false;
                confirmarContraseñaInput.classList.add('is-invalid');
                confirmarContraseñaInput.classList.remove('is-valid');
                const feedback = confirmarContraseñaInput.closest('.form-floating')
                    .querySelector('.invalid-feedback');
                if (feedback) {
                    feedback.textContent = pass1.length < 8
                        ? 'La contraseña debe tener al menos 8 caracteres.'
                        : 'Las contraseñas no coinciden.';
                }
            } else {
                confirmarContraseñaInput.classList.remove('is-invalid');
                confirmarContraseñaInput.classList.add('is-valid');
            }
        }

        return valido;
    }

    confirmarContraseñaInput?.addEventListener('blur', validarCoincidenciaContraseñas);
    contraseñaInput?.addEventListener('blur', validarCoincidenciaContraseñas);

    // Validar nombre/apellido
    function validarTexto(inputElement) {
        if (!inputElement) return;
        inputElement.addEventListener('input', () => {
            const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/;
            const esValido = regex.test(inputElement.value);
            inputElement.classList.toggle('is-invalid', !esValido && inputElement.value);
            inputElement.classList.toggle('is-valid', esValido && inputElement.value);
            const feedback = inputElement.closest('.form-floating')
                .querySelector('.invalid-feedback');
            if (feedback) {
                feedback.textContent = !esValido && inputElement.value
                    ? 'Solo se permiten letras y espacios.'
                    : `Ingrese un ${inputElement.id === 'nombre' ? 'nombre' : 'apellido'} válido.`;
            }
        });
        inputElement.addEventListener('blur', () => {
            const val = inputElement.value.trim();
            if (val) {
                inputElement.value = val
                    .split(/\s+/)
                    .map(p => p[0].toUpperCase() + p.slice(1).toLowerCase())
                    .join(' ');
                inputElement.dispatchEvent(new Event('input'));
            }
        });
    }
    validarTexto(nombreInput);
    validarTexto(apellidoInput);

    // Documento y teléfono
    numDocInput?.addEventListener('input', () => {
        const esValido = /^[0-9]*$/.test(numDocInput.value);
        numDocInput.classList.toggle('is-invalid', !esValido && numDocInput.value);
        numDocInput.classList.toggle('is-valid', esValido && numDocInput.value);
    });
    telInput?.addEventListener('input', () => {
        const soloNums = telInput.value.replace(/[^0-9]/g, '');
        telInput.value = soloNums;
        const esValido = soloNums.length >= 7 && soloNums.length <= 15;
        telInput.classList.toggle('is-invalid', !esValido && soloNums);
        telInput.classList.toggle('is-valid', esValido);
    });

    formularioRegistro?.addEventListener('submit', function(evento) {
        evento.preventDefault();
        evento.stopPropagation();
        mensajeRegistroDiv.innerHTML = '';

        const contrasenasValidas = validarCoincidenciaContraseñas();
        formularioRegistro.classList.add('was-validated');

        if (formularioRegistro.checkValidity() && contrasenasValidas) {
            const usuario = {
                nombre:          nombreInput.value.trim(),
                apellido:        apellidoInput.value.trim(),
                tipoDocumento:   document.getElementById('tipoDocumento').value,
                numeroDocumento: numDocInput.value.trim(),
                correo:          document.getElementById('correo').value.trim().toLowerCase(),
                telefono:        telInput?.value.trim() || '',
                direccion:       document.getElementById('direccion')?.value.trim() || '',
                contrasena:      contraseñaInput.value,
                tipoUsuario:     selectTipoUsuario.value  // ADMIN o ENCARGADO
            };

            const boton = formularioRegistro.querySelector('button[type="submit"]');
            const htmlOrig = boton.innerHTML;
            boton.disabled = true;
            boton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Registrando...';

            fetch('/api/usuarios/registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuario)
            })
            .then(async resp => {
                const data = await resp.json();
                if (!resp.ok) throw new Error(data.mensaje || `Error ${resp.status}`);
                return data;
            })
            .then(data => {
                mostrarMensaje(data.mensaje || '¡Registro exitoso!', 'success');
                formularioRegistro.reset();
                formularioRegistro.classList.remove('was-validated');
                formularioRegistro.querySelectorAll('.form-control, .form-select')
                    .forEach(el => el.classList.remove('is-valid','is-invalid'));

                // **Redirijo siempre al login**
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1500);
            })
            .catch(err => {
                console.error('Error en registro:', err);
                mostrarMensaje(`Error al registrar: ${err.message}`, 'danger');
                boton.disabled = false;
                boton.innerHTML = htmlOrig;
            });

        } else {
            mostrarMensaje('Por favor, corrija los campos marcados en rojo.', 'warning');
            formularioRegistro.querySelector(':invalid')?.focus();
        }
    });

    function mostrarMensaje(mensaje, tipo) {
        if (!mensajeRegistroDiv) return;
        const tipoBS = (tipo === 'error' ? 'danger' : tipo);
        mensajeRegistroDiv.innerHTML = `
            <div class="alert alert-${tipoBS} alert-dismissible fade show mt-3" role="alert">
                ${mensaje}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>`;
    }
});
