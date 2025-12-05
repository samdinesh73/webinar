'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: CheckCircle2,
      title: 'Expert Instructors',
      description: 'Learn directly from industry professionals with 10+ years of experience.',
    },
    {
      icon: CheckCircle2,
      title: 'Live & Recorded',
      description: 'Join live sessions or watch recorded content at your own pace.',
    },
    {
      icon: CheckCircle2,
      title: 'Certificates',
      description: 'Get recognized certificates upon completion of each masterclass.',
    },
    {
      icon: CheckCircle2,
      title: 'Q&A Sessions',
      description: 'Direct interaction with speakers during dedicated Q&A periods.',
    },
    {
      icon: CheckCircle2,
      title: 'Global Community',
      description: 'Network with sellers from around the world.',
    },
    {
      icon: CheckCircle2,
      title: 'Resource Materials',
      description: 'Access course materials, slide decks, and seller resources.',
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Join Our Masterclass?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We provide everything you need to grow your Flipkart business successfully.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Icon className="w-8 h-8 text-primary mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
