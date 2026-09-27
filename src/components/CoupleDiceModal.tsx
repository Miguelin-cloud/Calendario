import React, { useState } from 'react';
import { WishlistPlan, CoupleConfig } from '../types/calendar';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { X, Dices, Calendar, RotateCw } from 'lucide-react';

interface CoupleDiceModalProps {
  isOpen: boolean;
  plans: WishlistPlan[];
  couple: CoupleConfig;
  lang?: Language;
  onClose: () => void;
  onSchedulePlan: (title: string, notes?: string) => void;
}

export const CoupleDiceModal: React.FC<CoupleDiceModalProps> = ({
  isOpen,
  plans,
  couple,
  lang = 'es',
  onClose,
  onSchedulePlan,
}) => {
  const t = TRANSLATIONS[lang];
  const [isRolling, setIsRolling] = useState(false);
  const [chosenIdea, setChosenIdea] = useState<{ title: string; notes?: string } | null>(null);

  if (!isOpen) return null;

  // Pool of ideas: combine pending wishlist plans + translated spontaneous list
  const pendingPlans = plans.filter((p) => !p.completed);
  const allChoices = [
    ...pendingPlans.map((p) => ({ title: p.title, notes: p.notes })),
    ...t.dice.ideas,
  ];

  const handleRoll = () => {
    if (allChoices.length === 0) return;
    setIsRolling(true);

    let counter = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * allChoices.length);
      setChosenIdea(allChoices[randomIdx]);
      counter++;
      if (counter > 12) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-lg">
              🎲
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t.dice.title}
              </h3>
              <p className="text-[11px] text-slate-500">
                {t.dice.subtitle} ({couple.partner1.name} & {couple.partner2.name})
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

        {/* Dice Arena */}
        <div className="p-6 flex flex-col items-center justify-center text-center gap-4">
          <div className="relative">
            <div
              className={`w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-xl shadow-indigo-100 transition-all cursor-pointer ${
                isRolling ? 'rotate-180 scale-110' : 'hover:scale-105 active:scale-95'
              }`}
              onClick={handleRoll}
            >
              <Dices className={`w-12 h-12 ${isRolling ? 'animate-spin' : ''}`} />
            </div>
          </div>

          <div className="min-h-[100px] flex flex-col items-center justify-center w-full">
            {chosenIdea ? (
              <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl w-full animate-in zoom-in-95 duration-150">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block mb-1">
                  {lang === 'it' ? '✨ Il destino ha scelto!' : '✨ ¡El destino ha hablado!'}
                </span>
                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  {chosenIdea.title}
                </h4>
                {chosenIdea.notes && (
                  <p className="text-xs text-slate-600 mt-1 italic">
                    {chosenIdea.notes}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500 max-w-xs">
                {lang === 'it'
                  ? 'Non sapete cosa fare oggi o nel weekend? Lanciate i dadi e lasciatevi sorprendere!'
                  : '¿No os decidís sobre qué plan hacer hoy o este fin de semana? ¡Tirad los dados y elegirá por vosotros!'}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
            <button
              onClick={handleRoll}
              disabled={isRolling}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
              <span>{isRolling ? t.dice.rolling : chosenIdea ? t.dice.againButton : t.dice.rollButton}</span>
            </button>

            {chosenIdea && (
              <button
                onClick={() => {
                  onSchedulePlan(chosenIdea.title, chosenIdea.notes);
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>{t.dice.scheduleButton}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
