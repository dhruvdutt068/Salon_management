import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguageStore } from '../store/useLanguageStore';
import { useQueueStore } from '../store/useQueueStore';
import { useAuthStore } from '../store/useAuthStore';
import {
  Scissors,
  User,
  Phone,
  Check,
  Clock,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Info,
} from 'lucide-react';

export const JoinQueuePage: React.FC = () => {
  const { t, language } = useLanguageStore();
  const navigate = useNavigate();

  const {
    services,
    barbers,
    isQueueOpen,
    calculateEstimatedWait,
    joinQueue,
  } = useQueueStore();
  const { user } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || (user?.role === 'customer' ? user.username : ''));
  const [selectedServices, setSelectedServices] = useState<string[]>(['s-haircut']);
  const [selectedBarber, setSelectedBarber] = useState<string>('any');

  // Form errors
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState<{ message: string; token: string } | null>(null);

  // Toggle service selection with max 3 constraint
  const handleToggleService = (id: string) => {
    setServiceError(null);
    if (selectedServices.includes(id)) {
      if (selectedServices.length === 1) {
        setServiceError(t('noServiceError'));
        return;
      }
      setSelectedServices(selectedServices.filter((s) => s !== id));
    } else {
      if (selectedServices.length >= 3) {
        setServiceError(t('serviceLimitError'));
        return;
      }
      setSelectedServices([...selectedServices, id]);
    }
  };

  // Only show active services (turning off in admin immediately hides from join queue)
  const availableServices = services.filter((s) => s.isActive);

  // Calculate live summary
  const activeSelectedServices = availableServices.filter((s) => selectedServices.includes(s.id));
  const totalDuration = activeSelectedServices.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalPrice = activeSelectedServices.reduce((acc, s) => acc + s.price, 0);
  const estimatedWait = calculateEstimatedWait(totalDuration, selectedBarber);

  // Validation
  const validateForm = (): boolean => {
    let isValid = true;
    setNameError(null);
    setPhoneError(null);
    setServiceError(null);
    setDuplicateError(null);

    // Validate Name
    if (!name.trim() || name.trim().length < 2) {
      setNameError(t('nameError'));
      isValid = false;
    }

    // Validate Phone (10 digits, Indian mobile numbers start with 6-9 usually, or strictly 10 numeric digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      setPhoneError(t('phoneError'));
      isValid = false;
    }

    // Validate Services (1 to 3)
    if (selectedServices.length === 0) {
      setServiceError(t('noServiceError'));
      isValid = false;
    } else if (selectedServices.length > 3) {
      setServiceError(t('serviceLimitError'));
      isValid = false;
    }

    return isValid;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      setPhone(val);
      if (phoneError) setPhoneError(null);
      if (duplicateError) setDuplicateError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isQueueOpen) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const result = joinQueue({
      customerName: name,
      customerPhone: phone,
      serviceIds: selectedServices,
      preferredBarberId: selectedBarber,
    });

    if (result.success && result.token) {
      navigate(`/status/${result.token}`);
    } else if (result.error === 'duplicate_phone' && result.existingToken) {
      setDuplicateError({
        message: t('duplicatePhoneError').replace('#token', result.existingToken),
        token: result.existingToken,
      });
    } else if (result.error === 'queue_closed') {
      alert(t('queueClosedCTA'));
    }
  };

  const selectedBarberObj = barbers.find((b) => b.id === selectedBarber);

  return (
    <div className="max-w-2xl mx-auto w-full py-4 sm:py-6 space-y-6">
      {/* Title & Description */}
      <div className="border-b border-gray-700/60 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t('joinTitle')}
        </h1>
        <p className="text-gray-400 text-sm mt-1">{t('joinSubtitle')}</p>
      </div>

      {/* Queue Closed Banner if applicable */}
      {!isQueueOpen && (
        <div className="bg-rose-500/10 border-2 border-rose-500/40 rounded-2xl p-4 flex items-center space-x-3 text-rose-300">
          <AlertCircle className="w-6 h-6 shrink-0 text-rose-400" />
          <div className="text-sm">
            <strong className="block text-rose-200">{t('queueClosedCTA')}</strong>
            {t('queueClosedNote')}
          </div>
        </div>
      )}

      {/* Duplicate Phone Number Alert */}
      {duplicateError && (
        <div className="bg-amber-500/15 border-2 border-[#D4A017] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200 animate-in fade-in">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 shrink-0 text-[#D4A017]" />
            <p className="text-sm font-semibold">{duplicateError.message}</p>
          </div>
          <Link
            to={`/status/${duplicateError.token}`}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#D4A017] text-gray-950 font-bold text-xs whitespace-nowrap min-h-[44px] cursor-pointer"
          >
            {t('viewExistingSpot')}
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Customer Details */}
        <div className="bg-[#111827]/85 rounded-3xl border border-gray-700/60 p-5 sm:p-6 space-y-4 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center">
            <User className="w-4 h-4 mr-1.5 text-[#D4A017]" />
            Customer Information
          </h2>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              {t('nameLabel')} <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                placeholder={t('namePlaceholder')}
                className={`w-full bg-gray-800/90 border rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none transition-colors min-h-[44px] ${
                  nameError ? 'border-rose-500 focus:border-rose-400' : 'border-gray-700 focus:border-[#D4A017]'
                }`}
              />
            </div>
            {nameError && (
              <p className="text-xs text-rose-400 mt-1.5 flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                {nameError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              {t('phoneLabel')} <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder={t('phonePlaceholder')}
                className={`w-full bg-gray-800/90 border rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 text-sm font-mono tracking-wider focus:outline-none transition-colors min-h-[44px] ${
                  phoneError ? 'border-rose-500 focus:border-rose-400' : 'border-gray-700 focus:border-[#D4A017]'
                }`}
              />
            </div>
            {phoneError && (
              <p className="text-xs text-rose-400 mt-1.5 flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                {phoneError}
              </p>
            )}
          </div>
        </div>

        {/* Step 2: Multi-Service Selection (Max 3) */}
        <div className="bg-[#111827]/85 rounded-3xl border border-gray-700/60 p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center">
              <Scissors className="w-4 h-4 mr-1.5 text-[#D4A017]" />
              {t('servicesLabel')}
            </h2>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                selectedServices.length === 3
                  ? 'bg-amber-500/20 text-[#D4A017] border-[#D4A017]/40'
                  : 'bg-gray-800 text-gray-300 border-gray-700'
              }`}
            >
              {selectedServices.length} / 3
            </span>
          </div>

          <p className="text-xs text-gray-400">{t('selectServicePrompt')}</p>

          {serviceError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5 shrink-0" />
              {serviceError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableServices.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              const isDisabled = !isSelected && selectedServices.length >= 3;

              return (
                <div
                  key={service.id}
                  onClick={() => handleToggleService(service.id)}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all min-h-[56px] select-none ${
                    isSelected
                      ? 'bg-[#D4A017]/15 border-[#D4A017] text-white shadow-md shadow-[#D4A017]/10'
                      : isDisabled
                      ? 'bg-gray-800/40 border-gray-800 text-gray-500 opacity-60 cursor-not-allowed'
                      : 'bg-gray-800/70 border-gray-700/80 text-gray-300 hover:border-gray-600 hover:bg-gray-800'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="font-bold text-sm sm:text-base text-white">
                      {language === 'gu' ? service.nameGu : service.nameEn}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-[#D4A017]" />
                      <span>{service.durationMinutes} min</span>
                      <span className="mx-1.5">•</span>
                      <strong className="text-gray-200">₹{service.price}</strong>
                    </p>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-[#D4A017] border-[#D4A017] text-gray-950 font-black'
                        : 'border-gray-600 bg-gray-900/60'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Preferred Barber Selection */}
        <div className="bg-[#111827]/85 rounded-3xl border border-gray-700/60 p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center">
              <Scissors className="w-4 h-4 mr-1.5 text-[#D4A017]" />
              {t('barberLabel')}
            </h2>
            <span className="text-xs text-gray-400 font-medium">
              {selectedBarber === 'any' ? t('anyBarber') : `${selectedBarberObj?.name || ''}`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Any Barber (Fastest) */}
            <button
              type="button"
              onClick={() => setSelectedBarber('any')}
              className={`p-3.5 rounded-2xl border text-center transition-all min-h-[64px] flex flex-col items-center justify-center cursor-pointer ${
                selectedBarber === 'any'
                  ? 'bg-[#D4A017]/20 border-[#D4A017] text-[#D4A017] font-bold shadow-md shadow-[#D4A017]/10'
                  : 'bg-gray-800/80 border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              <Scissors className="w-5 h-5 mx-auto mb-1 stroke-[2.5]" />
              <span className="text-xs font-bold block">{t('anyBarber')}</span>
            </button>

            {/* Specific Barbers */}
            {barbers.map((barber) => {
              const isSelected = selectedBarber === barber.id;
              const isOnBreak = barber.status === 'On Break';

              return (
                <button
                  key={barber.id}
                  type="button"
                  onClick={() => setSelectedBarber(barber.id)}
                  className={`p-3 rounded-2xl border text-center transition-all min-h-[64px] flex flex-col items-center justify-center cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#D4A017]/20 border-[#D4A017] text-[#D4A017] font-bold shadow-md shadow-[#D4A017]/10'
                      : 'bg-gray-800/80 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-gray-700 text-xs font-bold mx-auto mb-1 flex items-center justify-center text-white border border-gray-600">
                    {barber.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-white block">{barber.name}</span>
                  <span
                    className={`text-[10px] mt-0.5 font-medium ${
                      isOnBreak
                        ? 'text-rose-400'
                        : barber.status === 'Busy'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {barber.status}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedBarber !== 'any' && selectedBarberObj?.status === 'On Break' && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center">
              <Info className="w-4 h-4 mr-1.5 shrink-0" />
              <span>
                {selectedBarberObj.name} {t('barberBreakNotice')}. Wait time may be longer.
              </span>
            </div>
          )}
        </div>

        {/* Step 4: Live Dynamic Summary Card */}
        <div className="bg-gradient-to-br from-amber-500/15 via-[#111827] to-amber-950/20 rounded-3xl border-2 border-[#D4A017]/60 p-6 space-y-4 shadow-2xl">
          <div className="flex items-center space-x-3 border-b border-gray-800 pb-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4A017] text-gray-950 flex items-center justify-center font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#D4A017] font-black">
                {t('summaryTitle')}
              </p>
              <p className="text-xs text-gray-400">
                {activeSelectedServices.map((s) => (language === 'gu' ? s.nameGu : s.nameEn)).join(' + ')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-1">
            <div className="bg-gray-900/80 rounded-2xl p-3 border border-gray-800">
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">{t('totalTime')}</p>
              <p className="text-lg sm:text-xl font-mono font-black text-white mt-0.5">{totalDuration} min</p>
            </div>
            <div className="bg-gray-900/80 rounded-2xl p-3 border border-gray-800">
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">{t('totalAmount')}</p>
              <p className="text-lg sm:text-xl font-mono font-black text-[#D4A017] mt-0.5">₹{totalPrice}</p>
            </div>
            <div className="bg-gray-900/80 rounded-2xl p-3 border border-gray-800">
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">{t('expectedWait')}</p>
              <p className="text-lg sm:text-xl font-mono font-black text-amber-300 mt-0.5">~{estimatedWait} min</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!isQueueOpen}
              className="w-full min-h-[56px] rounded-2xl bg-[#D4A017] hover:bg-amber-400 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-gray-950 font-black text-base flex items-center justify-center space-x-2 shadow-lg shadow-[#D4A017]/25 transition-all cursor-pointer"
            >
              <span>{t('confirmJoinBtn')}</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
