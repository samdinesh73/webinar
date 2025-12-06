'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus, Edit2, Trash2, Loader2, Lock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    class_date: '',
    class_time: '',
    duration_minutes: '60',
    price: '999',
    plan_id: 'pro',
    meeting_link: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { token, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Check if user is admin
  useEffect(() => {
    if (!authLoading) {
      if (!token) {
        router.push('/login');
        return;
      }
      
      if (user?.role !== 'admin') {
        router.push('/');
        return;
      }
    }
  }, [token, user, authLoading, router]);

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      return;
    }
    fetchClasses();
  }, [token, user]);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setClasses(data.classes);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch classes');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/classes/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/classes`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({
          title: '',
          description: '',
          instructor: '',
          class_date: '',
          class_time: '',
          duration_minutes: '60',
          plan_id: 'pro',
          meeting_link: '',
        });
        setEditingId(null);
        setShowForm(false);
        await fetchClasses();
      } else {
        setError(data.message || 'Failed to save class');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        await fetchClasses();
      } else {
        setError('Failed to delete class');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (classItem) => {
    setFormData({
      title: classItem.title,
      description: classItem.description || '',
      instructor: classItem.instructor,
      class_date: classItem.class_date,
      class_time: classItem.class_time,
      duration_minutes: classItem.duration_minutes || '60',
      price: classItem.price || '999',
      plan_id: classItem.plan_id || 'pro',
      meeting_link: classItem.meeting_link || '',
    });
    setEditingId(classItem.id);
    setShowForm(true);
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  // Check if user has admin role
  if (!user || user?.role !== 'admin') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-2 text-center">
              <div className="flex justify-center mb-4">
                <Lock className="w-16 h-16 text-red-600" />
              </div>
              <CardTitle className="text-3xl">Access Denied</CardTitle>
              <CardDescription>Admin access required</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You don't have permission to access this page. Only administrators can manage classes.
                </AlertDescription>
              </Alert>
              <div className="flex flex-col gap-3">
                <Button onClick={() => router.push('/')} className="w-full">
                  Back to Home
                </Button>
                <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold">Manage Classes</h1>
              <p className="text-muted-foreground mt-2">Create and manage upcoming masterclasses</p>
            </div>
            <Button
              onClick={() => {
                setFormData({
                  title: '',
                  description: '',
                  instructor: '',
                  class_date: '',
                  class_time: '',
                  duration_minutes: '60',
                  price: '999',
                  plan_id: 'pro',
                  meeting_link: '',
                });
                setEditingId(null);
                setShowForm(!showForm);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Class
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form Card */}
          {showForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{editingId ? 'Edit Class' : 'Add New Class'}</CardTitle>
                <CardDescription>
                  {editingId ? 'Update class details' : 'Create a new masterclass'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title">Class Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., E-commerce Growth Hacking"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    {/* Instructor */}
                    <div className="space-y-2">
                      <Label htmlFor="instructor">Instructor *</Label>
                      <Input
                        id="instructor"
                        placeholder="e.g., Amitabh Kumar"
                        value={formData.instructor}
                        onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                        required
                      />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                      <Label htmlFor="class_date">Class Date *</Label>
                      <Input
                        id="class_date"
                        type="date"
                        value={formData.class_date}
                        onChange={(e) => setFormData({ ...formData, class_date: e.target.value })}
                        required
                      />
                    </div>

                    {/* Time */}
                    <div className="space-y-2">
                      <Label htmlFor="class_time">Class Time *</Label>
                      <Input
                        id="class_time"
                        type="time"
                        value={formData.class_time}
                        onChange={(e) => setFormData({ ...formData, class_time: e.target.value })}
                        required
                      />
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                      <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                      <Input
                        id="duration_minutes"
                        type="number"
                        placeholder="60"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                      />
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="999"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>

                    {/* Plan */}
                    <div className="space-y-2">
                      <Label htmlFor="plan_id">Available for Plan *</Label>
                      <Select value={formData.plan_id} onValueChange={(value) => setFormData({ ...formData, plan_id: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="all">All Plans</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      placeholder="Class description..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      rows="4"
                    />
                  </div>

                  {/* Meeting Link */}
                  <div className="space-y-2">
                    <Label htmlFor="meeting_link">Meeting Link (Zoom/Google Meet)</Label>
                    <Input
                      id="meeting_link"
                      placeholder="https://zoom.us/..."
                      value={formData.meeting_link}
                      onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        editingId ? 'Update Class' : 'Create Class'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Classes List */}
          <div className="grid gap-4">
            {classes.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No classes found. Create your first class to get started.
                </CardContent>
              </Card>
            ) : (
              classes.map((classItem) => (
                <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">{classItem.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{classItem.description}</p>
                        <div className="flex gap-6 mt-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Instructor:</span>
                            <p className="font-semibold">{classItem.instructor}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date & Time:</span>
                            <p className="font-semibold">{classItem.class_date} at {classItem.class_time}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <p className="font-semibold">{classItem.duration_minutes} min</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Price:</span>
                            <p className="font-semibold">₹{classItem.price}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Plan:</span>
                            <p className="font-semibold capitalize">{classItem.plan_id}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(classItem)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(classItem.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
