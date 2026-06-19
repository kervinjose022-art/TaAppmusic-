import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, ShieldCheck, Wallet, DollarSign, ArrowUpRight, ArrowDownRight,
  PlusCircle, RefreshCw, Send, AlertCircle, CheckCircle2, Copy, FileText, Upload,
  Users, Key, HelpCircle, Landmark, Sparkles, MessageSquare, AlertTriangle, UserCheck, X,
  CreditCard
} from 'lucide-react';

interface P2POffer {
  id: string;
  type: 'Comprar' | 'Vender';
  traderName: string;
  rate: number; // rate in Bs. per USDT
  amountUsdt: number;
  minLimitUsdt: number;
  maxLimitUsdt: number;
  paymentMethods: string[];
  reputation: string; // e.g. "99% (120 órdenes)"
  status: 'active' | 'reserved' | 'completed';
}

interface P2PTransaction {
  id: string;
  type: 'Comprar' | 'Vender';
  offerId: string;
  rate: number;
  amountUsdt: number;
  amountBs: number;
  status: 'pending_payment' | 'paid_checking' | 'completed' | 'disputed' | 'cancelled';
  paymentInfo: {
    bank: string;
    phone: string;
    idCard: string;
    holder: string;
  };
  buyerReceiptUrl?: string;
  createdAt: string;
}

export default function P2PExchangePortal({ onClose }: { onClose: () => void }) {
  // Master P2P Rates (simulation)
  const [usdtPriceInBs, setUsdtPriceInBs] = useState<number>(45.80);
  const [isUpdatingRate, setIsUpdatingRate] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'orders' | 'deposit' | 'advisor'>('buy');
  
  // Custom states for active liquid balances
  const [bovedaUsdt, setBovedaUsdt] = useState<number>(12450.00);
  const [fondoBs, setFondoBs] = useState<number>(480520.00);

  // Card Deposit / BPay simulation states
  const [depositType, setDepositType] = useState<'deposit' | 'withdraw'>('deposit');
  const [depositMethod, setDepositMethod] = useState<'card' | 'gpay'>('card');
  const [depositAmount, setDepositAmount] = useState<string>("100");
  const [depositStep, setDepositStep] = useState<number>(1); // 1: Select method & amount, 2: Insert card details & Pay, 3: Completed!
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardHolder, setCardHolder] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvv, setCardCvv] = useState<string>("");
  const [isProcessingDeposit, setIsProcessingDeposit] = useState<boolean>(false);
  const [adminCommissionTotal, setAdminCommissionTotal] = useState<number>(() => {
    const saved = localStorage.getItem('tapp_p2p_commissions');
    return saved ? parseFloat(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem('tapp_p2p_commissions', adminCommissionTotal.toString());
  }, [adminCommissionTotal]);

  // Custom interactive state for calculator
  const [calcType, setCalcType] = useState<'usdt_to_bs' | 'bs_to_usdt'>('usdt_to_bs');
  const [calcInput, setCalcInput] = useState<string>("100");
  const [calcOutput, setCalcOutput] = useState<string>("4580.00");

  // Filter bank options
  const [selectedBankFilter, setSelectedBankFilter] = useState<string>('Todos');

  // Interactive advice modal/widget expanded
  const [selectedAdviceType, setSelectedAdviceType] = useState<'otc' | 'free_p2p' | 'hybrid'>('hybrid');

  // Simulated state for live P2P Offers
  const [offers, setOffers] = useState<P2POffer[]>(() => {
    const saved = localStorage.getItem('tapp_p2p_offers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'off_1',
        type: 'Vender', // Trader sells USDT -> You buy USDT
        traderName: 'Inversiones Oro Express',
        rate: 45.85,
        amountUsdt: 450,
        minLimitUsdt: 20,
        maxLimitUsdt: 450,
        paymentMethods: ['Pago Móvil Banesco', 'Provincial'],
        reputation: '100% (415 órdenes)',
        status: 'active'
      },
      {
        id: 'off_2',
        type: 'Vender',
        traderName: 'Kervin Cambios P2P',
        rate: 45.80,
        amountUsdt: 1250,
        minLimitUsdt: 40,
        maxLimitUsdt: 1200,
        paymentMethods: ['Pago Móvil Mercantil', 'Banco de Venezuela'],
        reputation: '99.2% (1.2k órdenes)',
        status: 'active'
      },
      {
        id: 'off_3',
        type: 'Vender',
        traderName: 'Sofia Medina C.A.',
        rate: 45.75,
        amountUsdt: 180,
        minLimitUsdt: 10,
        maxLimitUsdt: 180,
        paymentMethods: ['Pago Móvil Banesco'],
        reputation: '98% (85 órdenes)',
        status: 'active'
      },
      {
        id: 'off_4',
        type: 'Comprar', // Trader buys USDT -> You sell USDT
        traderName: 'Abundancia P2P Express',
        rate: 45.68,
        amountUsdt: 800,
        minLimitUsdt: 50,
        maxLimitUsdt: 800,
        paymentMethods: ['Pago Móvil Banesco', 'Banco de Venezuela'],
        reputation: '100% (930 órdenes)',
        status: 'active'
      },
      {
        id: 'off_5',
        type: 'Comprar',
        traderName: 'Manuel Cambios Rápidos',
        rate: 45.62,
        amountUsdt: 350,
        minLimitUsdt: 15,
        maxLimitUsdt: 350,
        paymentMethods: ['Provincial', 'Bancamiga'],
        reputation: '97.5% (210 órdenes)',
        status: 'active'
      }
    ];
  });

  // Active P2P Transactions/Trades
  const [transactions, setTransactions] = useState<P2PTransaction[]>(() => {
    const saved = localStorage.getItem('tapp_p2p_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'tr_1092',
        type: 'Comprar',
        offerId: 'off_2',
        rate: 45.80,
        amountUsdt: 50.00,
        amountBs: 2290.00,
        status: 'pending_payment',
        paymentInfo: {
          bank: 'Banco Mercantil (0105)',
          phone: '0412-5551234',
          idCard: 'V-19.852.147',
          holder: 'Kervin José Mercado'
        },
        createdAt: new Date(Date.now() - 360000).toISOString()
      }
    ];
  });

  // State for posting custom P2P offers
  const [showCreateOfferModal, setShowCreateOfferModal] = useState<boolean>(false);
  const [newOfferType, setNewOfferType] = useState<'Comprar' | 'Vender'>('Comprar');
  const [newOfferRate, setNewOfferRate] = useState<string>("45.80");
  const [newOfferAmount, setNewOfferAmount] = useState<string>("100");
  const [newOfferMinLimit, setNewOfferMinLimit] = useState<string>("10");
  const [newOfferMaxLimit, setNewOfferMaxLimit] = useState<string>("100");
  const [newOfferBank, setNewOfferBank] = useState<string>("Pago Móvil Banesco");

  // State for buying/selling trade modal trigger
  const [selectedOfferToTrade, setSelectedOfferToTrade] = useState<P2POffer | null>(null);
  const [tradeAmountUsdt, setTradeAmountUsdt] = useState<string>("50");
  const [tradeAmountBs, setTradeAmountBs] = useState<string>("2290.00");

  // Simulated image upload for Bank Receipt
  const [isUploadingReceipt, setIsUploadingReceipt] = useState<string | null>(null);
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('tapp_p2p_offers', JSON.stringify(offers));
  }, [offers]);

  useEffect(() => {
    localStorage.setItem('tapp_p2p_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Recalculate calculator results
  useEffect(() => {
    const val = parseFloat(calcInput);
    if (!isNaN(val) && val > 0) {
      if (calcType === 'usdt_to_bs') {
        setCalcOutput((val * usdtPriceInBs).toFixed(2));
      } else {
        setCalcOutput((val / usdtPriceInBs).toFixed(2));
      }
    } else {
      setCalcOutput("0.00");
    }
  }, [calcInput, calcType, usdtPriceInBs]);

  // Handle calculator trade trigger
  useEffect(() => {
    const val = parseFloat(tradeAmountUsdt);
    if (selectedOfferToTrade && !isNaN(val)) {
      setTradeAmountBs((val * selectedOfferToTrade.rate).toFixed(2));
    }
  }, [tradeAmountUsdt, selectedOfferToTrade]);

  // Trigger simulated live P2P rate update
  const handleRefreshRate = () => {
    setIsUpdatingRate(true);
    setTimeout(() => {
      // Simulate slight variation in Venezuelan exchange rate (Bs/USDT)
      const change = (Math.random() - 0.5) * 0.4;
      const newRate = Number((usdtPriceInBs + change).toFixed(2));
      setUsdtPriceInBs(newRate);
      setIsUpdatingRate(false);
    }, 700);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    setTimeout(() => setCopiedTextId(null), 2000);
  };

  // Create a new custom P2P offer
  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const rateVal = parseFloat(newOfferRate);
    const amountVal = parseFloat(newOfferAmount);
    const minVal = parseFloat(newOfferMinLimit);
    const maxVal = parseFloat(newOfferMaxLimit);

    if (isNaN(rateVal) || isNaN(amountVal) || isNaN(minVal) || isNaN(maxVal)) {
      alert("Por favor introduce valores de oferta válidos.");
      return;
    }

    const newOffer: P2POffer = {
      id: 'off_' + Date.now(),
      type: newOfferType,
      traderName: 'Tú (Operador Principal)',
      rate: rateVal,
      amountUsdt: amountVal,
      minLimitUsdt: minVal,
      maxLimitUsdt: maxVal,
      paymentMethods: [newOfferBank],
      reputation: '100% (Verificado)',
      status: 'active'
    };

    setOffers([newOffer, ...offers]);
    setShowCreateOfferModal(false);
    
    // Switch tabs to display our newly posted offer type
    if (newOfferType === 'Comprar') {
      setActiveTab('sell'); // System buys -> Users sell 
    } else {
      setActiveTab('buy'); // System sells -> Users buy
    }
  };

  // Start instant trade
  const handleStartTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferToTrade) return;

    const usdtToTrade = parseFloat(tradeAmountUsdt);
    if (isNaN(usdtToTrade) || usdtToTrade <= 0) {
      alert("Introduce un monto válido de USDT.");
      return;
    }

    if (usdtToTrade < selectedOfferToTrade.minLimitUsdt || usdtToTrade > selectedOfferToTrade.maxLimitUsdt) {
      alert(`El monto debe estar entre los límites del comerciante: $${selectedOfferToTrade.minLimitUsdt} - $${selectedOfferToTrade.maxLimitUsdt} USDT`);
      return;
    }

    // Set bank mock details for the selected trader
    const paymentBank = selectedOfferToTrade.paymentMethods[0] || 'Pago Móvil Banesco';
    const isBuy = selectedOfferToTrade.type === 'Vender'; // Trader Sell means we buy USDT from them

    const newTrade: P2PTransaction = {
      id: 'tr_' + Math.floor(1000 + Math.random() * 9000),
      type: isBuy ? 'Comprar' : 'Vender',
      offerId: selectedOfferToTrade.id,
      rate: selectedOfferToTrade.rate,
      amountUsdt: usdtToTrade,
      amountBs: usdtToTrade * selectedOfferToTrade.rate,
      status: 'pending_payment',
      paymentInfo: {
        bank: paymentBank,
        phone: '0424-' + Math.floor(1000000 + Math.random() * 8999999),
        idCard: 'V-' + Math.floor(12000000 + Math.random() * 15000000),
        holder: selectedOfferToTrade.traderName
      },
      createdAt: new Date().toISOString()
    };

    setTransactions([newTrade, ...transactions]);
    setSelectedOfferToTrade(null);
    setActiveTab('orders'); // Jump to my orders tab to view active trade!
  };

  // Simulate complete payment (user claims they paid and uploads capture)
  const handleConfirmPaid = (trId: string) => {
    setTransactions(transactions.map(t => {
      if (t.id === trId) {
        return {
          ...t,
          status: 'paid_checking',
          buyerReceiptUrl: '/assets/simulated_capture_pm.jpg' // mock proof
        };
      }
      return t;
    }));
  };

  // Simulate admin liberating funds or cancel
  const handleUpdateStatusByAdmin = (trId: string, newStatus: 'completed' | 'disputed' | 'cancelled') => {
    setTransactions(transactions.map(t => {
      if (t.id === trId) {
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  const filteredOffers = offers.filter(o => {
    const isTargetType = activeTab === 'buy' ? o.type === 'Vender' : o.type === 'Comprar';
    if (!isTargetType) return false;
    
    if (selectedBankFilter !== 'Todos') {
      return o.paymentMethods.some(pm => pm.toLowerCase().includes(selectedBankFilter.toLowerCase()));
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-neutral-950 font-sans text-neutral-200 select-none pb-12">
      {/* Upper Status / Header bar */}
      <div className="border-b border-emerald-500/10 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 animate-pulse">
              <ArrowLeftRight className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Tapp <span className="text-emerald-400">P2P Exchange</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold tracking-wider border border-emerald-500/30">
                  MÓDULO DEMO
                </span>
              </h1>
              <p className="text-[10px] text-zinc-400 font-medium">Mercado Cambiario de USDT a Bolívares (BsS) para Venezuela</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Live Exchange Rate */}
            <div className="bg-zinc-800/80 rounded-lg px-2.5 py-1 border border-zinc-700/50 flex items-center space-x-2">
              <span className="text-[10.5px] text-zinc-400 font-mono">Tasa Promedio:</span>
              <strong className="text-sm text-[#39FF14] font-mono">{usdtPriceInBs.toFixed(2)} Bs/USDT</strong>
              <button 
                onClick={handleRefreshRate} 
                className={`p-1 text-zinc-400 hover:text-white rounded transition ${isUpdatingRate ? 'animate-spin' : ''}`}
                title="Actualizar tasa cambiaria"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>

            <button 
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 text-xs font-semibold flex items-center gap-1 border border-zinc-700/60 transition active:scale-95"
            >
              <X className="h-3.5 w-3.5" /> Volver a Tappmusic
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-emerald-950/20 border border-emerald-500/20 rounded-2xl p-5 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-sans text-[10px] font-bold border border-emerald-500/25">
              🚀 GESTIÓN DE LIQUIDEZ Y TRANSFERENCIAS
            </span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Crea tu propio banco P2P seguro</h2>
            <p className="text-xs text-zinc-300 leading-relaxed max-w-xl">
              Diseña la pasarela donde tus usuarios compren y vendan USDT por Bolívares de forma transparente. Aquí puedes ver y simular toda la experiencia de usuario y el flujo de mediación del administrador.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('advisor')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-900 text-xs font-black rounded-lg transition active:scale-95 whitespace-nowrap flex items-center gap-2 shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
          >
            <HelpCircle className="h-4 w-4" /> ¿Cómo Ganar Dinero con P2P?
          </button>
        </div>

        {/* Dynamic Calculator widget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Quick Swap Calculator */}
          <div className="bg-zinc-900/95 p-4 rounded-xl border border-zinc-800 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Landmark className="h-3.5 w-3.5 text-emerald-400" /> Calculadora de Swap
                </span>
                <button 
                  onClick={() => setCalcType(calcType === 'usdt_to_bs' ? 'bs_to_usdt' : 'usdt_to_bs')}
                  className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-bold transition flex items-center gap-1"
                >
                  <ArrowLeftRight className="h-3 w-3" /> Invertir
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold block mb-1 uppercase tracking-wider">
                    {calcType === 'usdt_to_bs' ? 'Tú envías (USDT)' : 'Tú envías (Bolívares Bs)'}
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={calcInput} 
                      onChange={(e) => setCalcInput(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 text-white rounded-lg px-3 py-2 text-sm font-bold font-mono focus:outline-none focus:border-emerald-500 transition"
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-zinc-400 font-extrabold font-mono">
                      {calcType === 'usdt_to_bs' ? 'USDT' : 'Bs'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center -my-2">
                  <div className="bg-zinc-800 p-1.5 rounded-full border border-zinc-700">
                    <PlusCircle className="h-3.5 w-3.5 text-emerald-400 rotate-45" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 font-bold block mb-1 uppercase tracking-wider">
                    {calcType === 'usdt_to_bs' ? 'Tú recibes (Bolívares Bs)' : 'Tú recibes (USDT)'}
                  </label>
                  <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg px-3 py-2 text-sm font-black font-mono text-[#39FF14] flex justify-between items-center">
                    <span>{calcOutput}</span>
                    <span className="text-xs text-zinc-400 font-extrabold">
                      {calcType === 'usdt_to_bs' ? 'VES' : 'USDT'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[9px] text-zinc-400 italic mt-3 text-center">
              *Tasa de conversión ponderada calculada en tiempo real.
            </p>
          </div>

          {/* Liquid Balances Card */}
          <div className="bg-zinc-900/95 p-4 rounded-xl border border-zinc-800 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-emerald-400" /> Cajas de Liquidez Activa
                </span>
                <span className="text-[9px] bg-[#39FF14]/10 text-[#39FF14] px-1.5 py-0.5 rounded font-bold font-mono uppercase tracking-wider">
                  Estable
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 my-2">
                <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800/80 text-left">
                  <span className="text-[9px] text-zinc-400 font-bold block mb-0.5 uppercase">Bóveda USDT</span>
                  <div className="text-sm font-black text-white">${bovedaUsdt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <span className="text-[8.5px] text-emerald-400 font-mono">Disponibles en Escrow</span>
                </div>
                <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800/80 text-left">
                  <span className="text-[9px] text-zinc-400 font-bold block mb-0.5 uppercase">Fondo Bolívares</span>
                  <div className="text-sm font-black text-white">{fondoBs.toLocaleString('es-VE', { minimumFractionDigits: 0 })} Bs</div>
                  <span className="text-[8.5px] text-zinc-400 font-mono">Pago Móvil Banesco</span>
                </div>
              </div>
              {adminCommissionTotal > 0 && (
                <div className="text-[9px] bg-zinc-950 px-2 py-1.5 rounded border border-amber-500/10 text-amber-450 font-bold mt-1.5 flex justify-between items-center">
                  <span>💼 GANANCIA ADMIN BPAY (2.5%):</span>
                  <span className="font-mono text-[9.5px] text-[#39FF14]">${adminCommissionTotal.toFixed(2)} USD</span>
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowCreateOfferModal(true)}
              className="w-full mt-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-1.5 rounded-lg text-xs transition border border-zinc-700 active:scale-95 flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="h-3.5 w-3.5 text-emerald-400" /> Publicar Anuncio como Operador
            </button>
          </div>

          {/* Quick Safety Guard Card */}
          <div className="bg-zinc-900/95 p-4 rounded-xl border border-zinc-800 flex flex-col justify-between shadow-lg">
            <div className="space-y-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Escrow Inteligente Activo
              </span>
              <div className="space-y-1.5 text-xs text-zinc-300 leading-relaxed">
                <p className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 text-[#39FF14] mt-0.5 shrink-0" />
                  <span>Los USDT se bloquean automáticamente en el depósito en garantía (Escrow) al abrir una orden.</span>
                </p>
                <p className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 text-[#39FF14] mt-0.5 shrink-0" />
                  <span>El vendedor no puede retirar los activos hasta que el comprador pague o expire el tiempo.</span>
                </p>
              </div>
            </div>

            <div className="bg-zinc-950 p-2 rounded-lg border border-yellow-500/10 mt-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 animate-pulse shrink-0" />
              <p className="text-[8.5px] text-zinc-400 leading-tight">
                <strong>Atención:</strong> Nunca liberes fondos sin confirmar el capital real en tu cuenta bancaria. Los captures de pantalla pueden falsificarse.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection Switchers */}
        <div className="flex border-b border-zinc-800 mb-6 bg-zinc-900/45 p-1 rounded-xl">
          <button 
            onClick={() => { setActiveTab('buy'); setDepositStep(1); }}
            className={`flex-1 py-2 rounded-lg text-xs font-black transition ${activeTab === 'buy' ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-400 shadow-[inset_0_1px_2px_rgba(16,185,129,0.15)] border-b-2 border-emerald-500' : 'text-zinc-400 hover:text-white'}`}
          >
            Quiero Comprar USDT <span className="text-[10px] text-zinc-400 block font-normal">(Traders Venden)</span>
          </button>
          <button 
            onClick={() => { setActiveTab('sell'); setDepositStep(1); }}
            className={`flex-1 py-2 rounded-lg text-xs font-black transition ${activeTab === 'sell' ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-400 shadow-[inset_0_1px_2px_rgba(16,185,129,0.15)] border-b-2 border-emerald-500' : 'text-zinc-400 hover:text-white'}`}
          >
            Quiero Vender USDT <span className="text-[10px] text-zinc-400 block font-normal">(Traders Compran)</span>
          </button>
          <button 
            onClick={() => { setActiveTab('orders'); setDepositStep(1); }}
            className={`flex-1 py-2 rounded-lg text-xs font-black transition relative ${activeTab === 'orders' ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-400 shadow-[inset_0_1px_2px_rgba(16,185,129,0.15)] border-b-2 border-emerald-500' : 'text-zinc-400 hover:text-white'}`}
          >
            Mis Órdenes Activas
            {transactions.some(t => t.status === 'pending_payment' || t.status === 'paid_checking') && (
              <span className="absolute top-1.5 right-6 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
              </span>
            )}
            <span className="text-[10px] text-zinc-400 block font-normal">(Escrow/{transactions.length} activas)</span>
          </button>

          {/* New BPay/Mastercard/VISA Deposit Tab */}
          <button 
            onClick={() => { setActiveTab('deposit'); setDepositStep(1); }}
            className={`flex-1 py-2 rounded-lg text-xs font-black transition relative ${activeTab === 'deposit' ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-400 shadow-[inset_0_1px_2px_rgba(245,158,11,0.15)] border-b-2 border-amber-500' : 'text-zinc-400 hover:text-white'}`}
          >
            💳 Depósito USD (BPay)
            <span className="text-[10px] text-zinc-400 block font-normal">(Visa/Mastercard 2.5%)</span>
          </button>

          <button 
            onClick={() => { setActiveTab('advisor'); setDepositStep(1); }}
            className={`flex-grow py-2 rounded-lg text-xs font-black transition ${activeTab === 'advisor' ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-400 shadow-[inset_0_1px_2px_rgba(245,158,11,0.15)] border-b-2 border-amber-500 text-amber-300' : 'text-zinc-400 hover:text-white'}`}
          >
            📚 Consejos del Experto
            <span className="text-[10px] text-zinc-400 block font-normal">(Análisis de Riesgo)</span>
          </button>
        </div>

        {/* TAB 1 & 2: Offers board */}
        {(activeTab === 'buy' || activeTab === 'sell') && (
          <div className="space-y-4">
            {/* Bank Filtering Rail */}
            <div className="flex items-center justify-between bg-zinc-900/30 p-2 rounded-xl mb-4 border border-zinc-850">
              <span className="text-xs text-zinc-400 ml-2">Filtrar por Banco nacional:</span>
              <div className="flex space-x-1.5">
                {['Todos', 'Banesco', 'Venezuela', 'Mercantil', 'Provincial'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBankFilter(b)}
                    className={`px-3 py-1 rounded text-[11px] font-bold tracking-tight transition ${selectedBankFilter === b ? 'bg-emerald-500 text-neutral-900' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* List Header */}
            <div className="hidden md:grid grid-cols-5 text-zinc-400 text-xs px-4 font-bold uppercase tracking-wider mb-2">
              <div className="col-span-2">Comerciante / Reputación</div>
              <div>Precio por USDT</div>
              <div>Límites de Orden</div>
              <div className="text-right">Acción</div>
            </div>

            {/* Offers dynamic display */}
            {filteredOffers.length === 0 ? (
              <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-8 text-center text-zinc-400">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-zinc-500" />
                <p className="text-sm font-semibold text-white">No hay ofertas disponibles</p>
                <p className="text-xs text-zinc-400 mt-1">Intenta ajustando el filtro de banco o publica tu propio anuncio de oferta.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOffers.map((o) => (
                  <div 
                    key={o.id} 
                    className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl px-4 py-3.5 hover:border-emerald-500/30 transition flex flex-col md:grid md:grid-cols-5 items-center gap-4 shadow-md"
                  >
                    {/* Trader and reputational info */}
                    <div className="col-span-2 flex items-center justify-start w-full gap-3">
                      <div className="p-2 bg-zinc-800 rounded-full border border-zinc-700 font-extrabold text-white text-xs w-9 h-9 flex items-center justify-center">
                        {o.traderName.charAt(0)}
                      </div>
                      <div className="text-left">
                        <div className="text-white text-sm font-black flex items-center gap-1.5">
                          {o.traderName}
                          <span className="p-0.5 bg-zinc-800 text-[#39FF14] text-[8px] border border-[#39FF14]/20 rounded font-bold font-mono">
                            VERIFICADO
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 flex items-center gap-1">
                          <UserCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span>Reputación: <strong>{o.reputation}</strong></span>
                        </p>
                      </div>
                    </div>

                    {/* Price in Bolivares */}
                    <div className="w-full text-left md:text-left">
                      <div className="text-lg font-black text-[#39FF14] font-mono">
                        {o.rate.toFixed(2)} <span className="text-xs text-zinc-400">Bs/USDT</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                        <Landmark className="h-3 w-3 text-zinc-400 shrink-0" /> Local: {o.paymentMethods[0]}
                      </p>
                    </div>

                    {/* Transaction bounds limits */}
                    <div className="w-full text-left">
                      <div className="text-xs font-bold text-white font-mono">
                        Límites: ${o.minLimitUsdt.toFixed(2)} - ${o.maxLimitUsdt.toFixed(2)} USDT
                      </div>
                      <span className="text-[10px] text-zinc-400 font-bold block mt-0.5">
                        Fondos: ${o.amountUsdt.toFixed(2)} USDT disponibles
                      </span>
                    </div>

                    {/* Trading triggers */}
                    <div className="w-full text-right flex md:block justify-end">
                      <button
                        onClick={() => {
                          setSelectedOfferToTrade(o);
                          setTradeAmountUsdt(o.minLimitUsdt.toString());
                        }}
                        className={`w-full md:w-auto px-5 py-2 rounded-lg text-xs font-extrabold tracking-tight transition duration-150 active:scale-95 ${activeTab === 'buy' ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-900 border border-emerald-400 shadow-[0_3px_12px_rgba(16,185,129,0.25)]' : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/25'}`}
                      >
                        {activeTab === 'buy' ? 'Comprar USDT' : 'Vender USDT'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Active Orders & Escrow Operations */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 animate-pulse" />
              <p className="text-xs text-zinc-300 leading-relaxed">
                El capital de las órdenes listadas abajo está congelado de forma segura en nuestro <strong>depósito en garantía (Escrow)</strong>. Una vez confirmado el pago vía Pago Móvil, el comerciante o el administrador confirman para liberar los USDT a la billetera.
              </p>
            </div>

            {transactions.length === 0 ? (
              <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-8 text-center text-zinc-400">
                <FileText className="h-8 w-8 mx-auto mb-2 text-zinc-500" />
                <p className="text-sm font-semibold text-white">No tienes órdenes en progreso</p>
                <p className="text-xs text-zinc-500 mt-1">Selecciona una oferta en el tablero principal para iniciar transacciones.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((t) => {
                  const isBuy = t.type === 'Comprar';
                  return (
                    <div 
                      key={t.id}
                      className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 shadow-md"
                    >
                      {/* Top status bar */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${isBuy ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {isBuy ? 'Tú Compras USDT' : 'Tú Vendes USDT'}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono font-semibold">
                            ID Orden: #{t.id}
                          </span>
                        </div>

                        {/* Status badge */}
                        <div className="flex items-center space-x-2">
                          {t.status === 'pending_payment' && (
                            <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-0.5 rounded font-bold text-[10px] animate-pulse">
                              ⏳ ESPERANDO PAGO MÓVIL (COMPRADOR)
                            </span>
                          )}
                          {t.status === 'paid_checking' && (
                            <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded font-black text-[10px]">
                              🔎 VERIFICANDO PAGO (COMERCIANTE)
                            </span>
                          )}
                          {t.status === 'completed' && (
                            <span className="bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 px-2.5 py-0.5 rounded font-black text-[10px]">
                              ✅ COMPLETADA (FONDOS LIBERADOS)
                            </span>
                          )}
                          {t.status === 'disputed' && (
                            <span className="bg-red-500/15 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded font-black text-[10px] animate-bounce">
                              🚨 EN DISPUTA ARBITRAL (ADMIN)
                            </span>
                          )}
                          {t.status === 'cancelled' && (
                            <span className="bg-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded font-bold text-[10px]">
                              ❌ CANCELADA / EXPIRADA
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Trade amounts info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Transaction amounts */}
                        <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800">
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Monto total</span>
                          <div className="text-xl font-black text-white font-mono mt-0.5">
                            ${t.amountUsdt.toFixed(2)} <span className="text-xs text-zinc-400 font-normal">USDT</span>
                          </div>
                          <div className="text-xs font-extrabold text-[#39FF14] font-mono mt-0.5">
                            Equivale a: {t.amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.
                          </div>
                          <p className="text-[9.5px] text-zinc-400 font-medium font-mono mt-1">Tasa pactada: {t.rate.toFixed(2)} Bs/USDT</p>
                        </div>

                        {/* Payment coordinates info */}
                        <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800">
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Datos de Pago Móvil</span>
                          {isBuy ? (
                            <div className="mt-1 space-y-1 text-xs text-zinc-300">
                              <p className="font-semibold flex items-center justify-between">
                                <span>Banco: <strong>{t.paymentInfo.bank}</strong></span>
                              </p>
                              <p className="font-semibold flex items-center justify-between font-mono">
                                <span>Teléfono: <strong>{t.paymentInfo.phone}</strong></span>
                                <button 
                                  onClick={() => copyToClipboard(t.paymentInfo.phone, t.id + 'ph')}
                                  className="text-[9.5px] text-emerald-400 hover:text-emerald-300 font-bold font-sans"
                                >
                                  {copiedTextId === t.id + 'ph' ? '¡Copiado!' : 'Copiar'}
                                </button>
                              </p>
                              <p className="font-semibold flex items-center justify-between font-mono">
                                <span>C.I. / RIF: <strong>{t.paymentInfo.idCard}</strong></span>
                                <button 
                                  onClick={() => copyToClipboard(t.paymentInfo.idCard.replace(/[V-]/g, ''), t.id + 'id')}
                                  className="text-[9.5px] text-emerald-400 hover:text-emerald-300 font-bold font-sans"
                                >
                                  {copiedTextId === t.id + 'id' ? '¡Copiado!' : 'Copiar'}
                                </button>
                              </p>
                              <p className="font-semibold text-zinc-200">Titular: <strong>{t.paymentInfo.holder}</strong></p>
                            </div>
                          ) : (
                            <div className="mt-2 text-xs text-zinc-400 leading-tight">
                              El comprador realizará el Pago Móvil a tus datos asociados. Espera a recibir el dinero firme en tu cuenta antes de liberar.
                            </div>
                          )}
                        </div>

                        {/* Document Verification / Actions */}
                        <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800 flex flex-col justify-between">
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">Evidencia de Transferencia</span>
                          
                          {t.buyerReceiptUrl ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-1.5 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
                              <div className="text-left">
                                <span className="text-[10px] text-emerald-400 font-bold block">pago_movil_comprobante.jpg</span>
                                <span className="text-[8.5px] text-zinc-400 font-mono">Subido exitosamente</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[10px] text-zinc-500 italic p-2 text-center border border-dashed border-zinc-800 rounded">
                              Sin capture cargado aún.
                            </div>
                          )}

                          {t.status === 'pending_payment' && isBuy && (
                            <div className="mt-2">
                              <button
                                onClick={() => handleConfirmPaid(t.id)}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-900 font-black py-1.5 rounded text-[11px] transition active:scale-95 flex items-center justify-center gap-1"
                              >
                                <Upload className="h-3.5 w-3.5" /> Confirmar Pago (+ Subir Capture)
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Simulation Controller for testing */}
                      <div className="bg-zinc-950/50 rounded-lg p-2.5 border border-zinc-850 flex flex-col md:flex-row items-center justify-between gap-3">
                        <span className="text-[9.5px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5" /> PANEL SIMULACIÓN (TÚ COMO ADMINISTRADOR):
                        </span>

                        <div className="flex space-x-1 w-full md:w-auto">
                          {t.status !== 'completed' && t.status !== 'cancelled' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatusByAdmin(t.id, 'completed')}
                                className="flex-1 md:flex-initial bg-emerald-500/10 hover:bg-emerald-500/20 text-[#39FF14] text-[10px] px-3 py-1.5 rounded font-black border border-[#39FF14]/30 duration-150"
                              >
                                ✅ Liberar USDT a Billetera
                              </button>
                              <button
                                onClick={() => handleUpdateStatusByAdmin(t.id, 'disputed')}
                                className="flex-1 md:flex-initial bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-[10px] px-3 py-1.5 rounded font-bold border border-yellow-500/25 duration-150"
                              >
                                🚨 Marcar Disputa
                              </button>
                              <button
                                onClick={() => handleUpdateStatusByAdmin(t.id, 'cancelled')}
                                className="flex-1 md:flex-initial bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] px-3 py-1.5 rounded font-bold border border-red-500/20 duration-150"
                              >
                                ❌ Cancelar Orden
                              </button>
                            </>
                          )}
                          {(t.status === 'completed' || t.status === 'cancelled') && (
                            <span className="text-[10px] text-zinc-400 italic">Transacción archivada de forma segura en Firestore.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: BPay Visa/Mastercard Deposit & Withdraw */}
        {activeTab === 'deposit' && (
          <div className="max-w-md mx-auto bg-[#181a20] border border-zinc-800/80 rounded-3xl p-6 shadow-2xl text-left my-4 relative overflow-hidden">
            {/* Ambient background glow inside the card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Header with selector for Deposit / Withdraw */}
            <div className="flex items-center space-x-1.5 p-1 bg-zinc-900/80 rounded-2xl border border-zinc-800/60 mb-6 relative z-10">
              <button
                onClick={() => { setDepositType('deposit'); setDepositStep(1); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-tight transition duration-150 ${depositType === 'deposit' ? 'bg-[#f0b90b] text-neutral-950 shadow-md shadow-amber-500/15' : 'text-zinc-400 hover:text-white'}`}
              >
                Depósito
              </button>
              <button
                onClick={() => { setDepositType('withdraw'); setDepositStep(1); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-tight transition duration-150 ${depositType === 'withdraw' ? 'bg-[#f0b90b] text-neutral-950 shadow-md shadow-amber-500/15' : 'text-zinc-400 hover:text-white'}`}
              >
                Retirar
              </button>
            </div>

            {depositStep === 1 && (
              <div className="space-y-5 animate-fadeIn relative z-10">
                <h3 className="text-[14px] font-black text-zinc-100 tracking-tight">
                  {depositType === 'deposit' ? 'Selecciona un método de depósito' : 'Selecciona un método de retiro'}
                </h3>

                {/* Currency selector component */}
                <div className="flex items-center justify-between bg-zinc-950/70 border border-zinc-800/60 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-[#f0b90b] font-black font-mono text-xs border border-amber-500/40">
                      $
                    </span>
                    <span className="text-xs font-extrabold text-white">USD (Dólar Fiat / Tarjeta Internacional)</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-bold hover:text-white transition cursor-pointer flex items-center gap-1 bg-zinc-900 border border-zinc-850 px-2 py-1 rounded-lg">
                    Más <span className="text-[8px] text-[#f0b90b]">▼</span>
                  </span>
                </div>

                {/* Amount input box */}
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold block mb-1.5 uppercase tracking-wider">
                    {depositType === 'deposit' ? 'Monto a Depositar (USD)' : 'Monto a Retirar (USD)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      min="10"
                      max="10000"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/80 rounded-2xl px-4 py-3.5 text-sm font-black font-mono text-white focus:outline-none transition-all"
                      placeholder="100.00"
                    />
                    <span className="absolute right-4 top-4.5 text-xs text-zinc-400 font-extrabold font-mono">USD</span>
                  </div>
                  <p className="text-[9.5px] text-zinc-500 mt-1 italic">
                    *Mínimo de operación: $10 USD. Límites automáticos con BPay.
                  </p>
                </div>

                {/* Recommended (VISA / Mastercard) Card block */}
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-wider">Recomendado</h4>
                  
                  <div 
                    onClick={() => setDepositMethod('card')}
                    className={`p-4 rounded-2.5xl border cursor-pointer transition duration-150 flex items-start space-x-3.5 relative ${depositMethod === 'card' ? 'bg-amber-500/5 border-amber-500 shadow-[0_0_15px_rgba(240,185,11,0.08)]' : 'bg-transparent border-zinc-800/80 hover:border-zinc-700'}`}
                  >
                    <div className="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800 text-[#f0b90b] shrink-0">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div className="text-left space-y-0.5">
                      <h5 className="text-xs font-black text-white">Tarjeta (VISA/Mastercard)</h5>
                      <p className="text-[9.5px] text-zinc-400 font-medium">Impulsado por BPay para Banco de Venezuela y otros</p>
                      
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1">
                        <span className="bg-amber-500/10 text-amber-400 font-black text-[9px] px-2 py-0.5 rounded font-mono border border-amber-500/20">
                          Comisión del 2.5%
                        </span>
                        <span className="bg-emerald-500/10 text-[#39FF14] font-black text-[9px] px-2 py-0.5 rounded font-mono border border-emerald-500/20 animate-pulse">
                          En tiempo real
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Others row (Google Pay) */}
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-wider">Otros</h4>
                  
                  <div 
                    onClick={() => setDepositMethod('gpay')}
                    className={`p-4 rounded-2.5xl border cursor-pointer transition duration-150 flex items-start space-x-3.5 relative ${depositMethod === 'gpay' ? 'bg-amber-500/5 border-amber-500 shadow-[0_0_15px_rgba(240,185,11,0.08)]' : 'bg-transparent border-zinc-800/80 hover:border-zinc-700'}`}
                  >
                    <div className="absolute top-3.5 right-4 bg-amber-500/10 text-[#f0b90b] text-[8px] font-black px-1.5 py-0.5 rounded border border-amber-500/20 select-none">
                      Usado por última vez
                    </div>
                    
                    <div className="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800 text-[#39FF14] shrink-0">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div className="text-left space-y-0.5">
                      <h5 className="text-xs font-black text-white flex items-center gap-1.5">
                        Google Pay
                      </h5>
                      <p className="text-[9.5px] text-zinc-400 font-medium">Impulsado por BPay con tarjeta internacional</p>
                      
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1">
                        <span className="bg-amber-500/10 text-amber-400 font-black text-[9px] px-2 py-0.5 rounded font-mono border border-amber-500/20">
                          Comisión del 2.5%
                        </span>
                        <span className="bg-emerald-500/10 text-[#39FF14] font-black text-[9px] px-2 py-0.5 rounded font-mono border border-emerald-500/20">
                          En tiempo real
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Golden Continue button */}
                <button
                  onClick={() => {
                    const val = parseFloat(depositAmount);
                    if (isNaN(val) || val < 10) {
                      alert("Por favor introduce un monto mínimo de $10 USD.");
                      return;
                    }
                    if (depositMethod === 'gpay') {
                      setIsProcessingDeposit(true);
                      setTimeout(() => {
                        setIsProcessingDeposit(false);
                        const comision = val * 0.025;
                        const finalAmount = val - comision;
                        if (depositType === 'deposit') {
                          setBovedaUsdt(prev => prev + finalAmount);
                          setAdminCommissionTotal(prev => prev + comision);
                        } else {
                          setBovedaUsdt(prev => Math.max(0, prev - val));
                        }
                        setDepositStep(3);
                      }, 2000);
                    } else {
                      setDepositStep(2);
                    }
                  }}
                  disabled={isProcessingDeposit}
                  className="w-full mt-4 bg-[#f0b90b] text-neutral-950 border border-yellow-500/30 hover:bg-[#dfaa0a] hover:shadow-[0_0_15px_rgba(240,185,11,0.25)] font-black uppercase text-xs rounded-2xl py-4 px-6 transition duration-150 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingDeposit ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Procesando pago bpay...
                    </>
                  ) : (
                    'Continuar'
                  )}
                </button>
              </div>
            )}

            {depositStep === 2 && (
              <div className="space-y-4 animate-fadeIn relative z-10">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5 mb-2">
                  <h4 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1">
                    <CreditCard className="h-4 w-4 text-amber-500" /> Detalles de Tarjeta BPay
                  </h4>
                  <button 
                    onClick={() => setDepositStep(1)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-0.5"
                  >
                    ◀ Volver
                  </button>
                </div>

                {/* Calculations showing fee & net crediting */}
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400 font-medium">
                    <span>Monto de la Operación:</span>
                    <strong className="text-white font-mono">${parseFloat(depositAmount).toFixed(2)} USD</strong>
                  </div>
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span>Comisión Administrador (2.5%):</span>
                    <strong className="font-mono">-${(parseFloat(depositAmount) * 0.025).toFixed(2)} USD</strong>
                  </div>
                  <div className="border-t border-zinc-850 my-2 pt-2.5 flex justify-between text-white font-black text-sm">
                    <span>Monto Neto acreditado:</span>
                    <span className="text-[#39FF14] font-mono">${(parseFloat(depositAmount) * 0.975).toFixed(2)} USDT</span>
                  </div>
                </div>

                {/* Card input simulated forms */}
                <div className="space-y-3.5 pt-1">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold block mb-1 uppercase tracking-wider">
                      Titular de la Tarjeta (Mastercard/Visa)
                    </label>
                    <input 
                      type="text"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none text-white placeholder-zinc-650"
                      placeholder="Kervin José Torres"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold block mb-1 uppercase tracking-wider">
                      Número de Tarjeta (BPay o Internacional)
                    </label>
                    <input 
                      type="text"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs font-mono tracking-widest focus:outline-none text-white placeholder-zinc-650"
                      placeholder="5412 7500 1234 5678"
                      value={cardNumber}
                      maxLength={19}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '').substring(0, 16);
                        const parts = raw.match(/.{1,4}/g) || [];
                        setCardNumber(parts.join(' '));
                      }}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[10px] text-zinc-400 font-bold block mb-1 uppercase tracking-wider">
                        Vencimiento
                      </label>
                      <input 
                        type="text"
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none text-white text-center placeholder-zinc-650"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => {
                          let raw = e.target.value.replace(/\D/g, '').substring(0, 4);
                          if (raw.length > 2) {
                            raw = raw.substring(0, 2) + '/' + raw.substring(2);
                          }
                          setCardExpiry(raw);
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 font-bold block mb-1 uppercase tracking-wider">
                        CVV / CVI
                      </label>
                      <input 
                        type="password"
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none text-white text-center placeholder-zinc-650 tracking-widest"
                        placeholder="***"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                        required
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!cardHolder || cardNumber.length < 15 || cardExpiry.length < 5 || cardCvv.length < 3) {
                        alert("Por favor rellene los datos de tarjeta.");
                        return;
                      }
                      setIsProcessingDeposit(true);
                      setTimeout(() => {
                        setIsProcessingDeposit(false);
                        const val = parseFloat(depositAmount);
                        const comision = val * 0.025;
                        const finalAmount = val - comision;
                        if (depositType === 'deposit') {
                          setBovedaUsdt(prev => prev + finalAmount);
                          setAdminCommissionTotal(prev => prev + comision);
                        } else {
                          setBovedaUsdt(prev => Math.max(0, prev - val));
                        }
                        setDepositStep(3);
                      }, 2500);
                    }}
                    disabled={isProcessingDeposit}
                    className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-900 border border-emerald-450/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] font-black uppercase text-xs rounded-2xl py-4 px-6 transition duration-150 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingDeposit ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin animate-reverse" /> Autorizando Pasarela BPay...
                      </>
                    ) : (
                      `Pagar $${parseFloat(depositAmount).toFixed(2)} USD`
                    )}
                  </button>
                </div>
              </div>
            )}

            {depositStep === 3 && (
              <div className="text-center space-y-4 py-8 animate-fadeIn relative z-10">
                <div className="w-16 h-16 bg-[#39FF14]/10 border border-[#39FF14]/40 text-[#39FF14] rounded-full flex items-center justify-center mx-auto mb-2 shadow-[0_0_20px_rgba(57,255,20,0.18)]">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-white">¡Operación BPay Completada!</h4>
                  <p className="text-xs text-zinc-350">
                    Tu pase de fondos internacional mediante <strong className="text-[#39FF14]">BPay / VISA / Mastercard</strong> se ha liquidado de forma impecable.
                  </p>
                </div>

                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 space-y-2 text-xs text-left">
                  <div className="flex justify-between text-zinc-400">
                    <span>Monto de la Operación:</span>
                    <strong className="text-white font-mono">${parseFloat(depositAmount).toFixed(2)} USD</strong>
                  </div>
                  {depositType === 'deposit' ? (
                    <>
                      <div className="flex justify-between text-amber-400 font-semibold">
                        <span>Comisión del Administrador (2.5%):</span>
                        <strong className="font-mono">-${(parseFloat(depositAmount) * 0.025).toFixed(2)} USD</strong>
                      </div>
                      <div className="border-t border-zinc-850 pt-2 flex justify-between text-white font-black">
                        <span>Bóveda USDT Acreditada:</span>
                        <span className="text-emerald-400 font-mono">+${(parseFloat(depositAmount) * 0.975).toFixed(2)} USDT</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-red-400 font-semibold">
                        <span>Monto Retirado:</span>
                        <strong className="font-mono font-black">-${parseFloat(depositAmount).toFixed(2)} USD</strong>
                      </div>
                      <div className="border-t border-zinc-850 pt-2 text-zinc-400 text-[10px] leading-tight text-center">
                        Los fondos han sido debitados de tu balance exitosamente.
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => {
                    setDepositStep(1);
                    setCardNumber("");
                    setCardHolder("");
                    setCardExpiry("");
                    setCardCvv("");
                    setActiveTab('buy'); // redirect user to P2P market
                  }}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 hover:text-white text-zinc-300 font-black py-3 rounded-2xl text-xs transition active:scale-95 border border-zinc-750/70"
                >
                  Regresar al Mercado P2P
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Strategic Advisor & Risk Analysis */}
        {activeTab === 'advisor' && (
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 space-y-6 shadow-xl text-left">
            <div className="flex items-center space-x-3 border-b border-zinc-800 pb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-lime-500/20 border border-amber-500/30">
                <Users className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Análisis de Estructura de Negocio Cambiario</h3>
                <p className="text-xs text-zinc-400">¿Cómo diseñar el flujo de USDT a Bolívares (Bs) minimizando el fraude?</p>
              </div>
            </div>

            {/* Strategy selector radio blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: Admin Mediad OTC */}
              <div 
                onClick={() => setSelectedAdviceType('otc')}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${selectedAdviceType === 'otc' ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.15)]' : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-white uppercase font-sans tracking-wide">Modelo Directo (OTC)</span>
                    <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">RECOMENDADO</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-normal">
                    Los usuarios te envían las solicitudes de cambio (Compra/Venta) directamente a ti. Tú eres la única contraparte confiable que les vende y compra usando tus datos bancarios oficiales.
                  </p>
                </div>
                <div className="mt-4 border-t border-zinc-800/80 pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Seguridad: Alta
                  </span>
                  <span className="text-[10px] text-zinc-400 font-bold">100% Control de Liquidez</span>
                </div>
              </div>

              {/* Option 2: Active User P2P */}
              <div 
                onClick={() => setSelectedAdviceType('free_p2p')}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${selectedAdviceType === 'free_p2p' ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.15)]' : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-white uppercase tracking-wide">P2P Abierto (Como Binance)</span>
                    <span className="bg-red-500/10 text-red-400 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">RIESGO MODERADO</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-normal">
                    Los usuarios comercian libremente entre ellos. Tu plataforma actúa únicamente como garante en custodia (fideicomiso). En caso de desacuerdo, abren una disputa de arbitraje y tú decides quién tiene razón.
                  </p>
                </div>
                <div className="mt-4 border-t border-zinc-800/80 pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-yellow-500 font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Seguridad: Media
                  </span>
                  <span className="text-[10px] text-zinc-400 font-bold">Escala infinita sin capital</span>
                </div>
              </div>

              {/* Option 3: Escrow Hibrido */}
              <div 
                onClick={() => setSelectedAdviceType('hybrid')}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${selectedAdviceType === 'hybrid' ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.15)]' : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-white uppercase tracking-wide">Fideicomiso Garantizado</span>
                    <span className="bg-blue-500/10 text-blue-400 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">MÁXIMO CONTROL</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-normal">
                    Los depósitos se liberan solo tras verificación de Pago Móvil en ambas vías. Tu negocio centraliza la liberación de los USD mediante una comisión garantizada de intermediación de mercado.
                  </p>
                </div>
                <div className="mt-4 border-t border-zinc-800/80 pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Seguridad: Muy Alta
                  </span>
                  <span className="text-[10px] text-zinc-400 font-bold">Rentabilidad Estable</span>
                </div>
              </div>
            </div>

            {/* Context advice explanation logic */}
            <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-400" /> Factibilidad Técnica y de Operación
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {selectedAdviceType === 'otc' && (
                  <strong>Es la mejor idea absoluta para arrancar.</strong> + " Al vender tú mismo los USDT usando tu dirección de billetera, eliminas el riesgo de fraude interno entre usuarios. El cliente te pide comprar $100 USDT, te transfiere Bolívares por Pago Móvil, tú validas la transacción desde la aplicación de tu banco nacional con total seguridad, y le transfieres los USDT desde tu billetera (Binance Pay, MetaMask, CoinBase). La aplicación es limpia, libre de reclamos complejos, garantizando una excelente experiencia de usuario."
                )}
                {selectedAdviceType === 'free_p2p' && (
                  <strong>Este modelo requiere atención legal y mediadores 24/7.</strong> + " Al dejar que los usuarios transen directamente entre ellos, aumentas enormemente la escalabilidad (no necesitas capital para cambiar tú mismo), pero introduces riesgos de estafas (captures de Pago Móvil falsos modificados con Photoshop, triangulación bancaria, etc.). Requieres validación de identidad robusta (KYC) y un equipo de soporte técnico encargado de resolver disputas basándose en estados de cuenta bancarios en formato PDF."
                )}
                {selectedAdviceType === 'hybrid' && (
                  <strong>Estructura Ganadora e Innovadora.</strong> + " Puedes arrancar actuando tú mismo (Kervin) como el Cajero / Liquidador principal de las solicitudes. De esta forma, construyes reputación. Una vez que la plataforma crezca y se gane la confianza absoluta de la comunidad, puedes habilitar cajeros asociados verificados bajo fianza, quienes depositan un fondo en colateral en tu poder de garantía para poder procesar órdenes a otros usuarios de forma automatizada y sin riesgo."
                )}
              </p>
            </div>

            {/* Quick architectural guidance */}
            <div className="bg-zinc-950/20 rounded-xl p-4 border border-zinc-90 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-xs leading-normal space-y-2 border-r border-zinc-850 pr-4">
                <span className="text-[10px] text-[#39FF14] font-black uppercase tracking-wider block">🛠️ CÓMO PASAR ESTO A GITHUB Y FIREBASE MAÑANA</span>
                <p className="text-zinc-400 leading-relaxed">
                  Para modularizar el proyecto de intercambio P2P cambiario en un nuevo repositorio separado limpio:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-300 pl-1 font-sans">
                  <li>Crea un repositorio de GitHub dedicado e inicializa un proyecto con Vite y TypeScript.</li>
                  <li>Configura Firebase en tu consola de Google para dar de alta colecciones dedicadas para: <code className="font-mono text-[10px] bg-zinc-800 text-emerald-400 px-1 rounded">offers_p2p</code> y <code className="font-mono text-[10px] bg-zinc-800 text-emerald-400 px-1 rounded">transactions_p2p</code>.</li>
                  <li>Usa los componentes interactivos creados aquí para disponer de inmediato de una pasarela cambiaria visualmente impecable con soporte de audio.</li>
                </ol>
              </div>

              <div className="text-xs leading-normal space-y-2">
                <span className="text-[10px] text-[#39FF14] font-black uppercase tracking-wider block">📈 MODELO DE NEGOCIO RECOMENDADO</span>
                <p className="text-zinc-400 leading-relaxed">
                  Fija un "margen de diferencial cambial" (spread). Por ejemplo:
                </p>
                <ul className="list-disc list-inside space-y-1 text-zinc-300 pl-1 font-sans">
                  <li>Tasa de Compra de USDT (cuando tú pagas Bolívares): <span className="text-emerald-400 font-mono">45.20 Bs/USDT</span></li>
                  <li>Tasa de Venta de USDT (cuando ellos te pagan Bolívares): <span className="text-emerald-400 font-mono">45.80 Bs/USDT</span></li>
                  <li>Ganancia neta del Operador: <strong className="text-white">0.60 Bs por cada USDT</strong> transado.</li>
                  <li>¡Con un volumen promedio diario de $1,000 USDT generas un ingreso sólido y recurrente de 600 Bs libres de riesgo!</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Trade Order Trigger modal */}
      {selectedOfferToTrade && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 max-w-md w-full rounded-2xl p-5 shadow-2xl text-left scale-100 transition duration-150">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3 mb-4">
              <span className="text-sm font-black text-white flex items-center gap-1.5">
                <ArrowLeftRight className="h-4 w-4 text-emerald-400" /> Nueva Orden P2P
              </span>
              <button 
                onClick={() => setSelectedOfferToTrade(null)}
                className="text-zinc-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 bg-zinc-950 p-3 rounded-lg border border-zinc-850">
              <p className="text-[10px] text-zinc-400 font-bold block mb-1">PROPIETARIO DE LA OFERTA</p>
              <div className="text-white text-sm font-black">{selectedOfferToTrade.traderName}</div>
              <div className="text-xs text-[#39FF14] font-mono mt-0.5">Tasa Cambiaria: {selectedOfferToTrade.rate.toFixed(2)} Bs/USDT</div>
              <p className="text-[9.5px] text-zinc-400 mt-1">Límites: ${selectedOfferToTrade.minLimitUsdt} - ${selectedOfferToTrade.maxLimitUsdt} USDT</p>
            </div>

            <form onSubmit={handleStartTrade} className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-400 font-bold block mb-1 uppercase tracking-wider">
                  ¿Cuánto deseas {selectedOfferToTrade.type === 'Vender' ? 'Comprar' : 'Vender'}? (USDT)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={tradeAmountUsdt}
                    onChange={(e) => setTradeAmountUsdt(e.target.value)}
                    min={selectedOfferToTrade.minLimitUsdt}
                    max={selectedOfferToTrade.maxLimitUsdt}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 text-sm font-bold font-mono focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-zinc-400 font-extrabold font-mono">USDT</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-bold block mb-1 uppercase tracking-wider">
                  Monto total equivalente en Bolívares (BsS)
                </label>
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-black font-mono text-[#39FF14]">
                  {tradeAmountBs} Bs
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-855 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedOfferToTrade(null)}
                  className="flex-1 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 font-bold text-xs hover:bg-zinc-750 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-900 font-black text-xs transition active:scale-95"
                >
                  Iniciar Intercambio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Offer Modal */}
      {showCreateOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 max-w-md w-full rounded-2xl p-5 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3 mb-4">
              <span className="text-sm font-black text-white flex items-center gap-1.5">
                <PlusCircle className="h-4 w-4 text-emerald-400" /> Publicar Anuncio Cambiario
              </span>
              <button 
                onClick={() => setShowCreateOfferModal(false)}
                className="text-zinc-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-400 font-bold block mb-1 uppercase tracking-wider">Tipo de Operación</label>
                <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setNewOfferType('Comprar')}
                    className={`py-1 rounded text-xs font-bold transition ${newOfferType === 'Comprar' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
                  >
                    Comprar USDT
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewOfferType('Vender')}
                    className={`py-1 rounded text-xs font-bold transition ${newOfferType === 'Vender' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
                  >
                    Vender USDT
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold block mb-1 uppercase tracking-wider">Tasa Comercial (Bs)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newOfferRate}
                    onChange={(e) => setNewOfferRate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-1.5 text-xs font-bold font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold block mb-1 uppercase tracking-wider">Monto Total (USDT)</label>
                  <input 
                    type="number" 
                    value={newOfferAmount}
                    onChange={(e) => {
                      setNewOfferAmount(e.target.value);
                      setNewOfferMaxLimit(e.target.value);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-1.5 text-xs font-bold font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold block mb-1 uppercase tracking-wider">Límite Mínimo ($)</label>
                  <input 
                    type="number" 
                    value={newOfferMinLimit}
                    onChange={(e) => setNewOfferMinLimit(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-1.5 text-xs font-bold font-mono focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold block mb-1 uppercase tracking-wider">Límite Máximo ($)</label>
                  <input 
                    type="number" 
                    value={newOfferMaxLimit}
                    onChange={(e) => setNewOfferMaxLimit(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-1.5 text-xs font-bold font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-bold block mb-1 uppercase tracking-wider">Banco Nacional Principal</label>
                <select 
                  value={newOfferBank}
                  onChange={(e) => setNewOfferBank(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none"
                >
                  <option value="Pago Móvil Banesco">Pago Móvil Banesco</option>
                  <option value="Pago Móvil Banco de Venezuela">Pago Móvil Banco de Venezuela</option>
                  <option value="Pago Móvil Mercantil">Pago Móvil Mercantil</option>
                  <option value="Provincial">Provincial</option>
                  <option value="Bancamiga">Bancamiga</option>
                </select>
              </div>

              <div className="pt-3 border-t border-zinc-850 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateOfferModal(false)}
                  className="flex-grow py-1.5 rounded-lg bg-zinc-800 text-zinc-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-grow py-1.5 bg-emerald-500 text-neutral-900 font-black rounded-lg text-xs"
                >
                  Publicar Oferta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
