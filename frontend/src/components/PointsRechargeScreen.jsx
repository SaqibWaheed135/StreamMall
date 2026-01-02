import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CreditCard, DollarSign, Star, Gift, History, CheckCircle, XCircle, Clock, User, Mail, Phone, MapPin, Calendar, Lock, Upload, Copy, QrCode, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { QRCodeCanvas } from "qrcode.react";
import { API_BASE_URL } from '../config/api';

const PointsRechargeScreen = ({ onBack }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('recharge');
  const [pointsBalance, setPointsBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recharging, setRecharging] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('usdt');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showUsdtPayment, setShowUsdtPayment] = useState(false);
  const [usdtPaymentData, setUsdtPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [countdown, setCountdown] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [copyMsg, setCopyMsg] = useState('');
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    paypalEmail: '',
    transactionScreenshot: null,
    transactionId: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const hasAlertedRef = useRef(false);
  const pollingIntervalRef = useRef(null);


  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Skeleton components
  const Skeleton = ({ className = "", children, ...props }) => (
    <div
      className={`animate-pulse bg-gradient-to-r from-[#ffb3c6] via-[#ff99b3] to-[#ffb3c6] bg-[length:200%_100%] animate-shimmer rounded ${className}`}
      {...props}
    >
      {children}
    </div>
  );

  const RechargeSkeleton = () => (
    <div className="min-h-screen bg-[#FFC0CB] text-black">
      {/* Custom styles for shimmer effect */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes shimmer-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
          background: linear-gradient(90deg, #ffb3c6 25%, #ff99b3 50%, #ffb3c6 75%);
          background-size: 200% 100%;
        }
        
        .animate-shimmer-slide {
          animation: shimmer-slide 2s infinite;
        }
      `}</style>

      {/* Header Skeleton */}
      <div className="sticky top-0 bg-[#FFC0CB]/95 backdrop-blur-lg border-b border-[#ff99b3] z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 justify-end">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-3 w-20 mt-1" />
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Balance Card Skeleton */}
        <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-shimmer-slide"></div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-4 w-28 mx-auto" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-lg p-1 mb-6">
          <div className="flex">
            <div className="flex-1 py-3 px-4">
              <Skeleton className="h-6 w-20 mx-auto" />
            </div>
            <div className="flex-1 py-3 px-4">
              <Skeleton className="h-6 w-16 mx-auto" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-6">
          {/* Amount Options Skeleton */}
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid grid-cols-1 gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-[#ff99b3] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-shimmer-slide"></div>
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="flex items-center space-x-2 mb-1">
                        <Skeleton className="h-6 w-12" />
                        {i === 2 && <Skeleton className="h-5 w-16 rounded-full" />}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Skeleton className="w-4 h-4 rounded" />
                        <Skeleton className="h-4 w-20" />
                        {i > 2 && <Skeleton className="h-3 w-16" />}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Amount Skeleton */}
          <div>
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>

          {/* Payment Methods Skeleton */}
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 rounded-lg bg-white/70 backdrop-blur-sm border border-[#ff99b3] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-shimmer-slide"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-6 h-6" />
                      <div className="text-left">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button Skeleton */}
          <Skeleton className="h-14 w-full rounded-xl" />

          {/* Usage Info Skeleton */}
          <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-lg p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-shimmer-slide"></div>
            <Skeleton className="h-5 w-24 mb-2" />
            <div className="space-y-1">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const HistorySkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-lg p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-shimmer-slide"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-5 h-5 rounded" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-6 w-12 mb-1" />
              <Skeleton className="h-3 w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const rechargeOptions = [
    { amount: 5, points: 50, popular: false, bonus: 0 },
    { amount: 10, points: 100, popular: true, bonus: 10 },
    { amount: 25, points: 250, popular: false, bonus: 50 },
    { amount: 50, points: 500, popular: false, bonus: 150 },
    { amount: 100, points: 1000, popular: false, bonus: 400 },
  ];

  const paymentMethods = [
    { id: 'usdt', name: t('recharge.usdtTrc20'), icon: DollarSign, description: t('recharge.usdtDescription') },
    { id: 'bank', name: t('recharge.bankTransfer'), icon: Gift, description: t('recharge.bankDescription') },
  ];

  const getCategoryForIcon = (transaction) => {
    return transaction.category ||
      (transaction.status && `recharge_${transaction.status}`) ||
      transaction.type ||
      'unknown';
  };

  const getCategoryForColor = (transaction) => {
    return transaction.category ||
      (transaction.status && `recharge_${transaction.status}`) ||
      transaction.type ||
      'unknown';
  };

  // const getTransactionIcon = (category) => {
  //   switch (category) {
  //     case 'recharge_approved':
  //     case 'usdt_recharge_approved':
  //     case 'recharge':
  //     case 'credit':
  //       return <CheckCircle className="w-5 h-5 text-green-400" />;
  //     case 'recharge_request':
  //       return <Clock className="w-5 h-5 text-yellow-400" />;
  //     case 'recharge_rejected':
  //     case 'debit':
  //       return <XCircle className="w-5 h-5 text-red-400" />;
  //     case 'recharge_cancelled':
  //     case 'pending':
  //       return <Clock className="w-5 h-5 text-gray-400" />;
  //     case 'gift':
  //     case 'award':
  //     case 'bonus':
  //       return <Gift className="w-5 h-5 text-yellow-400" />;
  //     default:
  //       return <Clock className="w-5 h-5 text-gray-400" />;
  //   }
  // };


  // Update the history section to show expired orders with different styling:
const getTransactionIcon = (category) => {
  switch (category) {
    case 'recharge_approved':
    case 'usdt_recharge_approved':
    case 'recharge':
    case 'credit':
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case 'recharge_request':
      return <Clock className="w-5 h-5 text-yellow-400" />;
    case 'recharge_rejected':
    case 'debit':
      return <XCircle className="w-5 h-5 text-red-400" />;
    case 'recharge_expired':
      return <AlertCircle className="w-5 h-5 text-orange-400" />;
    case 'recharge_cancelled':
    case 'pending':
      return <Clock className="w-5 h-5 text-gray-400" />;
    case 'gift':
    case 'award':
    case 'bonus':
      return <Gift className="w-5 h-5 text-yellow-400" />;
    default:
      return <Clock className="w-5 h-5 text-gray-400" />;
  }
};
  // const getTransactionColor = (category) => {
  //   switch (category) {
  //     case 'recharge_approved':
  //     case 'usdt_recharge_approved':
  //     case 'recharge':
  //     case 'award':
  //     case 'bonus':
  //     case 'credit':
  //       return 'text-green-400';
  //     case 'recharge_rejected':
  //     case 'debit':
  //       return 'text-red-400';
  //     case 'recharge_request':
  //     case 'recharge_cancelled':
  //     case 'pending':
  //       return 'text-gray-400';
  //     default:
  //       return 'text-gray-400';
  //   }
  // };

  const getTransactionColor = (category) => {
  switch (category) {
    case 'recharge_approved':
    case 'usdt_recharge_approved':
    case 'recharge':
    case 'award':
    case 'bonus':
    case 'credit':
      return 'text-green-400';
    case 'recharge_rejected':
    case 'debit':
      return 'text-red-400';
    case 'recharge_expired':
      return 'text-orange-400';
    case 'recharge_request':
    case 'recharge_cancelled':
    case 'pending':
      return 'text-gray-400';
    default:
      return 'text-gray-400';
  }
};
  const formatDate = (dateString) => {
    if (!dateString) return t('recharge.invalidDate');
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t('recharge.invalidDate');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const appBankDetails = {
    bankName: 'Example Bank',
    accountNumber: '1234567890',
    routingNumber: '0987654321',
    accountHolder: 'ClipStream Inc.',
    swiftCode: 'EXBKUS33',
    instructions: 'Please transfer the amount to this account and upload the transaction screenshot/receipt.'
  };

  const fetchPointsBalance = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/points/balance`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setPointsBalance(data.balance);
      }
    } catch (error) {
      console.error('Error fetching points balance:', error);
    }
  };

  const fetchPointsHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

      const response = await fetch(`${API_BASE_URL}/recharges/history?userId=${userId}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        const mappedHistory = (data.recharges || []).map(recharge => ({
          _id: recharge._id,
          transactionId: recharge.requestId,
          type: recharge.status === 'approved' ? 'credit' : 'pending',
          category: `recharge_${recharge.status}`,
          amount: recharge.pointsToAdd,
          balanceBefore: 0,
          balanceAfter: recharge.pointsToAdd,
          description: `${recharge.method.toUpperCase()} Recharge ${recharge.status}: $${recharge.amount}`,
          createdAt: recharge.requestedAt,
          metadata: {
            rechargeId: recharge._id,
            status: recharge.status,
            method: recharge.method
          }
        }));
        setHistory(mappedHistory);
      } else {
        console.error('Failed to fetch history:', await response.text());
        setHistory([]);
      }
    } catch (error) {
      console.error('Error fetching points history:', error);
      setHistory([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPointsBalance(),
        fetchPointsHistory()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  const calculatePoints = (amount) => {
    const basePoints = amount * 10;
    const option = rechargeOptions.find(opt => opt.amount === amount);
    const bonus = option?.bonus || 0;
    return basePoints + bonus;
  };

  const validateForm = () => {
    const errors = {};
    if (selectedPaymentMethod !== 'usdt') {
      if (!paymentDetails.fullName.trim()) {
        errors.fullName = t('recharge.validation.fullNameRequired');
      }
      if (!paymentDetails.email.trim()) {
        errors.email = t('recharge.validation.emailRequired');
      } else if (!/\S+@\S+\.\S+/.test(paymentDetails.email)) {
        errors.email = t('recharge.validation.validEmail');
      }
      if (!paymentDetails.phone.trim()) {
        errors.phone = t('recharge.validation.phoneRequired');
      }
    }
    if (selectedPaymentMethod === 'card') {
      if (!paymentDetails.cardNumber.trim()) {
        errors.cardNumber = t('recharge.validation.cardNumberRequired');
      }
      if (!paymentDetails.expiryDate.trim()) {
        errors.expiryDate = t('recharge.validation.expiryDateRequired');
      }
      if (!paymentDetails.cvv.trim()) {
        errors.cvv = t('recharge.validation.cvvRequired');
      }
      if (!paymentDetails.cardholderName.trim()) {
        errors.cardholderName = t('recharge.validation.cardholderNameRequired');
      }
      if (!paymentDetails.address.trim()) {
        errors.address = t('recharge.validation.addressRequired');
      }
      if (!paymentDetails.city.trim()) {
        errors.city = t('recharge.validation.cityRequired');
      }
      if (!paymentDetails.zipCode.trim()) {
        errors.zipCode = t('recharge.validation.zipCodeRequired');
      }
    } else if (selectedPaymentMethod === 'paypal') {
      if (!paymentDetails.paypalEmail.trim()) {
        errors.paypalEmail = t('recharge.validation.paypalEmailRequired');
      } else if (!/\S+@\S+\.\S+/.test(paymentDetails.paypalEmail)) {
        errors.paypalEmail = t('recharge.validation.validPaypalEmail');
      }
    } else if (selectedPaymentMethod === 'bank') {
      if (!paymentDetails.transactionId.trim()) {
        errors.transactionId = t('recharge.validation.transactionIdRequired');
      }
      if (!paymentDetails.transactionScreenshot) {
        errors.transactionScreenshot = t('recharge.validation.screenshotRequired');
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setPaymentDetails(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentDetails(prev => ({ ...prev, transactionScreenshot: file }));
      if (validationErrors.transactionScreenshot) {
        setValidationErrors(prev => ({ ...prev, transactionScreenshot: '' }));
      }
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyMsg(t('recharge.copied'));
      setTimeout(() => setCopyMsg(''), 2000);
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopyMsg(t('recharge.copied'));
      setTimeout(() => setCopyMsg(''), 2000);
    });
  };

  // const createUsdtOrder = async (amount) => {
  //   try {
  //     setRecharging(true);
  //     const response = await fetch(`${API_BASE_URL}/recharges/usdt/create-order`, {
  //       method: 'POST',
  //       headers: getAuthHeaders(),
  //       body: JSON.stringify({ amount })
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       setUsdtPaymentData(data.data);
  //       setShowUsdtPayment(true);
  //       setPaymentStatus('pending');
  //       hasAlertedRef.current = false;

  //       const exp = new Date(data.data.expiresAt).getTime();
  //       const now = Date.now();
  //       const diff = Math.max(0, Math.floor((exp - now) / 1000));
  //       setCountdown(diff);

  //       if (timerInterval) clearInterval(timerInterval);
  //       const iv = setInterval(() => {
  //         setCountdown((prev) => {
  //           if (prev <= 1) {
  //             clearInterval(iv);
  //             setPaymentStatus('expired');
  //             return 0;
  //           }
  //           return prev - 1;
  //         });
  //       }, 1000);
  //       setTimerInterval(iv);

  //       startPaymentStatusCheck(data.data.orderId);
  //     } else {
  //       alert(data.errors?.[0]?.msg || data.msg || 'Failed to create USDT order');
  //     }
  //   } catch (error) {
  //     console.error('Error creating USDT order:', error);
  //     alert('Failed to create USDT payment order');
  //   } finally {
  //     setRecharging(false);
  //   }
  // };


  // Update the createUsdtOrder function:
  const createUsdtOrder = async (amount) => {
    try {
      setRecharging(true);
      const response = await fetch(`${API_BASE_URL}/recharges/usdt/create-order`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount })
      });

      const data = await response.json();

      if (response.ok) {
        setUsdtPaymentData(data.data);
        setShowUsdtPayment(true);
        setPaymentStatus('pending');
        hasAlertedRef.current = false;

        const exp = new Date(data.data.expiresAt).getTime();
        const now = Date.now();
        const diff = Math.max(0, Math.floor((exp - now) / 1000));
        setCountdown(diff);

        if (timerInterval) clearInterval(timerInterval);
        const iv = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(iv);
              setPaymentStatus('expired');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setTimerInterval(iv);

        startPaymentStatusCheck(data.data.orderId);
        } else {
          // Handle error - if there's a pending order, show option to continue
          if (data.orderId) {
            const continueExisting = window.confirm(
              `${data.msg}\n\n${t('recharge.messages.continueExistingOrder')}`
            );
            if (continueExisting) {
              // Redirect to check existing order status
              alert(t('recharge.messages.checkPreviousOrder'));
            }
          } else {
            alert(data.errors?.[0]?.msg || data.msg || t('recharge.messages.failedToCreateOrder'));
          }
        }
      } catch (error) {
        console.error('Error creating USDT order:', error);
        alert(t('recharge.messages.failedToCreateOrderTryAgain'));
    } finally {
      setRecharging(false);
    }
  };

  // const checkUsdtPayment = async (orderId) => {
  //   try {
  //     setCheckingPayment(true);
  //     const response = await fetch(`${API_BASE_URL}/recharges/usdt/check-payment`, {
  //       method: 'POST',
  //       headers: getAuthHeaders(),
  //       body: JSON.stringify({ orderId })
  //     });

  //     const data = await response.json();

  //     if (data.success && data.status === 'approved') {
  //       setPaymentStatus('approved');
  //       if (!hasAlertedRef.current) {
  //         alert('Payment confirmed! Points have been added to your account.');
  //         hasAlertedRef.current = true;
  //       }
  //       if (pollingIntervalRef.current) {
  //         clearInterval(pollingIntervalRef.current);
  //         pollingIntervalRef.current = null;
  //       }
  //       await fetchPointsBalance();
  //       await fetchPointsHistory();
  //       resetForm();
  //       setActiveTab('history');
  //     } else if (data.status === 'expired') {
  //       setPaymentStatus('expired');
  //       if (pollingIntervalRef.current) {
  //         clearInterval(pollingIntervalRef.current);
  //         pollingIntervalRef.current = null;
  //       }
  //       if (!hasAlertedRef.current) {
  //         alert('Order expired');
  //         hasAlertedRef.current = true;
  //       }
  //     } else {
  //       setPaymentStatus(data.status || 'pending');
  //     }
  //   } catch (error) {
  //     console.error('Error checking payment:', error);
  //   } finally {
  //     setCheckingPayment(false);
  //   }
  // };

  // Update the checkUsdtPayment function to handle expired status:
  const checkUsdtPayment = async (orderId) => {
    try {
      setCheckingPayment(true);
      const response = await fetch(`${API_BASE_URL}/recharges/usdt/check-payment`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ orderId })
      });

      const data = await response.json();

      if (data.success && data.status === 'approved') {
        setPaymentStatus('approved');
        if (!hasAlertedRef.current) {
          alert(`✅ ${t('recharge.messages.paymentConfirmedAlert')}`);
          hasAlertedRef.current = true;
        }
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        if (timerInterval) {
          clearInterval(timerInterval);
          setTimerInterval(null);
        }
        await fetchPointsBalance();
        await fetchPointsHistory();

        // Auto-close after 3 seconds
        setTimeout(() => {
          resetForm();
          setActiveTab('history');
        }, 3000);
      } else if (data.status === 'expired') {
        setPaymentStatus('expired');
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        if (timerInterval) {
          clearInterval(timerInterval);
          setTimerInterval(null);
        }
        if (!hasAlertedRef.current) {
          alert(`⏰ ${t('recharge.messages.orderExpiredAlert')}`);
          hasAlertedRef.current = true;
        }
      } else {
        setPaymentStatus(data.status || 'pending');
      }
    } catch (error) {
      console.error('Error checking payment:', error);
    } finally {
      setCheckingPayment(false);
    }
  };

  const startPaymentStatusCheck = (orderId) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    pollingIntervalRef.current = setInterval(async () => {
      if (paymentStatus === 'approved' || paymentStatus === 'expired') {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        return;
      }
      await checkUsdtPayment(orderId);
    }, 10000);

    setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (paymentStatus !== 'approved') {
        setPaymentStatus('expired');
        if (!hasAlertedRef.current) {
          alert(t('recharge.messages.orderExpired'));
          hasAlertedRef.current = true;
        }
      }
    }, 15 * 60 * 1000);
  };

  const proceedToCheckout = () => {
    const amount = selectedAmount || parseFloat(customAmount);

    if (!amount || amount <= 0) {
      alert(t('recharge.validation.selectValidAmount'));
      return;
    }
    if (amount < 1) {
      alert(t('recharge.validation.minimumAmount'));
      return;
    }
    if (amount > 500) {
      alert(t('recharge.validation.maximumAmount'));
      return;
    }
    if (selectedPaymentMethod === 'usdt') {
      createUsdtOrder(amount);
    } else {
      setShowCheckout(true);
    }
  };

  const resetForm = () => {
    setSelectedAmount(null);
    setCustomAmount('');
    setShowCheckout(false);
    setShowUsdtPayment(false);
    setUsdtPaymentData(null);
    setPaymentStatus('pending');
    setCountdown(0);
    if (timerInterval) clearInterval(timerInterval);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setPaymentDetails({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      paypalEmail: '',
      transactionScreenshot: null,
      transactionId: '',
    });
    setValidationErrors({});
    hasAlertedRef.current = false;
  };
  // Add a function to handle creating new order after expiry:
  const handleCreateNewOrder = () => {
    if (window.confirm(t('recharge.messages.createNewOrder'))) {
      const amount = selectedAmount || parseFloat(customAmount);
      resetForm();
      setTimeout(() => {
        setSelectedAmount(amount);
        proceedToCheckout();
      }, 100);
    }
  };
  // Add this function to your PointsRechargeScreen component
  // Place it after the resetForm function and before the loading check

  const handleRecharge = async () => {
    try {
      // Validate form first
      if (!validateForm()) {
        alert(t('recharge.validation.fillRequiredFields'));
        return;
      }

      setRecharging(true);

      const amount = selectedAmount || parseFloat(customAmount);
      const pointsToAdd = calculatePoints(amount);

      // For bank transfer method
      if (selectedPaymentMethod === 'bank') {
        // Prepare FormData for file upload
        const formData = new FormData();

        // Add main fields
        formData.append('amount', amount.toString());
        formData.append('pointsToAdd', pointsToAdd.toString());
        formData.append('method', 'bank');

        // Add details as a JSON string
        const details = {
          fullName: paymentDetails.fullName,
          email: paymentDetails.email,
          phone: paymentDetails.phone,
          transactionId: paymentDetails.transactionId,
        };
        formData.append('details', JSON.stringify(details));

        // Add screenshot file
        if (paymentDetails.transactionScreenshot) {
          formData.append('transactionScreenshot', paymentDetails.transactionScreenshot);
        }

        // Get token for authorization
        const token = localStorage.getItem('token');

        // Send request to backend
        const response = await fetch(`${API_BASE_URL}/recharges/request`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type, let browser set it with boundary for FormData
          },
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          // Success - show success message
          alert(`✅ ${t('recharge.messages.rechargeSubmitted')}\n\n${t('recharge.messages.requestId')}: ${data.recharge.requestId}\n${t('recharge.messages.amount')}: $${data.recharge.amount}\n${t('recharge.messages.points')}: ${data.recharge.pointsToAdd.toLocaleString()}\n\n${t('recharge.messages.requestBeingReviewed')}`);

          // Refresh data
          await fetchPointsBalance();
          await fetchPointsHistory();

          // Reset form and go to history tab
          resetForm();
          setActiveTab('history');
        } else {
          // Handle errors
          const errorMsg = data.errors?.[0]?.msg || data.msg || t('recharge.messages.rechargeFailed');
          alert(`❌ ${t('recharge.messages.error')}: ${errorMsg}`);
        }
      } else if (selectedPaymentMethod === 'card' || selectedPaymentMethod === 'paypal') {
        // For card/PayPal - these would integrate with payment gateways
        alert(t('recharge.messages.cardPaypalNotAvailable'));
      } else {
        alert(t('recharge.messages.invalidPaymentMethod'));
      }
    } catch (error) {
      console.error('Error submitting recharge:', error);
      alert(`❌ ${t('recharge.messages.rechargeFailedTryAgain')}`);
    } finally {
      setRecharging(false);
    }
  };

  // Now update the button onClick to use this function:
  // Replace the button code with this:


  // Loading screen with skeleton
  if (loading) {
    return <RechargeSkeleton />;
  }

  // if (showUsdtPayment && usdtPaymentData) {
  //   return (
  //     <div className="min-h-screen bg-[#FFC0CB] text-black">
  //       <div className="sticky top-0 bg-[#FFC0CB]/95 backdrop-blur-lg border-b border-[#ff99b3] z-10 p-4">
  //         <div className="flex items-center justify-between">
  //           <div className="flex items-center space-x-4">
  //             <button
  //               onClick={() => {
  //                 setShowUsdtPayment(false);
  //                 setUsdtPaymentData(null);
  //                 if (timerInterval) clearInterval(timerInterval);
  //                 if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
  //               }}
  //               className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors"
  //             >
  //               <ArrowLeft className="w-5 h-5" />
  //             </button>
  //             <h1 className="text-xl font-bold">USDT Payment</h1>
  //           </div>
  //           <div className="text-right">
  //             <div className="text-lg font-bold text-pink-700">
  //               {usdtPaymentData.amount} USDT
  //             </div>
  //             <p className="text-xs text-gray-700">
  //               {usdtPaymentData.pointsToAdd.toLocaleString()} points
  //             </p>
  //           </div>
  //         </div>
  //       </div>

  //       <div className="p-4 max-w-md mx-auto">
  //         <div className={`rounded-xl p-4 mb-6 ${paymentStatus === 'approved' ? 'bg-green-100 border border-green-500' :
  //           paymentStatus === 'expired' ? 'bg-red-100 border border-red-500' :
  //             'bg-yellow-100 border border-yellow-500'
  //           }`}>
  //           <div className="text-center">
  //             {paymentStatus === 'approved' ? (
  //               <>
  //                 <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
  //                 <h3 className="text-lg font-bold text-green-700">Payment Confirmed!</h3>
  //                 <p className="text-green-700">Points have been added to your account</p>
  //               </>
  //             ) : paymentStatus === 'expired' ? (
  //               <>
  //                 <XCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
  //                 <h3 className="text-lg font-bold text-red-700">Order Expired</h3>
  //                 <p className="text-red-700">Please create a new order</p>
  //               </>
  //             ) : (
  //               <>
  //                 <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
  //                 <h3 className="text-lg font-bold text-yellow-700">Waiting for Payment</h3>
  //                 <p className="text-yellow-700">Send USDT to the address below</p>
  //               </>
  //             )}
  //           </div>
  //         </div>

  //         {paymentStatus === 'pending' && (
  //           <>
  //             <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-xl p-4 mb-6 text-center">
  //               <h3 className="text-lg font-semibold mb-4">Scan QR Code</h3>
  //               <div className="bg-white p-4 rounded-lg inline-block">
  //                 <QRCodeCanvas
  //                   value={`tron:${usdtPaymentData.walletAddress}?amount=${usdtPaymentData.amount}`}
  //                   size={180}
  //                   includeMargin={true}
  //                 />
  //               </div>
  //               <p className="text-gray-700 text-sm mt-2">Scan with your USDT wallet</p>
  //             </div>

  //             <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-xl p-4 mb-6">
  //               <h3 className="text-lg font-semibold mb-4">Wallet Address (TRC20)</h3>
  //               <div className="flex items-center gap-2">
  //                 <p className="text-sm font-mono break-all text-gray-800 flex-1">
  //                   {usdtPaymentData.walletAddress}
  //                 </p>
  //                 <button
  //                   onClick={() => copyToClipboard(usdtPaymentData.walletAddress)}
  //                   className="bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 text-white px-2 py-1 rounded text-sm flex items-center"
  //                 >
  //                   <Copy className="w-4 h-4 mr-1" />
  //                   Copy
  //                 </button>
  //               </div>
  //               {copyMsg && <p className="text-green-700 text-sm mt-1">{copyMsg}</p>}
  //             </div>

  //             <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-xl p-4 mb-6">
  //               <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
  //               <div className="space-y-3">
  //                 <div className="flex justify-between">
  //                   <span className="text-gray-700">Requested Amount:</span>
  //                   <span className="font-bold">{usdtPaymentData.originalAmount} USDT</span>
  //                 </div>
  //                 <div className="flex justify-between">
  //                   <span className="text-gray-700">Payable Amount:</span>
  //                   <span className="font-bold text-red-600">{usdtPaymentData.amount} USDT</span>
  //                 </div>
  //                 <div className="flex justify-between">
  //                   <span className="text-gray-700">Network:</span>
  //                   <span className="font-bold">TRC20 (Tron)</span>
  //                 </div>
  //                 <div className="flex justify-between">
  //                   <span className="text-gray-700">Points:</span>
  //                   <span className="font-bold text-pink-700">{usdtPaymentData.pointsToAdd.toLocaleString()}</span>
  //                 </div>
  //                 <div className="flex justify-between">
  //                   <span className="text-gray-700">Order ID:</span>
  //                   <span className="font-mono text-sm">{usdtPaymentData.orderId}</span>
  //                 </div>
  //                 <div className="flex justify-between">
  //                   <span className="text-gray-700">Expires in:</span>
  //                   <span className="font-bold">{formatTime(countdown)}</span>
  //                 </div>
  //               </div>
  //             </div>

  //             <div className="bg-red-100 border border-red-500 rounded-lg p-4 mb-6">
  //               <p className="text-red-700 text-sm text-center">
  //                 ⚠️ Send exactly {usdtPaymentData.amount} USDT (otherwise payment won't be detected)
  //               </p>
  //             </div>

  //             <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-xl p-4 mb-6">
  //               <h3 className="text-lg font-semibold mb-4">Instructions</h3>
  //               <div className="space-y-2 text-sm text-gray-800">
  //                 <p>1. Send exactly <strong>{usdtPaymentData.amount} USDT</strong> to the wallet address above</p>
  //                 <p>2. Make sure to use the <strong>TRC20 network</strong></p>
  //                 <p>3. Payment will be confirmed automatically within 1-5 minutes</p>
  //                 <p>4. Points will be added to your account once confirmed</p>
  //               </div>
  //             </div>

  //             <button
  //               onClick={() => checkUsdtPayment(usdtPaymentData.orderId)}
  //               disabled={checkingPayment}
  //               className="w-full py-3 bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed mb-6 flex items-center justify-center space-x-2 text-white"
  //             >
  //               {checkingPayment ? (
  //                 <>
  //                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  //                   <span>Checking...</span>
  //                 </>
  //               ) : (
  //                 <>
  //                   <RefreshCw className="w-5 h-5" />
  //                   <span>Check Payment Status</span>
  //                 </>
  //               )}
  //             </button>

  //             {usdtPaymentData.paymentUrl && (
  //               <a
  //                 href={usdtPaymentData.paymentUrl}
  //                 target="_blank"
  //                 rel="noopener noreferrer"
  //                 className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold mb-6 flex items-center justify-center space-x-2"
  //               >
  //                 <ExternalLink className="w-5 h-5" />
  //                 <span>Open in Wallet</span>
  //               </a>
  //             )}

  //             <div className="bg-red-100 border border-red-500 rounded-lg p-4">
  //               <p className="text-red-700 text-sm text-center">
  //                 ⚠️ Only send USDT on TRC20 network. Sending other tokens or using wrong network will result in loss of funds.
  //               </p>
  //             </div>
  //           </>
  //         )}
  //       </div>
  //     </div>
  //   );
  // }


  if (showUsdtPayment && usdtPaymentData) {
    return (
      <div className="min-h-screen bg-[#FFC0CB] text-black">
        <div className="sticky top-0 bg-[#FFC0CB]/95 backdrop-blur-lg border-b border-[#ff99b3] z-10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setShowUsdtPayment(false);
                  setUsdtPaymentData(null);
                  if (timerInterval) clearInterval(timerInterval);
                  if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                }}
                className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold">{t('recharge.usdtPayment')}</h1>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-pink-700">
                {usdtPaymentData.amount} USDT
              </div>
              <p className="text-xs text-gray-700">
                {usdtPaymentData.pointsToAdd.toLocaleString()} points
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-md mx-auto">
          {/* Status Banner */}
          <div className={`rounded-xl p-4 mb-6 ${paymentStatus === 'approved'
              ? 'bg-green-100 border border-green-500'
              : paymentStatus === 'expired'
                ? 'bg-orange-100 border border-orange-500'
                : 'bg-yellow-100 border border-yellow-500'
            }`}>
            <div className="text-center">
              {paymentStatus === 'approved' ? (
                <>
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-green-700">{t('recharge.paymentConfirmed')}</h3>
                  <p className="text-green-700">{t('recharge.pointsAddedToAccount')}</p>
                  <p className="text-sm text-green-600 mt-2">{t('recharge.redirectingToHistory')}</p>
                </>
              ) : paymentStatus === 'expired' ? (
                <>
                  <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-orange-700">{t('recharge.paymentExpired')}</h3>
                  <p className="text-orange-700">{t('recharge.paymentWindowClosed')}</p>
                </>
              ) : (
                <>
                  <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-yellow-700">{t('recharge.waitingForPayment')}</h3>
                  <p className="text-yellow-700">{t('recharge.sendUsdtBelow')}</p>
                  <div className="mt-2 text-2xl font-bold text-yellow-800">
                    {formatTime(countdown)}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Approved State */}
          {paymentStatus === 'approved' && (
            <div className="space-y-4">
              <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-3">{t('recharge.transactionDetails')}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">{t('recharge.amount')}:</span>
                    <span className="font-bold">{usdtPaymentData.amount} USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">{t('recharge.pointsAdded')}:</span>
                    <span className="font-bold text-green-600">+{usdtPaymentData.pointsToAdd.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">{t('recharge.status')}:</span>
                    <span className="font-bold text-green-600">{t('recharge.completed')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Expired State */}
          {/* {paymentStatus === 'expired' && (
          <div className="space-y-4">
            <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3">What Happened?</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Payment window was {USDT_CONFIG.orderExpiryMinutes} minutes</li>
                <li>• No transaction was detected on the blockchain</li>
                <li>• Your order has been automatically cancelled</li>
                <li>• You can create a new payment order anytime</li>
              </ul>
            </div>

            <button
              onClick={handleCreateNewOrder}
              className="w-full py-3 bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 rounded-lg font-semibold text-white flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Create New Payment Order</span>
            </button>

            <button
              onClick={() => {
                resetForm();
                setActiveTab('recharge');
              }}
              className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold"
            >
              Back to Recharge
            </button>
          </div>
        )} */}


          {paymentStatus === 'expired' && (
            <div className="space-y-4">
              <div className="bg-orange-100 border border-orange-500 rounded-lg p-4">
                <p className="text-orange-700 text-sm text-center">
                  ⏰ {t('recharge.orderExpiredMessage')}
                </p>
              </div>

              <button
                onClick={handleCreateNewOrder}
                className="w-full py-3 bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 rounded-lg font-semibold text-white flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>{t('recharge.createNewPaymentOrder')}</span>
              </button>

              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('recharge');
                }}
                className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold"
              >
                {t('recharge.backToRecharge')}
              </button>
            </div>
          )}

          {/* Pending State - Show QR and instructions */}
          {paymentStatus === 'pending' && (
            <>
              {/* QR Code */}
              <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-xl p-4 mb-6 text-center">
                <h3 className="text-lg font-semibold mb-4">{t('recharge.scanQrCode')}</h3>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <QRCodeCanvas
                    value={`tron:${usdtPaymentData.walletAddress}?amount=${usdtPaymentData.amount}`}
                    size={180}
                    includeMargin={true}
                  />
                </div>
                <p className="text-gray-700 text-sm mt-2">{t('recharge.scanWithWallet')}</p>
              </div>

              {/* Wallet Address */}
              <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-xl p-4 mb-6">
                <h3 className="text-lg font-semibold mb-4">{t('recharge.walletAddressTrc20')}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono break-all text-gray-800 flex-1">
                    {usdtPaymentData.walletAddress}
                  </p>
                  <button
                    onClick={() => copyToClipboard(usdtPaymentData.walletAddress)}
                    className="bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 text-white px-2 py-1 rounded text-sm flex items-center"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {t('recharge.copy')}
                  </button>
                </div>
                {copyMsg && <p className="text-green-700 text-sm mt-1">{copyMsg}</p>}
              </div>

              {/* Payment Details */}
              <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-xl p-4 mb-6">
                <h3 className="text-lg font-semibold mb-4">{t('recharge.paymentDetails')}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">{t('recharge.requestedAmount')}:</span>
                    <span className="font-bold">{usdtPaymentData.originalAmount} USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">{t('recharge.payableAmount')}:</span>
                    <span className="font-bold text-red-600">{usdtPaymentData.amount} USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">{t('recharge.network')}:</span>
                    <span className="font-bold">{t('recharge.trc20Tron')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">{t('recharge.pointsLabel')}:</span>
                    <span className="font-bold text-pink-700">{usdtPaymentData.pointsToAdd.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">{t('recharge.orderId')}:</span>
                    <span className="font-mono text-sm">{usdtPaymentData.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">{t('recharge.expiresIn')}:</span>
                    <span className={`font-bold ${countdown < 300 ? 'text-red-600' : ''}`}>
                      {formatTime(countdown)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-red-100 border border-red-500 rounded-lg p-4 mb-6">
                <p className="text-red-700 text-sm text-center">
                  ⚠️ {t('recharge.sendExactly', { amount: usdtPaymentData.amount })}
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-xl p-4 mb-6">
                <h3 className="text-lg font-semibold mb-4">{t('recharge.instructions')}</h3>
                <div className="space-y-2 text-sm text-gray-800">
                  <p>1. {t('recharge.instruction1', { amount: usdtPaymentData.amount })}</p>
                  <p>2. {t('recharge.instruction2')}</p>
                  <p>3. {t('recharge.instruction3')}</p>
                  <p>4. {t('recharge.instruction4')}</p>
                  <p>5. {t('recharge.instruction5', { time: formatTime(countdown) })}</p>
                </div>
              </div>

              {/* Check Payment Button */}
              <button
                onClick={() => checkUsdtPayment(usdtPaymentData.orderId)}
                disabled={checkingPayment}
                className="w-full py-3 bg-gradient-to-r from-pink-600 to-pink-500 hover:opacity-90 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed mb-6 flex items-center justify-center space-x-2 text-white"
              >
                {checkingPayment ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('recharge.checking')}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    <span>{t('recharge.checkPaymentStatus')}</span>
                  </>
                )}
              </button>

              {/* Safety Warning */}
              <div className="bg-red-100 border border-red-500 rounded-lg p-4">
                <p className="text-red-700 text-sm text-center">
                  ⚠️ {t('recharge.safetyWarning')}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }


  if (showCheckout) {
    return (
      <div className="min-h-screen bg-[#FFC0CB] text-black">
        <div className="sticky top-0 bg-[#FFC0CB]/95 backdrop-blur-lg border-b border-[#ff99b3] z-10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCheckout(false)}
                className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold">{t('recharge.paymentDetailsHeader')}</h1>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-pink-700">
                ${selectedAmount || customAmount}
              </div>
              <p className="text-xs text-gray-700">
                {calculatePoints(selectedAmount || parseFloat(customAmount)).toLocaleString()} {t('recharge.pointsLabel')}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-md mx-auto">
          <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-xl p-6 mb-6">
            <div className="text-center text-black">
              <h3 className="text-lg font-bold mb-2">{t('recharge.orderSummary')}</h3>
              <div className="flex justify-between items-center mb-2">
                <span>{t('recharge.amount')}:</span>
                <span className="font-bold">${selectedAmount || customAmount}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>{t('recharge.pointsLabel')}:</span>
                <span className="font-bold text-pink-700">
                  {calculatePoints(selectedAmount || parseFloat(customAmount)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>{t('recharge.paymentMethod')}:</span>
                <span className="font-bold capitalize">{selectedPaymentMethod}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                {t('recharge.personalInformation')}
              </h3>

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder={t('recharge.fullName')}
                    value={paymentDetails.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.fullName ? 'border-red-500' : 'border-[#ff99b3]'
                      }`}
                  />
                  {validationErrors.fullName && (
                    <p className="text-red-700 text-sm mt-1">{validationErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <input
                    type="email"
                    placeholder={t('recharge.emailAddress')}
                    value={paymentDetails.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.email ? 'border-red-500' : 'border-[#ff99b3]'
                      }`}
                  />
                  {validationErrors.email && (
                    <p className="text-red-700 text-sm mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder={t('recharge.phoneNumber')}
                    value={paymentDetails.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.phone ? 'border-red-500' : 'border-[#ff99b3]'
                      }`}
                  />
                  {validationErrors.phone && (
                    <p className="text-red-700 text-sm mt-1">{validationErrors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {selectedPaymentMethod === 'card' && (
              <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  {t('recharge.cardInformation')}
                </h3>

                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder={t('recharge.cardholderName')}
                      value={paymentDetails.cardholderName}
                      onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                      className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.cardholderName ? 'border-red-500' : 'border-[#ff99b3]'
                        }`}
                    />
                    {validationErrors.cardholderName && (
                      <p className="text-red-700 text-sm mt-1">{validationErrors.cardholderName}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder={t('recharge.cardNumber')}
                      value={paymentDetails.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                      maxLength="19"
                      className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.cardNumber ? 'border-red-500' : 'border-[#ff99b3]'
                        }`}
                    />
                    {validationErrors.cardNumber && (
                      <p className="text-red-700 text-sm mt-1">{validationErrors.cardNumber}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder={t('recharge.mmYy')}
                        value={paymentDetails.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                        maxLength="5"
                        className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.expiryDate ? 'border-red-500' : 'border-[#ff99b3]'
                          }`}
                      />
                      {validationErrors.expiryDate && (
                        <p className="text-red-700 text-sm mt-1">{validationErrors.expiryDate}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder={t('recharge.cvv')}
                        value={paymentDetails.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.cvv ? 'border-red-500' : 'border-[#ff99b3]'
                          }`}
                      />
                      {validationErrors.cvv && (
                        <p className="text-red-700 text-sm mt-1">{validationErrors.cvv}</p>
                      )}
                    </div>
                  </div>
                </div>

                <h4 className="text-md font-semibold mt-6 mb-4 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {t('recharge.billingAddress')}
                </h4>

                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder={t('recharge.streetAddress')}
                      value={paymentDetails.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.address ? 'border-red-500' : 'border-[#ff99b3]'
                        }`}
                    />
                    {validationErrors.address && (
                      <p className="text-red-700 text-sm mt-1">{validationErrors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder={t('recharge.city')}
                        value={paymentDetails.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.city ? 'border-red-500' : 'border-[#ff99b3]'
                          }`}
                      />
                      {validationErrors.city && (
                        <p className="text-red-700 text-sm mt-1">{validationErrors.city}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder={t('recharge.zipCode')}
                        value={paymentDetails.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.zipCode ? 'border-red-500' : 'border-[#ff99b3]'
                          }`}
                      />
                      {validationErrors.zipCode && (
                        <p className="text-red-700 text-sm mt-1">{validationErrors.zipCode}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={t('recharge.state')}
                      value={paymentDetails.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full p-3 bg-white border border-[#ff99b3] rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <input
                      type="text"
                      placeholder={t('recharge.country')}
                      value={paymentDetails.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full p-3 bg-white border border-[#ff99b3] rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedPaymentMethod === 'paypal' && (
              <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  {t('withdrawal.paypalInformation')}
                </h3>

                <div>
                  <input
                    type="email"
                    placeholder={t('withdrawal.paypalEmailAddress')}
                    value={paymentDetails.paypalEmail}
                    onChange={(e) => handleInputChange('paypalEmail', e.target.value)}
                    className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.paypalEmail ? 'border-red-500' : 'border-[#ff99b3]'
                      }`}
                  />
                  {validationErrors.paypalEmail && (
                    <p className="text-red-700 text-sm mt-1">{validationErrors.paypalEmail}</p>
                  )}
                </div>
              </div>
            )}

            {selectedPaymentMethod === 'bank' && (
              <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Gift className="w-5 h-5 mr-2" />
                  {t('recharge.bankInformation')}
                </h3>

                <div className="mb-6">
                  <h4 className="text-md font-semibold mb-2">{t('recharge.bankDetails')}:</h4>
                  <div className="space-y-2 text-sm text-gray-800">
                    <p><strong>{t('recharge.bankName')}:</strong> {appBankDetails.bankName}</p>
                    <p><strong>{t('recharge.accountNumber')}:</strong> {appBankDetails.accountNumber}</p>
                    <p><strong>{t('recharge.routingNumber')}:</strong> {appBankDetails.routingNumber}</p>
                    <p><strong>{t('recharge.accountHolder')}:</strong> {appBankDetails.accountHolder}</p>
                    <p><strong>{t('recharge.swiftCode')}:</strong> {appBankDetails.swiftCode}</p>
                    <p className="text-gray-700">{t('recharge.transferInstructions')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder={t('recharge.transactionIdReference')}
                      value={paymentDetails.transactionId}
                      onChange={(e) => handleInputChange('transactionId', e.target.value)}
                      className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.transactionId ? 'border-red-500' : 'border-[#ff99b3]'
                        }`}
                    />
                    {validationErrors.transactionId && (
                      <p className="text-red-700 text-sm mt-1">{validationErrors.transactionId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">{t('recharge.uploadScreenshot')}</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="transaction-screenshot"
                      />
                      <label
                        htmlFor="transaction-screenshot"
                        className="cursor-pointer flex items-center space-x-2 p-3 bg-white border rounded-lg w-full text-black focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        <Upload className="w-5 h-5" />
                        <span>{paymentDetails.transactionScreenshot ? paymentDetails.transactionScreenshot.name : t('common.chooseFile')}</span>
                      </label>
                    </div>
                    {validationErrors.transactionScreenshot && (
                      <p className="text-red-700 text-sm mt-1">{validationErrors.transactionScreenshot}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleRecharge}
              disabled={recharging || !selectedAmount && !customAmount}
              className="w-full py-4 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
            >
              {recharging ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{selectedPaymentMethod === 'bank' ? t('recharge.submitting') : t('common.processing')}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>
                    {selectedPaymentMethod === 'bank'
                      ? t('recharge.submitRecharge')
                      : `${t('common.completePayment')} - $${selectedAmount || customAmount}`}
                  </span>
                </div>
              )}
            </button>
            <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Lock className="w-4 h-4 text-green-700" />
                <span className="text-sm text-green-700 font-medium">{t('common.securePayment')}</span>
              </div>
              <p className="text-xs text-gray-700">
                {t('common.paymentSecureMessage')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFC0CB] text-black">
      {/* Custom styles for shimmer effect */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes shimmer-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
          background: linear-gradient(90deg, #ffb3c6 25%, #ff99b3 50%, #ffb3c6 75%);
          background-size: 200% 100%;
        }
        
        .animate-shimmer-slide {
          animation: shimmer-slide 2s infinite;
        }
      `}</style>

      <div className="sticky top-0 bg-[#FFC0CB]/95 backdrop-blur-lg border-b border-[#ff99b3] z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">{t('recharge.points')}</h1>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-pink-700" />
              <span className="text-lg font-bold text-pink-700">{pointsBalance.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-700">{t('recharge.currentBalance')}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-gradient-to-r from-pink-600 to-pink-500 rounded-xl p-6 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Star className="w-8 h-8 text-white" />
              <h2 className="text-3xl font-bold text-white">{pointsBalance.toLocaleString()}</h2>
            </div>
            <p className="text-white/80">{t('recharge.availablePoints')}</p>
          </div>
        </div>

        <div className="flex bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('recharge')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${activeTab === 'recharge'
              ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white'
              : 'text-gray-700 hover:text-black'
              }`}
          >
            <CreditCard className="w-4 h-4 inline mr-2" />
            {t('recharge.recharge')}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${activeTab === 'history'
              ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white'
              : 'text-gray-700 hover:text-black'
              }`}
          >
            <History className="w-4 h-4 inline mr-2" />
            {t('recharge.history')}
          </button>
        </div>

        {activeTab === 'recharge' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('recharge.selectAmount')}</h3>
              <div className="grid grid-cols-1 gap-3">
                {rechargeOptions.map((option) => (
                  <button
                    key={option.amount}
                    onClick={() => {
                      setSelectedAmount(option.amount);
                      setCustomAmount('');
                    }}
                    className={`relative p-4 rounded-xl border-2 transition-all ${selectedAmount === option.amount
                      ? 'bg-[#ffb3c6] border-[#ff99b3]'
                      : 'border-[#ff99b3] bg-white/70 backdrop-blur-sm hover:bg-[#ffb3c6]'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold">${option.amount}</span>
                          {option.popular && (
                            <span className="bg-pink-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                              {t('recharge.popular')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="w-4 h-4 text-pink-700" />
                          <span className="text-pink-700 font-medium">
                            {(option.points + option.bonus).toLocaleString()} {t('recharge.pointsLabel')}
                          </span>
                          {option.bonus > 0 && (
                            <span className="text-green-700 text-sm">
                              (+{option.bonus} {t('recharge.bonus')})
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedAmount === option.amount && (
                        <CheckCircle className="w-6 h-6 text-pink-700" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('recharge.orEnterCustomAmount')}</h3>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700">$</span>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  className="w-full pl-8 pr-4 py-3 bg-white border border-[#ff99b3] rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder={t('recharge.enterAmount')}
                />
              </div>
              {customAmount && (
                <div className="mt-2 flex items-center space-x-1 text-sm">
                  <Star className="w-4 h-4 text-pink-700" />
                  <span className="text-pink-700">
                    {t('recharge.youllGet')} {calculatePoints(parseFloat(customAmount)).toLocaleString()} {t('recharge.pointsWillBeAdded')}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('recharge.paymentMethod')}</h3>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all ${selectedPaymentMethod === method.id
                        ? 'border-[#ff99b3] bg-[#ffb3c6]'
                        : 'border-[#ff99b3] bg-white/70 backdrop-blur-sm hover:bg-[#ffb3c6]'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <IconComponent className="w-6 h-6" />
                          <div className="text-left">
                            <span className="text-sm font-medium block">{method.name}</span>
                            <span className="text-xs text-gray-700">{method.description}</span>
                          </div>
                        </div>
                        {selectedPaymentMethod === method.id && (
                          <CheckCircle className="w-5 h-5 text-pink-700" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={proceedToCheckout}
              disabled={!selectedAmount && !customAmount || recharging}
              className="w-full py-4 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
            >
              <div className="flex items-center justify-center space-x-2">
                {recharging ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('recharge.creatingOrder')}</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>
                      {selectedPaymentMethod === 'usdt' ? t('recharge.payWithUsdt') : t('recharge.proceedToCheckout')} - ${selectedAmount || customAmount || '0'}
                    </span>
                  </>
                )}
              </div>
            </button>

            <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-lg p-4">
              <h4 className="font-semibold mb-2">{t('recharge.pointsUsage')}</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• {t('recharge.sendVirtualGifts')}</li>
                <li>• {t('recharge.boostVideos')}</li>
                <li>• {t('recharge.accessPremium')}</li>
                <li>• {t('recharge.supportCreators')}</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {(!history || history.length === 0) ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                <p className="text-gray-700 text-lg mb-2">{t('recharge.noTransactionHistory')}</p>
                <p className="text-gray-600">{t('recharge.transactionsWillAppear')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((transaction, index) => (
                  <div
                    key={transaction._id || transaction.transactionId || index}
                    className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(getCategoryForIcon(transaction))}
                        <div>
                          <p className="font-medium">{transaction.description || transaction.categoryDisplay || t('recharge.transaction')}</p>
                          <p className="text-sm text-gray-700">
                            {formatDate(transaction.createdAt || transaction.requestedAt)}
                          </p>
                          {transaction.transactionId && (
                            <p className="text-xs text-gray-600 mt-1">
                              ID: {transaction.transactionId}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${getTransactionColor(getCategoryForColor(transaction))}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount || transaction.pointsToAdd}
                        </p>
                        <p className="text-xs text-gray-700">points</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsRechargeScreen;