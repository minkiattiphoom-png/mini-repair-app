import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<{
    outcome: 'accepted' | 'dismissed';
  }>;

  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
  }>;
}

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      setInstallPrompt(
        event as BeforeInstallPromptEvent
      );
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      'appinstalled',
      handleAppInstalled
    );

    const standalone = window.matchMedia(
      '(display-mode: standalone)'
    ).matches;

    if (standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        'appinstalled',
        handleAppInstalled
      );
    };
  }, []);

  const install = async () => {
    if (!installPrompt) {
      return;
    }

    const result = await installPrompt.prompt();

    console.log(
      'PWA install result:',
      result.outcome
    );

    setInstallPrompt(null);
  };

  return {
    canInstall: !!installPrompt && !isInstalled,
    install,
    isInstalled,
  };
}