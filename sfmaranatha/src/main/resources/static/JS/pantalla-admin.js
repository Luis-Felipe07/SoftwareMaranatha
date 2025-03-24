

document.getElementById('cerrarSesion').addEventListener('click', () => {
    const confirmar = confirm('¿Estás seguro de que deseas cerrar sesión?');
    if (confirmar) {
      alert('Sesión cerrada exitosamente.');
      
      window.location.href = 'login.html';
    }
  });
  