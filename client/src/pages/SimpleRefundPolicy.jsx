import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function SimpleRefundPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6 font-medium transition-colors duration-200">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Refund Policy</h1>
          <div className="flex items-center mb-4">
            <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium mr-3">BrainMesh</div>
            <span className="text-gray-600">SSC Vocabulary Learning Platform</span>
          </div>
          <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded">
            <p className="text-purple-800 font-medium">Effective Date: August 29, 2025</p>
          </div>
        </div>
      
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">Our Commitment to Customer Satisfaction</h2>
          <p className="mb-2">At BrainMesh, we are committed to providing exceptional value through our SSC vocabulary learning platform. This refund policy outlines the circumstances under which refunds may be granted and our process for handling refund requests fairly and transparently.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Refund Eligibility Criteria</h2>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Eligible Refund Scenarios:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Technical Issues:</strong> Persistent technical problems that prevent access to the platform despite our support team's assistance</li>
              <li><strong>Service Unavailability:</strong> Extended service outages (more than 72 consecutive hours) that significantly impact your learning experience</li>
              <li><strong>Billing Errors:</strong> Incorrect charges, duplicate payments, or unauthorized transactions on your account</li>
              <li><strong>Content Access Issues:</strong> Inability to access purchased content due to platform errors (not user error)</li>
              <li><strong>Early Cancellation (Trial Period):</strong> Cancellation within the first 7 days of your initial subscription with valid reasons</li>
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Non-Eligible Refund Scenarios:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Change of Mind:</strong> General dissatisfaction or change of mind after using the platform</li>
              <li><strong>Exam Performance:</strong> Unsatisfactory exam results or performance outcomes</li>
              <li><strong>User Error:</strong> Inability to access content due to forgotten passwords, incorrect login details, or user mistakes</li>
              <li><strong>Partial Usage:</strong> Requests for partial refunds for unused portions of subscription periods</li>
              <li><strong>Violation of Terms:</strong> Account suspension or termination due to violation of our Terms & Conditions</li>
              <li><strong>Third-party Issues:</strong> Problems with internet connectivity, device compatibility, or other external factors</li>
              <li><strong>Content Completion:</strong> After completing significant portions of the vocabulary content or quizzes</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Subscription-Specific Refund Terms</h2>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">7 Days Trial (₹19):</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Full refund available within 7 days if technical issues prevent platform access</li>
              <li>Must demonstrate good faith effort to resolve issues with our support team</li>
              <li>Refund processing time: 3-5 business days</li>
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">3 Months Plan (₹129):</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Full refund available within first 7 days for technical issues only</li>
              <li>After 7 days: Refunds considered only for severe technical problems or billing errors</li>
              <li>No partial refunds for unused months</li>
              <li>Refund processing time: 5-7 business days</li>
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">6 Months Plan (₹199):</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Full refund available within first 7 days for technical issues only</li>
              <li>After 7 days: Refunds considered only for severe technical problems or billing errors</li>
              <li>No partial refunds for unused months</li>
              <li>Refund processing time: 5-7 business days</li>
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">12 Months Plan (₹329):</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Full refund available within first 7 days for technical issues only</li>
              <li>After 7 days: Refunds considered only for severe technical problems or billing errors</li>
              <li>No partial refunds for unused months</li>
              <li>Refund processing time: 7-10 business days</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Refund Request Process</h2>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Step 1: Contact Support First</h3>
            <p className="mb-2">Before requesting a refund, please contact our support team to resolve any technical issues. Many problems can be quickly resolved without needing a refund.</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email: support@BrainMesh.com</li>
              <li>Response time: Within 24 hours during business days</li>
              <li>Include: Account email, subscription details, and description of the issue</li>
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Step 2: Submit Refund Request</h3>
            <p className="mb-2">If the issue cannot be resolved, submit a formal refund request with the following information:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Subject Line:</strong> "Refund Request - [Your Email Address]"</li>
              <li><strong>Account Information:</strong> Registered email address and subscription plan</li>
              <li><strong>Order Details:</strong> Transaction ID, payment date, and amount paid</li>
              <li><strong>Reason for Refund:</strong> Detailed explanation of why you're requesting a refund</li>
              <li><strong>Supporting Evidence:</strong> Screenshots, error messages, or other relevant documentation</li>
              <li><strong>Previous Support Interactions:</strong> Reference any previous support tickets or communications</li>
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Step 3: Review Process</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Our team will review your request within 2-3 business days</li>
              <li>We may request additional information or clarification</li>
              <li>You will receive a decision via email with detailed explanation</li>
              <li>If approved, refund processing will begin immediately</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Refund Processing & Timeline</h2>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Processing Times by Payment Method:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Credit/Debit Cards:</strong> 5-7 business days after approval</li>
              <li><strong>Net Banking:</strong> 3-5 business days after approval</li>
              <li><strong>UPI/Digital Wallets:</strong> 2-4 business days after approval</li>
              <li><strong>Bank Transfers:</strong> 7-10 business days after approval</li>
            </ul>
            <p className="mt-2 text-sm text-gray-600">Note: Processing times may vary depending on your bank or payment provider's policies.</p>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Refund Method:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Refunds will be processed to the original payment method used for the purchase</li>
              <li>We cannot process refunds to different accounts or payment methods</li>
              <li>If the original payment method is no longer available, alternative arrangements may be made</li>
              <li>You will receive email confirmation when the refund is processed</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Account Access After Refund</h2>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Immediate Effects:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Premium access will be revoked immediately upon refund processing</li>
              <li>All downloaded content and progress data will be retained for 30 days</li>
              <li>You can still access basic account features and settings</li>
              <li>Re-subscription is possible at any time with full access restoration</li>
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Data Retention:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Learning progress and quiz results are preserved for 30 days</li>
              <li>Account information remains active unless you request deletion</li>
              <li>If you re-subscribe within 30 days, all previous progress will be restored</li>
              <li>After 30 days, progress data may be permanently deleted</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Special Circumstances</h2>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Medical or Emergency Situations:</h3>
            <p className="mb-2">We understand that unexpected circumstances may arise. In cases of medical emergencies, family crises, or other exceptional situations, please contact us directly. We will review such cases individually and may offer:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Subscription pause or extension options</li>
              <li>Partial refunds in extreme circumstances</li>
              <li>Transfer to a different subscription plan</li>
              <li>Compassionate consideration beyond standard policy</li>
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Technical Platform Issues:</h3>
            <p className="mb-2">If widespread technical issues affect multiple users:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>We will proactively communicate about the issue and resolution timeline</li>
              <li>Subscription extensions may be offered to compensate for lost access time</li>
              <li>In severe cases, proactive partial refunds may be issued</li>
              <li>Users will be notified via email about any compensation offered</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Dispute Resolution</h2>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">If Your Refund Request is Denied:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>You will receive a detailed explanation of the decision</li>
              <li>You can appeal the decision by providing additional information</li>
              <li>Appeals are reviewed by a senior team member within 5 business days</li>
              <li>Final decisions will be communicated in writing with reasoning</li>
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Alternative Solutions:</h3>
            <p className="mb-2">Even if a refund is not possible, we may offer:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Account credits for future subscriptions</li>
              <li>Subscription plan changes or upgrades</li>
              <li>Extended access periods</li>
              <li>Additional support and training resources</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Prevention & Best Practices</h2>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">To Avoid Refund Situations:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Start with our 7-day trial to evaluate the platform thoroughly</li>
              <li>Contact support immediately if you experience any technical issues</li>
              <li>Ensure your device and browser meet our system requirements</li>
              <li>Keep your account information and payment details up to date</li>
              <li>Read our Terms & Conditions and Privacy Policy before subscribing</li>
              <li>Use the platform regularly to maximize your learning investment</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Contact Information for Refunds</h2>
          <p className="mb-3">For all refund-related inquiries and requests:</p>
          <div className="space-y-2">
            <p><strong>Primary Contact:</strong> support@BrainMesh.com</p>
            <p><strong>Billing Specific:</strong> billing@BrainMesh.com</p>
            <p><strong>Technical Issues:</strong> tech@BrainMesh.com</p>
            <p><strong>Business Hours:</strong> Monday to Friday, 9 AM - 6 PM IST</p>
            <p><strong>Response Time:</strong> Within 24 hours for refund requests</p>
            <p><strong>Emergency Contact:</strong> For urgent billing issues, mark email as "URGENT - Billing Issue"</p>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">When Contacting Support:</h4>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>Include your registered email address</li>
              <li>Provide transaction ID or order number</li>
              <li>Describe the issue in detail with timestamps if applicable</li>
              <li>Attach screenshots or error messages if relevant</li>
              <li>Mention any troubleshooting steps you've already tried</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Policy Updates</h2>
          <p className="mb-2">This refund policy may be updated periodically to reflect changes in our services, legal requirements, or business practices. Significant changes will be communicated to active subscribers via email. The updated policy will apply to all new subscriptions and renewals after the effective date.</p>
          <p className="mt-2 text-sm text-gray-600">Last updated: August 29, 2025. Previous versions of this policy are available upon request.</p>
        </section>
          </div>
        </div>
      </div>
    </div>
  );
}
