import React, { useState, useEffect } from 'react';
import { ArrowLeft, DollarSign, Star, History, Clock, CheckCircle, XCircle, AlertCircle, Loader2, User, Mail, Phone, CreditCard, Building, RefreshCw, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../config/api';

const PointsWithdrawalScreen = ({ onBack }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('withdraw');
  const [pointsBalance, setPointsBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [selectedWithdrawalMethod, setSelectedWithdrawalMethod] = useState('paypal');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [withdrawalDetails, setWithdrawalDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    paypalEmail: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountHolderName: '',
    swiftCode: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    usdtWalletAddress: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

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

  const WithdrawalSkeleton = () => (
    <div className="min-h-screen bg-[#FFC0CB] text-black relative overflow-hidden">
      <div className="absolute w-[400px] h-[400px] bg-pink-300 rounded-full blur-[150px] opacity-30 top-[-100px] left-[-100px] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-pink-400 rounded-full blur-[150px] opacity-30 bottom-[-100px] right-[-100px] pointer-events-none" />
      {/* Header Skeleton */}
      <div className="sticky top-0 bg-[#FFC0CB]/95 backdrop-blur-lg border-b border-[#ff99b3] z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="text-right">
              <div className="flex items-center space-x-2 justify-end">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-3 w-16 mt-1" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 relative z-10">
        {/* Balance Card Skeleton */}
        <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-2xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-shimmer-slide"></div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-4 w-32 mx-auto mb-1" />
            <Skeleton className="h-4 w-20 mx-auto mb-2" />
            <Skeleton className="h-3 w-28 mx-auto" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-xl p-1 mb-6">
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
          {/* Amount Input Skeleton */}
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>

          {/* Methods Skeleton */}
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-white/70 border border-[#ff99b3] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-shimmer-slide"></div>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-6 h-6 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-24 mb-1" />
                      <Skeleton className="h-4 w-48 mb-1" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Skeleton */}
          <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-shimmer-slide"></div>
            <div className="flex items-center mb-4">
              <Skeleton className="w-5 h-5 rounded mr-2" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>

          {/* Submit Button Skeleton */}
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );

  const HistorySkeleton = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-[#ff99b3] bg-white/70 p-4 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-shimmer-slide"></div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-5 h-5 rounded" />
                <div>
                  <Skeleton className="h-6 w-16 mb-1" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            
            <div className="space-y-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const withdrawalMethods = [
    {
      id: 'paypal',
      name: t('withdrawal.paypal'),
      icon: DollarSign,
      description: t('withdrawal.paypalDescription'),
      minAmount: 10,
      processingTime: `1-2 ${t('withdrawal.businessDays')}`,
      fees: '2% + $0.30'
    },
    {
      id: 'bank',
      name: t('withdrawal.bankTransfer'),
      icon: Building,
      description: t('withdrawal.bankDescription'),
      minAmount: 25,
      processingTime: `3-5 ${t('withdrawal.businessDays')}`,
      fees: '$2.00 flat fee'
    },
    {
      id: 'card',
      name: t('withdrawal.debitCard'),
      icon: CreditCard,
      description: t('withdrawal.cardDescription'),
      minAmount: 5,
      processingTime: t('withdrawal.instant'),
      fees: '3% + $0.25'
    },
    {
      id: 'usdt',
      name: t('withdrawal.usdtWallet'),
      icon: Wallet,
      description: t('withdrawal.usdtDescription'),
      minAmount: 20,
      processingTime: `1-3 ${t('withdrawal.businessDays')}`,
      fees: '1% + $1.00'
    }
  ];

  // Fetch points balance
  const fetchPointsBalance = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/points/balance`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setPointsBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Error fetching points balance:', error);
      setPointsBalance(1250);
    }
  };

  // Fetch withdrawal history
  const fetchWithdrawalHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/withdrawals/history`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setWithdrawalHistory(data.withdrawals || []);
      } else {
        setWithdrawalHistory([
          {
            _id: '1',
            requestId: 'WD17265432109ABCD',
            amount: 50,
            pointsToDeduct: 500,
            method: 'paypal',
            status: 'pending',
            requestedAt: new Date().toISOString(),
            details: { fullName: 'John Doe', paypalEmail: 'user@example.com' }
          },
          {
            _id: '2',
            requestId: 'WD17265432108EFGH',
            amount: 25,
            pointsToDeduct: 250,
            method: 'bank',
            status: 'approved',
            requestedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            approvedAt: new Date(Date.now() - 86400000).toISOString(),
            details: { fullName: 'John Doe', bankName: 'Chase Bank' }
          },
          {
            _id: '3',
            requestId: 'WD17265432107IJKL',
            amount: 15,
            pointsToDeduct: 150,
            method: 'card',
            status: 'completed',
            requestedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
            approvedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
            completedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            details: { fullName: 'John Doe', cardholderName: 'John Doe' }
          },
          {
            _id: '4',
            requestId: 'WD17265432106MNOP',
            amount: 100,
            pointsToDeduct: 1000,
            method: 'usdt',
            status: 'rejected',
            requestedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
            rejectedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
            rejectionReason: 'Invalid wallet address',
            details: { fullName: 'John Doe', usdtWalletAddress: '0x1234567890abcdef1234567890abcdef12345678' }
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      setWithdrawalHistory([
        {
          _id: '1',
          requestId: 'WD17265432109ABCD',
          amount: 50,
          pointsToDeduct: 500,
          method: 'paypal',
          status: 'pending',
          requestedAt: new Date().toISOString(),
          details: { fullName: 'John Doe', paypalEmail: 'user@example.com' }
        },
        {
          _id: '2',
          requestId: 'WD17265432108EFGH',
          amount: 25,
          pointsToDeduct: 250,
          method: 'bank',
          status: 'approved',
          requestedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          approvedAt: new Date(Date.now() - 86400000).toISOString(),
          details: { fullName: 'John Doe', bankName: 'Chase Bank' }
        }
      ]);
    }
  };

  // Cancel withdrawal
  const cancelWithdrawal = async (withdrawalId) => {
    try {
      setProcessing(true);
      const response = await fetch(`${API_BASE_URL}/withdrawals/cancel/${withdrawalId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setSuccess(t('withdrawal.messages.cancelledSuccessfully'));
        await fetchWithdrawalHistory();
      } else {
        const data = await response.json();
        setError(data.msg || t('withdrawal.messages.cancelFailed'));
      }
    } catch (error) {
      console.error('Cancel withdrawal error:', error);
      setError(t('withdrawal.messages.cancelFailed'));
    } finally {
      setProcessing(false);
    }
  };

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPointsBalance(),
      fetchWithdrawalHistory()
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPointsBalance(),
        fetchWithdrawalHistory()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  const pointsToUSD = (points) => {
    return points / 10; // 10 points = $1
  };

  const usdToPoints = (usd) => {
    return usd * 10; // $1 = 10 points
  };

  const validateForm = () => {
    const errors = {};

    if (!withdrawalDetails.fullName.trim()) {
      errors.fullName = t('withdrawal.validation.fullNameRequired');
    }

    if (!withdrawalDetails.email.trim()) {
      errors.email = t('withdrawal.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(withdrawalDetails.email)) {
      errors.email = t('withdrawal.validation.validEmail');
    }

    if (!withdrawalDetails.phone.trim()) {
      errors.phone = t('withdrawal.validation.phoneRequired');
    }

    if (selectedWithdrawalMethod === 'paypal') {
      if (!withdrawalDetails.paypalEmail.trim()) {
        errors.paypalEmail = t('withdrawal.validation.paypalEmailRequired');
      }
    } else if (selectedWithdrawalMethod === 'bank') {
      if (!withdrawalDetails.bankName.trim()) {
        errors.bankName = t('withdrawal.validation.bankNameRequired');
      }
      if (!withdrawalDetails.accountNumber.trim()) {
        errors.accountNumber = t('withdrawal.validation.accountNumberRequired');
      }
      if (!withdrawalDetails.accountHolderName.trim()) {
        errors.accountHolderName = t('withdrawal.validation.accountHolderNameRequired');
      }
    } else if (selectedWithdrawalMethod === 'card') {
      if (!withdrawalDetails.accountNumber.trim()) {
        errors.accountNumber = t('withdrawal.validation.cardNumberRequired');
      }
      if (!withdrawalDetails.accountHolderName.trim()) {
        errors.accountHolderName = t('withdrawal.validation.cardholderNameRequired');
      }
    } else if (selectedWithdrawalMethod === 'usdt') {
      if (!withdrawalDetails.usdtWalletAddress.trim()) {
        errors.usdtWalletAddress = t('withdrawal.validation.usdtWalletRequired');
      } else if (!/^0x[a-fA-F0-9]{40}$/.test(withdrawalDetails.usdtWalletAddress)) {
        errors.usdtWalletAddress = t('withdrawal.validation.validUsdtWallet');
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setWithdrawalDetails(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleWithdrawalRequest = async () => {
    const amount = parseFloat(withdrawalAmount);
    const pointsRequired = usdToPoints(amount);
    const selectedMethod = withdrawalMethods.find(m => m.id === selectedWithdrawalMethod);

    // Validation
    if (!amount || amount <= 0) {
      setError(t('withdrawal.validation.enterValidAmount'));
      return;
    }

    if (amount < selectedMethod.minAmount) {
      setError(t('withdrawal.validation.minimumAmount', { method: selectedMethod.name, amount: selectedMethod.minAmount }));
      return;
    }

    if (pointsRequired > pointsBalance) {
      setError(t('withdrawal.validation.insufficientPoints', { 
        required: pointsRequired.toLocaleString(), 
        available: pointsBalance.toLocaleString() 
      }));
      return;
    }

    if (!validateForm()) {
      setError(t('withdrawal.validation.fillRequiredFields'));
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/withdrawals/request`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amount,
          pointsToDeduct: pointsRequired,
          method: selectedWithdrawalMethod,
          details: {
            fullName: withdrawalDetails.fullName,
            email: withdrawalDetails.email,
            phone: withdrawalDetails.phone,
            paypalEmail: selectedWithdrawalMethod === 'paypal' ? withdrawalDetails.paypalEmail : null,
            bankDetails: selectedWithdrawalMethod === 'bank' ? {
              bankName: withdrawalDetails.bankName,
              accountNumber: withdrawalDetails.accountNumber,
              routingNumber: withdrawalDetails.routingNumber,
              accountHolderName: withdrawalDetails.accountHolderName,
              swiftCode: withdrawalDetails.swiftCode
            } : null,
            cardDetails: selectedWithdrawalMethod === 'card' ? {
              cardNumber: withdrawalDetails.accountNumber,
              cardholderName: withdrawalDetails.accountHolderName
            } : null,
            usdtDetails: selectedWithdrawalMethod === 'usdt' ? {
              walletAddress: withdrawalDetails.usdtWalletAddress
            } : null,
            address: {
              street: withdrawalDetails.address,
              city: withdrawalDetails.city,
              state: withdrawalDetails.state,
              zipCode: withdrawalDetails.zipCode,
              country: withdrawalDetails.country || 'US'
            }
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(t('withdrawal.messages.requestSubmitted', { requestId: data.withdrawal.requestId }));

        // Reset form
        setWithdrawalAmount('');
        setWithdrawalDetails({
          fullName: '',
          email: '',
          phone: '',
          paypalEmail: '',
          bankName: '',
          accountNumber: '',
          routingNumber: '',
          accountHolderName: '',
          swiftCode: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          usdtWalletAddress: ''
        });
        setValidationErrors({});

        // Refresh data
        await Promise.all([
          fetchPointsBalance(),
          fetchWithdrawalHistory()
        ]);

        // Switch to history tab
        setActiveTab('history');
      } else {
        setError(data.msg || t('withdrawal.messages.requestFailed'));
      }
    } catch (error) {
      console.error('Withdrawal request error:', error);
      setError(t('withdrawal.messages.requestFailedTryAgain'));
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-pink-500" />;
      case 'approved':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-pink-600';
      case 'approved':
      case 'completed':
        return 'text-green-600';
      case 'rejected':
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'pending':
        return 'border border-pink-300 bg-pink-100/60';
      case 'approved':
      case 'completed':
        return 'border border-green-200 bg-green-100/60';
      case 'rejected':
      case 'cancelled':
        return 'border border-red-200 bg-red-100/60';
      default:
        return 'border border-gray-200 bg-white/70';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'paypal':
        return <DollarSign className="w-5 h-5" />;
      case 'bank':
        return <Building className="w-5 h-5" />;
      case 'card':
        return <CreditCard className="w-5 h-5" />;
      case 'usdt':
        return <Wallet className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  // Loading screen with skeleton
  if (loading) {
    return <WithdrawalSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#FFC0CB] text-black relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] bg-pink-200 rounded-full blur-[180px] opacity-40 top-[-150px] left-[-150px] pointer-events-none" />
      <div className="absolute w-[450px] h-[450px] bg-pink-400 rounded-full blur-[180px] opacity-30 bottom-[-150px] right-[-150px] pointer-events-none" />

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

      {/* Header */}
      <div className="sticky top-0 bg-[#FFC0CB]/95 backdrop-blur-lg border-b border-[#ff99b3] z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">{t('withdrawal.withdrawPoints')}</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-pink-700" />
                <span className="text-lg font-bold text-pink-700">{pointsBalance.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-700">
                ≈ ${pointsToUSD(pointsBalance).toFixed(2)} USD
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="p-4">
        <div className="bg-white/80 backdrop-blur-md border border-[#ff99b3] rounded-2xl p-6 mb-6 shadow-lg">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <DollarSign className="w-8 h-8 text-pink-700" />
              <h2 className="text-3xl font-bold text-black">
                ${pointsToUSD(pointsBalance).toFixed(2)}
              </h2>
            </div>
            <p className="text-sm text-pink-700 font-medium">{t('withdrawal.availableForWithdrawal')}</p>
            <p className="text-sm text-gray-700 mt-1">
              {pointsBalance.toLocaleString()} {t('profile.points').toLowerCase()}
            </p>
            <p className="text-xs text-gray-600 mt-2 italic">
              {t('withdrawal.conversionRate')}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4 flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4 flex items-center space-x-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <p>{success}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${activeTab === 'withdraw'
              ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow'
              : 'text-gray-600 hover:text-black'
              }`}
          >
            <DollarSign className="w-4 h-4 inline mr-2" />
            {t('withdrawal.withdraw')}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${activeTab === 'history'
              ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow'
              : 'text-gray-600 hover:text-black'
              }`}
          >
            <History className="w-4 h-4 inline mr-2" />
            {t('withdrawal.history')}
          </button>
        </div>

        {/* Withdraw Tab */}
        {activeTab === 'withdraw' && (
          <div className="space-y-6">
            {/* Withdrawal Amount */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('withdrawal.withdrawalAmount')}</h3>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  min="1"
                  max={pointsToUSD(pointsBalance)}
                  step="0.01"
                  value={withdrawalAmount}
                  onChange={(e) => {
                    setWithdrawalAmount(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  className="w-full pl-8 pr-4 py-3 bg-white border border-[#ff99b3] rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder={t('withdrawal.enterAmount')}
                />
              </div>
              {withdrawalAmount && parseFloat(withdrawalAmount) > 0 && (
                <div className="mt-2 flex items-center space-x-1 text-sm">
                  <Star className="w-4 h-4 text-pink-600" />
                  <span className="text-pink-700">
                    {usdToPoints(parseFloat(withdrawalAmount)).toLocaleString()} {t('withdrawal.pointsWillBeDeducted')}
                  </span>
                </div>
              )}
            </div>

            {/* Withdrawal Methods */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('withdrawal.withdrawalMethod')}</h3>
              <div className="grid grid-cols-1 gap-3">
                {withdrawalMethods.map((method) => {
                  const IconComponent = method.icon;
                  const isDisabled = withdrawalAmount && parseFloat(withdrawalAmount) < method.minAmount;

                  return (
                    <button
                      key={method.id}
                      onClick={() => {
                        if (!isDisabled) {
                          setSelectedWithdrawalMethod(method.id);
                          setError('');
                          setSuccess('');
                        }
                      }}
                      disabled={isDisabled}
                      className={`p-4 rounded-2xl border-2 transition-all text-left ${selectedWithdrawalMethod === method.id
                        ? 'border-pink-500 bg-pink-200/60 text-black shadow-lg'
                        : isDisabled
                          ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed text-gray-500'
                          : 'border-[#ff99b3] bg-white hover:border-pink-400 hover:shadow-md text-black'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-pink-100">
                          <IconComponent className="w-6 h-6 text-pink-700" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-gray-600">{method.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {t('withdrawal.min')}: ${method.minAmount} • {method.processingTime} • {t('withdrawal.fees')}: {method.fees}
                          </div>
                        </div>
                        {selectedWithdrawalMethod === method.id && !isDisabled && (
                          <CheckCircle className="w-5 h-5 text-pink-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white/80 backdrop-blur-md border border-[#ff99b3] rounded-2xl p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <div className="p-2 rounded-lg bg-pink-100 mr-2">
                  <User className="w-5 h-5 text-pink-700" />
                </div>
                {t('withdrawal.personalInformation')}
              </h3>

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder={t('withdrawal.fullName')}
                    value={withdrawalDetails.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.fullName ? 'border-red-400' : 'border-[#ff99b3]'
                      }`}
                  />
                  {validationErrors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <input
                    type="email"
                    placeholder={t('withdrawal.emailAddress')}
                    value={withdrawalDetails.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.email ? 'border-red-400' : 'border-[#ff99b3]'
                      }`}
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder={t('withdrawal.phoneNumber')}
                    value={withdrawalDetails.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.phone ? 'border-red-400' : 'border-[#ff99b3]'
                      }`}
                  />
                  {validationErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Method Specific Fields */}
            {selectedWithdrawalMethod === 'paypal' && (
              <div className="bg-white/80 backdrop-blur-md border border-[#ff99b3] rounded-2xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <div className="p-2 rounded-lg bg-pink-100 mr-2">
                    <DollarSign className="w-5 h-5 text-pink-700" />
                  </div>
                  {t('withdrawal.paypalInformation')}
                </h3>

                <div>
                  <input
                    type="email"
                    placeholder={t('withdrawal.paypalEmailAddress')}
                    value={withdrawalDetails.paypalEmail}
                    onChange={(e) => handleInputChange('paypalEmail', e.target.value)}
                    className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.paypalEmail ? 'border-red-400' : 'border-[#ff99b3]'
                      }`}
                  />
                  {validationErrors.paypalEmail && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.paypalEmail}</p>
                  )}
                </div>
              </div>
            )}

            {selectedWithdrawalMethod === 'bank' && (
              <div className="bg-white/80 backdrop-blur-md border border-[#ff99b3] rounded-2xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <div className="p-2 rounded-lg bg-pink-100 mr-2">
                    <Building className="w-5 h-5 text-pink-700" />
                  </div>
                  {t('withdrawal.bankInformation')}
                </h3>

                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder={t('withdrawal.bankName')}
                      value={withdrawalDetails.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.bankName ? 'border-red-400' : 'border-[#ff99b3]'
                        }`}
                    />
                    {validationErrors.bankName && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.bankName}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder={t('withdrawal.accountHolderName')}
                      value={withdrawalDetails.accountHolderName}
                      onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                      className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.accountHolderName ? 'border-red-400' : 'border-[#ff99b3]'
                        }`}
                    />
                    {validationErrors.accountHolderName && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.accountHolderName}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder={t('withdrawal.accountNumber')}
                      value={withdrawalDetails.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.accountNumber ? 'border-red-400' : 'border-[#ff99b3]'
                        }`}
                    />
                    {validationErrors.accountNumber && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.accountNumber}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder={t('withdrawal.routingNumber')}
                      value={withdrawalDetails.routingNumber}
                      onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                      className="w-full p-3 bg-white border border-[#ff99b3] rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedWithdrawalMethod === 'card' && (
              <div className="bg-white/80 backdrop-blur-md border border-[#ff99b3] rounded-2xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <div className="p-2 rounded-lg bg-pink-100 mr-2">
                    <CreditCard className="w-5 h-5 text-pink-700" />
                  </div>
                  {t('withdrawal.debitCardInformation')}
                </h3>

                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder={t('withdrawal.cardholderName')}
                      value={withdrawalDetails.accountHolderName}
                      onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                      className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.accountHolderName ? 'border-red-400' : 'border-[#ff99b3]'
                        }`}
                    />
                    {validationErrors.accountHolderName && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.accountHolderName}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder={t('withdrawal.cardNumber')}
                      value={withdrawalDetails.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.accountNumber ? 'border-red-400' : 'border-[#ff99b3]'
                        }`}
                    />
                    {validationErrors.accountNumber && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.accountNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedWithdrawalMethod === 'usdt' && (
              <div className="bg-white/80 backdrop-blur-md border border-[#ff99b3] rounded-2xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <div className="p-2 rounded-lg bg-pink-100 mr-2">
                    <Wallet className="w-5 h-5 text-pink-700" />
                  </div>
                  {t('withdrawal.usdtWalletInformation')}
                </h3>

                <div>
                  <input
                    type="text"
                    placeholder={t('withdrawal.usdtWalletAddress')}
                    value={withdrawalDetails.usdtWalletAddress}
                    onChange={(e) => handleInputChange('usdtWalletAddress', e.target.value)}
                    className={`w-full p-3 bg-white border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-pink-500 ${validationErrors.usdtWalletAddress ? 'border-red-400' : 'border-[#ff99b3]'
                      }`}
                  />
                  {validationErrors.usdtWalletAddress && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.usdtWalletAddress}</p>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleWithdrawalRequest}
              disabled={processing || !withdrawalAmount || parseFloat(withdrawalAmount) <= 0}
              className="w-full py-4 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-2xl font-semibold text-lg disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-colors shadow-lg"
            >
              {processing ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('withdrawal.submittingRequest')}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>{t('withdrawal.requestWithdrawal')} - ${withdrawalAmount || '0'}</span>
                </div>
              )}
            </button>

            {/* Important Notice */}
            <div className="bg-pink-200/60 border border-[#ff99b3] rounded-xl p-4">
              <h4 className="font-semibold mb-2 text-pink-700 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {t('withdrawal.importantNotice')}
              </h4>
              <ul className="text-sm text-pink-800 space-y-1">
                <li>• {t('withdrawal.adminApprovalRequired')}</li>
                <li>• {t('withdrawal.processingTimeNotice')}</li>
                <li>• {t('withdrawal.pointsDeductedOnApproval')}</li>
                <li>• {t('withdrawal.ensureAccurateInfo')}</li>
                <li>• {t('withdrawal.contactSupportToCancel')}</li>
              </ul>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {loading || refreshing ? (
              <HistorySkeleton />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{t('withdrawal.withdrawalHistory')}</h3>
                  <div className="text-sm text-gray-700">
                    {withdrawalHistory.length} {t('withdrawal.totalRequests')}
                  </div>
                </div>

                {withdrawalHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-black mb-2">{t('withdrawal.noWithdrawalsYet')}</h3>
                    <p className="text-gray-600 mb-4">
                      {t('withdrawal.noWithdrawalRequests')}
                    </p>
                    <button
                      onClick={() => setActiveTab('withdraw')}
                      className="px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-colors"
                    >
                      {t('withdrawal.makeFirstWithdrawal')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {withdrawalHistory.map((withdrawal) => (
                      <div
                        key={withdrawal._id}
                        className={`rounded-2xl border p-4 bg-white/85 backdrop-blur-sm shadow-sm ${getStatusBg(withdrawal.status)}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getMethodIcon(withdrawal.method)}
                            <div>
                              <div className="font-semibold text-lg text-black">${withdrawal.amount}</div>
                              <div className="text-sm text-gray-600">
                                {withdrawal.method.charAt(0).toUpperCase() +
                                  withdrawal.method.slice(1)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(withdrawal.status)}
                            <span className={`font-medium capitalize ${getStatusColor(withdrawal.status)}`}>
                              {t(`withdrawal.status.${withdrawal.status}`)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{t('withdrawal.requestId')}:</span>
                            <span className="font-mono text-gray-800">{withdrawal.requestId}</span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{t('withdrawal.pointsDeducted')}:</span>
                            <span className="flex items-center space-x-1 text-gray-800">
                              <Star className="w-3 h-3 text-pink-600" />
                              <span>
                                {withdrawal.pointsToDeduct?.toLocaleString() ||
                                  (withdrawal.amount * 10).toLocaleString()}
                              </span>
                            </span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{t('withdrawal.requested')}:</span>
                            <span className="text-gray-800">{formatDate(withdrawal.requestedAt)}</span>
                          </div>

                          {withdrawal.approvedAt && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">{t('withdrawal.approved')}:</span>
                              <span className="text-green-600">
                                {formatDate(withdrawal.approvedAt)}
                              </span>
                            </div>
                          )}

                          {withdrawal.completedAt && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">{t('withdrawal.completed')}:</span>
                              <span className="text-green-600">
                                {formatDate(withdrawal.completedAt)}
                              </span>
                            </div>
                          )}

                          {withdrawal.rejectedAt && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">{t('withdrawal.rejected')}:</span>
                              <span className="text-red-500">
                                {formatDate(withdrawal.rejectedAt)}
                              </span>
                            </div>
                          )}

                          {withdrawal.rejectionReason && (
                            <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded-lg">
                              <div className="text-sm text-red-700">
                                <span className="font-medium">{t('withdrawal.rejectionReason')}: </span>
                                {withdrawal.rejectionReason}
                              </div>
                            </div>
                          )}

                          {withdrawal.adminNotes && (
                            <div className="mt-2 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                              <div className="text-sm text-blue-700">
                                <span className="font-medium">{t('withdrawal.adminNotes')}: </span>
                                {withdrawal.adminNotes}
                              </div>
                            </div>
                          )}

                          {/* Payment Details */}
                          {withdrawal.details && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <div className="text-xs text-gray-500 mb-2">
                                {t('withdrawal.paymentDetails')}:
                              </div>

                              <div className="space-y-1 text-sm">
                                {withdrawal.details.fullName && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">{t('withdrawal.name')}:</span>
                                    <span className="text-gray-800">{withdrawal.details.fullName}</span>
                                  </div>
                                )}

                                {withdrawal.method === 'paypal' &&
                                  withdrawal.details.paypalEmail && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">{t('withdrawal.paypal')}:</span>
                                      <span className="text-gray-800">{withdrawal.details.paypalEmail}</span>
                                    </div>
                                  )}

                                {withdrawal.method === 'bank' &&
                                  withdrawal.details.bankDetails && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">{t('withdrawal.bankTransfer')}:</span>
                                      <span className="text-gray-800">
                                        {withdrawal.details.bankDetails.bankName ||
                                          withdrawal.details.bankName}
                                      </span>
                                    </div>
                                  )}

                                {withdrawal.method === 'card' &&
                                  withdrawal.details.cardDetails && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">{t('withdrawal.debitCard')}:</span>
                                      <span className="text-gray-800">
                                        {withdrawal.details.cardDetails.cardholderName ||
                                          withdrawal.details.cardholderName}
                                      </span>
                                    </div>
                                  )}

                                {withdrawal.method === 'usdt' &&
                                  withdrawal.details.usdtDetails && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">{t('withdrawal.usdtWallet')}:</span>
                                      <span className="font-mono truncate w-40 text-gray-800">
                                        {withdrawal.details.usdtDetails.walletAddress}
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          {withdrawal.status === 'pending' && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <button
                                onClick={() => cancelWithdrawal(withdrawal._id)}
                                disabled={processing}
                                className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processing ? (
                                  <div className="flex items-center justify-center space-x-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>{t('withdrawal.cancelling')}</span>
                                  </div>
                                ) : (
                                  t('withdrawal.cancelRequest')
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Summary Stats */}
                {withdrawalHistory.length > 0 && (
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-white/80 backdrop-blur-sm border border-[#ff99b3] rounded-2xl p-4 shadow-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-pink-700">
                          $
                          {withdrawalHistory
                            .filter((w) => w.status === 'completed')
                            .reduce((sum, w) => sum + w.amount, 0)
                            .toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">{t('withdrawal.totalWithdrawn')}</div>
                      </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm border border-[#ff99b3] rounded-2xl p-4 shadow-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-pink-600">
                          $
                          {withdrawalHistory
                            .filter((w) => w.status === 'pending')
                            .reduce((sum, w) => sum + w.amount, 0)
                            .toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">{t('withdrawal.pending')}</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsWithdrawalScreen;