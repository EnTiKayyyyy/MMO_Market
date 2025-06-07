import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<'success' | 'failed' | 'pending'>('pending');
    const [message, setMessage] = useState('');
    const [txnRef, setTxnRef] = useState('');
    const [amount, setAmount] = useState('');

    useEffect(() => {
        const success = searchParams.get('success');
        const vnp_TxnRef = searchParams.get('vnp_TxnRef');
        const vnp_Amount = searchParams.get('vnp_Amount');
        const errorMessage = searchParams.get('message');
        
        setTxnRef(vnp_TxnRef || 'Không có');
        setAmount(vnp_Amount ? formatCurrency(parseInt(vnp_Amount) / 100) : '0');

        if (success === 'true') {
            setStatus('success');
            setMessage('Giao dịch của bạn đã được thực hiện thành công. Tiền sẽ được cộng vào ví sau vài phút.');
        } else {
            setStatus('failed');
            setMessage(errorMessage || 'Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
        }
        
        // Giả lập một chút độ trễ để người dùng thấy trạng thái loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);

    }, [searchParams]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-20">
                <Loader2 size={48} className="animate-spin text-primary-600 mb-4" />
                <h2 className="text-xl font-semibold">Đang xác thực giao dịch...</h2>
                <p className="text-gray-600">Vui lòng chờ trong giây lát.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto text-center py-12 px-4">
            <div className="bg-white p-8 rounded-lg shadow-custom">
                {status === 'success' ? (
                    <CheckCircle size={64} className="mx-auto text-success-500" />
                ) : (
                    <XCircle size={64} className="mx-auto text-error-500" />
                )}

                <h1 className={`text-2xl font-bold mt-4 ${status === 'success' ? 'text-success-700' : 'text-error-700'}`}>
                    {status === 'success' ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
                </h1>
                
                <p className="text-gray-600 mt-2">{message}</p>

                <div className="text-left bg-gray-50 p-4 rounded-lg mt-6 space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Mã giao dịch:</span>
                        <span className="font-medium">#{txnRef}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-gray-500">Số tiền:</span>
                        <span className="font-medium">{amount}</span>
                    </div>
                </div>

                <div className="mt-8">
                    <Link to="/vi" className="btn btn-primary">
                        Quay về Ví của tôi
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatus;