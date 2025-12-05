'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Speakers() {
  const speakers = [
    {
      name: 'Sarah Anderson',
      title: 'Lead Seller Growth at Flipkart',
      bio: 'Growth expert helping sellers scale to 7+ figures.',
      image: '👩‍💼',
      topic: 'Seller Growth Hacks',
    },
    {
      name: 'Michael Chen',
      title: 'Flipkart Marketplace Director',
      bio: 'Expert in marketplace optimization and product strategy.',
      image: '👨‍💻',
      topic: 'Product Optimization',
    },
    {
      name: 'Emma Rodriguez',
      title: 'Marketing Lead at Flipkart',
      bio: 'Specialist in seller marketing and brand building.',
      image: '👩‍🔬',
      topic: 'Marketing & Branding',
    },
    {
      name: 'James Wilson',
      title: 'Operations Expert',
      bio: 'Logistics and fulfillment specialist.',
      image: '👨‍💼',
      topic: 'Logistics & Fulfillment',
    },
  ];

  return (
    <section id="speakers" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Meet Our Expert Speakers
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn from Flipkart's finest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {speakers.map((speaker, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow text-center">
              <CardHeader>
                <div className="text-6xl mb-4 flex justify-center">{speaker.image}</div>
                <CardTitle>{speaker.name}</CardTitle>
                <CardDescription className="text-primary font-semibold">
                  {speaker.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{speaker.bio}</p>
                <Badge variant="secondary">{speaker.topic}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
