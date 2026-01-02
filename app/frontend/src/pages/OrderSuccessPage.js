import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { paymentsAPI } from '../../../../services/api';
import { toast } from 'sonner';

const OrderSuccessPage = () => {
const router = useRouter();
  const [searchParams] = useSearchParams();
  const { clearCart } = useApp();
  const [status, setStatus] = useState('checking'); // checking, success, failed
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 5;

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      router.push('/cart');
      return;
    }

    // Poll payment status
    pollPaymentStatus();
  }, [sessionId]);

  const pollPaymentStatus = async () => {
    if (attempts >= maxAttempts) {
      setStatus('timeout');
      toast.error('Ödəniş statusu yoxlanılarkən problem yarandı');
      return;
    }

    try {
      const res = await paymentsAPI.getCheckoutStatus(sessionId);
      
      if (res.data.payment_status === 'paid') {
        setStatus('success');
        clearCart();
        toast.success('Ödəniş uğurla tamamlandı!');
      } else if (res.data.status === 'expired') {
        setStatus('failed');
        toast.error('Ödəniş sessiyası bitdi');
      } else {
        // Continue polling
        setAttempts(prev => prev + 1);
        setTimeout(() => pollPaymentStatus(), 2000);
      }
    } catch (err) {
      setStatus('failed');
      toast.error('Ödəniş statusu yoxlanılarkən xəta baş verdi');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto border-border">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {status === 'checking' && (
                <Loader2 className="h-16 w-16 text-accent animate-spin" data-testid="loading-icon" />
              )}
              {status === 'success' && (
                <CheckCircle2 className="h-16 w-16 text-green-500" data-testid="success-icon" />
              )}
              {(status === 'failed' || status === 'timeout') && (
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-3xl">✕</span>
                </div>
              )}
            </div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: 'Manrope, sans-serif' }}
              data-testid="status-title"
            >
              {status === 'checking' && 'Ödəniş yoxlanılır...'}
              {status === 'success' && 'Ödəniş uğurla tamamlandı!'}
              {status === 'failed' && 'Ödəniş uğursuz oldu'}
              {status === 'timeout' && 'Zaman bitdi'}
            </h1>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {status === 'checking' && (
              <p className="text-muted" data-testid="checking-message">
                Ödənişiniz yoxlanılır, lütfən gözləyin...
              </p>
            )}
            {status === 'success' && (
              <>
                <p className="text-muted" data-testid="success-message">
                  Sifarişiniz uğurla qeydə alındı. Tezliklə sizinlə əlaqə saxlanılacaq.
                </p>
                <Button
                  data-testid="continue-shopping-button"
                  onClick={() => router.push('/')}
                  className="bg-accent hover:bg-accent/90"
                >
                  Alış-verişə davam et
                </Button>
              </>
            )}
            {(status === 'failed' || status === 'timeout') && (
              <>
                <p className="text-muted" data-testid="failed-message">
                  Ödəniş zamanı problem yarandı. Lütfən yenidən cəhd edin.
                </p>
                <Button
                  data-testid="retry-button"
                  onClick={() => router.push('/cart')}
                  className="bg-accent hover:bg-accent/90"
                >
                  Səbətə qayıt
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
