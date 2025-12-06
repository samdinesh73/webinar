'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user } = useAuth();

  const classIdParam = searchParams.get('classId');

  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [registrationMode, setRegistrationMode] = useState('plan');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [checking, setChecking] = useState(true);

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

  // Fetch classes if classId is provided
  useEffect(() => {
    if (classIdParam) {
      fetchClasses();
    }
  }, [classIdParam]);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classes/upcoming`);
      const data = await response.json();
      console.log('Fetched classes in register page:', data.classes);
      if (data.success) {
        setClasses(data.classes);
        if (classIdParam) {
          const parsedClassId = parseInt(classIdParam);
          console.log('Looking for classId:', parsedClassId, 'type:', typeof parsedClassId);
          const classItem = data.classes.find(c => {
            console.log(`Comparing: ${c.id} (${typeof c.id}) === ${parsedClassId} (${typeof parsedClassId})`);
            return Number(c.id) === parsedClassId;
          });
          if (classItem) {
            console.log('Found class:', classItem.title);
            setSelectedClass(parsedClassId);
            setClasses(data.classes); // Make sure classes are set so PaymentForm can find the class
            setRegistrationMode('class');
            // Don't set step here - let the check below handle it
          } else {
            console.log('Class not found!');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  // Check if user has already purchased
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!token) {
        setChecking(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/check-status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setPaymentStatus(data);
        setChecking(false);
      } catch (error) {
        console.error('Error checking payment status:', error);
        setChecking(false);
      }
    };

    checkPaymentStatus();
  }, [token]);

  // If user already registered (status = success), show already registered message
  if (checking) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  // If user already registered for this specific class, show message
  if (!checking && classIdParam && paymentStatus?.registrations) {
    const isRegisteredForClass = paymentStatus.registrations.some(
      r => Number(r.classId) === Number(classIdParam)
    );
    
    if (isRegisteredForClass) {
      // Find the class name
      const classItem = classes.find(c => Number(c.id) === Number(classIdParam));
      return (
        <>
          <Header />
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="space-y-2 text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="w-16 h-16 text-green-600" />
                </div>
                <CardTitle className="text-3xl">Already Registered!</CardTitle>
                <CardDescription>You have already registered for this class</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900">
                    You are registered for: <strong>{classItem?.title}</strong>
                  </p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Link href="/classes" className="w-full">
                    <Button className="w-full">
                      View All Classes
                    </Button>
                  </Link>
                  <Link href="/dashboard" className="w-full">
                    <Button variant="outline" className="w-full">
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link href="/" className="w-full">
                    <Button variant="ghost" className="w-full">
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
    } else if (selectedClass && registrationMode === 'class') {
      // User is not registered for this class, show payment form directly
      const classItem = classes.find(c => Number(c.id) === Number(selectedClass));
      return (
        <>
          <Header />
          <PaymentForm 
            user={user} 
            plan={null}
            selectedClass={selectedClass}
            classes={classes}
            registrationMode="class"
          />
          <Footer />
        </>
      );
    }
  }

  if (paymentStatus?.status === 'success') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-2 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
              <CardTitle className="text-3xl">Already Registered!</CardTitle>
              <CardDescription>You have already purchased a plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-900">
                  You have successfully registered for our masterclasses. Access all your content and start learning!
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <Link href="/videos" className="w-full">
                  <Button className="w-full">
                    View Videos & Classes
                  </Button>
                </Link>
                <Link href="/dashboard" className="w-full">
                  <Button variant="outline" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/" className="w-full">
                  <Button variant="ghost" className="w-full">
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

  // Step 2: Select Plan or Class
  if (step === 1) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl">Choose Registration Type</CardTitle>
            <CardDescription>Select how you want to register</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Registration Mode Selector */}
            <div className="space-y-3">
              <div
                onClick={() => {
                  setRegistrationMode('plan');
                  setSelectedClass(null);
                }}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  registrationMode === 'plan'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <h3 className="font-semibold text-lg mb-1">Register for a Plan</h3>
                <p className="text-sm text-muted-foreground">Get access to multiple masterclasses based on your plan level</p>
              </div>

              <div
                onClick={() => {
                  setRegistrationMode('class');
                  setSelectedPlan(null);
                }}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  registrationMode === 'class'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <h3 className="font-semibold text-lg mb-1">Register for a Specific Class</h3>
                <p className="text-sm text-muted-foreground">Register for individual masterclasses</p>
              </div>
            </div>

            {/* Plan Selection */}
            {registrationMode === 'plan' && (
              <div className="space-y-3 border-t pt-6">
                <h3 className="font-semibold">Select Your Plan</h3>
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
            )}

            {/* Class Selection */}
            {registrationMode === 'class' && (
              <div className="space-y-3 border-t pt-6">
                <h3 className="font-semibold">Select a Class</h3>
                {classes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No upcoming classes available</p>
                ) : (
                  classes.map((classItem) => (
                    <div
                      key={classItem.id}
                      onClick={() => setSelectedClass(classItem.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedClass === classItem.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{classItem.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{classItem.description}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>📅 {new Date(classItem.class_date).toLocaleDateString()}</span>
                            <span>🕐 {classItem.class_time}</span>
                            <span>👨‍🏫 {classItem.instructor}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

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
                  if (registrationMode === 'plan' && !selectedPlan) {
                    setError('Please select a plan');
                    return;
                  }
                  if (registrationMode === 'class' && !selectedClass) {
                    setError('Please select a class');
                    return;
                  }
                  setError('');
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
        <PaymentForm 
          user={user} 
          plan={selectedPlan ? plans.find(p => p.id === selectedPlan) : null}
          selectedClass={selectedClass}
          classes={classes}
          registrationMode={registrationMode}
        />
        <Footer />
      </>
    );
  }
}

function PaymentForm({ user, plan, selectedClass, classes, registrationMode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const classItem = selectedClass ? classes.find(c => c.id === selectedClass) : null;
  const amount = registrationMode === 'plan' ? plan.price : (classItem?.price || 999); // Use class price from database
  const title = registrationMode === 'plan' ? `${plan.name} Plan` : `${classItem?.title}`;

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        firstname: user.name,
        email: user.email,
        phone: user.phone,
        amount: amount,
      };

      // Add planId or classId based on registration mode
      if (registrationMode === 'plan') {
        payload.planId = plan.id;
      } else {
        payload.classId = selectedClass;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log('=== Payment Initiate Response ===');
      console.log('txnid:', data.payuData?.txnid);
      console.log('Full PayU data:', data.payuData);
      console.log('Success URL (surl):', data.payuData?.surl);

      if (data.success) {
        // IMPORTANT: Store txnid in localStorage so we can retrieve it after redirect
        localStorage.setItem('pending_txnid', data.payuData.txnid);
        console.log('✓ Stored pending txnid in localStorage:', data.payuData.txnid);

        // Create and submit PayU form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.payuBaseUrl + '/_payment';

        console.log('Submitting form to:', form.action);

        Object.keys(data.payuData).forEach((key) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = data.payuData[key];
          form.appendChild(input);
          console.log(`Form field: ${key} = ${data.payuData[key].substring(0, 50)}...`);
        });

        document.body.appendChild(form);
        console.log('Submitting form to PayU...');
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
              <span className="text-muted-foreground">
                {registrationMode === 'plan' ? 'Plan' : 'Class'}:
              </span>
              <span className="font-semibold">{title}</span>
            </div>

            {registrationMode === 'class' && classItem && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-semibold">{new Date(classItem.class_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-semibold">{classItem.class_time}</span>
                </div>
              </>
            )}

            <div className="flex justify-between text-lg font-bold border-t pt-3 mt-2">
              <span>Amount:</span>
              <span>₹{amount}</span>
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
              `Pay ₹${amount}`
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
