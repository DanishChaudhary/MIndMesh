import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function SimplePrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium transition-colors duration-200">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Privacy Policy</h1>
          <div className="flex items-center mb-4">
            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mr-3">BrainMesh</div>
            <span className="text-gray-600">SSC Vocabulary Learning Platform</span>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-blue-800 font-medium">Effective Date: August 29, 2025</p>
          </div>
        </div>
      
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Personal Information:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email address for account creation and communication</li>
              <li>Name (optional) for personalized experience</li>
              <li>Payment information for subscription processing</li>
              <li>Subscription plan preferences and billing history</li>
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Learning Data:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Quiz scores and performance analytics</li>
              <li>Word learning progress and completion status</li>
              <li>Time spent on different vocabulary sections (OWS, IPH, Synonyms, Antonyms)</li>
              <li>Practice session history and improvement tracking</li>
              <li>Known words list and mastery levels</li>
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Technical Information:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Device type and browser information</li>
              <li>IP address and location data</li>
              <li>Usage patterns and feature interactions</li>
              <li>Error logs and performance metrics</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Personalized Learning:</strong> Track your progress through 200+ vocabulary words, customize difficulty levels, and recommend practice sessions based on your performance</li>
            <li><strong>Subscription Management:</strong> Process payments for 7-day trial (₹19), 3-month (₹129), 6-month (₹219), and 1-year (₹349) plans</li>
            <li><strong>Progress Tracking:</strong> Monitor completion rates across OWS, IPH, Synonyms, and Antonyms sections</li>
            <li><strong>Quiz Optimization:</strong> Generate targeted quizzes based on your weak areas and learning patterns</li>
            <li><strong>Communication:</strong> Send important updates about new vocabulary content, subscription renewals, and platform improvements</li>
            <li><strong>Customer Support:</strong> Provide assistance with technical issues, account problems, and learning guidance</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Data Security & Protection</h2>
          <p className="mb-3">BrainMesh takes your data security seriously. We implement multiple layers of protection:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Encryption:</strong> All data is encrypted in transit using HTTPS and at rest using AES-256 encryption</li>
            <li><strong>Secure Servers:</strong> Data stored on secure cloud servers with regular security audits</li>
            <li><strong>Access Control:</strong> Limited access to personal data, only authorized personnel can view user information</li>
            <li><strong>Payment Security:</strong> Payment processing handled by secure third-party providers, we don't store credit card information</li>
            <li><strong>Regular Backups:</strong> Automated backups ensure your learning progress is never lost</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Data Sharing & Third Parties</h2>
          <p className="mb-3">We do not sell or rent your personal information. We may share data only in these limited circumstances:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Payment Processors:</strong> Secure payment gateways for subscription processing</li>
            <li><strong>Analytics Services:</strong> Anonymized usage data to improve platform performance</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and users</li>
            <li><strong>Service Providers:</strong> Trusted partners who help us operate the platform (under strict confidentiality agreements)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Your Rights & Controls</h2>
          <p className="mb-3">You have full control over your personal data:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Access:</strong> Request a complete copy of your personal data and learning history</li>
            <li><strong>Correction:</strong> Update or correct any inaccurate information in your profile</li>
            <li><strong>Deletion:</strong> Request deletion of your account and all associated data</li>
            <li><strong>Portability:</strong> Export your learning progress and quiz data in a standard format</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing emails while keeping account notifications</li>
            <li><strong>Data Restriction:</strong> Limit how we process your data for specific purposes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Cookies & Tracking</h2>
          <p className="mb-3">BrainMesh uses cookies to enhance your learning experience:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Essential Cookies:</strong> Required for login, session management, and core functionality</li>
            <li><strong>Performance Cookies:</strong> Help us understand how you use the platform to improve features</li>
            <li><strong>Preference Cookies:</strong> Remember your settings and customization choices</li>
            <li><strong>Analytics Cookies:</strong> Provide insights into learning patterns and popular content</li>
          </ul>
          <p className="mt-2">You can control cookie settings through your browser preferences.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Children's Privacy</h2>
          <p className="mb-2">BrainMesh is designed for SSC exam preparation and is intended for users 16 years and older. We do not knowingly collect personal information from children under 16. If you believe a child has provided us with personal information, please contact us immediately.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Data Retention</h2>
          <p className="mb-3">We retain your data for different periods based on type:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Account Data:</strong> Retained while your account is active and for 2 years after deletion</li>
            <li><strong>Learning Progress:</strong> Kept for the duration of your subscription plus 1 year</li>
            <li><strong>Payment Records:</strong> Maintained for 7 years for tax and legal compliance</li>
            <li><strong>Support Communications:</strong> Stored for 3 years for quality assurance</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">International Data Transfers</h2>
          <p className="mb-2">Your data may be processed and stored in servers located outside your country. We ensure adequate protection through appropriate safeguards and comply with applicable data protection laws.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Policy Updates</h2>
          <p className="mb-2">We may update this Privacy Policy periodically. Significant changes will be communicated via email or platform notifications. Your continued use of BrainMesh after changes constitutes acceptance of the updated policy.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
          <p className="mb-3">For any privacy-related questions, concerns, or requests, please contact us:</p>
          <div className="space-y-2">
            <p><strong>Email:</strong> privacy@BrainMesh.com</p>
            <p><strong>Support Email:</strong> support@BrainMesh.com</p>
            <p><strong>Response Time:</strong> Within 30 days for data requests, 48 hours for general inquiries</p>
            <p><strong>Mailing Address:</strong> BrainMesh Privacy Team, [Your Business Address]</p>
          </div>
          <p className="mt-4 text-sm text-gray-600">When contacting us about privacy matters, please include your registered email address and specific details about your request to help us assist you promptly.</p>
        </section>
          </div>
        </div>
      </div>
    </div>
  );
}
