document.addEventListener("DOMContentLoaded", () => {
  // Manejo de enlaces sociales
  const socialLinks = document.querySelectorAll(".social-link, .contact-link");
  
  socialLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      if (!link.getAttribute('href').startsWith('mailto:') && !link.getAttribute('href').startsWith('https://wa.me')) {
        e.preventDefault();
        alert("Estás siendo redirigido. Gracias por contactarnos.");
        window.open(link.getAttribute('href'), '_blank');
      }
    });
  });

  // Sistema de calificación por estrellas
  const stars = document.querySelectorAll('.star');
  const ratingInput = document.getElementById('rating-value');
  
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = parseInt(star.getAttribute('data-value'));
      ratingInput.value = value;
      
      // Resetear todas las estrellas
      stars.forEach(s => s.classList.remove('active'));
      
      // Activar estrellas hasta la seleccionada
      stars.forEach(s => {
        if (parseInt(s.getAttribute('data-value')) <= value) {
          s.classList.add('active');
        }
      });
    });
  });

  // Manejo del formulario
  const pqrForm = document.getElementById('pqrForm');
  
  pqrForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validar calificación
    if (ratingInput.value === "0") {
      alert("Por favor, califica nuestro servicio antes de enviar el formulario.");
      return;
    }
    
    // Simulación de envío exitoso
    const formData = new FormData(pqrForm);
    let formValues = {};
    
    for (let [key, value] of formData.entries()) {
      formValues[key] = value;
    }
    
    // Agregar rating
    formValues.rating = ratingInput.value;
    
    
    console.log("Formulario enviado:", formValues);
    
    alert("¡Gracias por tu mensaje! Hemos recibido tu solicitud y te contactaremos pronto.");
    pqrForm.reset();
    
    // Resetear estrellas
    stars.forEach(s => s.classList.remove('active'));
    ratingInput.value = "0";
  });
});
