'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const txnid = searchParams.get('txnid');

  useEffect(() => {
    // Send success notification to backend
    if (txnid) {
      fetch('http://localhost:5000/api/payment/success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txnid, status: 'success' }),
      }).catch(err => console.error('Error notifying backend:', err));
    }
  }, [txnid]);

  return (
    <>
      <Header />
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
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono font-semibold">{txnid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-green-600 font-semibold">Completed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-semibold">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                📧 A confirmation email has been sent to your registered email address with your registration details and login credentials.
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
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
