// Guest boards are stored on this device, so never announce a cloud save.
(() => {
  const labels = {
    es: ["Guardado en la nube", "Solo en este dispositivo"],
    en: ["Saved in the cloud", "Only on this device"],
    de: ["In der Cloud gespeichert", "Nur auf diesem Gerät"],
    fr: ["Enregistré dans le cloud", "Sur cet appareil uniquement"],
    ja: ["クラウドに保存済み", "この端末のみ"],
    pt: ["Salvo na nuvem", "Só neste dispositivo"],
    it: ["Salvato nel cloud", "Solo su questo dispositivo"],
    ko: ["클라우드에 저장됨", "이 기기에만 보관"]
  };

  const update = () => {
    if (!document.querySelector(".app-header.guest-header")) return;
    const language = (document.documentElement.lang || "es").split("-")[0];
    const [cloud, local] = labels[language] || labels.es;
    document.querySelectorAll(".connection, .sr-only[role='status']").forEach(status => {
      if (status.textContent.trim() === cloud) status.textContent = local;
    });
  };

  new MutationObserver(update).observe(document.documentElement, {
    childList: true, subtree: true, characterData: true
  });
  update();
})();
