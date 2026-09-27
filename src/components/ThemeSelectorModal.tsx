import React from 'react';
import { AppTheme } from '../types/calendar';
import { THEMES } from '../utils/themeStyles';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { X, Check, Sparkles } from 'lucide-react';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  currentTheme: AppTheme;
  lang?: Language;
  onClose: () => void;
  onSelectTheme: (theme: AppTheme) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  currentTheme,
  lang = 'es',
  onClose,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang];
  const themeList = (Object.keys(THEMES) as AppTheme[]).map((key) => THEMES[key]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg">
              ✨
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {lang === 'it' ? 'Scegli il Tema del Calendario' : 'Elige el Tema del Calendario'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {lang === 'it' ? 'Cambia stile visivo, cursori speciali e atmosfera' : 'Cambia estilo visual, cursores especiales y ambientación'}
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

        {/* Themes Grid */}
        <div className="p-5 flex flex-col gap-3.5">
          {themeList.map((item) => {
            const isSelected = currentTheme === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onSelectTheme(item.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden flex flex-col gap-2.5 ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md scale-[1.01]'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                {/* Visual Top Preview Strip */}
                <div
                  className={`h-2 -mt-4 -mx-4 mb-1 bg-gradient-to-r ${item.bannerGradient}`}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-slate-100/80 shadow-2xs">
                      {item.emoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {item.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-slate-600">
                          ({item.subtitle})
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.tagline}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                {/* Special details badge */}
                {item.id === 'bears' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-amber-900 flex items-center gap-1.5">
                    <span>🍯</span>
                    <span>{lang === 'it' ? 'Include cursore a bastone di miele & zampette d\'orso 🐾' : 'Incluye cursor de bastón de miel & patitas de oso 🐾'}</span>
                  </div>
                )}
                {item.id === 'dragons' && (
                  <div className="bg-red-950/20 border border-orange-500/30 rounded-lg px-2.5 py-1 text-[11px] font-bold text-orange-700 dark:text-orange-300 flex items-center gap-1.5">
                    <span>🔥</span>
                    <span>{lang === 'it' ? 'Include cursore con spada di fuoco fiammeggiante ⚔️🐉' : 'Incluye cursor de espada de fuego llameante ⚔️🐉'}</span>
                  </div>
                )}

                {/* Avatars preview and palette pills */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span>{lang === 'it' ? 'Avatar:' : 'Avatares:'}</span>
                    <span className="font-semibold text-slate-800">
                      Miguel {item.p1Avatar}
                    </span>
                    <span>&</span>
                    <span className="font-semibold text-slate-800">
                      Giulia {item.p2Avatar}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-2xs"
                      style={{ backgroundColor: item.primaryColor }}
                      title="Color Miguel"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-2xs"
                      style={{ backgroundColor: item.secondaryColor }}
                      title="Color Giulia"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-2xs"
                      style={{ backgroundColor: item.sharedColor }}
                      title="Color Juntos / Insieme"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{lang === 'it' ? 'Il tema si applica subito a tutta l\'app.' : 'El tema se aplica de inmediato a todo el calendario.'}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs cursor-pointer"
          >
            {lang === 'it' ? 'Fatto' : 'Listo'}
          </button>
        </div>
      </div>
    </div>
  );
};
