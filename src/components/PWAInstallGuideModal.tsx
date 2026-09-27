import React, { useState } from 'react';
import {
  X,
  Download,
} from 'lucide-react';
import { Language } from '../utils/i18n';

interface PWAInstallGuideModalProps {
  isOpen: boolean;
  isInstallable: boolean;
  lang?: Language;
  onClose: () => void;
  onDirectInstall: () => void;
}

export const PWAInstallGuideModal: React.FC<PWAInstallGuideModalProps> = ({
  isOpen,
  isInstallable,
  lang = 'es',
  onClose,
  onDirectInstall,
}) => {
  const [tab, setTab] = useState<'ios' | 'android' | 'desktop'>('ios');

  if (!isOpen) return null;

  const isIt = lang === 'it';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {isIt ? 'Installa Icona sullo Schermo' : 'Instalar Icono en Pantalla'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isIt ? 'Accesso rapido da smartphone o computer' : 'Acceso directo desde móvil y ordenador'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Switcher Tabs */}
        <div className="grid grid-cols-3 p-1.5 bg-slate-100 mx-5 mt-4 rounded-xl text-xs font-semibold text-center">
          <button
            onClick={() => setTab('ios')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              tab === 'ios'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            iPhone / iPad
          </button>
          <button
            onClick={() => setTab('android')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              tab === 'android'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Android
          </button>
          <button
            onClick={() => setTab('desktop')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              tab === 'desktop'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {isIt ? 'Computer' : 'Ordenador'}
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4 text-xs">
          {/* iOS Safari Guide */}
          {tab === 'ios' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <div className="font-semibold text-slate-800">
                    {isIt ? 'Apri in Safari' : 'Abre esta web en Safari'}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {isIt
                      ? 'Tocca il pulsante Condividi (quadrato con freccia verso l\'alto) in basso.'
                      : 'Pulsa el botón Compartir (icono del cuadrado con flecha hacia arriba) en la barra inferior.'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <div className="font-semibold text-slate-800">
                    {isIt ? 'Aggiungi a schermata Home' : 'Añadir a pantalla de inicio'}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {isIt
                      ? 'Scorri il menu e tocca "Aggiungi a schermata Home".'
                      : 'Desliza un poco hacia abajo en el menú y selecciona "Añadir a pantalla de inicio".'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  <div className="font-semibold text-slate-800">
                    {isIt ? 'Conferma e tocca "Aggiungi"' : 'Confirma y pulsa "Añadir"'}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {isIt
                      ? 'Fatto! L\'icona di DuoCalendar sarà tra le tue app a schermo intero.'
                      : '¡Listo! Se creará el icono de DuoCalendar junto a tus aplicaciones con pantalla completa.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Android Guide */}
          {tab === 'android' && (
            <div className="flex flex-col gap-3">
              {isInstallable && (
                <button
                  onClick={() => {
                    onDirectInstall();
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isIt ? 'Installa App ora con 1 tocco' : 'Instalar App ahora con 1 toque'}</span>
                </button>
              )}

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <div className="font-semibold text-slate-800">
                    {isIt ? 'Menu del browser Chrome' : 'Menú de Chrome o navegador'}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {isIt ? 'Tocca i 3 puntini (⋮) in alto a destra.' : 'Pulsa en los 3 puntos (⋮) en la esquina superior derecha.'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <div className="font-semibold text-slate-800">
                    {isIt ? 'Installa applicazione' : 'Instalar aplicación'}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {isIt
                      ? 'Tocca "Installa applicazione" o "Aggiungi a schermata Home".'
                      : 'Toca en "Instalar aplicación" o "Añadir a pantalla de inicio".'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Guide */}
          {tab === 'desktop' && (
            <div className="flex flex-col gap-3">
              {isInstallable && (
                <button
                  onClick={() => {
                    onDirectInstall();
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isIt ? 'Installa su questo computer' : 'Instalar en este ordenador'}</span>
                </button>
              )}

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col gap-2">
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  {isIt
                    ? 'In Chrome, Edge o browser compatibili, cerca l\'icona Installa nella barra degli indirizzi o apri il menu ⋮ e tocca "Installa DuoCalendar".'
                    : 'En Chrome, Edge o navegadores compatibles, busca el icono de Instalar en la barra de direcciones o abre el menú ⋮ y pulsa "Instalar DuoCalendar".'}
                </p>
                <p className="text-slate-500 text-[11px]">
                  {isIt
                    ? 'Si aprirà come un\'app nativa sul tuo desktop senza barre del browser.'
                    : 'Se abrirá en su propia ventana sin barras del navegador, como una app nativa en tu escritorio o barra de tareas.'}
                </p>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              {isIt ? 'Ho capito' : 'Entendido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
