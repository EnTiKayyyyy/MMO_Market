import { useState, useEffect } from 'react';
import { DollarSign, ArrowUp, ArrowDown, Clock, CheckCircle, AlertTriangle, X, Copy } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { useWalletStore } from '../../stores/walletStore';
import { createVnpayDepositUrl, createNowPaymentsDepositUrl, NowPaymentsResponse } from '../../services/walletService';

// --- Component Modal hiển thị thông tin thanh toán Crypto ---
const CryptoDepositModal = ({ paymentInfo, onClose }: { paymentInfo: NowPaymentsResponse | null, onClose: () => void }) => {
    if (!paymentInfo) return null;

    const [timeLeft, setTimeLeft] = useState('00:00');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const expiration = new Date(paymentInfo.expiration_estimate_date).getTime();
            const distance = expiration - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft("Hết hạn");
                return;
            }

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [paymentInfo.expiration_estimate_date]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Đã sao chép!");
    };

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${paymentInfo.pay_address}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 text-center transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Quét để nạp tiền</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20}/></button>
                </div>
                <p className="mb-4">Gửi chính xác <strong className="text-primary-600">{paymentInfo.pay_amount} {paymentInfo.pay_currency.toUpperCase()}</strong></p>
                <img src={qrCodeUrl} alt="Crypto QR Code" className="mx-auto border-4 border-white rounded-lg shadow-lg" />
                <p className="mt-4 text-sm text-gray-500">Hoặc gửi đến địa chỉ:</p>
                <div className="bg-gray-100 p-2 rounded-md my-2 flex items-center justify-between">
                    <span className="font-mono text-sm break-all mr-2">{paymentInfo.pay_address}</span>
                    <button onClick={() => handleCopy(paymentInfo.pay_address)} title="Sao chép" className="p-2 rounded hover:bg-gray-200 shrink-0">
                        <Copy size={16} />
                    </button>
                </div>
                <div className={`mt-4 font-bold text-lg ${timeLeft === 'Hết hạn' ? 'text-error-600' : 'text-gray-800'}`}>
                    Thời gian còn lại: {timeLeft}
                </div>
                <p className="mt-2 text-xs text-gray-500">Vui lòng không đóng cửa sổ này cho đến khi giao dịch của bạn được xác nhận trên blockchain.</p>
            </div>
        </div>
    );
};


const BuyerWallet = () => {
    // --- SỬA ĐỔI: Xóa bỏ hằng số tỉ giá, chỉ giữ lại số tiền nạp tối thiểu ---
    const MIN_CRYPTO_DEPOSIT_VND = 500000; // Tương đương $5

    const { balance, transactions, isLoading: isWalletLoading, fetchWalletData } = useWalletStore();
    const [depositAmount, setDepositAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [cryptoAmountVND, setCryptoAmountVND] = useState('');
    const [selectedCrypto, setSelectedCrypto] = useState('btc');
    const [isCryptoModalOpen, setIsCryptoModalOpen] = useState(false);
    const [cryptoPaymentInfo, setCryptoPaymentInfo] = useState<NowPaymentsResponse | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [transactionsPerPage] = useState(10);

    useEffect(() => {
        fetchWalletData();
    }, [fetchWalletData]);

    const handleVnPayDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!depositAmount || isSubmitting) return;
        const amount = Number(depositAmount);
        if (isNaN(amount) || amount < 10000) {
            alert("Số tiền nạp tối thiểu là 10,000đ.");
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await createVnpayDepositUrl(amount);
            window.location.href = response.paymentUrl;
        } catch (error) {
            alert('Có lỗi xảy ra khi tạo yêu cầu nạp tiền. Vui lòng thử lại.');
            console.error(error);
            setIsSubmitting(false);
        }
    };

    const handleCryptoDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cryptoAmountVND || isSubmitting) return;
        const amountVND = Number(cryptoAmountVND);

        if (isNaN(amountVND) || amountVND < MIN_CRYPTO_DEPOSIT_VND) {
            alert(`Số tiền nạp tối thiểu là ${formatCurrency(MIN_CRYPTO_DEPOSIT_VND)}.`);
            return;
        }

        setIsSubmitting(true);
        try {
            // --- SỬA ĐỔI: Gửi trực tiếp số tiền VND người dùng nhập ---
            const responseData = await createNowPaymentsDepositUrl(amountVND, selectedCrypto);
            if (responseData && responseData.pay_address) {
                setCryptoPaymentInfo(responseData);
                setIsCryptoModalOpen(true);
            } else {
                alert("Không thể lấy thông tin thanh toán. Vui lòng thử lại.");
            }
        } catch (error) {
            alert('Có lỗi xảy ra khi tạo yêu cầu nạp tiền Crypto.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTransactionStatusColor = (status: string) => {
        switch(status) {
            case 'completed': return 'text-success-600 bg-success-50';
            case 'pending': return 'text-warning-600 bg-warning-50';
            case 'failed': return 'text-error-600 bg-error-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getTransactionStatusText = (status: string) => {
        switch(status) {
            case 'completed': return 'Hoàn thành';
            case 'pending': return 'Đang xử lý';
            case 'failed': return 'Thất bại';
            case 'refund_debit_seller': return 'Hoàn tiền';
            default: return 'Không xác định';
        }
    };

    const getTransactionStatusIcon = (status: string) => {
        switch(status) {
            case 'completed': return <CheckCircle size={16} />;
            case 'pending': return <Clock size={16} />;
            case 'failed': return <AlertTriangle size={16} />;
            default: return null;
        }
    };

    const indexOfLastTransaction = currentPage * transactionsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
    const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
    const totalPages = Math.ceil(transactions.length / transactionsPerPage);

    const paginate = (pageNumber: number) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    }

    return (
        <div>
            {isCryptoModalOpen && <CryptoDepositModal paymentInfo={cryptoPaymentInfo} onClose={() => setIsCryptoModalOpen(false)} />}

            <div className="mb-6">
                <h1 className="text-2xl font-bold">Ví của tôi</h1>
                <p className="text-gray-600 mt-1">Quản lý số dư và giao dịch</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cột bên trái */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-white rounded-lg shadow-custom p-8">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-700">Số dư khả dụng</h3>
                            <div className="p-2 rounded-full bg-primary-100 text-primary-600">
                                <DollarSign size={20} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold">{isWalletLoading ? '...' : formatCurrency(balance)}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-custom p-6">
                        <h2 className="text-lg font-semibold mb-4">Nạp tiền qua VNPay</h2>
                        <form onSubmit={handleVnPayDeposit}>
                            <div className="mb-4">
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Số tiền muốn nạp</label>
                                <input type="number" id="amount" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="input" placeholder="Tối thiểu 10,000đ" min="10000" step="10000" required />
                            </div>
                            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">{isSubmitting ? 'Đang xử lý...' : 'Tiếp tục với VNPay'}</button>
                        </form>
                    </div>

                    <div className="bg-white rounded-lg shadow-custom p-6">
                        <h2 className="text-lg font-semibold mb-4">Nạp tiền bằng Crypto</h2>
                        <form onSubmit={handleCryptoDeposit}>
                            <div className="mb-4">
                                <label htmlFor="crypto-amount" className="block text-sm font-medium text-gray-700 mb-1">Số tiền (VND)</label>
                                <input type="number" id="crypto-amount" value={cryptoAmountVND} onChange={(e) => setCryptoAmountVND(e.target.value)} className="input" placeholder={`Tối thiểu ${formatCurrency(MIN_CRYPTO_DEPOSIT_VND)}`} min={MIN_CRYPTO_DEPOSIT_VND} step="1000" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="crypto-currency" className="block text-sm font-medium text-gray-700 mb-1">Chọn loại Coin</label>
                                <select id="crypto-currency" value={selectedCrypto} onChange={(e) => setSelectedCrypto(e.target.value)} className="input">
                                    <option value="btc">Bitcoin (BTC)</option>
                                    <option value="eth">Ethereum (ETH)</option>
                                    <option value="usdttrc20">USDT (TRC20)</option>
                                    <option value="ltc">Litecoin (LTC)</option>
                                </select>
                            </div>
                            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">{isSubmitting ? 'Đang xử lý...' : 'Tạo địa chỉ nạp'}</button>
                        </form>
                    </div>
                </div>

                {/* Cột bên phải */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-custom p-6">
                        <h2 className="text-lg font-semibold mb-4">Lịch sử giao dịch</h2>

                        {transactions.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                        <tr className="border-b">
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Thời gian</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Loại</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Số tiền</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {currentTransactions.map((transaction) => (
                                            <tr key={transaction.id} className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{formatDateTime(transaction.createdAt)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`inline-flex items-center text-sm ${Number(transaction.amount) > 0 ? 'text-success-600' : 'text-error-600'}`}>
                                                        {Number(transaction.amount) > 0 ? <ArrowUp size={16} className="mr-1" /> : <ArrowDown size={16} className="mr-1" />}
                                                        {transaction.type === 'deposit' ? 'Nạp tiền' : transaction.type === 'withdraw' ? 'Rút tiền' : 'Thanh toán'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                                    <span className={Number(transaction.amount) > 0 ? 'text-success-600' : 'text-error-600'}>
                                                        {Number(transaction.amount) > 0 ? '+' : ''}{formatCurrency(Number(transaction.amount))}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionStatusColor(transaction.status)}`}>
                                                        {getTransactionStatusIcon(transaction.status)}
                                                        <span className="ml-1">{getTransactionStatusText(transaction.status)}</span>
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                                {totalPages > 1 && (
                                    <nav className="mt-6 flex justify-end items-center space-x-2">
                                        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded-md text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border">
                                            Trước
                                        </button>
                                        <span className="text-sm text-gray-700">Trang {currentPage} / {totalPages}</span>
                                        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border">
                                            Sau
                                        </button>
                                    </nav>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                Chưa có giao dịch nào
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyerWallet;