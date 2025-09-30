async function fetchSession() {
  const response = await fetch('/api/auth/me', {
    credentials: 'include',
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.user;
}

async function ensureAuthenticated() {
  const user = await fetchSession();
  if (!user) {
    window.location.href = '/login.html';
    return null;
  }
  return user;
}

async function ensureActiveSubscription() {
  const user = await ensureAuthenticated();
  if (!user) {
    return null;
  }
  if (user.subscription_status !== 'active') {
    window.location.href = '/subscribe.html';
    return null;
  }
  return user;
}

window.Session = {
  fetchSession,
  ensureAuthenticated,
  ensureActiveSubscription,
};
