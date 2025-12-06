'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { 
  Play, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  BookOpen,
  Trophy,
  Clock,
  Users
} from 'lucide-react';

export default function Dashboard() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [registeredClasses, setRegisteredClasses] = useState([]);

  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
    }
  }, [token, loading, router]);

  // Fetch payment status
  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        if (token) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/check-status`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const data = await res.json();
          setPaymentStatus(data);
          
          // Extract registered classes
          if (data.registrations) {
            const registeredIds = data.registrations
              .map(r => r.classId)
              .filter(id => id !== null && id !== undefined)
              .map(id => Number(id));
            setRegisteredClasses(registeredIds);
          }
        }
      } catch (error) {
        console.error('Error fetching payment status:', error);
      } finally {
        setStatusLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [token]);

  // Fetch upcoming classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classes/upcoming`);
        const data = await res.json();
        if (data.success) {
          setUpcomingClasses(data.classes.slice(0, 3)); // Get top 3 upcoming classes
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setClassesLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const hasPayment = paymentStatus?.status === 'success';
  const memberSince = new Date(user.created_at);
  const memberMonths = Math.floor((new Date() - memberSince) / (1000 * 60 * 60 * 24 * 30));

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
              <p className="text-muted-foreground mt-2">Manage your account and access your masterclasses</p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="lg">
              Logout
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-900">{user.name}</p>
                <p className="text-xs text-blue-700 mt-1">Account Owner</p>
              </CardContent>
            </Card>

            {/* Member Since Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-purple-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-purple-900">{memberMonths}+</p>
                <p className="text-xs text-purple-700 mt-1">months active</p>
              </CardContent>
            </Card>

            {/* Payment Status Card */}
            <Card className={`bg-gradient-to-br ${hasPayment ? 'from-green-50 to-green-100 border-green-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-sm font-medium flex items-center gap-2 ${hasPayment ? 'text-green-900' : 'text-orange-900'}`}>
                  {hasPayment ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Payment
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Payment
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={hasPayment ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}>
                  {paymentStatus?.status?.toUpperCase() || 'PENDING'}
                </Badge>
                <p className={`text-xs mt-2 ${hasPayment ? 'text-green-700' : 'text-orange-700'}`}>
                  {hasPayment ? 'Verified' : 'Not verified'}
                </p>
              </CardContent>
            </Card>

            {/* Access Card */}
            <Card className={`bg-gradient-to-br ${hasPayment ? 'from-cyan-50 to-cyan-100 border-cyan-200' : 'from-gray-50 to-gray-100 border-gray-200'}`}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-sm font-medium flex items-center gap-2 ${hasPayment ? 'text-cyan-900' : 'text-gray-900'}`}>
                  <Zap className="w-4 h-4" />
                  Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${hasPayment ? 'text-cyan-900' : 'text-gray-900'}`}>
                  {hasPayment ? '✓' : '✗'}
                </p>
                <p className={`text-xs mt-1 ${hasPayment ? 'text-cyan-700' : 'text-gray-700'}`}>
                  {hasPayment ? 'Full access' : 'Limited access'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>View and manage your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Name */}
                  <div>
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-primary" />
                      Full Name
                    </label>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{user.name}</p>
                  </div>

                  <Separator />

                  {/* Email */}
                  <div>
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-primary" />
                      Email Address
                    </label>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg break-all">{user.email}</p>
                  </div>

                  <Separator />

                  {/* Phone */}
                  <div>
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-primary" />
                      Phone Number
                    </label>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {user.phone ? `+91 ${user.phone}` : 'Not provided'}
                    </p>
                  </div>

                  <Separator />

                  {/* Member Since */}
                  <div>
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Member Since
                    </label>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {memberSince.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>

                  <Separator className="my-6" />

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <Button className="w-full" size="lg">
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="w-full" size="lg">
                      Change Password
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              
              {/* Payment Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Payment Status
                  </CardTitle>
                  <CardDescription>Your subscription details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`p-4 rounded-lg border-2 ${hasPayment ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {hasPayment ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-orange-600" />
                      )}
                      <span className={`font-semibold ${hasPayment ? 'text-green-900' : 'text-orange-900'}`}>
                        {hasPayment ? 'Payment Verified' : 'No Active Payment'}
                      </span>
                    </div>
                    <p className={`text-sm ${hasPayment ? 'text-green-700' : 'text-orange-700'}`}>
                      {hasPayment 
                        ? 'You have full access to all masterclasses' 
                        : 'Register for a plan to access masterclasses'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Access your masterclasses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/videos" className="block">
                    <Button className="w-full" size="lg">
                      <Play className="w-4 h-4 mr-2" />
                      View Masterclasses
                    </Button>
                  </Link>
                  
                  {!hasPayment && (
                    <Link href="/register" className="block">
                      <Button variant="outline" className="w-full" size="lg">
                        <Zap className="w-4 h-4 mr-2" />
                        Upgrade Plan
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>

            </div>

          </div>

          {/* Upcoming Classes Section */}
          <div className="mt-12 pt-8 border-t">
            
            {/* Registered Classes */}
            {registeredClasses.length > 0 && (
              <div className="mb-12">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      Your Registered Classes
                    </h2>
                    <p className="text-muted-foreground mt-1">Classes you've successfully registered for</p>
                  </div>
                </div>

                {classesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {upcomingClasses
                      .filter(c => registeredClasses.includes(Number(c.id)))
                      .map((classItem) => (
                        <Card key={classItem.id} className="overflow-hidden hover:shadow-lg transition-all border-green-200 bg-green-50">
                          {/* Header with gradient */}
                          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white">
                            <h3 className="font-semibold text-lg line-clamp-2">{classItem.title}</h3>
                          </div>

                          <CardContent className="pt-4">
                            <div className="space-y-3 text-sm mb-4">
                              {/* Instructor */}
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="w-4 h-4 flex-shrink-0" />
                                <span>{classItem.instructor}</span>
                              </div>

                              {/* Date */}
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span>{new Date(classItem.class_date).toLocaleDateString()}</span>
                              </div>

                              {/* Time */}
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span>{classItem.class_time}</span>
                              </div>

                              {/* Duration */}
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Trophy className="w-4 h-4 flex-shrink-0" />
                                <span>{classItem.duration_minutes} mins</span>
                              </div>
                            </div>

                            {/* Join Button */}
                            {classItem.meeting_link && (
                              <a 
                                href={classItem.meeting_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <Button className="w-full" size="sm">Join Meeting</Button>
                              </a>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* All Upcoming Classes */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Upcoming Masterclasses
                </h2>
                <p className="text-muted-foreground mt-1">Don't miss these upcoming sessions</p>
              </div>
              <Link href="/classes">
                <Button variant="outline">View All Classes</Button>
              </Link>
            </div>

            {classesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : upcomingClasses.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-8">
                  <p className="text-muted-foreground">No upcoming classes scheduled yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingClasses
                  .filter(c => !registeredClasses.includes(Number(c.id)))
                  .map((classItem) => (
                    <Card key={classItem.id} className="overflow-hidden hover:shadow-lg transition-all">
                      {/* Header with gradient */}
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 text-white">
                        <h3 className="font-semibold text-lg line-clamp-2">{classItem.title}</h3>
                      </div>

                      <CardContent className="pt-4">
                        <div className="space-y-3 text-sm mb-4">
                          {/* Instructor */}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4 flex-shrink-0" />
                            <span>{classItem.instructor}</span>
                          </div>

                          {/* Date */}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>{new Date(classItem.class_date).toLocaleDateString()}</span>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span>{classItem.class_time}</span>
                          </div>

                          {/* Duration */}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Trophy className="w-4 h-4 flex-shrink-0" />
                            <span>{classItem.duration_minutes} mins</span>
                          </div>
                        </div>

                        {/* Register Button */}
                        <Link href={`/register?classId=${classItem.id}`} className="block">
                          <Button className="w-full" size="sm" variant="outline">Register for Class</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
