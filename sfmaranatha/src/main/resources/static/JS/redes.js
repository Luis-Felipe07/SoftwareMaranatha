// Variables globales
let calificacionesPorCategoria = {
    comida: 0,
    servicio: 0,
    limpieza: 0,
    precio: 0,
    ambiente: 0
};

let calificacionesEdicion = {
    'comida-edit': 0,
    'servicio-edit': 0,
    'limpieza-edit': 0,
    'precio-edit': 0,
    'ambiente-edit': 0
};

let paginaComentarios = 1;
const comentariosPorPagina = 5;
let usuarioActual = null;
let pedidosCalificables = [];

document.addEventListener("DOMContentLoaded", () => {
    // Verificar autenticación del usuario
    verificarAutenticacion();
    
    // Cargar estadísticas iniciales
    cargarEstadisticasCalificaciones();
    
    // Cargar comentarios recientes
    cargarComentariosRecientes();
    
    // Configurar botón de cargar más comentarios
    document.getElementById('cargarMasComentarios').addEventListener('click', () => {
        paginaComentarios++;
        cargarComentariosRecientes(true);
    });
});

/**
 * Verificar si el usuario está autenticado
 */
async function verificarAutenticacion() {
    try {
        // Usar el endpoint existente de tu aplicación
        const response = await fetch('/api/usuarios/sesion-actual', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.autenticado && data.idUsuario) {
                usuarioActual = data;
                // Verificar si tiene pedidos entregados
                await verificarPedidosEntregados();
            } else {
                // Usuario no autenticado
                mostrarMensajeNoAutenticado();
            }
        } else {
            // Error en el servidor o no autenticado
            console.error('Error verificando autenticación:', response.status);
            mostrarMensajeNoAutenticado();
        }
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        mostrarMensajeNoAutenticado();
    }
}

/**
 * Verificar si el usuario tiene pedidos entregados
 */
async function verificarPedidosEntregados() {
    try {
        // Intentar obtener estadísticas del usuario que incluyen pedidos
        const response = await fetch('/api/usuarios/estadisticas', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.exito && data.estadisticas) {
                const pedidosEntregados = data.estadisticas.pedidosEntregados || 0;
                
                if (pedidosEntregados > 0) {
                    // Simular un pedido para el formulario (en una implementación real obtendrías los pedidos reales)
                    const pedidoSimulado = {
                        idPedido: data.estadisticas.ultimoPedido ? data.estadisticas.ultimoPedido.id : 1,
                        direccionEntrega: null // Para determinar tipo de visita
                    };
                    
                    // Verificar si ya calificó algún pedido
                    await verificarCalificacionesExistentes(pedidoSimulado);
                } else {
                    mostrarMensajeSinPedidos();
                }
            } else {
                mostrarMensajeSinPedidos();
            }
        } else {
            console.error('Error obteniendo estadísticas:', response.status);
            mostrarMensajeSinPedidos();
        }
    } catch (error) {
        console.error('Error verificando pedidos:', error);
        mostrarMensajeSinPedidos();
    }
}

/**
 * Verificar si el usuario ya tiene calificaciones
 */
async function verificarCalificacionesExistentes(pedido) {
    try {
        const response = await fetch('/api/calificaciones/mis-calificaciones', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const calificaciones = await response.json();
            
            if (calificaciones.length === 0) {
                // No tiene calificaciones, puede calificar
                pedidosCalificables = [pedido];
                mostrarFormularioCalificacion(pedido);
            } else {
                // Ya tiene calificaciones
                mostrarMensajeYaCalificado();
            }
        } else {
            // Error obteniendo calificaciones, permitir calificar
            pedidosCalificables = [pedido];
            mostrarFormularioCalificacion(pedido);
        }
    } catch (error) {
        console.error('Error verificando calificaciones:', error);
        // En caso de error, permitir calificar
        pedidosCalificables = [pedido];
        mostrarFormularioCalificacion(pedido);
    }
}

/**
 * Mostrar formulario de calificación
 */
function mostrarFormularioCalificacion(pedido) {
    document.getElementById('seccionFormulario').style.display = 'block';
    document.getElementById('mensajeNoAutenticado').style.display = 'none';
    document.getElementById('mensajeSinPedidos').style.display = 'none';
    
    // Actualizar información del usuario y pedido
    document.getElementById('nombreUsuarioLogueado').textContent = 
        `${usuarioActual.nombre} ${usuarioActual.apellido || ''}`;
    document.getElementById('numeroPedido').textContent = pedido.idPedido;
    document.getElementById('idPedidoCalificar').value = pedido.idPedido;
    
    // Determinar tipo de visita según el pedido
    const tipoVisita = pedido.direccionEntrega ? 'domicilio' : 'restaurante';
    
    // Inicializar sistema de estrellas
    inicializarSistemaEstrellas();
    
    // Configurar formulario
    configurarFormulario(pedido.idPedido, tipoVisita);
}

/**
 * Mostrar mensaje cuando ya calificó todos los pedidos
 */
function mostrarMensajeYaCalificado() {
    document.getElementById('seccionFormulario').style.display = 'block';
    document.getElementById('mensajeNoAutenticado').style.display = 'none';
    document.getElementById('mensajeSinPedidos').style.display = 'none';
    
    // Cambiar el contenido del formulario por un mensaje
    const formContainer = document.querySelector('.pqr-form');
    formContainer.innerHTML = `
        <div class="alert alert-success text-center">
            <i class="fas fa-check-circle"></i> 
            <strong>¡Gracias!</strong><br>
            Ya has calificado tus pedidos entregados. 
            Podrás calificar nuevamente cuando realices y recibas un nuevo pedido.
            <br><br>
            <a href="/gestion-de-menus.html" class="btn btn-primary">Ver Menú</a>
        </div>
    `;
}

/**
 * Mostrar mensaje para usuarios no autenticados
 */
function mostrarMensajeNoAutenticado() {
    document.getElementById('seccionFormulario').style.display = 'none';
    document.getElementById('mensajeNoAutenticado').style.display = 'block';
    document.getElementById('mensajeSinPedidos').style.display = 'none';
}

/**
 * Mostrar mensaje para usuarios sin pedidos
 */
function mostrarMensajeSinPedidos() {
    document.getElementById('seccionFormulario').style.display = 'none';
    document.getElementById('mensajeNoAutenticado').style.display = 'none';
    document.getElementById('mensajeSinPedidos').style.display = 'block';
}

/**
 * Inicializa el sistema de calificación por estrellas
 */
function inicializarSistemaEstrellas() {
    // Para el formulario principal
    document.querySelectorAll('#formCalificacion .star-rating').forEach(ratingContainer => {
        const categoria = ratingContainer.dataset.categoria;
        const estrellas = ratingContainer.querySelectorAll('.star');
        
        estrellas.forEach(estrella => {
            estrella.addEventListener('click', () => {
                const valor = parseInt(estrella.dataset.value);
                establecerCalificacion(categoria, valor, estrellas);
            });
            
            estrella.addEventListener('mouseenter', () => {
                const valor = parseInt(estrella.dataset.value);
                mostrarPreviewCalificacion(valor, estrellas);
            });
        });
        
        ratingContainer.addEventListener('mouseleave', () => {
            const valorActual = calificacionesPorCategoria[categoria];
            if (valorActual > 0) {
                mostrarPreviewCalificacion(valorActual, estrellas);
            } else {
                estrellas.forEach(s => s.classList.remove('active'));
            }
        });
    });
    
    // Para el modal de edición
    document.querySelectorAll('#modalEditarComentario .star-rating').forEach(ratingContainer => {
        const categoria = ratingContainer.dataset.categoria;
        const estrellas = ratingContainer.querySelectorAll('.star');
        
        estrellas.forEach(estrella => {
            estrella.addEventListener('click', () => {
                const valor = parseInt(estrella.dataset.value);
                establecerCalificacionEdicion(categoria, valor, estrellas);
            });
            
            estrella.addEventListener('mouseenter', () => {
                const valor = parseInt(estrella.dataset.value);
                mostrarPreviewCalificacion(valor, estrellas);
            });
        });
        
        ratingContainer.addEventListener('mouseleave', () => {
            const valorActual = calificacionesEdicion[categoria];
            if (valorActual > 0) {
                mostrarPreviewCalificacion(valorActual, estrellas);
            } else {
                estrellas.forEach(s => s.classList.remove('active'));
            }
        });
    });
}

/**
 * Establece la calificación para una categoría
 */
function establecerCalificacion(categoria, valor, estrellas) {
    calificacionesPorCategoria[categoria] = valor;
    
    const inputOculto = document.getElementById(`calificacion-${categoria}`);
    if (inputOculto) {
        inputOculto.value = valor;
    }
    
    estrellas.forEach((estrella, index) => {
        if (index < valor) {
            estrella.classList.add('active');
        } else {
            estrella.classList.remove('active');
        }
    });
}

/**
 * Establece la calificación para edición
 */
function establecerCalificacionEdicion(categoria, valor, estrellas) {
    calificacionesEdicion[categoria] = valor;
    
    estrellas.forEach((estrella, index) => {
        if (index < valor) {
            estrella.classList.add('active');
        } else {
            estrella.classList.remove('active');
        }
    });
}

/**
 * Muestra preview de calificación al hacer hover
 */
function mostrarPreviewCalificacion(valor, estrellas) {
    estrellas.forEach((estrella, index) => {
        if (index < valor) {
            estrella.classList.add('active');
        } else {
            estrella.classList.remove('active');
        }
    });
}

/**
 * Configurar el formulario de calificación
 */
function configurarFormulario(idPedido, tipoVisita) {
    const formulario = document.getElementById('formCalificacion');
    
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const categoriasValidas = validarCalificaciones();
        if (!categoriasValidas) {
            mostrarAlerta('Por favor califica todas las categorías antes de enviar', 'warning');
            return;
        }
        
        const datosCalificacion = {
            idPedido: parseInt(idPedido),
            tipoVisita: tipoVisita,
            calificaciones: calificacionesPorCategoria,
            comentario: document.getElementById('comentario').value.trim(),
            recomendaria: document.getElementById('recomendaria').checked,
            promedioGeneral: calcularPromedioGeneral()
        };
        
        const botonEnviar = formulario.querySelector('button[type="submit"]');
        const textoOriginal = botonEnviar.innerHTML;
        botonEnviar.disabled = true;
        botonEnviar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';
        
        try {
            const response = await fetch('/api/calificaciones/nueva', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(datosCalificacion)
            });
            
            if (response.ok) {
                const modal = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
                modal.show();
                
                formulario.reset();
                limpiarCalificaciones();
                
                await cargarEstadisticasCalificaciones();
                paginaComentarios = 1;
                await cargarComentariosRecientes(false);
                
                // Mostrar mensaje de ya calificado después de un delay
                setTimeout(() => {
                    mostrarMensajeYaCalificado();
                }, 2000);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.mensaje || 'Error al enviar la calificación');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('Hubo un error al enviar tu calificación: ' + error.message, 'danger');
        } finally {
            botonEnviar.disabled = false;
            botonEnviar.innerHTML = textoOriginal;
        }
    });
}

/**
 * Validar que todas las categorías tengan calificación
 */
function validarCalificaciones() {
    for (const categoria in calificacionesPorCategoria) {
        if (calificacionesPorCategoria[categoria] === 0) {
            const contenedor = document.querySelector(`[data-categoria="${categoria}"]`).closest('.categoria-item');
            contenedor.style.border = '2px solid #e83f3f';
            setTimeout(() => {
                contenedor.style.border = '';
            }, 3000);
            return false;
        }
    }
    return true;
}

/**
 * Calcular el promedio general de todas las categorías
 */
function calcularPromedioGeneral() {
    const valores = Object.values(calificacionesPorCategoria);
    const suma = valores.reduce((acc, val) => acc + val, 0);
    return suma / valores.length;
}

/**
 * Limpiar todas las calificaciones
 */
function limpiarCalificaciones() {
    for (const categoria in calificacionesPorCategoria) {
        calificacionesPorCategoria[categoria] = 0;
    }
    
    document.querySelectorAll('.star').forEach(estrella => {
        estrella.classList.remove('active');
    });
    
    document.querySelectorAll('[id^="calificacion-"]').forEach(input => {
        input.value = '0';
    });
}

/**
 * Cargar las estadísticas de calificaciones
 */
async function cargarEstadisticasCalificaciones() {
    try {
        const response = await fetch('/api/calificaciones/estadisticas');
        if (response.ok) {
            const estadisticas = await response.json();
            actualizarEstadisticasUI(estadisticas);
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        mostrarEstadisticasEjemplo();
    }
}

/**
 * Actualizar la UI con las estadísticas recibidas
 */
function actualizarEstadisticasUI(estadisticas) {
    document.getElementById('promedioGeneral').textContent = estadisticas.promedioGeneral.toFixed(1);
    document.getElementById('totalResenas').textContent = estadisticas.totalResenas;
    
    actualizarEstrellasPromedio(estadisticas.promedioGeneral);
    
    for (let i = 1; i <= 5; i++) {
        const porcentaje = estadisticas.distribucion[i] || 0;
        document.getElementById(`barra${i}`).style.width = porcentaje + '%';
        document.getElementById(`porcentaje${i}`).textContent = porcentaje + '%';
    }
}

/**
 * Mostrar estadísticas de ejemplo
 */
function mostrarEstadisticasEjemplo() {
    const estadisticasEjemplo = {
        promedioGeneral: 4.5,
        totalResenas: 150,
        distribucion: {
            5: 60,
            4: 25,
            3: 10,
            2: 3,
            1: 2
        }
    };
    actualizarEstadisticasUI(estadisticasEjemplo);
}

/**
 * Actualizar las estrellas visuales del promedio
 */
function actualizarEstrellasPromedio(promedio) {
    const contenedor = document.getElementById('estrellasPromedio');
    contenedor.innerHTML = '';
    
    const enteroParte = Math.floor(promedio);
    const decimalParte = promedio - enteroParte;
    
    for (let i = 0; i < enteroParte; i++) {
        contenedor.innerHTML += '<i class="fas fa-star"></i>';
    }
    
    if (decimalParte >= 0.5) {
        contenedor.innerHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const estrellasRestantes = 5 - Math.ceil(promedio);
    for (let i = 0; i < estrellasRestantes; i++) {
        contenedor.innerHTML += '<i class="far fa-star"></i>';
    }
}

/**
 * Cargar los comentarios recientes
 */
async function cargarComentariosRecientes(agregarMas = false) {
    const contenedor = document.getElementById('comentariosRecientes');
    const botonCargarMas = document.getElementById('cargarMasComentarios');
    
    if (!agregarMas) {
        contenedor.innerHTML = '<div class="cargando"><div class="spinner-border"></div><p>Cargando comentarios...</p></div>';
    }
    
    try {
        const response = await fetch(`/api/calificaciones/comentarios?pagina=${paginaComentarios}&limite=${comentariosPorPagina}`);
        
        if (response.ok) {
            const datos = await response.json();
            
            if (!agregarMas) {
                contenedor.innerHTML = '';
            } else {
                const cargando = contenedor.querySelector('.cargando');
                if (cargando) cargando.remove();
            }
            
            if (datos.comentarios.length === 0 && !agregarMas) {
                contenedor.innerHTML = '<p class="text-center text-muted">Aún no hay comentarios. ¡Sé el primero en compartir tu experiencia!</p>';
                botonCargarMas.style.display = 'none';
            } else {
                for (const comentario of datos.comentarios) {
                    const elementoComentario = await crearElementoComentario(comentario);
                    contenedor.appendChild(elementoComentario);
                }
                
                if (datos.hayMas) {
                    botonCargarMas.style.display = 'block';
                } else {
                    botonCargarMas.style.display = 'none';
                }
            }
        } else {
            throw new Error('Error al cargar comentarios');
        }
    } catch (error) {
        console.error('Error:', error);
        if (!agregarMas) {
            contenedor.innerHTML = '<p class="text-center text-danger">Error al cargar los comentarios</p>';
        }
    }
}

/**
 * Crear el elemento HTML para un comentario
 */
async function crearElementoComentario(comentario) {
    const div = document.createElement('div');
    div.className = 'comentario-item animate__animated animate__fadeIn';
    
    // Marcar si es comentario propio
    const esMiComentario = usuarioActual && comentario.usuario.idUsuario === usuarioActual.idUsuario;
    if (esMiComentario) {
        div.className += ' es-mio';
    }
    
    const promedio = calcularPromedioComentario(comentario.calificaciones);
    const estrellas = generarEstrellasHTML(promedio);
    
    // Verificar si el usuario actual le dio like
    const usuarioDioLike = usuarioActual && comentario.likes && comentario.likes.some(like => 
        like.usuario.idUsuario === usuarioActual.idUsuario
    );
    
    div.innerHTML = `
        <div class="comentario-header">
            <div class="comentario-info">
                <div class="comentario-autor">
                    ${comentario.usuario.nombre} ${comentario.usuario.apellido || ''}
                    <span class="badge-cliente">Cliente verificado</span>
                    ${comentario.editado ? '<span class="comentario-editado">(editado)</span>' : ''}
                </div>
                <div class="comentario-fecha">${formatearFecha(comentario.fecha)}</div>
            </div>
            <div class="comentario-acciones">
                ${usuarioActual ? `
                    <button class="btn-accion btn-like ${usuarioDioLike ? 'liked' : ''}" 
                            onclick="toggleLike(${comentario.idCalificacion})">
                        <i class="fas fa-heart"></i>
                        <span class="contador-likes">${comentario.totalLikes || 0}</span>
                    </button>
                    ${esMiComentario ? `
                        <button class="btn-accion" onclick="editarComentario(${comentario.idCalificacion})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-accion" onclick="eliminarComentario(${comentario.idCalificacion})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    ` : `
                        <button class="btn-accion" onclick="responderComentario(${comentario.idCalificacion}, '${comentario.usuario.nombre}', '${comentario.comentario.replace(/'/g, "\\'")}')">
                            <i class="fas fa-reply"></i> Responder
                        </button>
                    `}
                ` : ''}
            </div>
        </div>
        <div class="comentario-estrellas">${estrellas}</div>
        <div class="comentario-texto">${comentario.comentario}</div>
        <div class="comentario-categorias">
            <div class="categoria-calificacion">
                <i class="fas fa-utensils"></i>
                <span>Comida:</span>
                <span class="mini-estrellas">${generarMiniEstrellas(comentario.calificaciones.comida)}</span>
            </div>
            <div class="categoria-calificacion">
                <i class="fas fa-concierge-bell"></i>
                <span>Servicio:</span>
                <span class="mini-estrellas">${generarMiniEstrellas(comentario.calificaciones.servicio)}</span>
            </div>
            <div class="categoria-calificacion">
                <i class="fas fa-broom"></i>
                <span>Limpieza:</span>
                <span class="mini-estrellas">${generarMiniEstrellas(comentario.calificaciones.limpieza)}</span>
            </div>
            <div class="categoria-calificacion">
                <i class="fas fa-dollar-sign"></i>
                <span>Precio:</span>
                <span class="mini-estrellas">${generarMiniEstrellas(comentario.calificaciones.precio)}</span>
            </div>
            <div class="categoria-calificacion">
                <i class="fas fa-store"></i>
                <span>Ambiente:</span>
                <span class="mini-estrellas">${generarMiniEstrellas(comentario.calificaciones.ambiente)}</span>
            </div>
        </div>
        ${comentario.recomendaria ? '<div class="recomendacion-badge mt-2"><i class="fas fa-thumbs-up"></i> Lo recomienda</div>' : ''}
        
        <!-- Sección de respuestas -->
        <div class="seccion-respuestas" id="respuestas-${comentario.idCalificacion}">
            ${comentario.respuestas && comentario.respuestas.length > 0 ? `
                <button class="btn-ver-respuestas" onclick="toggleRespuestas(${comentario.idCalificacion})">
                    <i class="fas fa-comments"></i> Ver ${comentario.respuestas.length} respuesta(s)
                </button>
                <div class="lista-respuestas" id="lista-respuestas-${comentario.idCalificacion}" style="display: none;">
                    ${comentario.respuestas.map(respuesta => crearElementoRespuesta(respuesta, esMiComentario)).join('')}
                </div>
            ` : ''}
        </div>
    `;
    
    return div;
}

/**
 * Crear elemento de respuesta
 */
function crearElementoRespuesta(respuesta, puedeEliminar) {
    const esRespuestaMia = usuarioActual && respuesta.usuario.idUsuario === usuarioActual.idUsuario;
    
    return `
        <div class="respuesta-item">
            <div class="respuesta-header">
                <div>
                    <div class="respuesta-autor">
                        ${respuesta.usuario.nombre} ${respuesta.usuario.apellido || ''}
                        ${respuesta.editado ? '<span class="comentario-editado">(editado)</span>' : ''}
                    </div>
                    <div class="respuesta-fecha">${formatearFecha(respuesta.fechaRespuesta)}</div>
                </div>
                ${esRespuestaMia || puedeEliminar ? `
                    <button class="btn-accion" onclick="eliminarRespuesta(${respuesta.idRespuesta})">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
            <div class="respuesta-texto">${respuesta.comentario}</div>
        </div>
    `;
}

/**
 * Toggle like en un comentario
 */
async function toggleLike(idCalificacion) {
    if (!usuarioActual) {
        mostrarAlerta('Debes iniciar sesión para dar like', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`/api/calificaciones/${idCalificacion}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        if (response.ok) {
            // Recargar comentarios para mostrar el cambio
            paginaComentarios = 1;
            await cargarComentariosRecientes(false);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Error al procesar el like');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al procesar el like: ' + error.message, 'danger');
    }
}

/**
 * Editar comentario
 */
async function editarComentario(idCalificacion) {
    try {
        const response = await fetch(`/api/calificaciones/${idCalificacion}`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const comentario = await response.json();
            
            // Llenar el modal con los datos actuales
            document.getElementById('idComentarioEditar').value = idCalificacion;
            document.getElementById('comentarioEditar').value = comentario.comentario;
            document.getElementById('recomendariaEditar').checked = comentario.recomendaria;
            
            // Establecer las calificaciones actuales
            calificacionesEdicion['comida-edit'] = comentario.calificaciones.comida;
            calificacionesEdicion['servicio-edit'] = comentario.calificaciones.servicio;
            calificacionesEdicion['limpieza-edit'] = comentario.calificaciones.limpieza;
            calificacionesEdicion['precio-edit'] = comentario.calificaciones.precio;
            calificacionesEdicion['ambiente-edit'] = comentario.calificaciones.ambiente;
            
            // Actualizar estrellas visuales
            for (const [categoria, valor] of Object.entries(calificacionesEdicion)) {
                const container = document.querySelector(`[data-categoria="${categoria}"]`);
                if (container) {
                    const estrellas = container.querySelectorAll('.star');
                    establecerCalificacionEdicion(categoria, valor, estrellas);
                }
            }
            
            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('modalEditarComentario'));
            modal.show();
        } else {
            throw new Error('Error al cargar el comentario');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar el comentario: ' + error.message, 'danger');
    }
}

/**
 * Guardar edición de comentario
 */
async function guardarEdicionComentario() {
    const idCalificacion = document.getElementById('idComentarioEditar').value;
    
    const datosActualizados = {
        calificaciones: {
            comida: calificacionesEdicion['comida-edit'],
            servicio: calificacionesEdicion['servicio-edit'],
            limpieza: calificacionesEdicion['limpieza-edit'],
            precio: calificacionesEdicion['precio-edit'],
            ambiente: calificacionesEdicion['ambiente-edit']
        },
        comentario: document.getElementById('comentarioEditar').value.trim(),
        recomendaria: document.getElementById('recomendariaEditar').checked
    };
    
    try {
        const response = await fetch(`/api/calificaciones/${idCalificacion}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(datosActualizados)
        });
        
        if (response.ok) {
            mostrarAlerta('Comentario actualizado exitosamente', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalEditarComentario')).hide();
            
            // Recargar comentarios
            paginaComentarios = 1;
            await cargarComentariosRecientes(false);
            await cargarEstadisticasCalificaciones();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Error al actualizar');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al actualizar el comentario: ' + error.message, 'danger');
    }
}

/**
 * Eliminar comentario
 */
async function eliminarComentario(idCalificacion) {
    if (!confirm('¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/calificaciones/${idCalificacion}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            mostrarAlerta('Comentario eliminado exitosamente', 'success');
            
            // Recargar comentarios y estadísticas
            paginaComentarios = 1;
            await cargarComentariosRecientes(false);
            await cargarEstadisticasCalificaciones();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Error al eliminar');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al eliminar el comentario: ' + error.message, 'danger');
    }
}

/**
 * Responder a un comentario
 */
function responderComentario(idCalificacion, autorOriginal, textoOriginal) {
    if (!usuarioActual) {
        mostrarAlerta('Debes iniciar sesión para responder', 'warning');
        return;
    }
    
    document.getElementById('idComentarioResponder').value = idCalificacion;
    document.getElementById('autorComentarioOriginal').textContent = autorOriginal;
    document.getElementById('textoComentarioOriginal').textContent = textoOriginal.substring(0, 100) + '...';
    document.getElementById('respuestaComentario').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('modalResponderComentario'));
    modal.show();
}

/**
 * Enviar respuesta
 */
async function enviarRespuesta() {
    const idCalificacion = document.getElementById('idComentarioResponder').value;
    const respuesta = document.getElementById('respuestaComentario').value.trim();
    
    if (!respuesta) {
        mostrarAlerta('Por favor escribe una respuesta', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`/api/calificaciones/${idCalificacion}/responder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ comentario: respuesta })
        });
        
        if (response.ok) {
            mostrarAlerta('Respuesta enviada exitosamente', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalResponderComentario')).hide();
            
            // Recargar comentarios
            paginaComentarios = 1;
            await cargarComentariosRecientes(false);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Error al enviar respuesta');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al enviar la respuesta: ' + error.message, 'danger');
    }
}

/**
 * Eliminar respuesta
 */
async function eliminarRespuesta(idRespuesta) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta respuesta?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/calificaciones/respuesta/${idRespuesta}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            mostrarAlerta('Respuesta eliminada exitosamente', 'success');
            
            // Recargar comentarios
            paginaComentarios = 1;
            await cargarComentariosRecientes(false);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Error al eliminar');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al eliminar la respuesta: ' + error.message, 'danger');
    }
}

/**
 * Toggle para mostrar/ocultar respuestas
 */
function toggleRespuestas(idCalificacion) {
    const listaRespuestas = document.getElementById(`lista-respuestas-${idCalificacion}`);
    const boton = document.querySelector(`[onclick="toggleRespuestas(${idCalificacion})"]`);
    
    if (listaRespuestas.style.display === 'none') {
        listaRespuestas.style.display = 'block';
        boton.innerHTML = boton.innerHTML.replace('Ver', 'Ocultar');
    } else {
        listaRespuestas.style.display = 'none';
        boton.innerHTML = boton.innerHTML.replace('Ocultar', 'Ver');
    }
}

/**
 * Actualizar un comentario específico (función auxiliar para optimizaciones futuras)
 */
async function actualizarComentario(idCalificacion) {
    try {
        const response = await fetch(`/api/calificaciones/${idCalificacion}`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const comentario = await response.json();
            const elementoActualizado = await crearElementoComentario(comentario);
            
            // Encontrar y reemplazar el comentario en el DOM
            const comentarios = document.querySelectorAll('.comentario-item');
            for (const elem of comentarios) {
                const editBtn = elem.querySelector(`[onclick*="editarComentario(${idCalificacion})"]`);
                if (editBtn) {
                    elem.replaceWith(elementoActualizado);
                    break;
                }
            }
        }
    } catch (error) {
        console.error('Error actualizando comentario:', error);
        // Fallback: recargar todos los comentarios
        paginaComentarios = 1;
        await cargarComentariosRecientes(false);
    }
}

// ========================= FUNCIONES AUXILIARES =========================

/**
 * Calcular promedio de un comentario
 */
function calcularPromedioComentario(calificaciones) {
    if (!calificaciones) return 0;
    const valores = Object.values(calificaciones);
    if (valores.length === 0) return 0;
    const suma = valores.reduce((acc, val) => acc + (val || 0), 0);
    return suma / valores.length;
}

/**
 * Generar HTML de estrellas para mostrar promedio
 */
function generarEstrellasHTML(promedio) {
    let html = '';
    const entero = Math.floor(promedio);
    const decimal = promedio - entero;
    
    // Estrellas llenas
    for (let i = 0; i < entero; i++) {
        html += '<i class="fas fa-star"></i>';
    }
    
    // Media estrella si es necesario
    if (decimal >= 0.5) {
        html += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Estrellas vacías
    const restantes = 5 - Math.ceil(promedio);
    for (let i = 0; i < restantes; i++) {
        html += '<i class="far fa-star"></i>';
    }
    
    return html;
}

/**
 * Generar mini estrellas para categorías
 */
function generarMiniEstrellas(valor) {
    let html = '';
    for (let i = 0; i < 5; i++) {
        if (i < valor) {
            html += '<i class="fas fa-star"></i>';
        } else {
            html += '<i class="far fa-star"></i>';
        }
    }
    return html;
}

/**
 * Formatear fecha para mostrar en comentarios
 */
function formatearFecha(fecha) {
    if (!fecha) return '';
    
    const opciones = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    try {
        return new Date(fecha).toLocaleDateString('es-CO', opciones);
    } catch (error) {
        console.error('Error formateando fecha:', error);
        return fecha.toString();
    }
}

/**
 * Mostrar alerta flotante
 */
function mostrarAlerta(mensaje, tipo) {
    // Remover alerta existente si hay una
    const alertaExistente = document.querySelector('.alerta-flotante');
    if (alertaExistente) {
        alertaExistente.remove();
    }
    
    // Crear nueva alerta
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alerta-flotante animate__animated animate__fadeInDown`;
    alerta.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1050;
        min-width: 300px;
        max-width: 500px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border: none;
        border-radius: 8px;
    `;
    
    // Determinar icono según el tipo
    let icono = '';
    switch(tipo) {
        case 'success':
            icono = '<i class="fas fa-check-circle me-2"></i>';
            break;
        case 'danger':
            icono = '<i class="fas fa-exclamation-triangle me-2"></i>';
            break;
        case 'warning':
            icono = '<i class="fas fa-exclamation-circle me-2"></i>';
            break;
        case 'info':
            icono = '<i class="fas fa-info-circle me-2"></i>';
            break;
        default:
            icono = '<i class="fas fa-bell me-2"></i>';
    }
    
    alerta.innerHTML = `
        <div class="d-flex align-items-center">
            ${icono}
            <span class="flex-grow-1">${mensaje}</span>
            <button type="button" class="btn-close ms-2" onclick="this.closest('.alerta-flotante').remove()"></button>
        </div>
    `;
    
    // Agregar al DOM
    document.body.appendChild(alerta);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (alerta && alerta.parentNode) {
            alerta.classList.remove('animate__fadeInDown');
            alerta.classList.add('animate__fadeOutUp');
            setTimeout(() => {
                if (alerta && alerta.parentNode) {
                    alerta.remove();
                }
            }, 500);
        }
    }, 5000);
}

/**
 * Función para escapar HTML (prevenir XSS)
 */
function escaparHTML(texto) {
    const elemento = document.createElement('div');
    elemento.textContent = texto;
    return elemento.innerHTML;
}

/**
 * Función para truncar texto largo
 */
function truncarTexto(texto, longitudMaxima = 100) {
    if (!texto || texto.length <= longitudMaxima) {
        return texto;
    }
    return texto.substring(0, longitudMaxima) + '...';
}

/**
 * Función para validar que un elemento existe antes de usarlo
 */
function validarElemento(id) {
    const elemento = document.getElementById(id);
    if (!elemento) {
        console.warn(`Elemento con ID '${id}' no encontrado en el DOM`);
        return false;
    }
    return true;
}

/**
 * Función para manejar errores de red de forma genérica
 */
function manejarErrorRed(error, operacion = 'realizar la operación') {
    console.error('Error de red:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        mostrarAlerta(`No se pudo conectar con el servidor. Verifica tu conexión a internet.`, 'danger');
    } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        mostrarAlerta(`Tu sesión ha expirado. Por favor, inicia sesión nuevamente.`, 'warning');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
    } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        mostrarAlerta(`No tienes permisos para ${operacion}.`, 'warning');
    } else if (error.message.includes('404')) {
        mostrarAlerta(`El recurso solicitado no fue encontrado.`, 'warning');
    } else if (error.message.includes('500')) {
        mostrarAlerta(`Error interno del servidor. Por favor, intenta nuevamente más tarde.`, 'danger');
    } else {
        mostrarAlerta(`Error al ${operacion}: ${error.message}`, 'danger');
    }
}

// ========================= INICIALIZACIÓN ADICIONAL =========================

/**
 * Función que se ejecuta cuando se redimensiona la ventana
 */
window.addEventListener('resize', () => {
    // Ajustar el layout si es necesario en pantallas pequeñas
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        // Ajustes para móvil si son necesarios
        document.querySelectorAll('.comentario-categorias').forEach(elemento => {
            elemento.style.flexDirection = 'column';
        });
    } else {
        // Ajustes para escritorio
        document.querySelectorAll('.comentario-categorias').forEach(elemento => {
            elemento.style.flexDirection = 'row';
        });
    }
});

/**
 * Prevenir envío del formulario si se presiona Enter accidentalmente
 */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.tagName !== 'BUTTON') {
        // Solo prevenir en campos de texto dentro del formulario de calificación
        if (e.target.closest('#formCalificacion') && e.target.tagName === 'INPUT') {
            e.preventDefault();
        }
    }
});

/**
 * Función para limpiar recursos cuando se abandona la página
 */
window.addEventListener('beforeunload', () => {
    // Limpiar cualquier timer o recurso si es necesario
    const alertas = document.querySelectorAll('.alerta-flotante');
    alertas.forEach(alerta => alerta.remove());
});

// ========================= DEBUGGING Y LOGS =========================

/**
 * Función para logging en desarrollo (se puede desactivar en producción)
 */
function log(mensaje, tipo = 'info') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console[tipo](`[REDES.JS] ${mensaje}`);
    }
}

// Log inicial
log('Sistema de calificaciones inicializado correctamente', 'info');