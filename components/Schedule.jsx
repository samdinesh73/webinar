'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Schedule() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classes/upcoming`);
      const data = await response.json();
      
      if (data.success && data.classes) {
        // Transform database classes to event format
        const transformedEvents = data.classes.map((classItem, index) => {
          const classDate = new Date(classItem.class_date);
          const formattedDate = classDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
          
          const [hours, minutes] = classItem.class_time.split(':');
          const endHours = parseInt(hours) + Math.floor((classItem.duration_minutes + parseInt(minutes)) / 60);
          const endMinutes = (parseInt(minutes) + classItem.duration_minutes) % 60;
          const formattedTime = `${hours}:${minutes} - ${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')} IST`;

          return {
            id: classItem.id,
            date: `${formattedDate}, 2025`,
            time: formattedTime,
            title: classItem.title,
            speaker: classItem.instructor,
            level: classItem.plan_id === 'pro' ? 'Advanced' : classItem.plan_id === 'basic' ? 'Intermediate' : 'Beginner',
            attendees: '100+',
            description: classItem.description,
            duration_minutes: classItem.duration_minutes,
            plan_id: classItem.plan_id,
          };
        });
        setEvents(transformedEvents);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setLoading(false);
    }
  };

  const getLevelVariant = (level) => {
    switch (level) {
      case 'Beginner':
        return 'default';
      case 'Intermediate':
        return 'secondary';
      case 'Advanced':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <section id="schedule" className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Upcoming Masterclasses
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Mark your calendar for our expert-led sessions.
            </p>
          </div>
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="schedule" className="py-16 md:py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Upcoming Masterclasses
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Mark your calendar for our expert-led sessions.
          </p>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-8">
              <p className="text-muted-foreground">No upcoming classes scheduled yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        DATE & TIME
                      </div>
                      <p className="font-semibold text-foreground">{event.date}</p>
                      <p className="text-sm text-muted-foreground">{event.time}</p>
                    </div>

                    <div className="md:col-span-2">
                      <div className="text-xs text-muted-foreground mb-1">MASTERCLASS</div>
                      <p className="font-semibold text-foreground mb-1">{event.title}</p>
                      <p className="text-sm text-muted-foreground">Speaker: {event.speaker}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Badge variant={getLevelVariant(event.level)}>
                        {event.level}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {event.attendees} registered
                      </div>
                    </div>

                    <div>
                      <Button className="w-full" onClick={() => window.location.href = `/register?classId=${event.id}`}>
                        Register
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
