'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function PaymentFailureContent() {
  const searchParams = useSearchParams();
  const txnid = searchParams.get('txnid');
  const error = searchParams.get('error');

  useEffect(() => {
    // Send failure notification to backend
    if (txnid) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/failure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txnid, error }),
      }).catch(err => console.error('Error notifying backend:', err));
    }
  }, [txnid, error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
          <CardTitle className="text-3xl">Payment Failed</CardTitle>
          <CardDescription>Your payment could not be processed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="font-mono font-semibold">{txnid || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="text-red-600 font-semibold">Failed</span>
            </div>
            {error && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Error:</span>
                <span className="text-red-600 text-xs">{error}</span>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-900">
              Your payment was not successful. Please try again or contact support if you continue to experience issues.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/register">
              <Button className="w-full">Try Again</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentFailure() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <PaymentFailureContent />
      </Suspense>
      <Footer />
    </>
  );
}
