async function initCountdown() {
  const banner = document.getElementById('countdown-banner');
  if (!banner) return;

  let launchDate;
  try {
    const res = await fetch('/launch.json');
    const data = await res.json();
    launchDate = new Date(data.goLiveDate);
  } catch (e) {
    return; // no banner is better than a broken one
  }
  if (isNaN(launchDate.getTime())) return;

  const dateLabel = launchDate.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  function render() {
    const diff = launchDate - new Date();

    if (diff <= 0) {
      banner.textContent = "🚀 We're live!";
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    banner.textContent = `🚀 Launching ${dateLabel} — ${days}d ${hours}h ${minutes}m to go`;
  }

  render();
  banner.classList.add('visible');
  setInterval(render, 60000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCountdown);
} else {
  initCountdown();
}
