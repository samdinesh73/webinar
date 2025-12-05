'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Webinar() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-4xl">Welcome to Our Webinar</CardTitle>
            <CardDescription className="text-blue-100">
              Learn from industry experts and expand your knowledge
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-xl font-semibold text-blue-900 mb-3">📅 Schedule</h3>
                  <p className="text-gray-700">
                    Date: December 15, 2025
                    <br />
                    Time: 2:00 PM - 4:00 PM EST
                  </p>
                </div>
                <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                  <h3 className="text-xl font-semibold text-indigo-900 mb-3">👥 Speakers</h3>
                  <p className="text-gray-700">
                    Expert professionals from leading tech companies
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">📝 Topics Covered</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Introduction to modern web development</li>
                  <li>Best practices in UI/UX design</li>
                  <li>Performance optimization techniques</li>
                  <li>Q&A session with experts</li>
                </ul>
              </div>

              <div className="flex gap-4 justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-2 text-white">
                  Register Now
                </Button>
                <Button variant="outline" className="px-8 py-2">
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
