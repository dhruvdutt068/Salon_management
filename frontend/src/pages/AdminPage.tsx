import React, { useState } from 'react';
import { useLanguageStore } from '../store/useLanguageStore';
import { useQueueStore } from '../store/useQueueStore';
import type { Service } from '../types';
import {
  Settings,
  ToggleLeft,
  ToggleRight,
  BarChart3,
  Users,
  Clock,
  AlertOctagon,
  DollarSign,
  Scissors,
  CheckCircle2,
  Coffee,
  Edit2,
  X,
  Check,
  Power,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { t, language } = useLanguageStore();
  const {
    isQueueOpen,
    toggleQueueOpen,
    services,
    toggleServiceActive,
    updateServicePriceAndDuration,
    barbers,
    toggleBarberOnDuty,
    getTodayStats,
  } = useQueueStore();

  const stats = getTodayStats();

  // Service Edit Modal
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editDuration, setEditDuration] = useState<number>(30);
  const [editPrice, setEditPrice] = useState<number>(150);

  const handleOpenEdit = (s: Service) => {
    setEditingService(s);
    setEditDuration(s.durationMinutes);
    setEditPrice(s.price);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateServicePriceAndDuration(editingService.id, Number(editDuration), Number(editPrice));
      setEditingService(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full py-4 sm:py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-700/60 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D4A017] text-gray-950 flex items-center justify-center font-black shadow-md shadow-[#D4A017]/20">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t('adminTitle')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">{t('adminDesc')}</p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-[#D4A017] border border-[#D4A017]/30">
          Owner Control Center
        </span>
      </div>

      {/* Master Switch: Online Queue Open/Close */}
      <div className="bg-[#111827] rounded-3xl border-2 border-gray-700/70 p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center space-x-2">
            <Power className={`w-5 h-5 ${isQueueOpen ? 'text-emerald-400' : 'text-rose-400'}`} />
            <h2 className="text-lg font-bold text-white">{t('queueControlTitle')}</h2>
          </div>
          <p className={`text-sm font-extrabold ${isQueueOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isQueueOpen ? t('queueOpen') : t('queueClosed')}
          </p>
          <p className="text-xs text-gray-400">{t('onlineQueueDesc')}</p>
        </div>

        <button
          type="button"
          onClick={toggleQueueOpen}
          className={`inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-2xl font-black text-sm transition-all min-h-[50px] shadow-lg cursor-pointer ${
            isQueueOpen
              ? 'bg-emerald-500 text-gray-950 hover:bg-emerald-400 shadow-emerald-950/40'
              : 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-950/40'
          }`}
        >
          {isQueueOpen ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
          <span>{isQueueOpen ? 'Queue is OPEN' : 'Queue is CLOSED'}</span>
        </button>
      </div>

      {/* Today's Operational Statistics (5 Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-widest text-[#D4A017] font-black flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            {t('todayStatsTitle')}
          </h2>
          <span className="text-xs text-gray-400 font-mono">Live Counters</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {/* Served */}
          <div className="bg-[#111827] rounded-3xl border border-gray-700/60 p-5 space-y-1 shadow-lg">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.served}</p>
            <p className="text-xs text-gray-400 font-medium">{t('statServed')}</p>
          </div>

          {/* Average Wait */}
          <div className="bg-[#111827] rounded-3xl border border-gray-700/60 p-5 space-y-1 shadow-lg">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-[#D4A017] flex items-center justify-center mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-[#D4A017] font-mono">
              ~{stats.avgWait}m
            </p>
            <p className="text-xs text-gray-400 font-medium">{t('statAvgWait')}</p>
          </div>

          {/* In Queue */}
          <div className="bg-[#111827] rounded-3xl border border-gray-700/60 p-5 space-y-1 shadow-lg">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.activeQueue}</p>
            <p className="text-xs text-gray-400 font-medium">{t('activeQueueStat')}</p>
          </div>

          {/* No-Shows */}
          <div className="bg-[#111827] rounded-3xl border border-gray-700/60 p-5 space-y-1 shadow-lg">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-2">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.noShows}</p>
            <p className="text-xs text-gray-400 font-medium">{t('statNoShows')}</p>
          </div>

          {/* Revenue */}
          <div className="col-span-2 lg:col-span-1 bg-[#111827] rounded-3xl border border-amber-500/30 p-5 space-y-1 shadow-lg">
            <div className="w-9 h-9 rounded-xl bg-[#D4A017]/20 text-[#D4A017] flex items-center justify-center mb-2">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-[#D4A017] font-mono">
              ₹{stats.revenue}
            </p>
            <p className="text-xs text-gray-400 font-medium">{t('revenueStat')}</p>
          </div>
        </div>
      </div>

      {/* Services Management Section */}
      <div className="bg-[#111827] rounded-3xl border border-gray-700/60 p-6 sm:p-7 space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center">
              <Scissors className="w-5 h-5 mr-2 text-[#D4A017]" />
              {t('manageServicesTitle')}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{t('manageServicesDesc')}</p>
          </div>
          <span className="text-xs text-gray-400">
            {services.filter((s) => s.isActive).length} / {services.length} Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {services.map((service) => (
            <div
              key={service.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                service.isActive
                  ? 'bg-gray-800/70 border-gray-700/80 hover:border-gray-600'
                  : 'bg-gray-900/40 border-gray-800 opacity-60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <p className="font-bold text-white text-sm sm:text-base">
                    {language === 'gu' ? service.nameGu : service.nameEn}
                  </p>
                  <span className="text-xs text-gray-400">
                    ({language === 'gu' ? service.nameEn : service.nameGu})
                  </span>
                </div>
                <p className="text-xs text-gray-400 flex items-center space-x-2">
                  <span>{service.durationMinutes} min</span>
                  <span>•</span>
                  <strong className="text-amber-300">₹{service.price}</strong>
                </p>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(service)}
                  className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                  title="Edit price & duration"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => toggleServiceActive(service.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all min-h-[40px] flex items-center space-x-1.5 cursor-pointer ${
                    service.isActive
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
                  }`}
                >
                  {service.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{service.isActive ? 'Active' : 'Disabled'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Barbers On Duty Management */}
      <div className="bg-[#111827] rounded-3xl border border-gray-700/60 p-6 sm:p-7 space-y-5 shadow-2xl">
        <div className="border-b border-gray-800 pb-4">
          <h2 className="text-lg font-black text-white flex items-center">
            <Users className="w-5 h-5 mr-2 text-[#D4A017]" />
            {t('manageBarbersTitle')}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{t('manageBarbersDesc')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {barbers.map((barber) => {
            const isOnBreak = barber.status === 'On Break';
            return (
              <div
                key={barber.id}
                className="bg-gray-800/80 rounded-2xl border border-gray-700 p-4.5 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-700 text-[#D4A017] font-black text-base flex items-center justify-center border border-gray-600">
                      {barber.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{barber.name}</p>
                      <span
                        className={`text-xs font-semibold ${
                          barber.status === 'Available'
                            ? 'text-emerald-400'
                            : barber.status === 'Busy'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {barber.status}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleBarberOnDuty(barber.id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all min-h-[44px] flex items-center justify-center space-x-1.5 cursor-pointer ${
                    isOnBreak
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30'
                      : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
                  }`}
                >
                  {isOnBreak ? <Coffee className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{isOnBreak ? t('stylistOffDuty') : t('stylistOnDuty')}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setEditingService(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-black text-white">{t('editServiceModal')}</h3>
              <p className="text-xs text-gray-400">
                {editingService.nameEn} / {editingService.nameGu}
              </p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  {t('serviceDuration')}
                </label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={editDuration}
                  onChange={(e) => setEditDuration(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4A017] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  {t('servicePrice')}
                </label>
                <input
                  type="number"
                  min={10}
                  max={10000}
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4A017] min-h-[44px]"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold min-h-[44px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#D4A017] hover:bg-amber-400 text-gray-950 text-xs font-black min-h-[44px] cursor-pointer"
                >
                  {t('saveChanges')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
