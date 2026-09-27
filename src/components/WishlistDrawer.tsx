import React, { useState } from 'react';
import { WishlistPlan, CoupleConfig } from '../types/calendar';
import { Language, TRANSLATIONS } from '../utils/i18n';
import {
  X,
  Plus,
  Sparkles,
  Calendar,
  CheckCircle2,
  Circle,
  Trash2,
  Utensils,
  Plane,
  Film,
  Compass,
  Coffee,
} from 'lucide-react';

interface WishlistDrawerProps {
  isOpen: boolean;
  plans: WishlistPlan[];
  couple: CoupleConfig;
  currentPartnerId: 'partner1' | 'partner2';
  lang?: Language;
  onClose: () => void;
  onSavePlan: (planData: Partial<WishlistPlan> & { title: string }) => void;
  onDeletePlan: (id: string) => void;
  onSchedulePlan: (plan: WishlistPlan) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  plans,
  couple,
  currentPartnerId,
  lang = 'es',
  onClose,
  onSavePlan,
  onDeletePlan,
  onSchedulePlan,
}) => {
  const t = TRANSLATIONS[lang];
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newCategory, setNewCategory] = useState<WishlistPlan['category']>('dinner');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onSavePlan({
      title: newTitle.trim(),
      notes: newNotes.trim() || undefined,
      category: newCategory,
      suggestedBy: currentPartnerId,
      completed: false,
    });

    setNewTitle('');
    setNewNotes('');
    setIsAdding(false);
  };

  const getCategoryIcon = (category: WishlistPlan['category']) => {
    switch (category) {
      case 'dinner':
        return <Utensils className="w-3.5 h-3.5 text-amber-500" />;
      case 'trip':
        return <Plane className="w-3.5 h-3.5 text-blue-500" />;
      case 'movie':
        return <Film className="w-3.5 h-3.5 text-purple-500" />;
      case 'activity':
        return <Compass className="w-3.5 h-3.5 text-emerald-500" />;
      case 'relax':
        return <Coffee className="w-3.5 h-3.5 text-rose-500" />;
    }
  };

  const pendingPlans = plans.filter((p) => !p.completed);
  const completedPlans = plans.filter((p) => p.completed);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t.wishlist.title}
              </h3>
              <p className="text-[11px] text-slate-500">
                {t.wishlist.subtitle}
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

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
          {/* Quick Add CTA or Form */}
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.wishlist.addNewIdea}</span>
            </button>
          ) : (
            <form
              onSubmit={handleAdd}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2.5"
            >
              <div className="text-xs font-bold text-slate-800">
                {lang === 'it' ? 'Nuova proposta di appuntamento o piano' : 'Nueva propuesta de plan o cita'}
              </div>
              <input
                type="text"
                required
                autoFocus
                placeholder={t.wishlist.ideaPlaceholder}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
              />
              <input
                type="text"
                placeholder={t.wishlist.notesPlaceholder}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
              />

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 text-[11px] font-medium mr-1">{t.wishlist.categorySelect}:</span>
                {(['dinner', 'trip', 'activity', 'movie', 'relax'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewCategory(cat)}
                    className={`px-2 py-1 rounded text-[11px] font-medium capitalize transition-colors cursor-pointer ${
                      newCategory === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat === 'dinner'
                      ? (lang === 'it' ? 'Cena' : 'Cena')
                      : cat === 'trip'
                      ? (lang === 'it' ? 'Viaggio' : 'Viaje')
                      : cat === 'activity'
                      ? (lang === 'it' ? 'Attività' : 'Actividad')
                      : cat === 'movie'
                      ? (lang === 'it' ? 'Cinema' : 'Cine')
                      : (lang === 'it' ? 'Relax' : 'Relax')}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-md cursor-pointer"
                >
                  {t.wishlist.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-2xs cursor-pointer"
                >
                  {t.wishlist.saveIdea}
                </button>
              </div>
            </form>
          )}

          {/* Pending list */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.wishlist.pendingSection} ({pendingPlans.length})
            </span>

            {pendingPlans.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                {lang === 'it'
                  ? 'Nessun piano in sospeso. Proponete qualcosa di bello da fare insieme!'
                  : 'No hay planes pendientes. ¡Proponed algo chulo para hacer juntos!'}
              </p>
            ) : (
              pendingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <button
                        onClick={() =>
                          onSavePlan({ ...plan, completed: true })
                        }
                        className="text-slate-300 hover:text-emerald-500 transition-colors mt-0.5 cursor-pointer"
                        title={lang === 'it' ? 'Segna come fatto' : 'Marcar como hecho'}
                      >
                        <Circle className="w-4 h-4" />
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {getCategoryIcon(plan.category)}
                          <span className="text-xs font-bold text-slate-900 leading-snug">
                            {plan.title}
                          </span>
                        </div>
                        {plan.notes && (
                          <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                            {plan.notes}
                          </p>
                        )}
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {lang === 'it' ? 'Suggerito da' : 'Sugerido por'}{' '}
                          {plan.suggestedBy === 'partner1'
                            ? couple.partner1.name
                            : couple.partner2.name}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeletePlan(plan.id)}
                      className="text-slate-300 hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                      title={lang === 'it' ? 'Elimina' : 'Eliminar'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Agendar en el calendario button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => {
                        onSchedulePlan(plan);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{t.wishlist.scheduleInCalendar}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Completed list */}
          {completedPlans.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t.wishlist.completedSection} ({completedPlans.length})
              </span>
              {completedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between gap-2 opacity-75"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={() =>
                        onSavePlan({ ...plan, completed: false })
                      }
                      className="text-emerald-500 hover:text-slate-400 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-slate-600 line-through truncate">
                      {plan.title}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeletePlan(plan.id)}
                    className="text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
