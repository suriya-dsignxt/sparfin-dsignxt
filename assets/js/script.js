// ── Mobile menu
function toggleMenu() {
  const m = document.getElementById('mobileMenu');
  m.classList.toggle('open');
}

// ── FAQ accordion
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// ── Multi-step form
let currentStep = 1;
function nextStep(from) {
  if (from === 1) {
    const name = document.getElementById('fname').value;
    const phone = document.getElementById('phone').value;
    const emp = document.getElementById('employment').value;
    if (!name.trim() || !phone.trim() || !emp) { alert('Please fill in all required fields.'); return; }
  }
  if (from === 2) {
    const lt = document.getElementById('loanType').value;
    const la = document.getElementById('loanAmount').value;
    if (!lt || !la) { alert('Please select a loan type and approximate amount.'); return; }
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
function submitForm() {
  const stage = document.getElementById('stage').value;
  const pref = document.getElementById('prefContact').value;
  if (!stage || !pref) { alert('Please select your current stage and contact preference.'); return; }
  
  document.getElementById('formMain').style.display = 'none';
  document.getElementById('successState').classList.add('show');
}

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
function calcEMI() {
  const P = parseFloat(document.getElementById('loanAmt').value);
  const r = parseFloat(document.getElementById('intRate').value) / 12 / 100;
  const n = parseInt(document.getElementById('tenure').value) * 12;
  const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const totalAmt = emi * n;
  const totalInt = totalAmt - P;
  document.getElementById('emiResult').textContent = '₹' + Math.round(emi).toLocaleString('en-IN');
  document.getElementById('breakPrincipal').textContent = formatINR(P);
  document.getElementById('breakInterest').textContent = formatINRFull(totalInt);
  document.getElementById('breakTotal').textContent = formatINRFull(totalAmt);
  document.getElementById('breakTenure').textContent = document.getElementById('tenure').value + ' Years';

  const loanVal = document.getElementById('loanAmtVal');
  const rateVal = document.getElementById('intRateVal');
  const tenVal = document.getElementById('tenureVal');

  if (document.activeElement !== loanVal) loanVal.value = formatINR(P);
  if (document.activeElement !== rateVal) rateVal.value = parseFloat(document.getElementById('intRate').value).toFixed(1) + '%';
  if (document.activeElement !== tenVal) tenVal.value = document.getElementById('tenure').value + ' Yrs';
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
});
