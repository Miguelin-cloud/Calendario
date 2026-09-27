import React, { useState } from 'react';
import { CoupleConfig, AppTheme, PRESET_PALETTES } from '../types/calendar';
import { getNextAnniversaryInfo } from '../utils/dateUtils';
import { THEMES } from '../utils/themeStyles';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { X, Heart, Palette, Calendar, RotateCcw, Check, Sparkles } from 'lucide-react';

interface CoupleSettingsModalProps {
  isOpen: boolean;
  couple: CoupleConfig;
  lang?: Language;
  onClose: () => void;
  onSave: (newConfig: Partial<CoupleConfig>) => void;
  onResetDemo: () => void;
}

export const CoupleSettingsModal: React.FC<CoupleSettingsModalProps> = ({
  isOpen,
  couple,
  lang = 'es',
  onClose,
  onSave,
  onResetDemo,
}) => {
  const t = TRANSLATIONS[lang];
  const [p1Name, setP1Name] = useState(couple.partner1.name);
  const [p1Color, setP1Color] = useState(couple.partner1.color);

  const [p2Name, setP2Name] = useState(couple.partner2.name);
  const [p2Color, setP2Color] = useState(couple.partner2.color);

  const [sharedColor, setSharedColor] = useState(couple.sharedColor);
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(couple.theme || 'classic');
  const [anniversaryDate, setAnniversaryDate] = useState(couple.anniversaryDate || '');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      partner1: {
        ...couple.partner1,
        name: p1Name.trim() || 'Miguel',
        color: p1Color,
      },
      partner2: {
        ...couple.partner2,
        name: p2Name.trim() || 'Giulia',
        color: p2Color,
      },
      sharedColor,
      theme: selectedTheme,
      anniversaryDate: anniversaryDate || undefined,
    });
    onClose();
  };

  const anniversaryInfo = anniversaryDate ? getNextAnniversaryInfo(anniversaryDate, lang) : null;
  const themeList = (Object.keys(THEMES) as AppTheme[]).map((key) => THEMES[key]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h3 className="text-base font-bold text-slate-900">
              {t.settingsModal.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5 max-h-[82vh] overflow-y-auto">
          {/* Theme Selector */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t.settingsModal.themeLabel}</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {themeList.map((tItem) => (
                <button
                  key={tItem.id}
                  type="button"
                  onClick={() => setSelectedTheme(tItem.id)}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    selectedTheme === tItem.id
                      ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/20 shadow-xs scale-102'
                      : 'border-slate-200 bg-white/60 hover:bg-white'
                  }`}
                >
                  <span className="text-xl">{tItem.emoji}</span>
                  <span className="text-[11px] font-bold text-slate-900 leading-tight">
                    {tItem.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-slate-500 line-clamp-1">
                    {tItem.subtitle}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Partner 1 Config */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p1Color }} />
                <span>{t.settingsModal.partner1Title}: {p1Name || 'Miguel'}</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  {t.settingsModal.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={p1Name}
                  onChange={(e) => setP1Name(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  {t.settingsModal.colorLabel}
                </label>
                <div className="flex items-center gap-1.5">
                  {PRESET_PALETTES.slice(0, 5).map((p) => (
                    <button
                      key={`p1-${p.color}`}
                      type="button"
                      onClick={() => setP1Color(p.color)}
                      className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: p.color }}
                      title={p.name}
                    >
                      {p1Color.toLowerCase() === p.color.toLowerCase() && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      )}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={p1Color}
                    onChange={(e) => setP1Color(e.target.value)}
                    className="w-6 h-6 rounded border border-slate-200 cursor-pointer"
                    title="Color personalizado"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Partner 2 Config (Giulia) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p2Color }} />
                <span>{t.settingsModal.partner2Title}: {p2Name || 'Giulia'}</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  {t.settingsModal.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={p2Name}
                  onChange={(e) => setP2Name(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  {t.settingsModal.colorLabel}
                </label>
                <div className="flex items-center gap-1.5">
                  {PRESET_PALETTES.slice(1, 6).map((p) => (
                    <button
                      key={`p2-${p.color}`}
                      type="button"
                      onClick={() => setP2Color(p.color)}
                      className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: p.color }}
                      title={p.name}
                    >
                      {p2Color.toLowerCase() === p.color.toLowerCase() && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      )}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={p2Color}
                    onChange={(e) => setP2Color(e.target.value)}
                    className="w-6 h-6 rounded border border-slate-200 cursor-pointer"
                    title="Color personalizado"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Shared Color */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                {t.settingsModal.sharedColorLabel}
              </span>
              <span className="text-[11px] text-slate-500">
                {lang === 'it' ? 'Utilizzato per eventi di entrambi' : 'Se usará cuando el evento sea de los dos'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {['#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'].map((c) => (
                <button
                  key={`shared-${c}`}
                  type="button"
                  onClick={() => setSharedColor(c)}
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: c }}
                >
                  {sharedColor.toLowerCase() === c.toLowerCase() && (
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  )}
                </button>
              ))}
              <input
                type="color"
                value={sharedColor}
                onChange={(e) => setSharedColor(e.target.value)}
                className="w-7 h-7 rounded border border-slate-200 cursor-pointer"
              />
            </div>
          </div>

          {/* Anniversary date tracker */}
          <div className="p-3.5 bg-rose-50/50 border border-rose-200/80 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>{t.settingsModal.anniversaryDateLabel}</span>
              </span>
              {anniversaryInfo && (
                <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                  {anniversaryInfo.isToday
                    ? t.anniversaryToday
                    : anniversaryInfo.isTomorrow
                    ? t.anniversaryTomorrow
                    : `${lang === 'it' ? 'Mancano' : '¡Quedan'} ${anniversaryInfo.daysRemaining} ${lang === 'it' ? 'giorni' : 'días'} (${anniversaryInfo.label})`}
                </span>
              )}
            </div>

            <input
              type="date"
              value={anniversaryDate}
              onChange={(e) => setAnniversaryDate(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 bg-white border border-rose-200 rounded-lg focus:outline-hidden focus:border-rose-500"
            />
          </div>

          {/* Reset Demo Data Button */}
          <div className="pt-1">
            {!showConfirmReset ? (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.settingsModal.restoreDefaults}</span>
              </button>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center justify-between text-xs text-amber-900">
                <span>{lang === 'it' ? 'Ripristinare gli eventi iniziali di esempio?' : '¿Restablecer calendario a los eventos de ejemplo?'}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className="font-medium text-slate-600 px-2 py-0.5 cursor-pointer"
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onResetDemo();
                      setShowConfirmReset(false);
                      onClose();
                    }}
                    className="font-bold text-red-600 px-2 py-0.5 hover:underline cursor-pointer"
                  >
                    {lang === 'it' ? 'Sì, ripristina' : 'Sí, restablecer'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Save / Cancel buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {t.settingsModal.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {t.settingsModal.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
