function setAlert(message, type = 'error') {
  const alert = document.querySelector('[data-alert]');
  if (!alert) return;
  alert.textContent = message;
  alert.classList.remove('success');
  if (type === 'success') {
    alert.classList.add('success');
  }
  alert.hidden = false;
}

async function submitForm(event, endpoint) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);

  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Une erreur est survenue.' }));
      setAlert(error.message || 'Une erreur est survenue.');
      return;
    }

    const data = await response.json();
    setAlert('Connexion réussie! Redirection...', 'success');
    setTimeout(() => {
      window.location.href = payload.redirectTo || '/modules/introduction';
    }, 600);
    return data;
  } catch (error) {
    console.error('Form submission failed', error); // eslint-disable-line no-console
    setAlert("Impossible d'envoyer le formulaire.");
    return null;
  }
}

function initializeAuthForms() {
  const loginForm = document.querySelector('[data-login-form]');
  const signupForm = document.querySelector('[data-signup-form]');

  if (loginForm) {
    loginForm.addEventListener('submit', (event) => submitForm(event, '/api/auth/login'));
  }

  if (signupForm) {
    signupForm.addEventListener('submit', (event) => submitForm(event, '/api/auth/signup'));
  }
}

document.addEventListener('DOMContentLoaded', initializeAuthForms);
