'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, MessageCircle, Mail, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try multiple ways to get txnid
  let txnid = 
    searchParams.get('txnid') || 
    searchParams.get('txn_id') || 
    searchParams.get('transaction_id');

  // If not in URL, try localStorage (this is the key fix!)
  if (!txnid && typeof window !== 'undefined') {
    txnid = localStorage.getItem('pending_txnid');
    console.log('✓ Retrieved txnid from localStorage:', txnid);
  }

  // Get all parameters from PayU
  const allParams = {};
  searchParams.forEach((value, key) => {
    allParams[key] = value;
  });

  console.log('=== Payment Success Page ===');
  console.log('Current URL:', typeof window !== 'undefined' ? window.location.href : 'N/A');
  console.log('ALL URL Parameters from PayU:', allParams);
  console.log('txnid from ?txnid=:', searchParams.get('txnid'));
  console.log('txn_id from ?txn_id=:', searchParams.get('txn_id'));
  console.log('txnid from localStorage:', typeof window !== 'undefined' ? localStorage.getItem('pending_txnid') : 'N/A');
  console.log('Final txnid to use:', txnid);

  useEffect(() => {
    if (!txnid) {
      console.warn('⚠️  WARNING: No txnid found in URL parameters!');
      console.warn('PayU may have returned data differently than expected');
      console.warn('Checking if user just completed payment in last 5 minutes...');
      
      // Try to get the most recent pending payment for this user
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/check-status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
          .then(res => res.json())
          .then(data => {
            console.log('Latest payment status from backend:', data);
            if (data.status === 'pending') {
              console.warn('Status is still PENDING - payment may not have completed');
            }
            setPaymentData(data);
            setLoading(false);
          })
          .catch(err => {
            console.error('Error checking status:', err);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
      return;
    }

    console.log('Notifying backend of payment success for txnid:', txnid);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/success`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txnid }),
    })
      .then(res => res.json())
      .then(data => {
        console.log('Backend response:', data);
        if (data.success) {
          console.log('✓ Payment status updated successfully in database');
          console.log('Confirmed txnid:', data.txnid);
          setPaymentData({ txnid: data.txnid, status: 'success' });
        } else {
          console.error('✗ Error updating payment status:', data.message);
          setPaymentData({ txnid, status: 'pending', error: data.message });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('✗ Error notifying backend:', err);
        setPaymentData({ txnid, status: 'pending', error: err.message });
        setLoading(false);
      });
  }, [txnid]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Payment Successful!</CardTitle>
            <CardDescription>Your registration is complete</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {!paymentData?.txnid && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-900">
                      Transaction ID could not be retrieved. PayU may not have returned the transaction ID in the redirect. Check your email for confirmation.
                    </p>
                  </div>
                )}

                <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID:</span>
                    <span className="font-mono font-semibold">
                      {paymentData?.txnid ? paymentData.txnid : 'Not received'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-semibold ${
                      paymentData?.status === 'success' ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {paymentData?.status === 'success' ? 'Completed' : 'Processing...'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-semibold">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                {paymentData?.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-900">{paymentData.error}</p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-900">
                    A confirmation email has been sent to your registered email address with your registration details and login credentials.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Link href="/dashboard">
                    <Button className="w-full">Go to Dashboard</Button>
                  </Link>
                  <a href="https://chat.whatsapp.com/YOUR_WHATSAPP_GROUP_LINK" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full bg-green-50 border-green-200 hover:bg-green-100">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Join WhatsApp Community
                    </Button>
                  </a>
                  <Link href="/">
                    <Button variant="outline" className="w-full">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

export default function PaymentSuccess() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <PaymentSuccessContent />
      </Suspense>
      <Footer />
    </>
  );
}
