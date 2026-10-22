/* =========================================================
   ICCOM — scripts du site
   ========================================================= */
(function () {
  'use strict';

  var WHATSAPP = '23561053017';
  var EMAIL = 'iccomafrique@gmail.com';

  var PRODUITS = {
    agro: 'Produits agricoles & d\'élevage (export)',
    petrole: 'Produits pétroliers (Diesel / Essence)',
    tubes: 'Tubes de cuvelage & production (Casing/Tubing)',
    manchons: 'Manchons & tuyauterie pétrolière',
    electrique: 'Matériel électrique industriel',
    logistique: 'Logistique, transit & transport routier',
    ingenierie: "Services d'ingénierie & maintenance"
  };

  /* ---------- Apparition au scroll ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Accueil : sélecteur de division ---------- */
  function initDivisions() {
    var wrap = document.getElementById('division-pills');
    if (!wrap) return;
    var go = document.getElementById('division-go');
    var buttons = wrap.querySelectorAll('.division-btn');

    function select(btn) {
      buttons.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
        b.querySelector('i').className = 'bi bi-circle';
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      btn.querySelector('i').className = 'bi bi-check-circle-fill';
      if (go) go.setAttribute('href', 'contact.html?produit=' + encodeURIComponent(btn.dataset.produit) + '#formulaire');
    }
    buttons.forEach(function (b) { b.addEventListener('click', function () { select(b); }); });
    if (buttons.length) select(buttons[0]);
  }

  /* ---------- Produits : filtres ---------- */
  function initFilters() {
    var bar = document.getElementById('filter-bar');
    if (!bar) return;
    var items = document.querySelectorAll('[data-cat]');
    var buttons = bar.querySelectorAll('.filter-btn');
    var empty = document.getElementById('filter-empty');

    function apply(cat) {
      var shown = 0;
      items.forEach(function (it) {
        var ok = cat === 'tous' || it.dataset.cat === cat;
        it.hidden = !ok;
        if (ok) shown++;
      });
      buttons.forEach(function (b) {
        var on = b.dataset.filter === cat;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (empty) empty.hidden = shown !== 0;
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        apply(b.dataset.filter);
        history.replaceState(null, '', b.dataset.filter === 'tous' ? location.pathname : '#' + b.dataset.filter);
      });
    });
    var hash = location.hash.replace('#', '');
    if (['petrole', 'forage', 'electrique'].indexOf(hash) > -1) {
      apply(hash);
      setTimeout(function () { bar.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
    } else { apply('tous'); }
  }

  /* ---------- Logistique : simulateur ---------- */
  function initSimulator() {
    var origin = document.getElementById('sim-origin');
    var goods = document.getElementById('sim-goods');
    if (!origin || !goods) return;
    var delay = document.getElementById('sim-delay');
    var regime = document.getElementById('sim-regime');
    var link = document.getElementById('sim-link');

    function update() {
      var interne = origin.value === 'interieur';
      delay.textContent = interne ? 'Communiqué sur devis' : '12 à 15 jours';
      regime.textContent = interne ? 'Circulation intérieure' : 'Transit CEMAC D15';
      var params = new URLSearchParams({
        produit: 'logistique',
        origine: origin.options[origin.selectedIndex].text,
        marchandise: goods.options[goods.selectedIndex].text
      });
      link.setAttribute('href', 'contact.html?' + params.toString() + '#formulaire');
    }
    origin.addEventListener('change', update);
    goods.addEventListener('change', update);
    update();
  }

  /* ---------- Contact : formulaire ---------- */
  function initContactForm() {
    var form = document.getElementById('devis-form');
    if (!form) return;
    var params = new URLSearchParams(location.search);
    var select = document.getElementById('f-produit');
    var message = document.getElementById('f-message');

    if (params.get('produit') && PRODUITS[params.get('produit')]) {
      select.value = PRODUITS[params.get('produit')];
    }
    if (params.get('origine') && params.get('marchandise')) {
      message.value = 'Demande d’estimation de transport.\nOrigine : ' + params.get('origine') +
        '\nMarchandise : ' + params.get('marchandise') + '\nPrécisions : ';
    }

    var panel = document.getElementById('result-panel');
    var wa = document.getElementById('send-wa');
    var mail = document.getElementById('send-mail');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        var first = form.querySelector(':invalid');
        if (first) first.focus();
        return;
      }
      var d = new FormData(form);
      var lignes = [
        'Demande de devis — ICCOM',
        '',
        'Nom : ' + d.get('nom'),
        'Entreprise : ' + d.get('entreprise'),
        'E-mail : ' + d.get('email'),
        'Téléphone / WhatsApp : ' + d.get('telephone'),
        'Produit / service : ' + d.get('produit'),
        'Quantité / volume : ' + (d.get('quantite') || 'non précisé'),
        '',
        'Besoin :',
        d.get('message') || '—'
      ];
      var texte = lignes.join('\n');
      wa.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texte);
      mail.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Demande de devis — ' + d.get('produit')) +
        '&body=' + encodeURIComponent(texte);
      panel.classList.add('show');
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    form.addEventListener('reset', function () {
      form.classList.remove('was-validated');
      panel.classList.remove('show');
    });
  }

  /* ---------- Fermer le menu mobile après un clic ---------- */
  function initOffcanvas() {
    var oc = document.getElementById('menuMobile');
    if (!oc || !window.bootstrap) return;
    oc.querySelectorAll('a.nav-link').forEach(function (a) {
      a.addEventListener('click', function () {
        var inst = bootstrap.Offcanvas.getInstance(oc);
        if (inst) inst.hide();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initReveal();
    initDivisions();
    initFilters();
    initSimulator();
    initContactForm();
    initOffcanvas();
  });
})();
