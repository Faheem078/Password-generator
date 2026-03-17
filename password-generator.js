const CHARS = {
  lower:   'abcdefghijklmnopqrstuvwxyz',
  upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

const opts = { lower: true, upper: true, numbers: true, symbols: false };
let currentPassword = '';

function toggleOpt(key) {
  const active = Object.values(opts).filter(Boolean).length;
  if (opts[key] && active === 1) return; // keep at least one
  opts[key] = !opts[key];
  document.getElementById('opt-' + key).classList.toggle('active', opts[key]);
}

function updateLength() {
  document.getElementById('lengthVal').textContent = document.getElementById('lengthSlider').value;
}

function generate() {
  const length = parseInt(document.getElementById('lengthSlider').value);
  let pool = '';
  const guaranteed = [];

  for (const [key, val] of Object.entries(opts)) {
    if (val) {
      pool += CHARS[key];
      guaranteed.push(CHARS[key][Math.floor(Math.random() * CHARS[key].length)]);
    }
  }

  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  let pwd = guaranteed.map((c, i) => c);
  for (let i = guaranteed.length; i < length; i++) {
    pwd.push(pool[arr[i] % pool.length]);
  }
  // shuffle
  for (let i = pwd.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
  }
  currentPassword = pwd.join('');

  const el = document.getElementById('output');
  el.textContent = currentPassword;
  el.classList.add('has-pass');
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');

  updateStrength(currentPassword, pool.length);
}

function updateStrength(pwd, poolSize) {
  const len = pwd.length;
  const entropy = len * Math.log2(poolSize);
  let level = 0;
  let label = '';
  let cls = '';

  if (entropy < 40)      { level = 1; label = 'Weak';   cls = 'weak'; }
  else if (entropy < 60) { level = 2; label = 'Fair';   cls = 'fair'; }
  else if (entropy < 80) { level = 3; label = 'Good';   cls = 'good'; }
  else                   { level = 4; label = 'Strong'; cls = 'strong'; }

  ['b1','b2','b3','b4'].forEach((id, i) => {
    const bar = document.getElementById(id);
    bar.className = 'bar';
    if (i < level) bar.classList.add('active-' + cls);
  });

  const st = document.getElementById('strengthText');
  st.textContent = label;
  st.className = 'strength-text ' + cls;
}

function copyPassword() {
  if (!currentPassword) return;
  navigator.clipboard.writeText(currentPassword).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.classList.add('copied');
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    showToast();
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = `<svg id="copyIcon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
    }, 2000);
  });
}

function showToast() {
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

// Slider fill
const slider = document.getElementById('lengthSlider');
slider.addEventListener('input', function() {
  const pct = (this.value - this.min) / (this.max - this.min) * 100;
  this.style.background = `linear-gradient(90deg, var(--accent) ${pct}%, var(--border) ${pct}%)`;
  updateLength();
});
slider.dispatchEvent(new Event('input'));

// Generate on load
generate();
