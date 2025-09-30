document.addEventListener('DOMContentLoaded', async () => {
  const guardTarget = document.querySelector('[data-requires-subscription]');
  try {
    const user = await window.Session.ensureActiveSubscription();
    if (user && guardTarget) {
      guardTarget.dataset.userEmail = user.email;
    }
  } catch (error) {
    console.error('Unable to enforce session guard', error); // eslint-disable-line no-console
  }
});
