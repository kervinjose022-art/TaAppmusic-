import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Settings, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

interface WithdrawConfig {
  enabled: boolean;
  allowedDays: number[]; // 0 for Sunday, 1 for Monday... 5 for Friday, 6 for Saturday
  allowedDates: string[]; // "YYYY-MM-DD"
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

  // Check if a given date is enabled for withdrawal
  const isDateEnabled = (dateStr: string, dayOfWeek: number) => {
    if (!config.enabled) return true; // if calendar is disabled, all days are open!
    return config.allowedDays.includes(dayOfWeek) || config.allowedDates.includes(dateStr);
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
      allowedDays: updatedDays
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
  const isWithdrawOpenToday = !config.enabled || config.allowedDays.includes(todayDayOfWeek) || config.allowedDates.includes(todayDateStr);

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
          {isWithdrawOpenToday ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-[#39FF14] animate-ping" />
              <span className="text-[#39FF14]">Abierto Hoy ✅</span>
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400">Cerrado Hoy 🔒</span>
            </>
          )}
        </div>
      </div>

      {/* TODAY STATUS EXPLAINER CARD */}
      <div className={`p-3 rounded-2xl border text-left text-[11px] leading-relaxed transition-all ${
        isWithdrawOpenToday
          ? 'bg-emerald-950/10 border-emerald-500/20 text-emerald-300'
          : 'bg-yellow-950/10 border-yellow-500/20 text-yellow-300'
      }`}>
        <div className="flex gap-2 items-start font-mono">
          {isWithdrawOpenToday ? (
            <>
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">RETIROS ACTIVO:</strong> El portal de retiro está <span className="text-[#39FF14] font-black uppercase">Abierto</span>. Hoy es un día elegible de retiro según las normativas del administrador. ¡Disfruta de tus regalías de fe sintonizadas!
              </div>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">PORTAL CERRADO TEMPORALMENTE:</strong> Hoy no es día de retiros. Puedes contemplar tareas diariamente, acumular tu saldo, y procesar sus retiros en los días resaltados en <span className="text-[#39FF14] font-bold">Verde Brillante</span> en el calendario interactivo.
              </div>
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
            const isEnabled = isDateEnabled(cell.dateStr, cell.dayOfWeek);

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
          {config.enabled ? (
            <span className="text-[#39FF14] font-black">Restricción Activa</span>
          ) : (
            <span className="text-yellow-500 font-black">Modo Libre Sin Filtros</span>
          )}
        </div>

        {config.enabled ? (
          <>
            <div>
              • <strong className="text-zinc-300">Días recurrentes semanales:</strong>{' '}
              <span className="text-[#39FF14] font-bold">
                {config.allowedDays.length === 0
                  ? 'Ninguno (Modo fecha específica única)'
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

              <div className="p-2 bg-purple-950/10 border border-purple-500/10 rounded-xl flex items-start gap-2 text-[9px] font-mono text-purple-400 mt-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="leading-tight">
                  <span className="font-bold text-white uppercase">Sincronización Interactiva Directa:</span> Puedes hacer click en cualquier día del calendario de arriba para agregar/remover fechas de retiro excepcionales. No requiere presionar Guardar, estos cambios toman efecto instantáneamente para los usuarios.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
