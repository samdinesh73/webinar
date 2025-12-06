'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Play, Lock, Calendar, Clock, User, ExternalLink, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VideosPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [registeredClasses, setRegisteredClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
      return;
    }

    if (token && user) {
      checkPaymentStatus();
      fetchRegisteredClasses();
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

  const fetchRegisteredClasses = async () => {
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
        if (data.registrations && Array.isArray(data.registrations)) {
          // Get class IDs that user is registered for
          const registeredClassIds = data.registrations
            .map(r => r.classId)
            .filter(id => id !== null && id !== undefined)
            .map(id => Number(id));

          // Fetch all classes and filter for registered ones
          const classesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classes/upcoming`);
          const classesData = await classesResponse.json();
          
          if (classesData.success && Array.isArray(classesData.classes)) {
            const registered = classesData.classes.filter(c => 
              registeredClassIds.includes(Number(c.id))
            );
            setRegisteredClasses(registered);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching registered classes:', error);
    } finally {
      setClassesLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="inline-block h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-muted-foreground">Loading your videos...</p>
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
                  {!paymentStatus && 'You need to register for a class or purchase a plan to access the videos.'}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {paymentStatus !== 'success' && (
                  <>
                    <Link href="/classes">
                      <Button className="w-full">
                        Register for a Class
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="outline" className="w-full">
                        Purchase a Plan
                      </Button>
                    </Link>
                  </>
                )}
                <Link href="/">
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

  // Videos content for paid users
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Your Registered Masterclasses</h1>
            <p className="text-muted-foreground text-lg">
              Welcome, {user?.name}! Access your registered classes and join the live sessions.
            </p>
          </div>

          <Alert className="mb-8 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your registration is confirmed. You have access to all your registered classes.
            </AlertDescription>
          </Alert>

          {classesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : registeredClasses.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg mb-4">You haven't registered for any classes yet.</p>
                <Link href="/classes">
                  <Button>
                    Register for a Class
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
              {registeredClasses.map((classItem) => (
                <Card key={classItem.id} className="overflow-hidden hover:shadow-lg transition-all">
                  {/* Header with gradient */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{classItem.title}</h3>
                    <p className="text-blue-100">{classItem.description}</p>
                  </div>

                  <CardContent className="pt-6">
                    {/* Class Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Instructor */}
                      <div className="flex gap-3">
                        <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Instructor</p>
                          <p className="font-semibold">{classItem.instructor}</p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-semibold">{formatDate(classItem.class_date)}</p>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Time (IST)</p>
                          <p className="font-semibold">{formatTime(classItem.class_time)}</p>
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="flex gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="font-semibold">{classItem.duration_minutes} minutes</p>
                        </div>
                      </div>
                    </div>

                    {/* Meeting Link Button */}
                    {classItem.meeting_link ? (
                      <a 
                        href={classItem.meeting_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        <Button className="w-full gap-2" size="lg">
                          <Play className="h-5 w-5" />
                          Join Live Class
                          <ExternalLink className="h-4 w-4 ml-auto" />
                        </Button>
                      </a>
                    ) : (
                      <Button className="w-full gap-2" size="lg" disabled>
                        <Play className="h-5 w-5" />
                        Meeting Link Not Available
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* View More Classes */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">Want to register for more classes?</p>
            <Link href="/classes">
              <Button variant="outline" size="lg">
                Browse All Classes
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
