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
  Trophy
} from 'lucide-react';

export default function Dashboard() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

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
        }
      } catch (error) {
        console.error('Error fetching payment status:', error);
      } finally {
        setStatusLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [token]);

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

        </div>
      </div>
      <Footer />
    </>
  );
}
