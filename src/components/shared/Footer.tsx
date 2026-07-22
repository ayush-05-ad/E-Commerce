"use client";

import Link from "next/link";
import { Mail } from "lucide-react";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export function Footer() {
  return (
    <footer className="bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-bold text-xl tracking-tight mb-4">
              NXT<span className="text-neutral-500">STORE</span>
            </h3>
            <p className="text-neutral-500 text-sm max-w-sm">
              Your premium destination for the best products. Built for speed, scaled for the enterprise.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-neutral-500">
              <li><Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Best Sellers</Link></li>
              <li><Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Sale</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-neutral-500">
              <li><Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Refunds</Link></li>
            </ul>
          </div>
        </div>


        {/* Copyright */}
        <div className="text-center text-xs text-neutral-400 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          &copy; {new Date().getFullYear()} NXTSTORE. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
