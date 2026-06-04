import { useState } from 'react';
import { Check, Flame, Trophy, Coins, ChevronRight, Lock, Play, Cpu, Sparkles } from 'lucide-react';
import { UserTask, UserProfile, VipLevel } from '../types';
import { TASKS_DATABASE } from '../data';

interface VipTasksProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
}

export default function VipTasks({ userProfile, setUserProfile }: VipTasksProps) {
  const [tasks, setTasks] = useState<UserTask[]>(() => {
    // Check if task IDs already stored in user profile to mark as completed
    return TASKS_DATABASE.map(task => ({
      ...task,
      isCompleted: userProfile.completedTaskIds.includes(task.id)
    }));
  });

  const [activeTab, setActiveTab] = useState<'disponibles' | 'completadas'>('disponibles');
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [taskProgress, setTaskProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // Filter tasks based on selected tab & matching user's exact VIP requirement
  const currentFilteredTasks = tasks.filter(task => {
    const isCompleted = userProfile.completedTaskIds.includes(task.id);
    const matchesTab = activeTab === 'completadas' ? isCompleted : !isCompleted;
    return matchesTab;
  });

  // VIP numbers to check locker status
  const VIP_RANK_MAPPING: Record<VipLevel, number> = {
    'VIP ORO 10$': 1,
    'VIP ORO 20$': 2,
    'VIP RUBÍ 40$': 3,
    'VIP DIAMANTE 120$': 4,
    'VIP PLATINO 420$': 5,
    'VIP SÚPER VIP 1000$': 6,
  };
  const getVipRank = (level: VipLevel) => VIP_RANK_MAPPING[level] || 1;
  const userVipRank = getVipRank(userProfile.vipLevel);

  // Core handler: Click to "Hacer Tarea" (Do Task) with fancy simulated loader
  const handlePerformTask = (task: UserTask) => {
    const requiredRank = getVipRank(task.vipRequired);
    
    // Guard of VIP level
    if (userVipRank < requiredRank) {
      alert(`⚠️ Esta tarea requiere nivel ${task.vipRequired} o superior. ¡Por favor mejora tu nivel VIP en el selector o regístrate para iniciar!`);
      return;
    }

    if (runningTaskId) return; // one task at a time

    setRunningTaskId(task.id);
    setTaskProgress(0);

    const statuses = [
      'Iniciando canal de sonido...',
      'Verificando sincronización de audio...',
      'Transmitiendo beats de prueba...',
      'Acreditando ganancias Tappmusic...'
    ];

    let currentStep = 0;
    setStatusMessage(statuses[0]);

    const interval = setInterval(() => {
      setTaskProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          completeTask(task);
          return 100;
        }

        // Cycle messages
        if (prev > 0 && prev % 25 === 0 && currentStep < statuses.length - 1) {
          currentStep++;
          setStatusMessage(statuses[currentStep]);
        }

        return prev + 5;
      });
    }, 150);
  };

  const completeTask = (task: UserTask) => {
    // Add task ID to user profile list, add payout balance
    setUserProfile(prev => {
      if (prev.completedTaskIds.includes(task.id)) return prev;
      
      const updatedIds = [...prev.completedTaskIds, task.id];
      const updatedEarnings = prev.earnings + task.rewardValue;

      return {
        ...prev,
        completedTaskIds: updatedIds,
        earnings: Number(updatedEarnings.toFixed(2))
      };
    });

    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, isCompleted: true } : t));
    setRunningTaskId(null);
    setTaskProgress(0);
    setStatusMessage('');
  };

  return (
    <div className="rounded-2xl border border-[#39FF14]/20 bg-black p-6 shadow-xl relative overflow-hidden select-none">
      
      {/* Wallet / Balance Board */}
      <div className="grid grid-cols-2 gap-4 mb-6 border-b border-[#39FF14]/10 pb-5">
        <div className="text-left">
          <p className="text-[10px] font-mono tracking-widest text-purple-400 uppercase">Billetera TaApp</p>
          <div className="flex items-center gap-1.5 pt-1 uppercase">
            <Coins className="h-4.5 w-4.5 text-yellow-400 animate-pulse" />
            <span className="text-2xl font-black text-white font-mono tracking-tight glow-text text-neon-green">
              ${userProfile.earnings.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="text-left border-l border-white/5 pl-4">
          <p className="text-[10px] font-mono tracking-widest text-[#39FF14] uppercase">Rango Activo</p>
          <div className="flex items-center gap-1 pt-1.5 font-bold text-white uppercase text-xs">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span>Nivel {userProfile.vipLevel}</span>
          </div>
        </div>
      </div>

      {/* Tabs configuration */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
        <button
          onClick={() => setActiveTab('disponibles')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wider transition-all uppercase cursor-pointer ${
            activeTab === 'disponibles'
              ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20'
              : 'text-gray-500 hover:text-white'
          }`}
        >
          Disponibles ({tasks.filter(t => !userProfile.completedTaskIds.includes(t.id)).length})
        </button>

        <button
          onClick={() => setActiveTab('completadas')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wider transition-all uppercase cursor-pointer ${
            activeTab === 'completadas'
              ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20'
              : 'text-gray-500 hover:text-white'
          }`}
        >
          Completadas ({userProfile.completedTaskIds.length})
        </button>
      </div>

      {/* Doing task loader simulation bar */}
      {runningTaskId && (
        <div className="mb-5 p-4 rounded-xl border border-purple-500/30 bg-purple-950/10 text-left space-y-2 animate-pulse">
          <div className="flex items-center justify-between text-xs font-bold text-purple-300">
            <span className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 animate-spin" /> {statusMessage}
            </span>
            <span>{taskProgress}%</span>
          </div>
          <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-purple-500/20">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-yellow-500 transition-all duration-150"
              style={{ width: `${taskProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Tasks Render lists */}
      {currentFilteredTasks.length === 0 ? (
        <div className="py-12 text-center text-gray-600 font-mono text-xs">
          {activeTab === 'disponibles' 
            ? '¡Excelente! Has completado todas las tareas disponibles de tu VIP.'
            : 'Aún no posees tareas completadas. ¡Haz click en "Hacer tarea" para ganar regalías!'}
        </div>
      ) : (
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {currentFilteredTasks.map(task => {
            const requiredRank = getVipRank(task.vipRequired);
            const isLocked = userVipRank < requiredRank;

            return (
              <div
                key={task.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl border transition-all text-left group ${
                  task.isCompleted
                    ? 'border-zinc-800 bg-zinc-950/40 opacity-70'
                    : isLocked
                    ? 'border-red-950 bg-red-950/10'
                    : 'border-[#39FF14]/15 bg-zinc-950/25 hover:border-[#39FF14]/30'
                }`}
              >
                <div className="space-y-1.5 flex-1 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider uppercase border border-[#39FF14]/20 bg-[#39FF14]/5 text-[#39FF14]">
                      {task.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider uppercase border ${
                      task.vipRequired === 'VIP SÚPER VIP 1000$' 
                        ? 'border-emerald-550/40 text-emerald-300 bg-emerald-500/5 font-black' 
                        : task.vipRequired === 'VIP PLATINO 420$'
                        ? 'border-purple-500/30 text-purple-300 bg-purple-500/5'
                        : task.vipRequired === 'VIP DIAMANTE 120$'
                        ? 'border-sky-500/30 text-sky-400 bg-sky-500/5'
                        : task.vipRequired === 'VIP RUBÍ 40$'
                        ? 'border-red-500/30 text-red-400 bg-red-400/5'
                        : task.vipRequired === 'VIP ORO 20$'
                        ? 'border-yellow-400/35 text-yellow-300 bg-yellow-400/5'
                        : 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5'
                    }`}>
                      {task.vipRequired}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-white">{task.title}</h4>
                  <p className="text-[11px] text-gray-400 leading-normal">{task.description}</p>
                </div>

                <div className="mt-3.5 sm:mt-0 w-full sm:w-auto shrink-0 flex items-center justify-between sm:justify-start gap-4 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-gray-500 font-mono leading-none">RECOMPENSA</p>
                    <p className="text-md font-extrabold text-[#39FF14] font-mono mt-1">+${task.rewardValue.toFixed(2)}</p>
                  </div>

                  {task.isCompleted ? (
                    <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                      <Check className="h-4 w-4" />
                    </div>
                  ) : isLocked ? (
                    <div className="rounded-xl bg-red-950/30 border border-red-500/20 px-3 py-1.5 flex items-center gap-1.5 text-[10px] text-red-400 font-mono font-bold">
                      <Lock className="h-3.5 w-3.5" />
                      <span>BLOQUEADO</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePerformTask(task)}
                      disabled={!!runningTaskId}
                      className="flex h-9 items-center gap-1.5 rounded-lg border border-[#39FF14] bg-[#39FF14]/5 hover:bg-[#39FF14]/20 text-[10px] font-bold font-mono text-[#39FF14] px-4 transition-all uppercase cursor-pointer disabled:opacity-50 active:scale-95 shadow-[0_0_8px_rgba(57,255,20,0.15)]"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Hacer tarea</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tip Box */}
      <div className="mt-5 p-3.5 rounded-xl border border-[#39FF14]/10 bg-[#39FF14]/5 text-left text-[11px] text-[#39FF14]/90 leading-relaxed font-mono">
        💎 <span className="font-bold">CONSEJO VIP:</span> Desbloquea niveles superiores usando el panel de registro superior para multiplicar tu balance y acceder a tareas de hasta $75.00 dólares cada una.
      </div>

    </div>
  );
}
