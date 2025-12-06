'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Play, Lock, Clapperboard, Package, TrendingUp, Users, Megaphone, BarChart3, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function VideosPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
      return;
    }

    if (token && user) {
      checkPaymentStatus();
    }
  }, [token, user, loading, router]);

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/check-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentStatus(data.status);
        setHasAccess(data.status === 'success');
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!hasAccess) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-2">
              <div className="flex justify-center mb-4">
                <Lock className="w-16 h-16 text-red-600" />
              </div>
              <CardTitle className="text-3xl text-center">Access Denied</CardTitle>
              <CardDescription className="text-center">
                This content is only for paid users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {paymentStatus === 'pending' && 'Your payment is pending. Please wait for confirmation.'}
                  {paymentStatus === 'failed' && 'Your payment failed. Please try again.'}
                  {!paymentStatus && 'You need to purchase a plan to access the videos.'}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {paymentStatus !== 'success' && (
                  <Link href="/register">
                    <Button className="w-full">
                      Purchase a Plan
                    </Button>
                  </Link>
                )}
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

  // Videos content for paid users
  const getVideoIcon = (id) => {
    const iconProps = { className: 'w-12 h-12' };
    switch(id) {
      case 1: return <Clapperboard {...iconProps} />;
      case 2: return <Package {...iconProps} />;
      case 3: return <TrendingUp {...iconProps} />;
      case 4: return <Users {...iconProps} />;
      case 5: return <Megaphone {...iconProps} />;
      case 6: return <BarChart3 {...iconProps} />;
      default: return <Play {...iconProps} />;
    }
  };

  const videos = [
    {
      id: 1,
      title: 'Getting Started with Flipkart Masterclass',
      description: 'Learn the basics and get started with your seller journey on Flipkart.',
      duration: '12:45',
    },
    {
      id: 2,
      title: 'Product Listing Best Practices',
      description: 'Master the art of creating high-converting product listings.',
      duration: '18:30',
    },
    {
      id: 3,
      title: 'Optimizing Your Store for Growth',
      description: 'Strategies to increase visibility and sales on Flipkart.',
      duration: '22:15',
    },
    {
      id: 4,
      title: 'Customer Service Excellence',
      description: 'Build trust and loyalty through excellent customer service.',
      duration: '15:20',
    },
    {
      id: 5,
      title: 'Marketing and Promotions',
      description: 'Leverage promotional tools to boost your sales.',
      duration: '20:10',
    },
    {
      id: 6,
      title: 'Advanced Analytics and Metrics',
      description: 'Understand data to make better business decisions.',
      duration: '25:45',
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Exclusive Video Content</h1>
            <p className="text-muted-foreground text-lg">
              Welcome, {user?.name}! Access all masterclass videos.
            </p>
          </div>

          <Alert className="mb-8 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your payment is confirmed. You have access to all premium content.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className=" h-40 flex items-center justify-center text-4xl text-black">
                  {getVideoIcon(video.id)}
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{video.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {video.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Duration: {video.duration}</span>
                  </div>
                  <Button className="w-full" variant="default">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Video
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
