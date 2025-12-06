'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, User, Link as LinkIcon, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/app/context/AuthContext';

export default function UpcomingClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registeredClasses, setRegisteredClasses] = useState([]);
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchClasses();
    if (token) {
      fetchRegisteredClasses();
    }
  }, [token]);

  // Refetch registered classes when page regains focus
  useEffect(() => {
    const handleFocus = () => {
      if (token) {
        console.log('Page regained focus, refetching registered classes');
        fetchRegisteredClasses();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [token]);

  const fetchRegisteredClasses = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/check-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log('Payment check-status response:', data);
      
      if (data.registrations && Array.isArray(data.registrations)) {
        // Convert classIds to numbers to ensure proper comparison
        const registeredIds = data.registrations
          .map(r => r.classId)
          .filter(id => id !== null && id !== undefined)
          .map(id => Number(id));
        console.log('Final registered classes after conversion:', registeredIds);
        setRegisteredClasses(registeredIds);
      } else {
        console.log('No registrations found or registrations is not an array');
        setRegisteredClasses([]);
      }
    } catch (err) {
      console.error('Error fetching registered classes:', err);
      setRegisteredClasses([]);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classes/upcoming`);
      const data = await response.json();
      if (data.success) {
        console.log('Fetched classes:', data.classes.map(c => ({ id: c.id, title: c.title })));
        setClasses(data.classes);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch classes');
      setLoading(false);
    }
  };

  const handleRegisterForClass = (classId) => {
    if (!token) {
      router.push('/login?redirect=/classes');
      return;
    }
    router.push(`/register?classId=${classId}`);
  };

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

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading classes...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Upcoming Masterclasses</h1>
            <p className="text-muted-foreground">
              Join live sessions with industry experts to level up your skills
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Classes Grid */}
          {classes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground text-lg">No upcoming classes scheduled yet.</p>
                <p className="text-muted-foreground mt-2">Check back soon for exciting masterclasses!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
              {classes.map((classItem, index) => {
                const isUserEligible = 
                  classItem.plan_id === 'all' || 
                  !user || 
                  user.plan === classItem.plan_id;

                return (
                  <Card 
                    key={classItem.id} 
                    className={`overflow-hidden hover:shadow-lg transition-all ${
                      !isUserEligible ? 'opacity-75' : ''
                    }`}
                  >
                    {/* Card Header with gradient background */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                      <h3 className="text-2xl font-bold mb-2">{classItem.title}</h3>
                      <p className="text-purple-100">{classItem.description}</p>
                    </div>

                    <CardContent className="pt-6">
                      {/* Class Details Grid */}
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

                      {/* Plan Info */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Available for:</span> {' '}
                          {classItem.plan_id === 'all' ? 'All Plans' : `${classItem.plan_id.charAt(0).toUpperCase() + classItem.plan_id.slice(1)} Plan & Above`}
                        </p>
                      </div>

                      {/* Meeting Link Button */}
                      {classItem.meeting_link && (
                        <a 
                          href={classItem.meeting_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <Button className="w-full gap-2 mb-4">
                            <LinkIcon className="h-4 w-4" />
                            Join Meeting
                          </Button>
                        </a>
                      )}

                      {/* Registration Status and Button */}
                      <div className="mb-4">
                        {(() => {
                          const isRegistered = registeredClasses.includes(Number(classItem.id));
                          console.log(`Class ${classItem.id} (${classItem.title}): registeredClasses=${JSON.stringify(registeredClasses)}, isRegistered=${isRegistered}`);
                          return isRegistered ? (
                            <Alert className="bg-green-50 border-green-200">
                              <AlertCircle className="h-4 w-4 text-green-600" />
                              <AlertDescription className="text-green-900">
                                ✓ You are registered for this class
                              </AlertDescription>
                            </Alert>
                          ) : (
                            <Button 
                              onClick={() => handleRegisterForClass(classItem.id)}
                              className="w-full"
                              variant="outline"
                            >
                              Register for This Class
                            </Button>
                          );
                        })()}
                      </div>

                      {/* Eligibility Status */}
                      {!isUserEligible && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Upgrade your plan to access this class
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
