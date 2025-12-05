'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users } from 'lucide-react';

export default function Schedule() {
  const events = [
    {
      date: 'Dec 10, 2025',
      time: '2:00 PM - 4:00 PM IST',
      title: 'Flipkart Seller Success Secrets',
      speaker: 'Sarah Anderson',
      level: 'Beginner',
      attendees: '324',
    },
    {
      date: 'Dec 15, 2025',
      time: '3:00 PM - 5:00 PM IST',
      title: 'Product Optimization Mastery',
      speaker: 'Michael Chen',
      level: 'Intermediate',
      attendees: '412',
    },
    {
      date: 'Dec 20, 2025',
      time: '1:00 PM - 3:00 PM IST',
      title: 'Advanced Marketing Strategies',
      speaker: 'Emma Rodriguez',
      level: 'Advanced',
      attendees: '198',
    },
    {
      date: 'Dec 28, 2025',
      time: '2:00 PM - 4:00 PM IST',
      title: 'Logistics & Fulfillment Excellence',
      speaker: 'James Wilson',
      level: 'Intermediate',
      attendees: '287',
    },
  ];

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

        <div className="space-y-4">
          {events.map((event, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
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
                    <Button className="w-full" onClick={() => window.location.href = '/register'}>
                      Register
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
