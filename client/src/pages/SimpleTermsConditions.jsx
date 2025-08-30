import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function SimpleTermsConditions() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-800 mb-6 font-medium transition-colors duration-200">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Terms & Conditions</h1>
          <div className="flex items-center mb-4">
            <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium mr-3">BrainMesh</div>
            <span className="text-gray-600">SSC Vocabulary Learning Platform</span>
          </div>
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
            <p className="text-green-800 font-medium">Effective Date: August 29, 2025</p>
          </div>
        </div>
      
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
          <p className="mb-2">By accessing and using BrainMesh, you accept and agree to be bound by the terms and provision of this agreement. BrainMesh is a specialized vocabulary learning platform designed for SSC (Staff Selection Commission) exam preparation.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Subscription Plans & Pricing</h2>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Available Subscription Plans:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>7 Days Trial:</strong> ₹19 - Perfect for testing our platform and features</li>
              <li><strong>3 Months Plan:</strong> ₹129 - Ideal for focused exam preparation</li>
              <li><strong>6 Months Plan:</strong> ₹199 - Best value for comprehensive learning</li>
              <li><strong>12 Months Plan:</strong> ₹329 - Complete mastery with maximum savings</li>
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">What's Included in All Plans:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access to 200+ carefully curated vocabulary words</li>
              <li>Comprehensive Synonyms and Antonyms database</li>
              <li>Extensive Idioms and Phrases (IPH) collection</li>
              <li>One Word Substitution (OWS) practice materials</li>
              <li>Interactive quizzes with instant feedback</li>
              <li>Progress tracking and performance analytics</li>
              <li>Word of the Day feature</li>
              <li>Practice queue for targeted learning</li>
              <li>Mobile-friendly responsive design</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">User Account & Responsibilities</h2>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Account Security:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>You are responsible for maintaining the confidentiality of your login credentials</li>
              <li>You must not share your account with others or allow unauthorized access</li>
              <li>You must notify us immediately of any suspected unauthorized use of your account</li>
              <li>Use strong, unique passwords and update them regularly</li>
              <li>You are responsible for all activities that occur under your account</li>
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Acceptable Use:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use BrainMesh solely for personal SSC exam preparation</li>
              <li>Do not attempt to copy, download, or redistribute our vocabulary content</li>
              <li>Respect other users and maintain appropriate conduct</li>
              <li>Do not attempt to reverse engineer or hack the platform</li>
              <li>Follow all applicable laws and regulations while using our service</li>
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Prohibited Activities:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Sharing or distributing BrainMesh content outside the platform</li>
              <li>Creating multiple accounts to abuse free trial offers</li>
              <li>Using automated tools, bots, or scripts to access the platform</li>
              <li>Attempting to breach security measures or access restricted areas</li>
              <li>Engaging in any activity that could harm or disrupt our services</li>
              <li>Violating intellectual property rights</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Payment Terms & Billing</h2>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Payment Processing:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>All payments are processed securely through trusted payment gateways</li>
              <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
              <li>Prices are subject to change with 30 days advance notice</li>
              <li>Failed payments may result in temporary suspension of access</li>
              <li>All prices are in Indian Rupees (INR) and include applicable taxes</li>
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Billing Cycle:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>You will be charged at the beginning of each billing period</li>
              <li>No partial refunds for unused portions of subscription periods</li>
              <li>You can cancel your subscription anytime before the next renewal</li>
              <li>Access continues until the end of your current billing period after cancellation</li>
              <li>Billing receipts are sent to your registered email address</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Content & Intellectual Property</h2>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Our Content:</h3>
            <p className="mb-2">All vocabulary lists, quizzes, explanations, and educational materials on BrainMesh are proprietary content owned by us. This includes:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Curated vocabulary words with definitions and examples</li>
              <li>Synonyms and antonyms databases</li>
              <li>Idioms and phrases collections</li>
              <li>One word substitution materials</li>
              <li>Quiz questions and explanations</li>
              <li>Progress tracking algorithms</li>
            </ul>
            <p className="mt-2">You may use this content for personal learning but cannot redistribute, sell, or commercialize it.</p>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Your Data:</h3>
            <p className="mb-2">You retain ownership of personal data you provide. We use it solely to provide and improve our services as outlined in our Privacy Policy. Your learning progress and quiz results are stored to enhance your experience.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Service Availability & Performance</h2>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Service Commitment:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>We strive to maintain 99.9% uptime for uninterrupted learning</li>
              <li>Scheduled maintenance will be announced in advance when possible</li>
              <li>Customer support available during business hours (9 AM - 6 PM IST)</li>
              <li>Regular updates to vocabulary content and platform features</li>
              <li>Mobile-responsive design for learning on any device</li>
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Service Limitations:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Internet connection required for full functionality</li>
              <li>Some features may be temporarily unavailable during updates</li>
              <li>Performance may vary based on device capabilities and network speed</li>
              <li>We reserve the right to modify features with reasonable notice</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Cancellation & Account Termination</h2>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">User-Initiated Cancellation:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>You can cancel your subscription anytime from your account settings</li>
              <li>Cancellation takes effect at the end of your current billing period</li>
              <li>You retain access to all features until your subscription expires</li>
              <li>No refunds for the current billing period unless eligible under our refund policy</li>
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Account Termination by BrainMesh:</h3>
            <p className="mb-2">We may suspend or terminate accounts for:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Violation of these terms and conditions</li>
              <li>Fraudulent or suspicious payment activity</li>
              <li>Abuse of platform features or content</li>
              <li>Repeated violations after warnings</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Disclaimers & Limitation of Liability</h2>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Educational Purpose:</h3>
            <p className="mb-2">BrainMesh is provided "as is" for educational purposes to assist with SSC exam preparation. We cannot guarantee specific exam results or outcomes from using our platform.</p>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Liability Limitations:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>We are not liable for exam performance, results, or career outcomes</li>
              <li>Maximum liability is limited to the amount paid for your subscription</li>
              <li>Users are responsible for their own comprehensive exam preparation strategy</li>
              <li>BrainMesh supplements but does not replace other study materials and methods</li>
              <li>We are not responsible for technical issues beyond our reasonable control</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Privacy & Data Protection</h2>
          <p className="mb-2">Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information. By using BrainMesh, you consent to our data practices as described in the Privacy Policy.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Updates to Terms</h2>
          <p className="mb-2">We may update these Terms & Conditions periodically to reflect changes in our services or legal requirements. Significant changes will be communicated via email or platform notifications. Continued use of BrainMesh after changes constitutes acceptance of the updated terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Governing Law & Disputes</h2>
          <p className="mb-2">These terms are governed by Indian law. Any disputes will be resolved through appropriate legal channels in India. We encourage users to contact us first to resolve any issues amicably.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Contact Information</h2>
          <p className="mb-3">For questions about these Terms & Conditions or any aspect of our service:</p>
          <div className="space-y-2">
            <p><strong>General Support:</strong> support@BrainMesh.com</p>
            <p><strong>Technical Issues:</strong> tech@BrainMesh.com</p>
            <p><strong>Billing Questions:</strong> billing@BrainMesh.com</p>
            <p><strong>Business Hours:</strong> Monday to Friday, 9 AM - 6 PM IST</p>
            <p><strong>Response Time:</strong> Within 24-48 hours for most inquiries</p>
          </div>
          <p className="mt-4 text-sm text-gray-600">When contacting support, please include your registered email address and describe your issue in detail for faster resolution.</p>
        </section>
          </div>
        </div>
      </div>
    </div>
  );
}
