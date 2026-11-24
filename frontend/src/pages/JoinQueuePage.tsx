import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore } from '../store/useLanguageStore';
import { DUMMY_SERVICES, DUMMY_BARBERS } from '../constants/dummyData';
import { Scissors, User, Phone, Check, Clock, ShieldCheck } from 'lucide-react';

export const JoinQueuePage: React.FC = () => {
  const { t, language } = useLanguageStore();
  const navigate = useNavigate();

  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [selectedServices, setSelectedServices] = React.useState<string[]>(['s-haircut']);
  const [selectedBarber, setSelectedBarber] = React.useState<string>('any');

  const toggleService = (id: string) => {
    if (selectedServices.includes(id)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s !== id));
      }
    } else {
      if (selectedServices.length < 3) {
        setSelectedServices([...selectedServices, id]);
      }
    }
  };

  const totalTime = selectedServices.reduce((acc, sId) => {
    const s = DUMMY_SERVICES.find((serv) => serv.id === sId);
    return acc + (s?.durationMinutes || 0);
  }, 0);

  const totalPrice = selectedServices.reduce((acc, sId) => {
    const s = DUMMY_SERVICES.find((serv) => serv.id === sId);
    return acc + (s?.price || 0);
  }, 0);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.length !== 10) return;
    // Simulate generation of token S-014 and navigate to status screen
    navigate('/status/S-014');
  };

  return (
    <div className="max-w-2xl mx-auto w-full py-6 space-y-6">
      <div className="border-b border-gray-700/60 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('joinTitle')}</h1>
        <p className="text-gray-400 text-sm">{t('joinSubtitle')}</p>
      </div>

      <form onSubmit={handleConfirm} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-[#111827]/80 rounded-2xl border border-gray-700/60 p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              {t('nameLabel')}
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017] min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              {t('phoneLabel')}
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder={t('phonePlaceholder')}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017] min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* Services Selection (Max 3) */}
        <div className="bg-[#111827]/80 rounded-2xl border border-gray-700/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              {t('servicesLabel')}
            </h2>
            <span className="text-xs text-[#D4A017] font-medium">
              {selectedServices.length}/3 selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DUMMY_SERVICES.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all min-h-[44px] ${
                    isSelected
                      ? 'bg-[#D4A017]/10 border-[#D4A017] text-white shadow-sm'
                      : 'bg-gray-800/70 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-sm">
                      {language === 'gu' ? service.nameGu : service.nameEn}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {service.durationMinutes} min • ₹{service.price}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      isSelected
                        ? 'bg-[#D4A017] border-[#D4A017] text-gray-950'
                        : 'border-gray-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Barber Selection */}
        <div className="bg-[#111827]/80 rounded-2xl border border-gray-700/60 p-5 space-y-3">
          <h2 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            {t('barberLabel')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedBarber('any')}
              className={`p-3 rounded-xl border text-center transition-all min-h-[44px] ${
                selectedBarber === 'any'
                  ? 'bg-[#D4A017]/15 border-[#D4A017] text-[#D4A017] font-bold'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              <Scissors className="w-4 h-4 mx-auto mb-1" />
              <span className="text-xs block">{t('anyBarber')}</span>
            </button>
            {DUMMY_BARBERS.map((barber) => (
              <button
                key={barber.id}
                type="button"
                onClick={() => setSelectedBarber(barber.id)}
                className={`p-3 rounded-xl border text-center transition-all min-h-[44px] ${
                  selectedBarber === barber.id
                    ? 'bg-[#D4A017]/15 border-[#D4A017] text-[#D4A017] font-bold'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-gray-700 text-xs font-bold mx-auto mb-1 flex items-center justify-center text-white">
                  {barber.name.charAt(0)}
                </div>
                <span className="text-xs block">{barber.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Summary Card */}
        <div className="bg-amber-500/10 rounded-2xl border border-[#D4A017]/40 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4A017] text-gray-950 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-amber-300 font-semibold">{t('summaryTitle')}</p>
              <p className="text-sm text-gray-200">
                {t('totalTime')}: <strong className="text-white">{totalTime} min</strong> • {t('totalAmount')}: <strong className="text-[#D4A017]">₹{totalPrice}</strong>
              </p>
              <p className="text-xs text-gray-400">
                {t('expectedWait')}: ~35 min
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#D4A017] hover:bg-amber-400 text-gray-950 font-bold text-sm shadow-md shadow-[#D4A017]/20 transition-all cursor-pointer min-h-[44px]"
          >
            {t('confirmJoinBtn')}
          </button>
        </div>
      </form>
    </div>
  );
};
