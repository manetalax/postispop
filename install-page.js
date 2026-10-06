(() => {
  const button = document.getElementById('install');
  const status = document.getElementById('install-status');
  if (!button || !status) return;

  const messages = {
    es: {
      accepted: 'Solicitud aceptada. El navegador completará la instalación.',
      dismissed: 'Puedes instalarla más adelante desde el menú del navegador.',
      error: 'No se pudo abrir la instalación. Sigue las instrucciones de tu dispositivo.',
      installed: 'PostisPop se ha instalado.',
      standalone: 'Estás usando PostisPop en modo aplicación.',
    },
    en: {
      accepted: 'Request accepted. Your browser will complete the installation.',
      dismissed: 'You can install it later from your browser menu.',
      error: 'Installation could not be opened. Follow the instructions for your device.',
      installed: 'PostisPop has been installed.',
      standalone: 'You are using PostisPop in app mode.',
    },
    de: {
      accepted: 'Anfrage angenommen. Der Browser schließt die Installation ab.',
      dismissed: 'Du kannst die App später über das Browsermenü installieren.',
      error: 'Die Installation konnte nicht geöffnet werden. Folge der Anleitung für dein Gerät.',
      installed: 'PostisPop wurde installiert.',
      standalone: 'Du verwendest PostisPop im App-Modus.',
    },
    fr: {
      accepted: 'Demande acceptée. Le navigateur terminera l’installation.',
      dismissed: 'Tu pourras l’installer plus tard depuis le menu du navigateur.',
      error: 'Impossible d’ouvrir l’installation. Suis les instructions pour ton appareil.',
      installed: 'PostisPop a été installé.',
      standalone: 'Tu utilises PostisPop en mode application.',
    },
    ja: {
      accepted: 'リクエストが受け付けられました。ブラウザがインストールを完了します。',
      dismissed: '後でブラウザのメニューからインストールできます。',
      error: 'インストールを開始できませんでした。お使いの端末向けの手順に従ってください。',
      installed: 'PostisPopがインストールされました。',
      standalone: 'PostisPopをアプリモードで使用しています。',
    },
    pt: {
      accepted: 'Solicitação aceita. O navegador concluirá a instalação.',
      dismissed: 'Você pode instalar mais tarde pelo menu do navegador.',
      error: 'Não foi possível abrir a instalação. Siga as instruções para o seu dispositivo.',
      installed: 'O PostisPop foi instalado.',
      standalone: 'Você está usando o PostisPop no modo aplicativo.',
    },
    it: {
      accepted: 'Richiesta accettata. Il browser completerà l’installazione.',
      dismissed: 'Puoi installarla in seguito dal menu del browser.',
      error: 'Impossibile avviare l’installazione. Segui le istruzioni per il tuo dispositivo.',
      installed: 'PostisPop è stato installato.',
      standalone: 'Stai usando PostisPop in modalità app.',
    },
    ko: {
      accepted: '요청이 수락되었습니다. 브라우저가 설치를 완료합니다.',
      dismissed: '나중에 브라우저 메뉴에서 설치할 수 있습니다.',
      error: '설치를 시작하지 못했습니다. 기기에 맞는 안내를 따라 주세요.',
      installed: 'PostisPop이 설치되었습니다.',
      standalone: 'PostisPop을 앱 모드로 사용 중입니다.',
    },
  };
  const documentLanguage = document.documentElement.lang;
  const supportedLanguage = Object.hasOwn(messages, documentLanguage);
  const text = messages[supportedLanguage ? documentLanguage : 'es'];
  let pendingInstall = null;
  let installed = false;

  addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    if (installed) return;
    pendingInstall = event;
    button.hidden = false;
  });
  button.addEventListener('click', async () => {
    if (!pendingInstall) return;
    const prompt = pendingInstall;
    pendingInstall = null;
    button.hidden = true;
    // Remember only an explicitly selected installation language for app startup.
    if (supportedLanguage) {
      try { localStorage.setItem('pp:lang', documentLanguage); } catch {}
    }
    try {
      await prompt.prompt();
      const result = await prompt.userChoice;
      if (!installed) status.textContent = result.outcome === 'accepted' ? text.accepted : text.dismissed;
    } catch {
      if (!installed) status.textContent = text.error;
    }
  });
  addEventListener('appinstalled', () => {
    installed = true;
    pendingInstall = null;
    button.hidden = true;
    status.textContent = text.installed;
  });
  if (matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
    installed = true;
    button.hidden = true;
    status.textContent = text.standalone;
  }
})();
