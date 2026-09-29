
    const field = id => document.getElementById(id);
    const planZohoMap = { Smart: 'Smart · 1–2 personas · $249/mes', Life: 'Life · 3–4 personas · $299/mes', Family: 'Family · 5–6 personas · $369/mes', Especial: 'Atención personalizada · Más de 6 personas' };
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    function formatDateForZoho(isoDate) {
      if (!isoDate) return '';
      const [y, m, d] = isoDate.split('-').map(Number);
      if (!y || !m || !d) return '';
      return String(d).padStart(2, '0') + '-' + monthsEn[m - 1] + '-' + y;
    }
    let zohoSubmitted = false;
    let submissionMode = 'landing';
    const selectedContactPreference = () => field('contact-preference');
    const showSuccessModal = () => {
      field('success-modal').hidden = false;
      document.body.style.overflow = 'hidden';
      field('success-modal').querySelector('[data-close-success]').focus();
    };
    const closeSuccessModal = () => {
      field('success-modal').hidden = true;
      document.body.style.overflow = '';
    };
    document.querySelectorAll('[data-close-success]').forEach(button => button.addEventListener('click', closeSuccessModal));
    field('success-modal').addEventListener('click', event => { if (event.target === field('success-modal')) closeSuccessModal() });
    const showPaymentModal = () => {
      field('payment-modal').hidden = false;
      document.body.style.overflow = 'hidden';
      field('accept-terms').focus();
      trackAquosEvent('payment_step_viewed');
    };
    const closePaymentModal = () => { field('payment-modal').hidden = true; document.body.style.overflow = '' };
    document.querySelectorAll('[data-close-payment]').forEach(button => button.addEventListener('click', closePaymentModal));
    field('payment-modal').addEventListener('click', event => { if (event.target === field('payment-modal')) closePaymentModal() });
    const AQUOS_PAYMENT_URL = import.meta.env.PUBLIC_PAYMENT_URL || '';
    field('accept-terms').addEventListener('change', event => { field('secure-payment-button').disabled = !event.target.checked });
    field('secure-payment-button').addEventListener('click', () => {
      if (!field('accept-terms').checked) return;
      trackAquosEvent('payment_setup_requested');
      if (AQUOS_PAYMENT_URL) { window.location.href = AQUOS_PAYMENT_URL; return }
      field('payment-status').textContent = 'La conexión con el proveedor de pago seguro se habilitará antes del lanzamiento.';
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !field('success-modal').hidden) closeSuccessModal() });
    window.dataLayer = window.dataLayer || [];
    const trackAquosEvent = (eventName, details = {}) => window.dataLayer.push({ event: eventName, landing_version: 'V3', ...details });
    window.aquosMetrics = {
      installationCompleted: details => trackAquosEvent('installation_completed', details || {}),
      contractActive: details => trackAquosEvent('contract_active', details || {})
    };
    trackAquosEvent('landing_view');
    field('hidden_iframe').addEventListener('load', () => {
      if (!zohoSubmitted) return;
      if (submissionMode === 'landing') {
        showPaymentModal();
      }
      zohoSubmitted = false;
    });
    const planForPeople = value => {
      const count = Number(value);
      if (!count) return { key: '', label: 'Se asignará automáticamente' };
      if (count <= 2) return { key: 'Smart', label: 'Smart · 1–2 personas · $249/mes' };
      if (count <= 4) return { key: 'Life', label: 'Life · 3–4 personas · $299/mes' };
      if (count <= 6) return { key: 'Family', label: 'Family · 5–6 personas · $369/mes' };
      return { key: 'Especial', label: 'Atención personalizada · Más de 6 personas' };
    };
    const validateBooking = () => {
      const controls = [field('firstname'), field('postal'), field('phone'), field('household-size'), field('install-date'), field('time')];
      for (const control of controls) { if (!control.reportValidity()) return false }
      const postal = field('postal');
      if (!/^\d{5}$/.test(postal.value.trim())) { postal.setCustomValidity('Escribe un código postal de 5 dígitos.'); postal.reportValidity(); postal.focus(); return false }
      postal.setCustomValidity('');
      return true;
    };
    const prepareZoho = () => {
      const recommended = planForPeople(field('household-size').value);
      field('plan-zoho').value = planZohoMap[recommended.key] || recommended.label;
      field('install-date-zoho').value = formatDateForZoho(field('install-date').value);
      field('contact-preference-zoho').value = selectedContactPreference()?.value || '';
    };
    const setFormStep = step => {
      document.querySelectorAll('[data-form-step]').forEach(panel => {
        const active = Number(panel.dataset.formStep) === step;
        panel.hidden = !active;
        panel.classList.toggle('active', active);
      });
      document.querySelectorAll('[data-step-dot]').forEach(dot => dot.classList.toggle('active', Number(dot.dataset.stepDot) <= step));
    };
    const validateLeadStep = () => {
      const controls = [field('firstname'), field('phone'), field('postal'), field('household-size')];
      for (const control of controls) { if (!control.reportValidity()) return false }
      const postal = field('postal');
      if (!/^\d{5}$/.test(postal.value.trim())) { postal.setCustomValidity('Escribe un código postal de 5 dígitos.'); postal.reportValidity(); postal.focus(); return false }
      postal.setCustomValidity('');
      return true;
    };
    field('v3-continue').addEventListener('click', () => {
      if (!validateLeadStep()) return;
      prepareZoho();
      const form = field('zohoForm');
      form.target = 'lead_iframe';
      form.submit();
      form.target = 'hidden_iframe';
      trackAquosEvent('lead_captured', { plan: planForPeople(field('household-size').value).key || 'Especial' });
      setFormStep(2);
      field('install-date').focus({ preventScroll: true });
    });
    field('v3-back').addEventListener('click', () => setFormStep(1));
    let agendaStarted = false;
    field('zohoForm').addEventListener('focusin', () => {
      if (agendaStarted) return;
      agendaStarted = true;
      trackAquosEvent('agenda_started');
    });
    document.querySelectorAll('a[href="#agendar"], [data-v3-cta]').forEach(link => link.addEventListener('click', () => trackAquosEvent('cta_click', { cta: link.dataset.v3Cta || 'schedule' })));
    document.querySelectorAll('[data-interest]').forEach(link => link.addEventListener('click', () => trackAquosEvent('information_interest_click', { section: link.dataset.interest })));
    document.querySelectorAll('[data-booking]').forEach(button => button.addEventListener('click', () => {
      const firstname = field('firstname'), phone = field('phone'), email = field('email'), postal = field('postal'), people = field('household-size'), installDate = field('install-date'), time = field('time'), promotion = field('promotion'), contactPreference = selectedContactPreference();
      const recommended = planForPeople(people.value);
      if (button.dataset.booking === 'whatsapp') {
        const details = [];
        if (firstname.value.trim()) details.push('Nombre: ' + firstname.value.trim());
        if (phone.value.trim()) details.push('Teléfono: ' + phone.value.trim());
        if (email.value.trim()) details.push('Correo: ' + email.value.trim());
        if (postal.value.trim()) details.push('Código postal: ' + postal.value.trim());
        if (people.value) details.push('Personas en casa: ' + people.value);
        if (recommended.key) details.push('Plan recomendado: ' + recommended.label);
        if (installDate.value) details.push('Fecha preferida: ' + installDate.value);
        if (time.value) details.push('Horario preferido: ' + time.value);
        if (contactPreference) details.push('Contacto preferido: ' + contactPreference.value);
        if (promotion) details.push('Promoción: ' + promotion.value);
        const body = 'Hola, quiero vivir una vida más confortable. ¿Me podrían instalar mi AquosLife? Aquí les comparto mi solicitud:' + (details.length ? '\n\n' + details.join('\n') : '');
        window.open('https://wa.me/527775047256?text=' + encodeURIComponent(body), '_blank', 'noopener,noreferrer');
        if (field('zohoForm').checkValidity() && /^\d{5}$/.test(postal.value.trim())) {
          prepareZoho();
          submissionMode = 'whatsapp';
          zohoSubmitted = true;
          field('zohoForm').submit();
        }
        return;
      }
      if (!validateBooking()) return;
      prepareZoho();
      submissionMode = 'landing';
      zohoSubmitted = true;
      field('zohoForm').submit();
      trackAquosEvent('agenda_completed', { plan: recommended.key || 'Especial' });
    }));
    const now = new Date(), today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
    field('install-date').min = today;
    field('postal').addEventListener('input', e => e.target.setCustomValidity(''));
    const mxn = n => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
    function calculate() {
      const people = Number(field('people').value), jugPrice = Number(field('jug-price').value);
      if (!Number.isFinite(jugPrice) || jugPrice <= 0) return;
      const jugs = people * 2.25, plan = people <= 2 ? 'Smart' : people <= 4 ? 'Life' : 'Family', fee = { Smart: 249, Life: 299, Family: 369 }[plan];
      const current = jugs * jugPrice, difference = current - fee;
      field('jugs').textContent = jugs.toLocaleString('es-MX', { maximumFractionDigits: 1 });
      field('current-cost').textContent = mxn(current);
      field('suggested-plan').textContent = 'AquosLife ' + plan;
      field('plan-cost').textContent = mxn(fee);
      field('monthly-saving').textContent = mxn(difference);
      field('annual-saving').textContent = mxn(difference * 12);
    }
    field('people').addEventListener('change', calculate); field('jug-price').addEventListener('input', calculate); calculate();
    const serviceTrack = document.querySelector('.service-reel-track');
    const serviceDots = [...document.querySelectorAll('.service-reel-dots button')];
    let serviceIndex = 0, serviceTimer;
    const showServiceSlide = index => {
      serviceIndex = (index + serviceDots.length) % serviceDots.length;
      serviceTrack.style.transform = `translateX(-${serviceIndex * 100}%)`;
      serviceDots.forEach((dot, i) => dot.classList.toggle('active', i === serviceIndex));
    };
    if (serviceTrack && serviceDots.length) {
      serviceDots.forEach((dot, i) => dot.addEventListener('click', () => { showServiceSlide(i); window.clearInterval(serviceTimer); serviceTimer = window.setInterval(() => showServiceSlide(serviceIndex + 1), 4800) }));
      serviceTimer = window.setInterval(() => showServiceSlide(serviceIndex + 1), 4800);
    }
    const testimonialReel = document.querySelector('.testimonial-grid');
    let testimonialTimer;
    const advanceTestimonials = () => {
      if (!testimonialReel || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const card = testimonialReel.querySelector('.testimonial');
      if (!card) return;
      const step = card.getBoundingClientRect().width + 18;
      const atEnd = testimonialReel.scrollLeft + testimonialReel.clientWidth >= testimonialReel.scrollWidth - 12;
      testimonialReel.scrollTo({ left: atEnd ? 0 : testimonialReel.scrollLeft + step, behavior: 'smooth' });
    };
    if (testimonialReel) {
      testimonialTimer = window.setInterval(advanceTestimonials, 4800);
      testimonialReel.addEventListener('pointerenter', () => window.clearInterval(testimonialTimer));
      testimonialReel.addEventListener('pointerleave', () => { testimonialTimer = window.setInterval(advanceTestimonials, 4800) });
    }
    document.querySelectorAll('[data-plan]').forEach(link => link.addEventListener('click', event => {
      event.preventDefault();
      const peopleByPlan = { Smart: '2', Life: '4', Family: '6' };
      field('household-size').value = peopleByPlan[link.dataset.plan] || '';
      field('household-size').dispatchEvent(new Event('change', { bubbles: true }));
      field('agendar').scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => showSectionArrival(field('agendar')), 480);
      window.setTimeout(() => field('firstname').focus({ preventScroll: true }), 650);
    }));
    const transitionSections = [...document.querySelectorAll('main > section')];
    transitionSections.slice(1).forEach(section => section.classList.add('section-transition'));
    function showSectionArrival(target) {
      const section = target.matches('section') ? target : target.closest('section') || target;
      section.classList.remove('section-arrival');
      void section.offsetWidth;
      section.classList.add('section-arrival');
      window.setTimeout(() => section.classList.remove('section-arrival'), 1500);
    }
    document.querySelectorAll('a[href^="#"]:not([data-plan])').forEach(link => link.addEventListener('click', event => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => showSectionArrival(target), 480);
    }));
    const imageDialog = field('v3-image-dialog'), dialogImage = field('v3-dialog-image');
    document.querySelectorAll('[data-image-expand]').forEach(button => button.addEventListener('click', () => {
      dialogImage.src = button.dataset.imageExpand;
      dialogImage.alt = button.querySelector('img')?.alt || 'Imagen AquosLife ampliada';
      if (typeof imageDialog.showModal === 'function') imageDialog.showModal();
    }));
    imageDialog.querySelector('.v3-dialog-close').addEventListener('click', () => imageDialog.close());
    imageDialog.addEventListener('click', event => { if (event.target === imageDialog) imageDialog.close() });
    const techDialog = field('tech-dialog');
    const techOpen = document.querySelector('.tech-open');
    const closeTechDialog = () => {
      if (techDialog.open) techDialog.close();
      document.body.style.overflow = '';
      techOpen?.focus({ preventScroll: true });
    };
    techOpen?.addEventListener('click', () => {
      if (typeof techDialog.showModal === 'function') techDialog.showModal();
      document.body.style.overflow = 'hidden';
      trackAquosEvent('technology_opened');
    });
    document.querySelectorAll('[data-close-tech]').forEach(button => button.addEventListener('click', closeTechDialog));
    techDialog.addEventListener('click', event => { if (event.target === techDialog) closeTechDialog() });
    techDialog.addEventListener('close', () => { document.body.style.overflow = '' });
    if (new URLSearchParams(window.location.search).get('payment') === 'success') {
      trackAquosEvent('payment_method_registered');
      showSuccessModal();
    }
    const headerLogo = document.querySelector('.brand img');
    const finalLogo = document.querySelector('[data-final-logo]');
    if (headerLogo && finalLogo) { const logo = headerLogo.cloneNode(true); logo.alt = 'AquosLife'; logo.removeAttribute('loading'); finalLogo.appendChild(logo) }
    field('year').textContent = new Date().getFullYear();
  