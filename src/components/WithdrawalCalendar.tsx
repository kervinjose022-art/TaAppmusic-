import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Settings, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

interface WithdrawConfig {
  enabled: boolean;
  allowedDays: number[]; // 0 for Sunday, 1 for Monday... 5 for Friday, 6 for Saturday
  allowedDates: string[]; // "YYYY-MM-DD"
  allowedMonthDays?: number[]; // Days of the month (1-31), e.g. [10, 20, 30]
  apkDownloadUrl?: string;
  depositAddress?: string;
  paused?: boolean;
}

interface WithdrawalCalendarProps {
  mode: 'user' | 'admin';
  config: WithdrawConfig;
  onUpdateConfig?: (newConfig: WithdrawConfig) => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAY_NAMES_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const RECURRING_DAYS_MAP = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' }
];

export default function WithdrawalCalendar({
  mode,
  config,
  onUpdateConfig
}: WithdrawalCalendarProps) {
  // Setup current viewed month and year inside the calendar carousel
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const viewYear = currentDate.getFullYear();
  const viewMonth = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(viewYear, viewMonth + 1, 1));
  };

  // Check if a specific date standard string is today
  const today = new Date();
  const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Calendar math of the grid
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // day of week 0..6
  const numDays = new Date(viewYear, viewMonth + 1, 0).getDate(); // days in this month

  // Generate date fields cells array for rendering
  const cells: { dayNum: number | null; dateStr: string; dayOfWeek: number }[] = [];

  // Puzzles spacers
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push({ dayNum: null, dateStr: '', dayOfWeek: -1 });
  }

  // Active days
  for (let d = 1; d <= numDays; d++) {
    const formattedDate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayOfWeek = new Date(viewYear, viewMonth, d).getDay();
    cells.push({
      dayNum: d,
      dateStr: formattedDate,
      dayOfWeek
    });
  }

  const allowedMonthDays = config.allowedMonthDays !== undefined ? config.allowedMonthDays : [10, 20, 30];

  // Check if a given date is enabled for withdrawal
  const isDateEnabled = (dateStr: string, dayOfWeek: number, dayOfMonth: number) => {
    if (!config.enabled) return true; // if calendar is disabled, all days are open!
    return config.allowedDays.includes(dayOfWeek) || 
           config.allowedDates.includes(dateStr) ||
           allowedMonthDays.includes(dayOfMonth);
  };

  // Toggle specific date allowance (admin ONLY)
  const handleToggleCellDate = (dateStr: string) => {
    if (mode !== 'admin' || !onUpdateConfig) return;

    let updatedDates = [...config.allowedDates];
    if (updatedDates.includes(dateStr)) {
      updatedDates = updatedDates.filter(d => d !== dateStr);
    } else {
      updatedDates.push(dateStr);
    }

    onUpdateConfig({
      ...config,
      allowedDates: updatedDates
    });
  };

  // Toggle specific recurring weekday (admin ONLY)
  const handleToggleRecurringDay = (dayNum: number) => {
    if (mode !== 'admin' || !onUpdateConfig) return;

    let updatedDays = [...config.allowedDays];
    if (updatedDays.includes(dayNum)) {
      updatedDays = updatedDays.filter(d => d !== dayNum);
    } else {
      updatedDays.push(dayNum);
    }

    onUpdateConfig({
      ...config,
      allowedDays: updatedDays,
      allowedMonthDays // preserve standard days of month
    });
  };

  // Toggle specific recurring day of month (admin ONLY)
  const handleToggleRecurringMonthDay = (dayNum: number) => {
    if (mode !== 'admin' || !onUpdateConfig) return;

    let updatedMonthDays = [...allowedMonthDays];
    if (updatedMonthDays.includes(dayNum)) {
      updatedMonthDays = updatedMonthDays.filter(d => d !== dayNum);
    } else {
      updatedMonthDays.push(dayNum);
    }
    updatedMonthDays.sort((a, b) => a - b);

    onUpdateConfig({
      ...config,
      allowedMonthDays: updatedMonthDays
    });
  };

  // Toggle override/master switch (admin ONLY)
  const handleToggleMasterSwitch = () => {
    if (mode !== 'admin' || !onUpdateConfig) return;
    onUpdateConfig({
      ...config,
      enabled: !config.enabled
    });
  };

  // Verify status of today (whether withdrawals are open right now for today)
  const todayDayOfWeek = today.getDay();
  const todayDayOfMonth = today.getDate();
  const isDayAllowedToday = config.enabled && (
                            config.allowedDays.includes(todayDayOfWeek) || 
                            config.allowedDates.includes(todayDateStr) ||
                            allowedMonthDays.includes(todayDayOfMonth));
  const isWithdrawOpenToday = !config.paused && (!config.enabled || (isDayAllowedToday && today.getHours() >= 9));

  return (
    <div id="virtual_withdrawal_calendar" className="p-5 rounded-3xl bg-zinc-950/90 border border-white/5 backdrop-blur-xl space-y-5 shadow-2xl relative overflow-hidden">
      
      {/* Absolute futuristic decoration light rays */}
      <div className="absolute -right-12 -top-12 w-28 h-28 bg-[#39FF14]/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-28 h-28 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Title block */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-xl flex items-center justify-center">
            <Calendar className="h-4.5 w-4.5 text-[#39FF14]" />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-black uppercase text-white tracking-widest leading-none">Calendario de Cosecha 4D</h4>
            <span className="text-[9px] font-mono text-zinc-500 uppercase">Fechas de Retiro Programadas</span>
          </div>
        </div>

        {/* Dynamic status pill */}
        <div className="flex items-center gap-1.5 font-mono text-[9px] px-2.5 py-1 rounded-full border bg-black font-bold uppercase transition-all">
          {config.paused ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400">Pausado/Cerrado 🚫</span>
            </>
          ) : isWithdrawOpenToday ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-[#39FF14] animate-ping" />
              <span className="text-[#39FF14]">Abierto Hoy ✅</span>
            </>
          ) : isDayAllowedToday && today.getHours() < 9 ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400">Abre Hoy @ 9:00 AM ⏳</span>
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400">Cerrado Hoy 🔒</span>
            </>
          )}
        </div>
      </div>



      {/* MAIN CAROUSEL CALENDAR CONTAINER */}
      <div className="space-y-3.5">
        
        {/* Month Selector header */}
        <div className="flex items-center justify-between px-1">
          <h5 className="text-sm font-black text-white font-sans flex items-center gap-1.5">
            <span>{MONTH_NAMES[viewMonth]}</span>
            <span className="text-zinc-500 font-mono text-[12px] font-normal">{viewYear}</span>
          </h5>

          <div className="flex gap-1">
            <button
              onClick={handlePrevMonth}
              className="h-7 w-7 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="h-7 w-7 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 7-column Weekdays titles */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAY_NAMES_ES.map(label => (
            <span key={label} className="text-[10px] text-zinc-500 font-mono font-bold uppercase py-0.5">
              {label}
            </span>
          ))}
        </div>

        {/* Grid Cells days */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, idx) => {
            if (cell.dayNum === null) {
              return <div key={`empty-${idx}`} className="aspect-square bg-zinc-950/10" />;
            }

            const isToday = cell.dateStr === todayDateStr;
            const isEnabled = cell.dayNum !== null ? isDateEnabled(cell.dateStr, cell.dayOfWeek, cell.dayNum) : false;

            return (
              <button
                key={cell.dateStr}
                onClick={() => {
                  if (mode === 'admin') {
                    handleToggleCellDate(cell.dateStr);
                  }
                }}
                disabled={mode !== 'admin'}
                className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center text-xs font-bold font-mono transition-all overflow-hidden ${
                  isEnabled
                    ? 'border-[#39FF14]/30 text-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_6px_rgba(57,255,20,0.06)]'
                    : 'border-white/5 text-zinc-600 bg-zinc-950/40'
                } ${
                  isToday 
                    ? 'ring-2 ring-yellow-500 border-yellow-500 shadow-md scale-105 z-10' 
                    : ''
                } ${
                  mode === 'admin' 
                    ? 'hover:scale-105 hover:border-white/20 active:scale-95 cursor-pointer' 
                    : 'cursor-default'
                }`}
              >
                <span>{cell.dayNum}</span>

                {/* Micro indicators */}
                {isToday && (
                  <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-yellow-500" />
                )}
                {isEnabled && !isToday && (
                  <span className="absolute top-0.5 right-0.5 h-1 w-1 rounded-full bg-[#39FF14]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUMMARY OF ACTIVE CONFIGURATION */}
      <div className="bg-black/50 border border-white/5 rounded-2xl p-3.5 space-y-2 text-left font-mono text-[9px]">
        <div className="flex items-center justify-between text-zinc-500 border-b border-white/5 pb-1.5 mb-1.5 uppercase font-bold text-[10px]">
          <span>📊 Reglas del Servidor Activas</span>
          {config.paused ? (
            <span className="text-red-500 font-black animate-pulse">RETIROS PAUSADOS 🚫</span>
          ) : config.enabled ? (
            <span className="text-[#39FF14] font-black">Restricción Activa</span>
          ) : (
            <span className="text-yellow-500 font-black">Modo Libre Sin Filtros</span>
          )}
        </div>

        {config.paused ? (
          <div className="text-red-450 font-bold p-2 bg-red-950/15 border border-red-500/25 rounded-xl text-[10px] uppercase font-mono leading-relaxed">
            ⚠️ ATENCIÓN: El administrador ha PAUSADO/CERRADO temporalmente todos los retiros de la plataforma. Ningún inversionista podrá someter solicitudes hasta que se reactive.
          </div>
        ) : config.enabled ? (
          <>
            <div>
              • <strong className="text-zinc-300">Días del mes recurrentes:</strong>{' '}
              <span className="text-[#39FF14] font-bold">
                {allowedMonthDays.length === 0 ? 'Ninguno' : allowedMonthDays.map(d => `${d} de cada mes`).join(', ')}
              </span>
            </div>
            <div>
              • <strong className="text-zinc-300">Días de la semana recurrentes:</strong>{' '}
              <span className="text-emerald-400 font-bold">
                {config.allowedDays.length === 0
                  ? 'Ninguno (Solo por día del mes / fecha)'
                  : config.allowedDays
                      .map(d => RECURRING_DAYS_MAP.find(rm => rm.value === d)?.label || '')
                      .join(', ')}
              </span>
            </div>
            <div>
              • <strong className="text-zinc-300">Fechas de calendario excepcionales:</strong>{' '}
              <span className="text-purple-300 font-bold">
                {config.allowedDates.length === 0
                  ? 'Ninguna fecha especial'
                  : config.allowedDates
                      .map(d => {
                        const parts = d.split('-');
                        const monthNum = parseInt(parts[1]) - 1;
                        return `${parts[2]} ${MONTH_NAMES[monthNum]?.substring(0, 3)}`;
                      })
                      .join(', ')}
              </span>
            </div>
            <div>
              • <strong className="text-zinc-300">Hora de inicio de solicitudes:</strong>{' '}
              <span className="text-yellow-400 font-bold">A partir de las 9:00 AM (Hora del Servidor)</span>
            </div>
          </>
        ) : (
          <div className="text-zinc-400">
            El portal ignora las fechas de retiro. Todos los usuarios pueden retirar cualquier día de la semana libremente.
          </div>
        )}
      </div>

      {/* ADMIN CONTROLS ENVELOPE (mode === 'admin') */}
      {mode === 'admin' && (
        <div className="mt-4 border-t border-white/5 pt-4 space-y-4 text-left">
          <div className="flex items-center gap-1.5">
            <Settings className="h-4 w-4 text-purple-400" />
            <h5 className="text-[10px] font-black font-mono tracking-wider text-purple-300 uppercase">Configuración de Administrador</h5>
          </div>

          {/* PAUSE WITHDRAWALS SWITCH */}
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-red-950/20 border border-red-500/20 shadow-md">
            <input
              type="checkbox"
              id="admin_pause_withdrawals"
              checked={config.paused || false}
              onChange={() => {
                if (onUpdateConfig) {
                  onUpdateConfig({
                    ...config,
                    paused: !config.paused
                  });
                }
              }}
              className="accent-red-500 h-4 w-4 rounded border-red-900 bg-zinc-900 cursor-pointer"
            />
            <label htmlFor="admin_pause_withdrawals" className="text-[11px] font-mono text-zinc-300 select-none cursor-pointer flex-1 leading-normal">
              🚫 <strong className="text-red-400">CERRAR/PAUSAR RETIROS TOTALMENTE HOY</strong> (Bloqueará las solicitudes de retiro a todos los usuarios de inmediato)
            </label>
          </div>

          {/* Master constraint Toggle checkbox */}
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-black border border-white/5">
            <input
              type="checkbox"
              id="admin_calendar_constraint"
              checked={config.enabled}
              onChange={handleToggleMasterSwitch}
              className="accent-[#39FF14] h-3.5 w-3.5 rounded border-zinc-800 bg-zinc-900 cursor-pointer"
            />
            <label htmlFor="admin_calendar_constraint" className="text-[10.5px] font-mono text-zinc-300 select-none cursor-pointer flex-1 leading-normal">
              Afectar retiros de usuarios con esta restricción de calendario <strong className="text-[#39FF14]">[RECOMENDADO]</strong>
            </label>
          </div>

          {/* Weekday Toggles */}
          {config.enabled && (
            <div className="space-y-2">
              <span className="text-[9px] font-mono font-extrabold text-zinc-500 uppercase tracking-widest block">
                Seleccionar Días Habilitados Recurrentes de la semana:
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
                {RECURRING_DAYS_MAP.map((item) => {
                  const isActive = config.allowedDays.includes(item.value);
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleToggleRecurringDay(item.value)}
                      className={`py-1.5 px-1.5 rounded-lg text-[9px] font-mono font-bold uppercase transition-all border cursor-pointer ${
                        isActive
                          ? 'border-[#39FF14] text-[#39FF14] bg-[#39FF14]/5'
                          : 'border-zinc-850 text-zinc-500 bg-zinc-950/30'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Monthly Days Toggles */}
              <div className="space-y-2 mt-3.5 pt-3.5 border-t border-white/5">
                <span className="text-[9px] font-mono font-extrabold text-purple-400 uppercase tracking-widest block">
                  Seleccionar Días recurrentes del Mes (Ej: 10, 20, 30):
                </span>
                <p className="text-[9px] font-sans text-zinc-500 leading-normal mb-1.5">
                  Los días seleccionados en verde serán habilitados automáticamente en todos los meses recurrentes del año.
                </p>
                <div className="grid grid-cols-6 sm:grid-cols-10 gap-1 bg-black/40 p-2.5 rounded-2xl border border-white/5">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((dayNum) => {
                    const isActive = allowedMonthDays.includes(dayNum);
                    return (
                      <button
                        key={dayNum}
                        type="button"
                        onClick={() => handleToggleRecurringMonthDay(dayNum)}
                        className={`h-7 rounded-lg text-[10px] font-mono font-black transition-all border cursor-pointer flex items-center justify-center ${
                          isActive
                            ? 'border-[#39FF14] text-[#39FF14] bg-[#39FF14]/10 shadow-[0_0_8px_rgba(57,255,20,0.08)]'
                            : 'border-white/5 text-zinc-500 hover:text-zinc-300 bg-zinc-950/20'
                        }`}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-2.5 bg-purple-950/10 border border-purple-500/10 rounded-xl flex items-start gap-2 text-[9px] font-mono text-purple-400 mt-3.5">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="leading-tight">
                  <span className="font-bold text-white uppercase">Sincronización Interactiva Directa:</span> Puedes hacer click en cualquier día del calendario de arriba para agregar/remover fechas de retiro excepcionales para un mes concreto. No requiere presionar Guardar, estos cambios toman efecto instantáneamente para los inversionistas.
                </p>
              </div>
            </div>
          )}

          {/* Secure Dynamic Deposit Address Admin Input */}
          <div className="space-y-2 mt-4 pt-4 border-t border-white/5 bg-black/35 p-3 rounded-2xl">
            <span className="text-[9px] font-mono font-extrabold text-[#39FF14] uppercase tracking-widest block">
              🛡️ DIRECCIÓN DE DEPÓSITO USDT (BEP-20) ACTUAL DE LA PLATAFORMA:
            </span>
            <p className="text-[9px] font-sans text-zinc-500 leading-normal">
              Esta es la dirección USDT que ven los usuarios al solicitar subir de VIP o comprar membresías. Cambiarla aquí la actualiza instantáneamente en toda la aplicación bajo los protocolos de seguridad de Firebase, previniendo alteraciones locales no autorizadas.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={config.depositAddress || '0x29f0f1edd5258ee3b7553bff665df4d1dd811af0'}
                onChange={(e) => {
                  if (onUpdateConfig) {
                    onUpdateConfig({
                      ...config,
                      depositAddress: e.target.value.trim()
                    });
                  }
                }}
                placeholder="Ej. 0x29f0..."
                className="flex-1 h-9 px-3 bg-black border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#39FF14]"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
