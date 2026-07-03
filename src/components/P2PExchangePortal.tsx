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
    reference?: string;
    senderBank?: string;
    senderPhone?: string;
    senderIdCard?: string;
    senderHolderName?: string;
  };
  buyerReceiptUrl?: string;
  createdAt: string;
}

const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write blocked:", e);
    }
  },
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage remove blocked:", e);
    }
  }
};

export default function P2PExchangePortal({ onClose, isStandalone }: { onClose: () => void; isStandalone?: boolean }) {
  // Master P2P Rates (simulation)
  const [usdtPriceInBs, setUsdtPriceInBs] = useState<number>(801.99);
  const [isUpdatingRate, setIsUpdatingRate] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'orders' | 'deposit' | 'advisor' | 'withdraw'>('buy');
  
  // Custom states for active liquid balances - persistent
  const [bovedaUsdt, setBovedaUsdt] = useState<number>(() => {
    const saved = safeLocalStorage.getItem('tapp_p2p_boveda_usdt');
    return saved ? parseFloat(saved) : 12450.00;
  });
  const [fondoBs, setFondoBs] = useState<number>(() => {
    const saved = safeLocalStorage.getItem('tapp_p2p_fondo_bs');
    return saved ? parseFloat(saved) : 480520.00;
  });

  useEffect(() => {
    safeLocalStorage.setItem('tapp_p2p_boveda_usdt', bovedaUsdt.toString());
  }, [bovedaUsdt]);

  useEffect(() => {
    safeLocalStorage.setItem('tapp_p2p_fondo_bs', fondoBs.toString());
  }, [fondoBs]);

  // Direct Casa de Cambio swap states (replacing BPay card deposit)
  const [depositType, setDepositType] = useState<'deposit' | 'withdraw'>('deposit'); // 'deposit' = Buy USDT, 'withdraw' = Sell USDT
  const [depositAmount, setDepositAmount] = useState<string>("100");
  const [depositStep, setDepositStep] = useState<number>(1); // 1: Input details, 2: Review / capture submittal, 3: Completed!
  
  // Custom user input declarations for Buy (Pago Móvil to Admin)
  const [buyerBankSender, setBuyerBankSender] = useState<string>("Banesco");
  const [buyerPhoneSender, setBuyerPhoneSender] = useState<string>("");
  const [buyerReference, setBuyerReference] = useState<string>("");
  const [buyerIdCard, setBuyerIdCard] = useState<string>("");
  const [buyerHolderName, setBuyerHolderName] = useState<string>("");

  // Custom user input declarations for Sell (USDT to get BS)
  const [sellerBankReceiver, setSellerBankReceiver] = useState<string>("Banesco");
  const [sellerPhoneReceiver, setSellerPhoneReceiver] = useState<string>("");
  const [sellerIdCard, setSellerIdCard] = useState<string>("");
  const [sellerHolderName, setSellerHolderName] = useState<string>("");
  const [sellerWalletBackup, setSellerWalletBackup] = useState<string>("");

  const [isProcessingDeposit, setIsProcessingDeposit] = useState<boolean>(false);
  const [adminCommissionTotal, setAdminCommissionTotal] = useState<number>(() => {
    const saved = safeLocalStorage.getItem('tapp_p2p_commissions');
    return saved ? parseFloat(saved) : 0;
  });

  // Admin configuration state for receiving Pago Móvil transfers
  const [adminPagoMovilBank, setAdminPagoMovilBank] = useState<string>(() => {
    return safeLocalStorage.getItem('tapp_p2p_admin_pm_bank') || "Banco Mercantil (0105)";
  });
  const [adminPagoMovilPhone, setAdminPagoMovilPhone] = useState<string>(() => {
    return safeLocalStorage.getItem('tapp_p2p_admin_pm_phone') || "0412-5551234";
  });
  const [adminPagoMovilId, setAdminPagoMovilId] = useState<string>(() => {
    return safeLocalStorage.getItem('tapp_p2p_admin_pm_id') || "V-19.852.147";
  });
  const [adminPagoMovilHolder, setAdminPagoMovilHolder] = useState<string>(() => {
    return safeLocalStorage.getItem('tapp_p2p_admin_pm_holder') || "Inversiones KervinP2P";
  });
  const [isEditingPmConfig, setIsEditingPmConfig] = useState<boolean>(false);

  const [adminPayoutAddress, setAdminPayoutAddress] = useState<string>(() => {
    return safeLocalStorage.getItem('tapp_p2p_admin_payout_address') || "TUh7b8P2vDkWqXp3Y9B9S7sTtrc20eXp20";
  });
  const [payoutNetwork, setPayoutNetwork] = useState<string>(() => {
    return safeLocalStorage.getItem('tapp_p2p_admin_payout_network') || "USDT TRC20";
  });
  const [isEditingPayout, setIsEditingPayout] = useState<boolean>(false);

  useEffect(() => {
    safeLocalStorage.setItem('tapp_p2p_admin_pm_bank', adminPagoMovilBank);
  }, [adminPagoMovilBank]);

  useEffect(() => {
    safeLocalStorage.setItem('tapp_p2p_admin_pm_phone', adminPagoMovilPhone);
  }, [adminPagoMovilPhone]);

  useEffect(() => {
    safeLocalStorage.setItem('tapp_p2p_admin_pm_id', adminPagoMovilId);
  }, [adminPagoMovilId]);

  useEffect(() => {
    safeLocalStorage.setItem('tapp_p2p_admin_pm_holder', adminPagoMovilHolder);
  }, [adminPagoMovilHolder]);

  useEffect(() => {
    safeLocalStorage.setItem('tapp_p2p_admin_payout_address', adminPayoutAddress);
  }, [adminPayoutAddress]);

  useEffect(() => {
    safeLocalStorage.setItem('tapp_p2p_admin_payout_network', payoutNetwork);
  }, [payoutNetwork]);

  useEffect(() => {
    safeLocalStorage.setItem('tapp_p2p_commissions', adminCommissionTotal.toString());
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
    const saved = safeLocalStorage.getItem('tapp_p2p_offers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'off_1',
        type: 'Vender', // Trader sells USDT -> You buy USDT
        traderName: 'Inversiones Oro Express',
        rate: 802.85,
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
        traderName: 'Orinoco Cambios',
        rate: 801.99,
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
        rate: 779.75,
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
        rate: 778.68,
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
        rate: 778.62,
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
    const saved = safeLocalStorage.getItem('tapp_p2p_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'tr_1092',
        type: 'Comprar',
        offerId: 'off_2',
        rate: 801.99,
        amountUsdt: 50.00,
        amountBs: 40099.50,
        status: 'pending_payment',
        paymentInfo: {
          bank: 'Banco Mercantil (0105)',
          phone: '0412-5551234',
          idCard: 'V-19.852.147',
          holder: 'Inversiones OrinocoP2P'
        },
        createdAt: new Date(Date.now() - 360000).toISOString()
      }
    ];
  });

  // State for posting custom P2P offers
  const [showCreateOfferModal, setShowCreateOfferModal] = useState<boolean>(false);
  const [newOfferType, setNewOfferType] = useState<'Comprar' | 'Vender'>('Comprar');
  const [newOfferRate, setNewOfferRate] = useState<string>("801.99");
  const [newOfferAmount, setNewOfferAmount] = useState<string>("100");
  const [newOfferMinLimit, setNewOfferMinLimit] = useState<string>("10");
  const [newOfferMaxLimit, setNewOfferMaxLimit] = useState<string>("100");
  const [newOfferBank, setNewOfferBank] = useState<string>("Pago Móvil Banesco");

  // State for buying/selling trade modal trigger
  const [selectedOfferToTrade, setSelectedOfferToTrade] = useState<P2POffer | null>(null);
  const [tradeAmountUsdt, setTradeAmountUsdt] = useState<string>("50");
  const [tradeAmountBs, setTradeAmountBs] = useState<string>("40099.50");

  // USDT Withdraw requests and form state
  const [withdrawRequests, setWithdrawRequests] = useState<any[]>(() => {
    const saved = safeLocalStorage.getItem('tapp_p2p_withdraw_requests');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'wreq_1082',
        username: 'usuario_bpay',
        walletAddress: 'TYr5bA2vDkWqXpR3Y9B9S7sTtrc2sXp44',
        network: 'USDT TRC20',
        amountUsdt: 45.00,
        status: 'pending',
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
      },
      {
        id: 'wreq_1054',
        username: 'manuel_p2p',
        walletAddress: '0x32168df9f201e74de055fef72365a123e449a8fe',
        network: 'USDT BEP20',
        amountUsdt: 125.00,
        status: 'dispatched',
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
      }
    ];
  });

  useEffect(() => {
    safeLocalStorage.setItem('tapp_p2p_withdraw_requests', JSON.stringify(withdrawRequests));
  }, [withdrawRequests]);

  const [withdrawAddress, setWithdrawAddress] = useState<string>('');
  const [withdrawNetwork, setWithdrawNetwork] = useState<string>('USDT TRC20');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('50');
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string>('');
  const [withdrawErrorMsg, setWithdrawErrorMsg] = useState<string>('');

  // Simulated image upload for Bank Receipt
  const [isUploadingReceipt, setIsUploadingReceipt] = useState<string | null>(null);
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);

  useEffect(() => {
    safeLocalStorage.setItem('tapp_p2p_offers', JSON.stringify(offers));
  }, [offers]);

  useEffect(() => {
    safeLocalStorage.setItem('tapp_p2p_transactions', JSON.stringify(transactions));
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

  // Submit manual withdrawal request to administrator
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawSuccessMsg('');
    setWithdrawErrorMsg('');
    
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawErrorMsg('❌ Por favor introduce un monto válido.');
      return;
    }
    if (amt > bovedaUsdt) {
      setWithdrawErrorMsg(`❌ Saldo insuficiente en tu Bóveda. Tu saldo actual: $${bovedaUsdt.toFixed(2)} USDT.`);
      return;
    }
    if (!withdrawAddress.trim()) {
      setWithdrawErrorMsg('❌ Por favor introduce tu billetera o ID de Binance Pay.');
      return;
    }

    // Deduct from local user Boveda balance
    setBovedaUsdt(prev => prev - amt);

    // Get current registered username or fallback
    let currentUsername = 'usuario_invitado';
    try {
      const savedProf = safeLocalStorage.getItem('tappmusic_profile');
      if (savedProf) {
        const parsed = JSON.parse(savedProf);
        if (parsed && parsed.username) currentUsername = parsed.username;
      }
    } catch(e) {}

    // Create a new request entry
    const newReq = {
      id: `wreq_${Math.floor(1000 + Math.random() * 9000)}`,
      username: currentUsername,
      walletAddress: withdrawAddress.trim(),
      network: withdrawNetwork,
      amountUsdt: amt,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setWithdrawRequests(prev => [newReq, ...prev]);
    setWithdrawSuccessMsg(`⚡ ¡Solicitud enviada con éxito! El Administrador la revisará en el Panel de Administrador de la Casa de Cambio para despacharte los $${amt.toFixed(2)} USDT.`);
    setWithdrawAddress('');
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
    <div className="min-h-screen bg-venezuela-sky font-sans text-neutral-200 select-none pb-12">
      {/* Tricolor Cielo Banner - Venezuela Flag Glow */}
      <div className="w-full h-1 flex select-none sticky top-0 z-50">
        <div className="h-full bg-[#f8d117] shadow-[0_0_8px_#f8d117]" style={{ width: '33.33%' }} />
        <div className="h-full bg-[#0039a6] shadow-[0_0_8px_#0039a6]" style={{ width: '33.33%' }} />
        <div className="h-full bg-[#ce1126] shadow-[0_0_8px_#ce1126]" style={{ width: '33.34%' }} />
      </div>

      {/* Upper Status / Header bar */}
      <div className="border-b border-emerald-500/10 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 animate-pulse">
              <ArrowLeftRight className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Orinoco <span className="text-emerald-400">P2P Exchange</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold tracking-wider border border-emerald-500/30">
                  MÓDULO DEMO
                </span>
              </h1>
              <p className="text-[10px] text-zinc-400 font-medium">Casa de Cambio Oficial - Mercado Cambiario de USDT a Bolívares (BsS)</p>
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

            {!isStandalone ? (
              <button 
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 text-xs font-semibold flex items-center gap-1 border border-zinc-700/60 transition active:scale-95"
              >
                <X className="h-3.5 w-3.5" /> Volver a Tappmusic
              </button>
            ) : (
              <button 
                onClick={() => {
                  try {
                    window.location.href = window.location.origin;
                  } catch (e) {
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1 border border-zinc-800 transition active:scale-95"
              >
                🌐 Ir a Tappmusic.com
              </button>
            )}
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
            <h2 className="text-xl font-extrabold text-white tracking-tight">Crea tu propia casa de cambio P2P segura</h2>
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
              {/* Admin Real Deposit & Commission Routing destination configuration */}
              <div className="mt-3.5 bg-zinc-950/90 rounded-xl p-3 border border-zinc-800/80 space-y-2.5 text-left">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-[9.5px] text-zinc-400 font-extrabold uppercase flex items-center gap-1">
                    👑 Ruteo de Comisiones Admin
                  </span>
                  <button 
                    onClick={() => setIsEditingPayout(!isEditingPayout)}
                    className="text-[8.5px] text-amber-450 font-black hover:text-amber-300 transition uppercase tracking-wider"
                  >
                    {isEditingPayout ? "Cancelar" : "⚙️ Configurar Dirección"}
                  </button>
                </div>

                {isEditingPayout ? (
                  <div className="space-y-2.5 animate-fadeIn">
                    <div>
                      <label className="text-[8px] text-zinc-400 font-black block mb-0.5 uppercase">Red de Recibo</label>
                      <select 
                        value={payoutNetwork}
                        onChange={(e) => setPayoutNetwork(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-[9.5px] rounded px-2 py-1 focus:outline-none text-white font-bold"
                      >
                        <option value="USDT TRC20">USDT (TRC20 - Red TRON) *Recomendado</option>
                        <option value="USDT BEP20">USDT (BEP20 - BNB Smart Chain)</option>
                        <option value="USDT ERC20">USDT (ERC20 - Red Ethereum)</option>
                        <option value="Binance ID">ID de Pay de Binance (Binance UID)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[8px] text-zinc-400 font-black block mb-0.5 uppercase">Dirección de Depósito Real</label>
                      <input 
                        type="text"
                        value={adminPayoutAddress}
                        onChange={(e) => setAdminPayoutAddress(e.target.value)}
                        placeholder="Introduce tu wallet real o ID de Binance"
                        className="w-full bg-zinc-900 border border-zinc-800 text-[9.5px] rounded px-2 py-1 font-mono text-zinc-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (!adminPayoutAddress.trim()) {
                          alert("Por favor introduce una dirección o ID válido.");
                          return;
                        }
                        setIsEditingPayout(false);
                      }}
                      className="w-full bg-amber-550 hover:bg-amber-450 text-xs text-neutral-950 font-black py-1 rounded transition uppercase"
                    >
                      Guardar Dirección Real
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-[9px]">
                    <div className="flex justify-between items-center bg-zinc-900/50 p-1 rounded">
                      <span className="text-zinc-400">Total Acumulado:</span>
                      <strong className="font-mono text-[#39FF14] text-[10px]">${adminCommissionTotal.toFixed(2)} USD</strong>
                    </div>
                    <div className="flex justify-between items-baseline bg-zinc-900/50 p-1.5 rounded">
                      <div className="space-y-0.5">
                        <span className="text-zinc-400 block text-[8px] uppercase">Dirección de Destino:</span>
                        <span className="font-mono text-white text-[8px] break-all tracking-tight leading-none block selection:bg-amber-500/30">
                          {adminPayoutAddress}
                        </span>
                      </div>
                      <span className="shrink-0 bg-amber-500/10 text-[#f0b90b] text-[7.5px] font-black px-1 py-0.5 rounded ml-1 uppercase">
                        {payoutNetwork}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* DESPACHO MANUAL DE RETIROS BINANCE - ADMIN ACTION */}
              <div className="mt-3 bg-[#0a0f1d] border border-yellow-500/20 rounded-xl p-3 space-y-2 text-left animate-fadeIn">
                <div className="border-b border-zinc-800 pb-1.5 flex justify-between items-center">
                  <span className="text-[9.5px] font-black text-yellow-400 uppercase tracking-wider flex items-center gap-1">
                    👑 Despacho manual (Admin)
                  </span>
                  <span className="bg-yellow-500/10 text-yellow-400 font-mono text-[8px] px-1.5 py-0.2 rounded font-bold">
                    {withdrawRequests.filter(r => r.status === 'pending').length} Pendientes
                  </span>
                </div>
                
                <p className="text-[8.5px] text-zinc-400 leading-tight leading-relaxed">
                  Como Administrador de la Casa de Cambio, procesa las solicitudes de retiro de los usuarios desde sus cuentas en la plataforma hacia sus billeteras Binance:
                </p>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pt-1">
                  {withdrawRequests.filter(r => r.status === 'pending').length === 0 ? (
                    <p className="text-[8.5px] text-zinc-500 text-center py-2.5">
                      No hay solicitudes de retiro pendientes de despacho. 👍
                    </p>
                  ) : (
                    withdrawRequests.filter(r => r.status === 'pending').map((req) => (
                      <div key={req.id} className="bg-black/50 p-2 rounded-lg border border-zinc-800 text-[8.5px] space-y-1.5 animate-fadeIn">
                        <div className="flex justify-between items-center text-[8px]">
                          <span className="font-mono text-zinc-500 font-bold">{req.id}</span>
                          <strong className="text-zinc-300 font-semibold uppercase">{req.username}</strong>
                        </div>
                        
                        <div className="flex justify-between items-baseline">
                          <span className="text-zinc-500">Monto:</span>
                          <strong className="text-xs text-[#39FF14] font-mono font-black">${req.amountUsdt.toFixed(2)} USDT</strong>
                        </div>

                        <div className="text-[8px] text-zinc-400 truncate space-y-0.5">
                          <div className="flex justify-between">
                            <span>Red:</span>
                            <span className="text-white font-mono">{req.network}</span>
                          </div>
                          <div className="truncate selection:bg-amber-500/40">
                            Destino: <span className="text-yellow-400 font-mono select-all font-bold">{req.walletAddress}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (window.confirm(`¿Confirmas que has enviado de forma real $${req.amountUsdt} USDT a la wallet ${req.walletAddress}?`)) {
                              setWithdrawRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'dispatched' } : r));
                              alert(`✅ Retiro ${req.id} marcado como "Despachado" con éxito en la plataforma.`);
                            }
                          }}
                          className="w-full bg-[#39FF14]/10 border border-[#39FF14]/30 hover:bg-[#39FF14]/20 text-[#39FF14] hover:text-[#39FF14] font-black uppercase text-[8px] py-1 rounded transition cursor-pointer"
                        >
                          Confirmar Depósito (Despachar)
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
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

          {/* Casa de Cambio Directa (Direct Buy/Sell with Platform) */}
          <button 
            onClick={() => { setActiveTab('deposit'); setDepositStep(1); }}
            className={`flex-1 py-2 rounded-lg text-xs font-black transition relative ${activeTab === 'deposit' ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-400 shadow-[inset_0_1px_2px_rgba(245,158,11,0.15)] border-b-2 border-amber-500' : 'text-zinc-400 hover:text-white'}`}
          >
            🏦 Casa de Cambio Directa
            <span className="text-[10px] text-zinc-400 block font-normal">(Compra/Venta Pago Móvil 0%)</span>
          </button>

          {/* New Binance USDT Withdrawal Tab */}
          <button 
            onClick={() => { setActiveTab('withdraw'); }}
            className={`flex-grow py-2 rounded-lg text-xs font-black transition relative ${activeTab === 'withdraw' ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 text-yellow-400 shadow-[inset_0_1px_2px_rgba(245,158,11,0.15)] border-b-2 border-yellow-500' : 'text-zinc-400 hover:text-white'}`}
          >
            🪙 Retirar Binance
            <span className="text-[10px] text-zinc-400 block font-normal">(Manual USDT)</span>
          </button>

          <button 
            onClick={() => { setActiveTab('advisor'); setDepositStep(1); }}
            className={`flex-grow py-2 rounded-lg text-xs font-black transition ${activeTab === 'advisor' ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-400 shadow-[inset_0_1px_2px_rgba(245,158,11,0.15)] border-b-2 border-amber-500 text-amber-300' : 'text-zinc-400 hover:text-white'}`}
          >
            📚 Consejos del Experto
            <span className="text-[10px] text-zinc-400 block font-normal">(Estrategias)</span>
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

        {/* TAB: Casa de Cambio Directa (Direct Buy/Sell with Platform) */}
        {activeTab === 'deposit' && (
          <div className="max-w-lg mx-auto bg-[#181a20] border border-zinc-800/80 rounded-3xl p-6 shadow-2xl text-left my-4 relative overflow-hidden">
            {/* Ambient background glow inside the card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Header with selector for Buy / Sell Direct */}
            <div className="flex items-center space-x-1.5 p-1 bg-zinc-900/80 rounded-2xl border border-zinc-800/60 mb-5 relative z-10">
              <button
                onClick={() => { setDepositType('deposit'); setDepositStep(1); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-tight transition duration-150 ${depositType === 'deposit' ? 'bg-[#f0b90b] text-neutral-950 shadow-md shadow-amber-500/15' : 'text-zinc-400 hover:text-white'}`}
              >
                📥 Comprar USDT (Tu Pagas Bs)
              </button>
              <button
                onClick={() => { setDepositType('withdraw'); setDepositStep(1); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-tight transition duration-150 ${depositType === 'withdraw' ? 'bg-[#f0b90b] text-neutral-950 shadow-md shadow-amber-500/15' : 'text-zinc-400 hover:text-white'}`}
              >
                📤 Vender USDT (Recibes Bs)
              </button>
            </div>

            {/* Admin/Owner Configuration Section - Collapsible, highly useful for Kervin */}
            <div className="mb-5 bg-zinc-950/90 rounded-2xl p-3 border border-zinc-800/85 relative z-10 text-[10px]">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2">
                <span className="text-zinc-400 font-extrabold flex items-center gap-1 text-[9.5px]">
                  👑 AJUSTES DEL OPERADOR (KERVIN - ADMIN)
                </span>
                <button 
                  onClick={() => setIsEditingPmConfig(!isEditingPmConfig)}
                  className="text-amber-400 font-black hover:text-amber-300 transition uppercase tracking-wider text-[8.5px]"
                >
                  {isEditingPmConfig ? "[ Cerrar ]" : "⚙️ Editar Pago Móvil de Destino"}
                </button>
              </div>

              {isEditingPmConfig ? (
                <div className="space-y-2 animate-fadeIn pt-1">
                  <p className="text-zinc-500 text-[8.5px] leading-tight mb-2">
                    Configura las coordenadas Pago Móvil donde tus clientes enviarán los Bolívares. Se guardan en memoria.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-zinc-500 block mb-0.5 font-bold uppercase text-[7.5px]">Banco Receptor</span>
                      <input 
                        type="text" 
                        value={adminPagoMovilBank} 
                        onChange={(e) => setAdminPagoMovilBank(e.target.value)} 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[9px] text-white font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-zinc-500 block mb-0.5 font-bold uppercase text-[7.5px]">Teléfono Receptor</span>
                      <input 
                        type="text" 
                        value={adminPagoMovilPhone} 
                        onChange={(e) => setAdminPagoMovilPhone(e.target.value)} 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[9px] text-white font-mono font-semibold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-zinc-500 block mb-0.5 font-bold uppercase text-[7.5px]">Cédula / RIF</span>
                      <input 
                        type="text" 
                        value={adminPagoMovilId} 
                        onChange={(e) => setAdminPagoMovilId(e.target.value)} 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[9px] text-white font-mono font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-zinc-500 block mb-0.5 font-bold uppercase text-[7.5px]">Nombre del Titular</span>
                      <input 
                        type="text" 
                        value={adminPagoMovilHolder} 
                        onChange={(e) => setAdminPagoMovilHolder(e.target.value)} 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[9px] text-white font-semibold"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsEditingPmConfig(false)}
                    className="w-full bg-emerald-500 text-neutral-950 font-black text-[9px] py-1 rounded hover:bg-emerald-400 mt-1 uppercase"
                  >
                    Guardar Parámetros de la Plataforma
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-zinc-400 text-[9px]">
                  <div>Banco Principal: <span className="text-white font-bold">{adminPagoMovilBank}</span></div>
                  <div>Pago Móvil: <span className="text-white font-mono font-bold">{adminPagoMovilPhone}</span></div>
                  <div>ID/Cédula: <span className="text-white font-mono font-bold">{adminPagoMovilId}</span></div>
                  <div>Titular: <span className="text-white font-bold">{adminPagoMovilHolder}</span></div>
                </div>
              )}
            </div>

            {depositStep === 1 && (
              <div className="space-y-4 animate-fadeIn relative z-10">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-2.5">
                  <h3 className="text-[13px] font-black text-white tracking-tight flex items-center gap-1.5">
                    <Landmark className="h-4 w-4 text-amber-500" />
                    {depositType === 'deposit' ? 'Paso 1: Solicitar Compra de USDT' : 'Paso 1: Solicitar Venta de USDT'}
                  </h3>
                  <span className="text-[10px] text-[#39FF14] bg-[#39FF14]/10 font-bold px-2 py-0.5 rounded border border-[#39FF14]/25">
                    0% Comisiones
                  </span>
                </div>

                {/* Amount selection block */}
                <div>
                  <label className="text-[9.5px] text-zinc-400 font-bold block mb-1.5 uppercase tracking-wider">
                    {depositType === 'deposit' ? '1. Introduce la cantidad de USDT que deseas comprar:' : '1. Introduce la cantidad de USDT que deseas vender:'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      min="5"
                      max="5000"
                      className="w-full bg-[#181a20] border border-zinc-800 focus:border-amber-500/80 rounded-2xl px-4 py-3 text-sm font-black font-mono text-white focus:outline-none transition-all"
                      placeholder="100"
                    />
                    <span className="absolute right-4 top-3.5 text-xs text-zinc-400 font-extrabold font-mono">USDT</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 px-1 text-[10.5px]">
                    <span className="text-zinc-500 font-medium text-[10px]">Tasa Actual de Conversión:</span>
                    <span className="text-amber-400 font-mono font-bold">{usdtPriceInBs.toFixed(2)} Bs / USDT</span>
                  </div>
                </div>

                {/* Total equivalent calculation display banner */}
                <div className="bg-zinc-950/80 rounded-2xl p-4 border border-zinc-800/80 flex justify-between items-center text-left">
                  <div>
                    <span className="text-[8.5px] text-zinc-500 block font-black uppercase">
                      {depositType === 'deposit' ? 'Total en Bolívares que enviarás:' : 'Total en Bolívares que recibirás:'}
                    </span>
                    <strong className="text-base font-black text-[#39FF14] font-mono block mt-0.5">
                      {(parseFloat(depositAmount || "0") * usdtPriceInBs).toLocaleString('es-VE', { minimumFractionDigits: 2 })} BsS
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-zinc-400 block font-semibold">Tiempos de Ejecución</span>
                    <span className="text-[10px] text-zinc-200 font-bold flex items-center gap-1 justify-end">
                      ⚡ 5 a 15 Minutos
                    </span>
                  </div>
                </div>

                {/* Conditional Form fields representing user registration details */}
                {depositType === 'deposit' ? (
                  /* Form fields for buying USDT from admin */
                  <div className="space-y-3.5 pt-1 animate-fadeIn">
                    <div className="bg-amber-500/10 border border-amber-500/20 text-neutral-200 p-3.5 rounded-xl text-xs space-y-1.5 leading-relaxed">
                      <p className="font-extrabold text-amber-400 text-[11px] uppercase flex items-center gap-1">
                        📲 PASO 2: REALIZA EL PAGO MÓVIL AL ADMINISTRADOR
                      </p>
                      <p className="text-[10.5px] text-zinc-350">
                        Por favor, transfiere exactamente <strong className="text-white font-mono">{(parseFloat(depositAmount || "0") * usdtPriceInBs).toFixed(2)} Bs</strong> desde tu cuenta de banco a los datos oficiales de cobro mostrados arriba, luego registra los detalles debajo.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] text-zinc-400 font-black block mb-1 uppercase tracking-wider font-sans">Banco Emisor desde donde pagaste</label>
                        <select 
                          value={buyerBankSender}
                          onChange={(e) => setBuyerBankSender(e.target.value)}
                          className="w-full bg-[#181a20] border border-zinc-800 text-xs rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                        >
                          <option value="Banesco">Banesco</option>
                          <option value="Banco de Venezuela">Banco de Venezuela</option>
                          <option value="Banco Mercantil">Banco Mercantil</option>
                          <option value="BBVA Provincial">BBVA Provincial</option>
                          <option value="Bancamiga">Bancamiga</option>
                          <option value="BNC (Banco Nacional de Crédito)">BNC (Banco Nacional de Crédito)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] text-zinc-400 font-black block mb-1 uppercase tracking-wider font-sans">Teléfono de Pago Móvil</label>
                          <input 
                            type="text"
                            value={buyerPhoneSender}
                            onChange={(e) => setBuyerPhoneSender(e.target.value)}
                            placeholder="Ej. 0414-1234567"
                            className="w-full bg-[#181a20] border border-zinc-800 text-xs font-mono rounded-xl px-3 py-2 text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-zinc-400 font-black block mb-1 uppercase tracking-wider font-sans">Código de Referencia</label>
                          <input 
                            type="text"
                            value={buyerReference}
                            onChange={(e) => setBuyerReference(e.target.value)}
                            placeholder="Últimos 6 u 8 dígitos"
                            className="w-full bg-[#181a20] border border-zinc-800 text-xs font-mono rounded-xl px-3 py-2 text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] text-zinc-400 font-black block mb-1 uppercase tracking-wider font-sans">Cédula del Titular</label>
                          <input 
                            type="text"
                            value={buyerIdCard}
                            onChange={(e) => setBuyerIdCard(e.target.value)}
                            placeholder="Ej. V-21444555"
                            className="w-full bg-[#181a20] border border-zinc-800 text-xs font-mono rounded-xl px-3 py-2 text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-zinc-400 font-black block mb-1 uppercase tracking-wider font-sans">Nombre del Titular</label>
                          <input 
                            type="text"
                            value={buyerHolderName}
                            onChange={(e) => setBuyerHolderName(e.target.value)}
                            placeholder="Nombre del Pagador"
                            className="w-full bg-[#181a20] border border-zinc-800 text-xs rounded-xl px-3 py-2 text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      {/* Screen capture simulation */}
                      <div>
                        <label className="text-[9px] text-zinc-400 font-black block mb-1 uppercase tracking-wider font-sans">Evidencia / Capture de Pago (Opcional)</label>
                        <div className="border border-dashed border-zinc-800 rounded-xl p-3 text-center bg-[#181a20] text-[10.5px] text-zinc-400 hover:border-amber-500/40 duration-150 cursor-pointer">
                          <Upload className="h-4 w-4 mx-auto mb-1.5 text-zinc-500" />
                          <span className="font-bold text-zinc-300">Seleccionar o soltar capture aquí</span>
                          <p className="text-[8px] text-zinc-500 mt-0.5">Formatos JPG, PNG, PDF permitidos</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const amt = parseFloat(depositAmount);
                        if (isNaN(amt) || amt < 5) {
                          alert("El monto mínimo para comprar es de $5 USDT.");
                          return;
                        }
                        if (!buyerPhoneSender.trim() || !buyerReference.trim() || !buyerIdCard.trim() || !buyerHolderName.trim()) {
                          alert("Por favor completa todos los campos del formulario para que el administrador pueda conciliar tu Pago Móvil.");
                          return;
                        }
                        
                        setIsProcessingDeposit(true);
                        setTimeout(() => {
                          setIsProcessingDeposit(false);
                          // Create direct transaction object
                          const newTx: P2PTransaction = {
                            id: (1094 + Math.floor(Math.random() * 9000)).toString(),
                            type: 'Comprar',
                            offerId: 'casa_de_cambio_directo_buy',
                            rate: usdtPriceInBs,
                            amountUsdt: amt,
                            amountBs: amt * usdtPriceInBs,
                            status: 'paid_checking',
                            paymentInfo: {
                              bank: adminPagoMovilBank,
                              phone: adminPagoMovilPhone,
                              idCard: adminPagoMovilId,
                              holder: adminPagoMovilHolder,
                              reference: buyerReference,
                              senderBank: buyerBankSender,
                              senderPhone: buyerPhoneSender,
                              senderIdCard: buyerIdCard,
                              senderHolderName: buyerHolderName
                            },
                            createdAt: new Date().toISOString()
                          };
                          
                          setTransactions([newTx, ...transactions]);
                          setDepositStep(3);
                        }, 1200);
                      }}
                      disabled={isProcessingDeposit}
                      className="w-full bg-[#f0b90b] hover:bg-amber-400 text-neutral-950 font-black py-3.5 rounded-2xl text-xs transition active:scale-95 shadow-md shadow-amber-500/10 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {isProcessingDeposit ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Procesando Notificación...
                        </>
                      ) : (
                        "Registrar Pago Móvil y Solicitar USDT"
                      )}
                    </button>
                  </div>
                ) : (
                  /* Form fields for selling USDT directly to platform swap */
                  <div className="space-y-3.5 pt-1 animate-fadeIn">
                    <div className="bg-red-500/10 border border-red-500/20 text-neutral-200 p-3.5 rounded-xl text-xs space-y-1 block leading-relaxed text-left font-sans">
                      <p className="font-extrabold text-red-400 text-[11px] uppercase">
                        📲 REGISTRA TUS DATOS DE COBRO (PAGO MÓVIL)
                      </p>
                      <p className="text-[10.5px] text-zinc-300">
                        La plataforma debitará tus USDT de la Bóveda en resguardo (Escrow) y el Administrador te hará una transferencia bancaria inmediata (Pago Móvil) a tus coordenadas por un total de <strong className="text-[#39FF14] font-mono">{(parseFloat(depositAmount || "0") * usdtPriceInBs).toFixed(2)} Bs</strong>.
                      </p>
                    </div>

                    <div className="space-y-3 text-left">
                      <div>
                        <label className="text-[9px] text-zinc-400 font-black block mb-1 uppercase tracking-wider font-sans">Banco donde quieres recibir los Bolívares</label>
                        <select 
                          value={sellerBankReceiver}
                          onChange={(e) => setSellerBankReceiver(e.target.value)}
                          className="w-full bg-[#181a20] border border-zinc-850 text-xs rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                        >
                          <option value="Banesco">Banesco</option>
                          <option value="Banco de Venezuela">Banco de Venezuela</option>
                          <option value="Banco Mercantil">Banco Mercantil</option>
                          <option value="BBVA Provincial">BBVA Provincial</option>
                          <option value="Bancamiga">Bancamiga</option>
                          <option value="BNC (Banco Nacional de Crédito)">BNC (Banco Nacional de Crédito)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-left">
                        <div>
                          <label className="text-[9px] text-zinc-400 font-black block mb-1 uppercase tracking-wider font-sans">Teléfono Pago Móvil</label>
                          <input 
                            type="text"
                            value={sellerPhoneReceiver}
                            onChange={(e) => setSellerPhoneReceiver(e.target.value)}
                            placeholder="Ej. 0416-5556677"
                            className="w-full bg-[#181a20] border border-zinc-850 text-xs font-mono rounded-xl px-3 py-2 text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-zinc-400 font-black block mb-1 uppercase tracking-wider font-sans">Cédula del Titular</label>
                          <input 
                            type="text"
                            value={sellerIdCard}
                            onChange={(e) => setSellerIdCard(e.target.value)}
                            placeholder="Ej. V-18333444"
                            className="w-full bg-[#181a20] border border-zinc-850 text-xs font-mono rounded-xl px-3 py-2 text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-left">
                        <div>
                          <label className="text-[9px] text-zinc-400 font-black block mb-1 uppercase tracking-wider font-sans">Nombre del Titular Receptor</label>
                          <input 
                            type="text"
                            value={sellerHolderName}
                            onChange={(e) => setSellerHolderName(e.target.value)}
                            placeholder="Ej. Juan Pérez"
                            className="w-full bg-[#181a20] border border-zinc-850 text-xs rounded-xl px-3 py-2 text-white placeholder-zinc-700/70 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-zinc-400 font-black block mb-1 uppercase tracking-wider font-sans">ID Binance de respaldo (Opcional)</label>
                          <input 
                            type="text"
                            value={sellerWalletBackup}
                            onChange={(e) => setSellerWalletBackup(e.target.value)}
                            placeholder="ID de Pay o Wallet Trc20"
                            className="w-full bg-[#181a20] border border-zinc-850 text-xs font-mono rounded-xl px-3 py-2 text-white placeholder-zinc-700/70 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const amt = parseFloat(depositAmount);
                        if (isNaN(amt) || amt < 5) {
                          alert("El monto mínimo para la venta directa es de $5 USDT.");
                          return;
                        }
                        if (amt > bovedaUsdt) {
                          alert(`Fondos insuficientes en Bóveda USDT. Tu saldo actual es de $${bovedaUsdt.toFixed(2)} USDT.`);
                          return;
                        }
                        if (!sellerPhoneReceiver.trim() || !sellerIdCard.trim() || !sellerHolderName.trim()) {
                          alert("Por favor completa los detalles de destino Pago Móvil donde recibirás el pago.");
                          return;
                        }
                        
                        setIsProcessingDeposit(true);
                        setTimeout(() => {
                          setIsProcessingDeposit(false);
                          
                          // Deduct balance
                          setBovedaUsdt(prev => prev - amt);
                          
                          // Create direct sell transaction object
                          const newTx: P2PTransaction = {
                            id: (2041 + Math.floor(Math.random() * 7000)).toString(),
                            type: 'Vender',
                            offerId: 'casa_de_cambio_directo_sell',
                            rate: usdtPriceInBs,
                            amountUsdt: amt,
                            amountBs: amt * usdtPriceInBs,
                            status: 'pending_payment', // Waiting for administrator to transfer Bs and complete
                            paymentInfo: {
                              bank: sellerBankReceiver,
                              phone: sellerPhoneReceiver,
                              idCard: sellerIdCard,
                              holder: sellerHolderName,
                              reference: sellerWalletBackup || "Sin ID Binance de respaldo"
                            },
                            createdAt: new Date().toISOString()
                          };
                          
                          setTransactions([newTx, ...transactions]);
                          setDepositStep(3);
                        }, 1200);
                      }}
                      disabled={isProcessingDeposit}
                      className="w-full bg-[#f0b90b] hover:bg-amber-400 text-neutral-950 font-black py-3.5 rounded-2xl text-xs transition active:scale-95 shadow-md shadow-amber-500/10 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {isProcessingDeposit ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Procesando Venta de USDT...
                        </>
                      ) : (
                        "Vender USDT y Solicitar Pago Móvil"
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* INVISIBLE_ANCHOR_FOR_REPLACEMENT_STEP2_AND_3 */}

            {depositStep === 3 && (
              <div className="space-y-5 py-4 animate-fadeIn relative z-10 text-center">
                <div className="w-16 h-16 bg-[#39FF14]/10 border border-[#39FF14]/40 text-[#39FF14] rounded-full flex items-center justify-center mx-auto mb-1 shadow-[0_0_20px_rgba(57,255,20,0.22)]">
                  <CheckCircle2 className="h-9 w-9 text-[#39FF14]" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-base font-black text-white uppercase tracking-tight">¡Solicitud Registrada con Éxito!</h3>
                  <p className="text-[11px] text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    Tu solicitud de {depositType === 'deposit' ? 'compra' : 'venta'} directa ha sido notificada al administrador para su verificación en el Pago Móvil.
                  </p>
                </div>

                {/* Venezuelan Pago Movil Receipt Voucher Component */}
                <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800 text-left space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
                      <span className="text-[9px] font-black tracking-wider text-zinc-350 uppercase">RECIBO DE TRANSMISIÓN DIRECTA</span>
                    </div>
                    <span className="text-[8px] text-zinc-500 font-mono font-bold">LOTE #{Math.floor(1000 + Math.random() * 9000)}</span>
                  </div>

                  <div className="space-y-2.5 text-[11px] font-medium text-zinc-300">
                    <div className="text-center bg-[#181a20] py-2 rounded-xl border border-zinc-850">
                      <span className="text-[8.5px] text-zinc-400 uppercase block font-bold">Monto de la Operación en Bolívares (Bs)</span>
                      <strong className="text-base font-mono text-[#39FF14] font-black block mt-0.5">
                        {(parseFloat(depositAmount || "100") * usdtPriceInBs).toLocaleString('es-VE', { minimumFractionDigits: 2 })} BsS
                      </strong>
                    </div>

                    <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                      <span className="text-zinc-500 font-bold">Operación:</span>
                      <span className="text-[#f0b90b] font-black uppercase text-[10px]">
                        {depositType === 'deposit' ? 'Compra Directa USDT' : 'Venta Directa USDT'}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                      <span className="text-zinc-500 font-bold">Equivalente Digital:</span>
                      <strong className="text-white font-mono font-bold">{parseFloat(depositAmount || "100").toFixed(2)} USDT</strong>
                    </div>

                    <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                      <span className="text-zinc-500 font-bold">Tasa Aplicada:</span>
                      <span className="text-zinc-300 font-mono font-semibold">{usdtPriceInBs.toFixed(2)} Bs / USDT</span>
                    </div>

                    {depositType === 'deposit' ? (
                      <>
                        <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                          <span className="text-zinc-500 font-semibold">Referencia Bancaria:</span>
                          <span className="text-white font-mono font-black tracking-wide">{buyerReference || "Sin referencia"}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                          <span className="text-zinc-505 font-medium">Bco Emisor:</span>
                          <span className="text-zinc-300 font-bold">{buyerBankSender}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                          <span className="text-zinc-505 font-medium">Nombre de Pagador:</span>
                          <span className="text-zinc-300 font-mono">{buyerHolderName}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                          <span className="text-zinc-505 font-medium">Banco Destino:</span>
                          <span className="text-white font-bold">{sellerBankReceiver}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                          <span className="text-zinc-505 font-medium">Titular Receptor:</span>
                          <span className="text-white font-mono">{sellerHolderName}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                          <span className="text-zinc-505 font-medium">Teléfono Destino:</span>
                          <span className="text-white font-mono">{sellerPhoneReceiver}</span>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between pb-0.5">
                      <span className="text-zinc-500 font-semibold">Comisión de Intercambio:</span>
                      <span className="text-emerald-400 font-bold font-mono">0.00 Bs / Gratis</span>
                    </div>
                  </div>

                  {/* Operational disclaimer matching user early exchange instructions */}
                  <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-[9.5px] leading-snug text-yellow-300 font-bold">
                    📌 CONCILIACIÓN SEMI-AUTOMÁTICA MARCHA:
                    <p className="text-zinc-300 font-medium font-sans mt-0.5 leading-snug">
                       El Administrador de OrinocoP2P verificará tu transferencia y actualizará el estado de la orden {depositType === 'deposit' ? 'para cargarte los USDT solicitados' : 'para transferirte los Bolívares correspondientes'}. Tiempo promedio: <strong className="text-white">5 a 15 Minutos</strong>. Puedes realizar el seguimiento en tu panel de <button onClick={() => { setDepositStep(1); setActiveTab('orders'); }} className="text-[#f0b90b] underline font-bold hover:text-amber-300 bg-transparent border-none p-0 cursor-pointer">Órdenes Activas</button>.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 max-w-xs mx-auto">
                  <button
                    onClick={() => {
                      setDepositStep(1);
                      setBuyerReference("");
                      setBuyerPhoneSender("");
                      setBuyerIdCard("");
                      setBuyerHolderName("");
                      setSellerPhoneReceiver("");
                      setSellerIdCard("");
                      setSellerHolderName("");
                      setSellerWalletBackup("");
                      setActiveTab('orders'); // Jump to orders list
                    }}
                    className="w-full bg-[#f0b90b] hover:bg-amber-400 text-neutral-950 font-black py-3 rounded-2xl text-xs transition active:scale-95 duration-100 shadow-md shadow-amber-500/5 cursor-pointer"
                  >
                    Ver Estado en "Mis Órdenes"
                  </button>
                  <button
                    onClick={() => {
                      setDepositStep(1);
                      setBuyerReference("");
                      setBuyerPhoneSender("");
                      setBuyerIdCard("");
                      setBuyerHolderName("");
                      setSellerPhoneReceiver("");
                      setSellerIdCard("");
                      setSellerHolderName("");
                      setSellerWalletBackup("");
                      setActiveTab('buy'); // Back to main P2P offers tab
                    }}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-extrabold py-3 rounded-2xl text-xs transition active:scale-95 border border-zinc-750/60 cursor-pointer"
                  >
                    Ir al Mercado P2P entre Usuarios
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3.5: USDT Withdrawal Form */}
        {activeTab === 'withdraw' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left animate-fadeIn">
            {/* Form Column */}
            <div className="lg:col-span-2 bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 space-y-6 shadow-xl">
              <div className="flex items-center space-x-3 border-b border-zinc-800 pb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30">
                  <ArrowUpRight className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">Retirar Fondos a Binance</h3>
                  <p className="text-xs text-zinc-400">Solicita cambiar tus USDT acumulados hacia tu billetera personal en Binance.</p>
                </div>
              </div>

              {withdrawSuccessMsg && (
                <div className="bg-emerald-950/40 border border-emerald-500/30 text-[#39FF14] text-xs font-semibold p-4 rounded-xl flex items-start gap-3 animate-fadeIn">
                  <span className="text-base">💎</span>
                  <div className="leading-relaxed">
                    {withdrawSuccessMsg}
                  </div>
                </div>
              )}

              {withdrawErrorMsg && (
                <div className="bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-semibold p-4 rounded-xl flex items-start gap-3 animate-fadeIn">
                  <span className="text-base">⚠️</span>
                  <div>
                    {withdrawErrorMsg}
                  </div>
                </div>
              )}

              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/40 p-4 rounded-2xl border border-zinc-800/65">
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Mi Saldo Disponible</span>
                    <strong className="text-xl sm:text-2xl font-mono font-black text-[#39FF14] tracking-normal inline-block mt-0.5">${bovedaUsdt.toFixed(2)} USDT</strong>
                  </div>
                  <div className="text-left border-t sm:border-t-0 sm:border-l border-zinc-800/80 pt-2.5 sm:pt-0 sm:pl-4">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Comisión de Salida</span>
                    <strong className="text-md font-mono font-black text-amber-400 tracking-normal inline-block mt-1">0.00% (¡Sin recargos de envío!)</strong>
                    <span className="text-[9px] text-zinc-500 block leading-tight">El costo de la red es absorbido por el administrador</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-[#39FF14] block font-black">
                    Dirección de Retiro o ID de Pago (Billetera Binance) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. TUh7b8P2vDkWqXp3Y9B9S7sTtrc20eXp20 o tu ID de Pay"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    className="w-full text-xs font-mono bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                  />
                  <span className="text-[9px] text-zinc-500 block">Indica tu dirección USDT de Coinbase, Binance, TrustWallet o tu Binance Pay UID.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 block font-bold">
                      Red Seleccionada (Network) *
                    </label>
                    <select
                      value={withdrawNetwork}
                      onChange={(e) => setWithdrawNetwork(e.target.value)}
                      className="w-full text-xs font-semibold bg-black border border-zinc-800 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-yellow-300 cursor-pointer"
                    >
                      <option value="USDT TRC20">USDT (TRC20 - Red TRON)</option>
                      <option value="USDT BEP20">USDT (BEP20 - BNB Smart Chain)</option>
                      <option value="Binance Pay ID">ID de Binance Pay (UID)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 block font-bold">
                      Monto a Retirar (USDT) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full text-xs font-mono font-black bg-black border border-zinc-800 rounded-xl pl-4 pr-16 py-3 text-[#39FF14] focus:outline-none focus:border-yellow-300"
                      />
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(bovedaUsdt.toString())}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-amber-400 hover:text-[#f0b90b] transition cursor-pointer bg-zinc-800 px-2 py-1 rounded"
                      >
                        MAX
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-[0_4px_15px_rgba(240,185,11,0.2)] border-none font-sans"
                >
                  <Send className="h-4 w-4" />
                  <span>Enviar Solicitud de Retiro</span>
                </button>
              </form>
            </div>

            {/* Sidebar Column: Requests history */}
            <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 space-y-4 shadow-xl">
              <div className="border-b border-zinc-800 pb-2">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Historial de Solicitudes</h3>
                <p className="text-[10px] text-zinc-500">Consulta el estado de despacho manual.</p>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {withdrawRequests.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 text-xs">
                    No tienes solicitudes de retiro activas.
                  </div>
                ) : (
                  withdrawRequests.map((req) => (
                    <div key={req.id} className="p-3 bg-black/40 border border-zinc-800/80 rounded-xl space-y-2 text-left">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-mono text-zinc-500 font-bold">{req.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8.5px] uppercase font-black ${
                          req.status === 'dispatched' 
                            ? 'bg-emerald-500/10 text-[#39FF14] border border-emerald-500/20' 
                            : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 animate-pulse'
                        }`}>
                          {req.status === 'dispatched' ? 'Despachado' : 'Pendiente'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] text-zinc-400 font-bold">Importe:</span>
                        <strong className="text-sm font-mono text-[#39FF14] font-black">${req.amountUsdt.toFixed(2)} USDT</strong>
                      </div>

                      <div className="space-y-0.5 pt-1 border-t border-zinc-800/40 text-[9px]">
                        <div className="flex justify-between text-zinc-500">
                          <span>Red:</span>
                          <span className="text-zinc-300 font-semibold">{req.network}</span>
                        </div>
                        <div className="text-zinc-500 flex flex-col pt-0.5">
                          <span className="text-[8px] uppercase">Billetera de Salida:</span>
                          <span className="font-mono text-zinc-300 truncate text-[9px] block" title={req.walletAddress}>{req.walletAddress}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
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
                    <span className="bg-amber-500/10 text-amber-400 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">ATENCIÓN MODERADA</span>
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
                  <strong>Es la mejor idea absoluta para arrancar.</strong> + " Al vender tú mismo los USDT usando tu dirección de billetera, eliminas la posibilidad de fraude interno entre usuarios. El cliente te pide comprar $100 USDT, te transfiere Bolívares por Pago Móvil, tú validas la transacción desde la aplicación de tu banco nacional con total seguridad, y le transfieres los USDT desde tu billetera (Binance Pay, MetaMask, CoinBase). La aplicación es limpia, libre de reclamos complejos, garantizando una excelente experiencia de usuario."
                )}
                {selectedAdviceType === 'free_p2p' && (
                  <strong>Este modelo requiere atención legal y mediadores 24/7.</strong> + " Al dejar que los usuarios transen directamente entre ellos, aumentas enormemente la escalabilidad (no necesitas capital para cambiar tú mismo), pero introduces situaciones de soporte adicionales (captures de Pago Móvil modificados con Photoshop, triangulación bancaria, etc.). Requieres validación de identidad robusta (KYC) y un equipo de soporte técnico encargado de resolver disputas basándose en estados de cuenta bancarios en formato PDF."
                )}
                {selectedAdviceType === 'hybrid' && (
                  <strong>Estructura Ganadora e Innovadora.</strong> + " Puedes arrancar actuando tú mismo como el Cajero / Liquidador principal de las solicitudes. De esta forma, construyes reputación. Una vez que la plataforma crezca y se gane la confianza absoluta de la comunidad, puedes habilitar cajeros asociados verificados bajo fianza, quienes depositan un fondo en colateral en tu poder de garantía para poder procesar órdenes a otros usuarios de forma automatizada y segura."
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
                  <li>Tasa de Compra de USDT (cuando tú pagas Bolívares): <span className="text-emerald-400 font-mono">797.00 Bs/USDT</span></li>
                  <li>Tasa de Venta de USDT (cuando ellos te pagan Bolívares): <span className="text-emerald-400 font-mono">801.99 Bs/USDT</span></li>
                  <li>Ganancia neta del Operador: <strong className="text-white">4.99 Bs por cada USDT</strong> transado.</li>
                  <li>¡Con un volumen promedio diario de $1,000 USDT generas un ingreso sólido y recurrente de 5,000 Bs libres de cargos!</li>
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
