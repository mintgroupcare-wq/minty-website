// ============================================
// MINT GROUP PRIVATE CARE — Shared Script
// ============================================

// --- Mobile nav toggle ---
function initNav(){
  const hamburger = document.getElementById('hamburger');
  const navlinks = document.getElementById('navlinks');
  const backdrop = document.getElementById('navBackdrop');
  if(!hamburger) return;
  const close = ()=>{ navlinks.classList.remove('open'); backdrop.classList.remove('show'); };
  hamburger.addEventListener('click', ()=>{
    navlinks.classList.toggle('open');
    backdrop.classList.toggle('show');
  });
  backdrop.addEventListener('click', close);
  navlinks.querySelectorAll('a').forEach(a=>a.addEventListener('click', close));
}

// --- Scroll reveal for cards / sections ---
function initReveal(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el=>io.observe(el));
}

// --- Smooth page transitions between internal links ---
function initPageTransitions(){
  document.querySelectorAll('a[href]').forEach(a=>{
    const href = a.getAttribute('href');
    if(!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || a.target === '_blank') return;
    a.addEventListener('click', function(e){
      e.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(()=>{ window.location.href = href; }, 300);
    });
  });
}

// --- FAQ accordion ---
function initAccordion(){
  document.querySelectorAll('.accordion-head').forEach(head=>{
    head.addEventListener('click', ()=>{
      const item = head.parentElement;
      const body = item.querySelector('.accordion-body');
      const isOpen = item.classList.contains('open');
      // close all others in the same group
      item.parentElement.querySelectorAll('.accordion-item.open').forEach(other=>{
        if(other!==item){
          other.classList.remove('open');
          other.querySelector('.accordion-body').style.maxHeight = null;
        }
      });
      if(isOpen){
        item.classList.remove('open');
        body.style.maxHeight = null;
      } else {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 40 + 'px';
      }
    });
  });
}

// --- Care Cost Estimator (instant calculation) ---
const CARE_RATES = { companion:25, personal:28, dementia:30, overnight:30, livein:null };
function initEstimator(){
  const form = document.getElementById('estimatorForm');
  if(!form) return;

  function calc(){
    const days = form.querySelectorAll('.day-btn.active').length || 1;
    const arrival = document.getElementById('arrivalTime').value;
    const departure = document.getElementById('departureTime').value;
    let hours = 4;
    if(arrival && departure){
      const [ah,am] = arrival.split(':').map(Number);
      const [dh,dm] = departure.split(':').map(Number);
      let diff = (dh*60+dm) - (ah*60+am);
      if(diff>0) hours = Math.max(4, Math.round((diff/60)*10)/10);
    }
    const careLevel = document.getElementById('careLevel').value;
    const rate = CARE_RATES[careLevel] ?? 25;
    const weekendSelected = [...form.querySelectorAll('.day-btn.active')].some(b=>['Sat','Sun'].includes(b.dataset.day));
    const holiday = document.getElementById('holidayCare').value === 'Yes';
    let effectiveRate = rate + (weekendSelected?5:0) + (holiday?8:0);
    const perVisit = Math.round(hours*effectiveRate);
    const weekly = perVisit*days;
    const monthly = Math.round(weekly*4.33);

    document.getElementById('estSelectedDays').textContent = days;
    document.getElementById('estHours').textContent = hours;
    document.getElementById('estRate').textContent = '$'+effectiveRate;
    document.getElementById('estPerVisit').textContent = '$'+perVisit;
    document.getElementById('estWeekly').textContent = '$'+weekly;
    document.getElementById('estMonthly').textContent = '$'+monthly;
    document.getElementById('estBigNumber').textContent = '$'+weekly+'/week';
  }

  form.querySelectorAll('.day-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{ btn.classList.toggle('active'); calc(); });
  });
  form.querySelectorAll('input,select').forEach(el=> el.addEventListener('input', calc));
  form.querySelectorAll('.service-check').forEach(el=> el.addEventListener('change', calc));
  calc();
}

// --- Netlify Forms submission handler (works once deployed to Netlify) ---
function handleFormSubmit(event, form){
  event.preventDefault();
  const formData = new FormData(form);
  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(formData).toString()
  }).then(() => {
    form.style.display = 'none';
    const successId = form.dataset.successTarget;
    if(successId){ document.getElementById(successId).style.display = 'block'; }
    window.scrollTo(0,0);
  }).catch(() => {
    alert('There was a problem submitting the form. Please try again, or reach us directly by phone.');
  });
  return false;
}

document.addEventListener('DOMContentLoaded', ()=>{
  initNav();
  initReveal();
  initPageTransitions();
  initAccordion();
  initEstimator();
});
