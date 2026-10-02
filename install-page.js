let pendingInstall = null;
const button = document.getElementById('install');
const status = document.getElementById('install-status');
addEventListener('beforeinstallprompt', event => {
  event.preventDefault(); pendingInstall = event; button.hidden = false;
});
button.addEventListener('click', async () => {
  if (!pendingInstall) return;
  const prompt = pendingInstall; pendingInstall = null; button.hidden = true;
  try {
    await prompt.prompt();
    const result = await prompt.userChoice;
    status.textContent = result.outcome === 'accepted' ? 'Solicitud aceptada. El navegador completará la instalación.' : 'Puedes instalarla más adelante desde el menú del navegador.';
  } catch { status.textContent = 'No se pudo abrir la instalación. Sigue las instrucciones de tu dispositivo.'; }
});
addEventListener('appinstalled', () => {
  pendingInstall = null; button.hidden = true; status.textContent = 'PostisPop se ha instalado.';
});
if (matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
  status.textContent = 'Estás usando PostisPop en modo aplicación.';
}
