'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Register() {
  const [step, setStep] = useState(1); // 1: Check login, 2: Select plan, 3: Payment
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, token } = useAuth();
  const router = useRouter();

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Get started with basic access',
      features: ['1 masterclass/month', 'Community access', 'Basic resources'],
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 1,
      description: 'Get started with basic access',
      features: ['1 masterclass/month', 'Community access', 'Basic resources'],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 2999,
      description: 'Perfect for active sellers',
      features: ['Unlimited masterclasses', 'Priority Q&A', 'Premium resources'],
    },
  ];

  // Step 1: Check if user is logged in
  if (!token || !user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl">Register for Masterclass</CardTitle>
            <CardDescription>You need to login first to register</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please login to your account to register for our masterclasses.
              </AlertDescription>
            </Alert>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push('/login')}
                className="flex-1"
              >
                Login
              </Button>
              <Button
                onClick={() => router.push('/signup')}
                variant="outline"
                className="flex-1"
              >
                Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
        <Footer />
      </>
    );
  }

  // Step 2: Select Plan
  if (step === 1) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl">Choose Your Plan</CardTitle>
            <CardDescription>Select a plan to register for masterclasses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        ₹{plan.price}
                        <span className="text-sm font-normal text-muted-foreground">/month</span>
                      </p>
                    </div>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  if (!selectedPlan) {
                    setError('Please select a plan');
                    return;
                  }
                  setStep(2);
                }}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
      </>
    );
  }

  // Step 3: Payment Processing
  if (step === 2) {
    return (
      <>
        <Header />
        <PaymentForm user={user} plan={plans.find(p => p.id === selectedPlan)} />
        <Footer />
      </>
    );
  }
}

function PaymentForm({ user, plan }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          firstname: user.name,
          email: user.email,
          phone: user.phone,
          amount: plan.price,
          planId: plan.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Create and submit PayU form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.payuBaseUrl + '/_payment';

        Object.keys(data.payuData).forEach((key) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = data.payuData[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        setError(data.message || 'Payment initiation failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl">Payment Details</CardTitle>
          <CardDescription>Complete your registration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-semibold">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-semibold text-sm">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-semibold">{user.phone || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan:</span>
              <span className="font-semibold">{plan.name}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-3 mt-2">
              <span>Amount:</span>
              <span>₹{plan.price}</span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ₹${plan.price}`
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            You will be redirected to PayU secure payment gateway
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
