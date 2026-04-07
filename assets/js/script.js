// ── Configuration (Enter your Google Apps Script Web App URL here)
const APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

function toggleMenu() {
  const m = document.getElementById('mobileMenu');
  const h = document.querySelector('.hamburger');
  m.classList.toggle('open');
  h.classList.toggle('active');
}

// ── FAQ accordion
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// ── Footer accordion
function toggleFooter(header) {
  if (window.innerWidth > 768) return;
  const col = header.closest('.footer-col');
  col.classList.toggle('open');
}

// ── Multi-step form
// ── Multi-step form
let currentStep = 1;

// Helper: Show validation error
function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  const parent = field.closest('.form-field');
  if (!parent) return;
  const errorSpan = parent.querySelector('.error-msg');
  if (message && errorSpan) errorSpan.textContent = message;
  parent.classList.add('error');
}

// Helper: Clear validation error
function clearError(field) {
  const parent = field.closest('.form-field');
  if (parent) parent.classList.remove('error');
}

// Validation Logic per step
function validateStep(step) {
  let isValid = true;
  
  if (step === 1) {
    const name = document.getElementById('fname');
    const phone = document.getElementById('phone');
    const city = document.getElementById('city');
    const emp = document.getElementById('employment');

    // Name: Min 3 letters
    if (name.value.trim().length < 3) {
      showError('fname', 'Name must be at least 3 characters.');
      isValid = false;
    }
    
    // Phone: Exactly 10 digits (ignoring spaces/dashes)
    const phoneClean = phone.value.replace(/\D/g, '');
    if (phoneClean.length < 10) {
      showError('phone', 'Please enter a valid 10-digit number.');
      isValid = false;
    }

    if (!city.value.trim()) {
      showError('city', 'Please enter your city.');
      isValid = false;
    }

    if (!emp.value) {
      showError('employment', 'Please select an employment type.');
      isValid = false;
    }
  }

  if (step === 2) {
    const lt = document.getElementById('loanType');
    const la = document.getElementById('loanAmount');
    
    if (!lt.value) { showError('loanType', 'Please select a loan type.'); isValid = false; }
    if (!la.value) { showError('loanAmount', 'Please select a loan range.'); isValid = false; }
  }

  if (step === 3) {
    const stage = document.getElementById('stage');
    const pref = document.getElementById('prefContact');
    
    if (!stage.value) { showError('stage', 'Please select your current stage.'); isValid = false; }
    if (!pref.value) { showError('prefContact', 'Please select a contact preference.'); isValid = false; }
  }

  return isValid;
}

function nextStep(from) {
  if (!validateStep(from)) {
    // Add shake effect to the button for feedback
    const btn = event.currentTarget;
    if (btn) {
      btn.classList.add('shake');
      setTimeout(() => btn.classList.remove('shake'), 400);
    }
    return;
  }
  
  document.getElementById('step' + from).classList.remove('active');
  document.getElementById('step' + (from + 1)).classList.add('active');
  document.getElementById('prog' + (from + 1)).classList.add('active');
  currentStep = from + 1;
}

function prevStep(from) {
  document.getElementById('step' + from).classList.remove('active');
  document.getElementById('step' + (from - 1)).classList.add('active');
  document.getElementById('prog' + from).classList.remove('active');
  currentStep = from - 1;
}

function submitForm(event) {
  if (event) event.preventDefault();
  
  if (!validateStep(3)) {
      const btn = document.querySelector('.btn-cta-submit');
      if (btn) {
        btn.classList.add('shake');
        setTimeout(() => btn.classList.remove('shake'), 400);
      }
      return;
  }
  
  const submitBtn = document.querySelector('.btn-cta-submit');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Submitting... <span class="spinner"></span>';
  
  // Collect all data
  const formData = {
    fname: document.getElementById('fname').value,
    phone: document.getElementById('phone').value,
    city: document.getElementById('city').value,
    employment: document.getElementById('employment').value,
    loanType: document.getElementById('loanType').value,
    loanAmount: document.getElementById('loanAmount').value,
    propType: document.getElementById('propType').value,
    stage: document.getElementById('stage').value,
    prefContact: document.getElementById('prefContact').value,
    notes: document.getElementById('notes').value,
    source: 'Lead Enquiry Modal'
  };

  // If APPS_SCRIPT_URL is not set, just show local success (for testing)
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_GOOGLE')) {
    console.warn('Apps Script URL is not configured. Redirecting to thank-you.html locally.');
    setTimeout(() => {
      window.location.href = 'thank-you.html';
    }, 1000);
    return;
  }

  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors', // standard for GAS
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
  .then(() => {
    // Redirect to Thank You page
    window.location.href = 'thank-you.html';
  })
  .catch(err => {
    console.error('Submission Error:', err);
    alert('Oops! Something went wrong. Please try again or contact us directly.');
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  });
}

// Real-time error clearing
document.addEventListener('input', (e) => {
  if (e.target.closest('.form-field.error')) {
    clearError(e.target);
  }
});
document.addEventListener('change', (e) => {
  if (e.target.closest('.form-field.error')) {
    clearError(e.target);
  }
});

function updateLeadFormAndOpenModal() {
  const amount = parseFloat(document.getElementById('loanAmt').value);
  const select = document.getElementById('loanAmount');
  
  if (amount < 2000000) select.selectedIndex = 1;
  else if (amount <= 5000000) select.selectedIndex = 2;
  else if (amount <= 10000000) select.selectedIndex = 3;
  else select.selectedIndex = 4;
  
  openModal();
}

function openModal() {
    const modal = document.getElementById('leadModal');
    
    // Reset form to Step 1
    currentStep = 1;
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step1').classList.add('active');
    
    document.querySelectorAll('.prog-step').forEach(p => p.classList.remove('active'));
    document.getElementById('prog1').classList.add('active');
    
    document.getElementById('formMain').style.display = 'block';
    document.getElementById('successState').classList.remove('show');
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('leadModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close on outside click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('leadModal');
    if (e.target === modal) closeModal();
});

// ── EMI Calculator
function formatINR(n) {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + 'Cr';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
  return '₹' + n.toLocaleString('en-IN');
}
function formatINRFull(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}
function updateSliderProgress(el) {
  const min = el.min || 0;
  const max = el.max || 100;
  const val = el.value;
  const percent = ((val - min) / (max - min)) * 100;
  el.style.setProperty('--range-progress', percent + '%');
}

function calcEMI() {
  const loanAmt = document.getElementById('loanAmt');
  const intRate = document.getElementById('intRate');
  const tenure = document.getElementById('tenure');

  const P = parseFloat(loanAmt.value);
  const r = parseFloat(intRate.value) / 12 / 100;
  const n = parseInt(tenure.value) * 12;
  const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const totalAmt = emi * n;
  const totalInt = totalAmt - P;

  // Update Result Display
  document.getElementById('emiResult').textContent = '₹' + Math.round(emi).toLocaleString('en-IN');
  document.getElementById('breakPrincipal').textContent = formatINR(P);
  document.getElementById('breakInterest').textContent = formatINRFull(totalInt);
  document.getElementById('breakTotal').textContent = formatINRFull(totalAmt);
  document.getElementById('breakTenure').textContent = tenure.value + ' Years';

  // Update Slider Visuals
  updateSliderProgress(loanAmt);
  updateSliderProgress(intRate);
  updateSliderProgress(tenure);

  const loanVal = document.getElementById('loanAmtVal');
  const rateVal = document.getElementById('intRateVal');
  const tenVal = document.getElementById('tenureVal');

  if (document.activeElement !== loanVal) loanVal.value = formatINR(P);
  if (document.activeElement !== rateVal) rateVal.value = parseFloat(intRate.value).toFixed(1) + '%';
  if (document.activeElement !== tenVal) tenVal.value = tenure.value + ' Yrs';
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const loanAmt = document.getElementById('loanAmt');
    const intRate = document.getElementById('intRate');
    const tenure = document.getElementById('tenure');

    const loanVal = document.getElementById('loanAmtVal');
    const rateVal = document.getElementById('intRateVal');
    const tenVal = document.getElementById('tenureVal');

    if (loanAmt && intRate && tenure) {
        loanAmt.addEventListener('input', calcEMI);
        intRate.addEventListener('input', calcEMI);
        tenure.addEventListener('input', calcEMI);

        // Sync text inputs back to sliders
        loanVal.addEventListener('input', (e) => {
            let v = e.target.value.replace(/[^0-9.]/g, '');
            if (v) { loanAmt.value = v; calcEMI(); }
        });
        rateVal.addEventListener('input', (e) => {
            let v = e.target.value.replace(/[^0-9.]/g, '');
            if (v) { intRate.value = v; calcEMI(); }
        });
        tenVal.addEventListener('input', (e) => {
            let v = e.target.value.replace(/[^0-9.]/g, '');
            if (v) { tenure.value = v; calcEMI(); }
        });

        // Focus/Blur formatting
        [loanVal, rateVal, tenVal].forEach(el => {
            el.addEventListener('focus', (e) => {
                const id = e.target.id;
                if (id === 'loanAmtVal') e.target.value = loanAmt.value;
                if (id === 'intRateVal') e.target.value = intRate.value;
                if (id === 'tenureVal') e.target.value = tenure.value;
            });
            el.addEventListener('blur', calcEMI);
        });

        calcEMI();
    }

    // ── Smooth nav highlight
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      sections.forEach(s => {
        const top = s.offsetTop - 100;
        const bottom = top + s.offsetHeight;
        if (scrollY >= top && scrollY < bottom) {
          document.querySelectorAll('.nav-links a').forEach(a => {
            a.style.color = a.getAttribute('href') === '#' + s.id ? 'var(--navy2)' : '';
          });
        }
      });
    });
});// ── Scroll Spy
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  
  const options = { threshold: 0.5, rootMargin: '-72px 0px 0px 0px' };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, options);
  
  sections.forEach(section => observer.observe(section));
});

// Scroll to sections on link click
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        if (!this.getAttribute('href').startsWith('#')) return;
        e.preventDefault();
        const targetId = this.getAttribute('href').slice(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const offset = 72; // Nav height
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = targetElement.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            const m = document.getElementById('mobileMenu');
            const h = document.querySelector('.hamburger');
            if (m.classList.contains('open')) {
                m.classList.remove('open');
                h.classList.remove('active');
            }
        }
    });
});

// ── Reveal Animations & Header Effects
document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for .reveal elements
  const revealOptions = { 
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px' 
  };
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Stop observing once animated
        revealObserver.unobserve(entry.target);
      }
    });
  }, revealOptions);

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Navbar background change on scroll
  const navbar = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
});
