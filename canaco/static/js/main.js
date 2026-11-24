/**
 * Template Name: Blogy
 * Template URL: https://bootstrapmade.com/blogy-bootstrap-blog-template/
 * Updated: Feb 22 2025 with Bootstrap v5.3.3
 * Author: BootstrapMade.com
 * License: https://bootstrapmade.com/license/
 */

(function () {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader) return;
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });
  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function (e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  if (scrollTop) {
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 600,
        easing: 'ease-in-out',
        once: true,
        mirror: false
      });
    }
  }
  window.addEventListener('load', aosInit);

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    if (typeof Swiper === 'undefined') return;
    document.querySelectorAll(".init-swiper").forEach(function (swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Initiate Pure Counter
   */
  if (typeof PureCounter !== 'undefined') {
    new PureCounter();
  }

  /**
   * Initiate glightbox
   */
  if (typeof GLightbox !== 'undefined') {
    const glightbox = GLightbox({
      selector: '.glightbox'
    });
  }

  // =========================================================================
  // MÓDULO AJAX PARA DJANGO (CANACO)
  // =========================================================================

  /**
   * Obtiene el token CSRF de las cookies de Django (necesario para peticiones POST)
   */
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  /**
   * 1. BUSCADOR DE NOTICIAS EN TIEMPO REAL
   * Requiere un input con id="buscador-ajax" y un contenedor id="resultados-busqueda"
   */
  function initBuscadorAjax() {
    const inputBuscador = document.getElementById('buscador-ajax');
    const contenedorResultados = document.getElementById('resultados-busqueda');
    if (!inputBuscador || !contenedorResultados) return;

    let temporizador;

    inputBuscador.addEventListener('input', () => {
      clearTimeout(temporizador);
      const query = inputBuscador.value.trim();

      if (query.length < 2) {
        contenedorResultados.innerHTML = '';
        contenedorResultados.style.display = 'none';
        return;
      }

      // Espera 300ms tras dejar de escribir para no saturar el servidor
      temporizador = setTimeout(async () => {
        try {
          const response = await fetch(`/ajax/buscar/?q=${encodeURIComponent(query)}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
          });
          const data = await response.json();

          if (data.status === 'ok' && data.resultados.length > 0) {
            contenedorResultados.innerHTML = data.resultados.map(item => `
              <a href="/noticia/${item.id}" class="list-group-item list-group-item-action">
                <div class="fw-bold">${item.titulo}</div>
                <small class="text-muted">${item.categoria} — ${item.resumen}...</small>
              </a>
            `).join('');
          } else {
            contenedorResultados.innerHTML = `
              <div class="list-group-item text-muted">No se encontraron noticias.</div>
            `;
          }
          contenedorResultados.style.display = 'block';
        } catch (error) {
          console.error('Error en buscador AJAX:', error);
        }
      }, 300);
    });

    // Ocultar resultados si el usuario hace clic fuera del buscador
    document.addEventListener('click', (e) => {
      if (!inputBuscador.contains(e.target) && !contenedorResultados.contains(e.target)) {
        contenedorResultados.style.display = 'none';
      }
    });
  }

  /**
   * 2. ENVÍO DE COMENTARIOS SIN RECARGAR (noticia.html)
   * Requiere un <form id="form-comentario"> y un <div id="alerta-comentario">
   */
  function initComentariosAjax() {
    const formComentario = document.getElementById('form-comentario');
    if (!formComentario) return;

    formComentario.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(formComentario);
      const alerta = document.getElementById('alerta-comentario');

      try {
        const response = await fetch(formComentario.action || window.location.href, {
          method: 'POST',
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          body: formData
        });
        const data = await response.json();

        if (alerta) {
          alerta.className = response.ok ? 'alert alert-success mt-2' : 'alert alert-danger mt-2';
          alerta.textContent = data.mensaje;
          alerta.style.display = 'block';
        } else {
          alert(data.mensaje);
        }

        if (response.ok && data.status === 'ok') {
          formComentario.reset();
        }
      } catch (error) {
        console.error('Error al enviar comentario:', error);
      }
    });
  }

  /**
   * 3. ACCIONES RÁPIDAS EN PANELES CRUD (Eliminar / Aprobar / Bloquear / Publicar)
   * Usa la clase .btn-ajax-eliminar en botones dentro de una fila <tr>
   */
  function initAccionesCrudAjax() {
    const csrftoken = getCookie('csrftoken');

    document.querySelectorAll('.btn-ajax-eliminar').forEach(boton => {
      boton.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!confirm('¿Estás seguro de eliminar este registro?')) return;

        const url = boton.dataset.url;
        const fila = boton.closest('tr');

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'X-CSRFToken': csrftoken
            }
          });
          const data = await response.json();

          if (response.ok && data.status === 'ok') {
            if (fila) fila.remove();
          } else {
            alert(data.mensaje || 'No se pudo eliminar el registro.');
          }
        } catch (error) {
          console.error('Error al eliminar por AJAX:', error);
        }
      });
    });
  }

  // Inicializar todos los módulos AJAX cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
    initBuscadorAjax();
    initComentariosAjax();
    initAccionesCrudAjax();
  });

})();