'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Get started with basic access',
      features: [
        'Access to 1 masterclass per month',
        'Community access',
        'Basic resources',
        'Email support',
      ],
      popular: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'Perfect for active sellers',
      features: [
        'Unlimited masterclass access',
        'Priority Q&A',
        'Premium seller resources',
        'Email & chat support',
        'Certificates',
        'Networking events',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For teams and organizations',
      features: [
        'Team licenses (10+)',
        'Custom training paths',
        'Dedicated account manager',
        'Analytics & reporting',
        'On-demand sessions',
        'Custom integrations',
      ],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works best for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative transition-all ${
                plan.popular ? 'md:scale-105 shadow-lg border-primary' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
