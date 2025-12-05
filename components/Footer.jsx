'use client';

import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-foreground mb-4">About Flipkart Masterclass</h3>
            <p className="text-sm text-muted-foreground">
              Premium masterclass platform for sellers to learn from industry experts.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#schedule" className="text-muted-foreground hover:text-foreground transition">
                  Events
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                Twitter
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                LinkedIn
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition">
                Facebook
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; 2025 Flipkart Masterclass. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0 text-sm">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition">
              Terms of Service
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition">
              Privacy Policy
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
