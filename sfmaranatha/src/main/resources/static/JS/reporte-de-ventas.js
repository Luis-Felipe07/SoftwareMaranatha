// Actualizar reporte de gráficos
document.getElementById('actualizarReporte').addEventListener('click', () => {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
  
    if (!fechaInicio || !fechaFin) {
      alert('Por favor, selecciona ambas fechas');
      return;
    }
    actualizarGraficos(fechaInicio, fechaFin);
  });
  
  //descargarExcel
  document.getElementById('descargarExcel').addEventListener('click', () => {
    alert("Descargando reporte de Excel..."); 
  });
  
  document.getElementById('descargarPDF').addEventListener('click', () => {
    alert("Descargando el reporte en PDF..."); 
  });
  
  // Configuración de gráficos con Chart.js
  const graficoSemanal = new Chart(document.getElementById('graficoSemanal'), {
    type: 'bar',
    data: {
      labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      datasets: [
        {
          label: 'Ventas Semanales ($)',
          backgroundColor: '#d62828',
          data: [0, 0, 0, 0, 0, 0, 0]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      }
    }
  });
  
  const graficoMensual = new Chart(document.getElementById('graficoMensual'), {
    type: 'line',
    data: {
      labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
      datasets: [
        {
          label: 'Ventas Mensuales ($)',
          borderColor: '#d62828',
          backgroundColor: 'rgba(214, 40, 40, 0.2)',
          data: [0, 0, 0, 0]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      }
    }
  });
  
  // Función para actualizar datos de los gráficos
  function actualizarGraficos(fechaInicio, fechaFin) {
    console.log(`Actualizando gráficos para el rango: ${fechaInicio} - ${fechaFin}`);
   
  
    // Datos de ejemplo para ilustrar la actualización
    const datosSemanales = [100, 200, 150, 300, 250, 400, 350];
    const datosMensuales = [1000, 1200, 1100, 1300];
  
    // Actualizar datos del gráfico semanal
    graficoSemanal.data.datasets[0].data = datosSemanales;
    graficoSemanal.update();
  
    // Actualizar datos del gráfico mensual
    graficoMensual.data.datasets[0].data = datosMensuales;
    graficoMensual.update();
  }
  