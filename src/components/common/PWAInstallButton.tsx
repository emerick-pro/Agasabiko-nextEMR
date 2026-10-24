import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white px-2.5 py-1.5 text-xs font-semibold shadow-xs transition cursor-pointer"
        title="Installer l'application hors-ligne sur votre appareil"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Installer l'application</span>
        <span className="sm:hidden">Installer</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-cyan-300 dark:border-cyan-700 bg-cyan-50 text-cyan-800 px-2.5 py-1.5 text-xs font-medium hover:bg-cyan-100 transition cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Installer PWA</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">Installer AMAGARAInfo sur iOS</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                1. Appuyez sur le bouton <strong>Partager</strong> dans la barre d'outils Safari.<br />
                2. Faites défiler vers le bas et sélectionnez <strong>Sur l'écran d'accueil</strong>.<br />
                3. L'application fonctionnera alors 100% hors-ligne sur le terrain.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-slate-100 py-2 text-xs font-medium text-slate-800 hover:bg-slate-200 cursor-pointer"
              >
                Compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
