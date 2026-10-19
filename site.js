// Contents rows: open a row (and scroll to it) when its #link is used,
// e.g. the header "Contact" button or a shared link like index.html#how
function openRow(id, scroll = true) {
  const el = id && document.getElementById(id);
  if (!el || el.tagName !== 'DETAILS') return false;
  el.open = true;
  if (scroll) el.scrollIntoView({ block: 'start' });
  return true;
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (a && openRow(a.getAttribute('href').slice(1))) { e.preventDefault(); history.replaceState(null, '', a.getAttribute('href')); }
});
openRow(location.hash.slice(1));

// When a contents row opens, bring its title to the top of the screen
document.querySelectorAll('details[name="contents"]').forEach(d => d.addEventListener('toggle', () => {
  if (d.open) requestAnimationFrame(() => d.scrollIntoView({ block: 'start', behavior: 'smooth' }));
}));

// Send the contact form in the background so visitors stay on the page
const form = document.getElementById('contactForm');
if (form) form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const note = form.querySelector('.form-note');
  const btn = form.querySelector('button[type=submit]');
  const data = new FormData(form);
  const types = data.getAll('type');
  data.delete('type');
  data.set('type', types.join(', ') || 'Not specified');
  data.set('news', data.has('news') ? 'Yes' : 'No');

  btn.disabled = true; btn.textContent = 'Sending…';
  note.hidden = false; note.textContent = 'Sending your message, this can take a few seconds…';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
  try {
    const res = await fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
      method: 'POST', body: data, headers: { Accept: 'application/json' }, signal: ctrl.signal
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || String(json.success) === 'false') throw new Error(json.message || res.status);
    note.textContent = "Thanks! We'll be in touch soon.";
    form.reset();
  } catch (err) {
    note.textContent = /activat/i.test(err.message)
      ? 'This form is waiting to be activated. Check sarah@periodexchange.com for the activation email.'
      : 'Something went wrong. Please email sarah@periodexchange.com directly.';
  } finally {
    clearTimeout(timer);
  }
  note.hidden = false;
  btn.disabled = false; btn.textContent = 'Submit';
});

document.getElementById('year').textContent = new Date().getFullYear();
