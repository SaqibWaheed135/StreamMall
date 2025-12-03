import React, { useState } from 'react';
import { ArrowLeft, Shield, RefreshCw, Truck, FileText, AlertCircle, CheckCircle, Clock, Mail, Phone } from 'lucide-react';

const PolicyScreens = () => {
  const [activeScreen, setActiveScreen] = useState('menu');

  // Menu Screen
  const MenuScreen = () => (
    <div className="min-h-screen bg-[#FFC0CB] text-black">
      <div className="sticky top-0 bg-[#FFC0CB]/95 backdrop-blur-lg border-b border-[#ff99b3] z-10 p-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Legal & Policies</h1>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <PolicyCard
          icon={<Shield className="w-6 h-6" />}
          title="Privacy Policy"
          description="How we collect, use, and protect your data"
          onClick={() => setActiveScreen('privacy')}
        />
        
        <PolicyCard
          icon={<RefreshCw className="w-6 h-6" />}
          title="Return & Refund Policy"
          description="Our policies on returns and refunds"
          onClick={() => setActiveScreen('refund')}
        />
        
        <PolicyCard
          icon={<Truck className="w-6 h-6" />}
          title="Service Delivery Policy"
          description="How we deliver our digital services"
          onClick={() => setActiveScreen('shipping')}
        />
        
        <PolicyCard
          icon={<FileText className="w-6 h-6" />}
          title="Terms & Conditions"
          description="Rules and guidelines for using our platform"
          onClick={() => setActiveScreen('terms')}
        />
      </div>
    </div>
  );

  const PolicyCard = ({ icon, title, description, onClick }) => (
    <button
      onClick={onClick}
      className="w-full bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-xl p-4 hover:bg-[#ffb3c6] transition-all text-left"
    >
      <div className="flex items-center space-x-4">
        <div className="bg-gradient-to-r from-pink-600 to-pink-500 text-white p-3 rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-gray-700">{description}</p>
        </div>
        <ArrowLeft className="w-5 h-5 rotate-180 text-gray-700" />
      </div>
    </button>
  );

  // Privacy Policy Screen
  const PrivacyPolicyScreen = () => (
    <PolicyLayout
      title="Privacy Policy"
      icon={<Shield className="w-6 h-6" />}
      onBack={() => setActiveScreen('menu')}
    >
      <Section title="Introduction">
        <p>
          At ClipStream, we value your privacy and are committed to protecting your personal information. 
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
          you use our mobile application and services.
        </p>
      </Section>

      <Section title="Information We Collect">
        <SubSection title="Personal Information">
          <ul>
            <li>Name and email address</li>
            <li>Phone number (optional)</li>
            <li>Profile picture and bio</li>
            <li>Payment information (processed securely through third-party providers)</li>
            <li>Device information and IP address</li>
          </ul>
        </SubSection>

        <SubSection title="Content and Usage Data">
          <ul>
            <li>Videos and content you upload or create</li>
            <li>Comments, likes, and interactions</li>
            <li>Search history and preferences</li>
            <li>Usage patterns and analytics</li>
          </ul>
        </SubSection>
      </Section>

      <Section title="How We Use Your Information">
        <ul>
          <li>Provide and maintain our services</li>
          <li>Process transactions and send notifications</li>
          <li>Improve user experience and personalize content</li>
          <li>Communicate with you about updates and offers</li>
          <li>Ensure platform safety and prevent fraud</li>
          <li>Comply with legal obligations</li>
        </ul>
      </Section>

      <Section title="Information Sharing">
        <p>We do not sell your personal information. We may share information with:</p>
        <ul>
          <li><strong>Service Providers:</strong> Payment processors, cloud storage, analytics</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
          <li><strong>Business Transfers:</strong> In case of merger or acquisition</li>
          <li><strong>With Your Consent:</strong> When you explicitly agree to sharing</li>
        </ul>
      </Section>

      <Section title="Data Security">
        <p>
          We implement industry-standard security measures to protect your data, including 
          encryption, secure servers, and regular security audits. However, no method of 
          transmission over the internet is 100% secure.
        </p>
      </Section>

      <Section title="Your Rights">
        <ul>
          <li>Access and download your data</li>
          <li>Correct inaccurate information</li>
          <li>Delete your account and data</li>
          <li>Opt-out of marketing communications</li>
          <li>Control privacy settings</li>
        </ul>
      </Section>

      <Section title="Children's Privacy">
        <AlertBox>
          Our service is not intended for users under 13 years of age. We do not knowingly 
          collect personal information from children under 13.
        </AlertBox>
      </Section>

      <Section title="Contact Us">
        <ContactInfo />
      </Section>

      <UpdateDate>Last Updated: December 3, 2025</UpdateDate>
    </PolicyLayout>
  );

  // Refund Policy Screen
  const RefundPolicyScreen = () => (
    <PolicyLayout
      title="Return & Refund Policy"
      icon={<RefreshCw className="w-6 h-6" />}
      onBack={() => setActiveScreen('menu')}
    >
      <Section title="Digital Products Policy">
        <AlertBox type="info">
          As a digital service platform, most purchases are final upon delivery of services 
          or digital goods. However, we understand issues may arise.
        </AlertBox>
      </Section>

      <Section title="Points & Virtual Currency">
        <SubSection title="Refund Eligibility">
          <ul>
            <li><CheckCircle className="w-4 h-4 inline text-green-600" /> Payment processing errors or duplicate charges</li>
            <li><CheckCircle className="w-4 h-4 inline text-green-600" /> Technical issues preventing points delivery</li>
            <li><CheckCircle className="w-4 h-4 inline text-green-600" /> Unauthorized transactions (with proof)</li>
          </ul>
        </SubSection>

        <SubSection title="Non-Refundable">
          <ul>
            <li>Points already spent or used</li>
            <li>Change of mind after successful purchase</li>
            <li>Voluntary account deletion</li>
            <li>Virtual gifts sent to creators</li>
          </ul>
        </SubSection>
      </Section>

      <Section title="Refund Request Process">
        <div className="space-y-3">
          <StepCard number="1" title="Submit Request">
            Contact support within 7 days of purchase via email or in-app support
          </StepCard>
          <StepCard number="2" title="Provide Details">
            Include transaction ID, purchase date, and reason for refund
          </StepCard>
          <StepCard number="3" title="Review Process">
            We review requests within 3-5 business days
          </StepCard>
          <StepCard number="4" title="Refund Processing">
            Approved refunds processed within 7-10 business days
          </StepCard>
        </div>
      </Section>

      <Section title="Refund Methods">
        <ul>
          <li><strong>USDT/Crypto:</strong> Refunded to original wallet address</li>
          <li><strong>Bank Transfer:</strong> Refunded to original account</li>
          <li><strong>Credit/Debit Card:</strong> Refunded to original card</li>
        </ul>
        <p className="text-sm text-gray-700 mt-2">
          Processing time varies by payment method and financial institution.
        </p>
      </Section>

      <Section title="Disputes & Chargebacks">
        <AlertBox type="warning">
          Initiating a chargeback without contacting us first may result in account suspension. 
          Please reach out to resolve issues before disputing charges.
        </AlertBox>
      </Section>

      <Section title="Contact for Refunds">
        <ContactInfo />
      </Section>

      <UpdateDate>Last Updated: December 3, 2025</UpdateDate>
    </PolicyLayout>
  );

  // Service Delivery Policy Screen
  const ShippingPolicyScreen = () => (
    <PolicyLayout
      title="Service Delivery Policy"
      icon={<Truck className="w-6 h-6" />}
      onBack={() => setActiveScreen('menu')}
    >
      <Section title="Digital Service Delivery">
        <p>
          ClipStream provides digital services and virtual products. There is no physical 
          shipping involved. All services are delivered electronically.
        </p>
      </Section>

      <Section title="Points & Virtual Currency">
        <div className="bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-xl p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Instant Delivery</span>
          </div>
          <p className="text-sm">
            Points are credited to your account immediately upon successful payment verification.
          </p>
        </div>

        <SubSection title="Delivery Timeline">
          <ul>
            <li><strong>USDT Payments:</strong> 1-5 minutes (blockchain confirmation required)</li>
            <li><strong>Bank Transfer:</strong> 1-2 business days (manual verification)</li>
            <li><strong>Card Payments:</strong> Instant (automated processing)</li>
          </ul>
        </SubSection>
      </Section>

      <Section title="Virtual Gifts & Features">
        <ul>
          <li>Delivered instantly upon sending</li>
          <li>Visible to recipients immediately</li>
          <li>Cannot be recalled after delivery</li>
          <li>Permanent record in transaction history</li>
        </ul>
      </Section>

      <Section title="Premium Features">
        <p>
          Premium features and subscriptions are activated immediately upon successful payment. 
          Access remains active for the purchased duration.
        </p>
      </Section>

      <Section title="Delivery Issues">
        <AlertBox type="info">
          If you experience delays in receiving points or services, please:
        </AlertBox>
        <ul className="mt-3">
          <li>Check your transaction history in the app</li>
          <li>Verify payment was successfully processed</li>
          <li>Wait for blockchain confirmation (USDT payments)</li>
          <li>Contact support if issue persists beyond stated timeframe</li>
        </ul>
      </Section>

      <Section title="Failed Deliveries">
        <p>
          In rare cases where delivery fails due to technical issues:
        </p>
        <ul>
          <li>We will retry delivery automatically</li>
          <li>You'll be notified of any issues</li>
          <li>Refund will be processed if delivery cannot be completed</li>
          <li>No charges for failed delivery attempts</li>
        </ul>
      </Section>

      <Section title="Service Availability">
        <SubSection title="24/7 Platform Access">
          <p>Our platform operates continuously with occasional maintenance windows.</p>
        </SubSection>

        <SubSection title="Scheduled Maintenance">
          <ul>
            <li>Announced in advance via app notifications</li>
            <li>Typically scheduled during low-usage hours</li>
            <li>Usually completed within 1-2 hours</li>
          </ul>
        </SubSection>
      </Section>

      <Section title="Geographic Availability">
        <p>
          Our services are available globally, subject to local regulations. Some features 
          may be restricted in certain regions due to legal requirements.
        </p>
      </Section>

      <Section title="Support & Assistance">
        <ContactInfo />
      </Section>

      <UpdateDate>Last Updated: December 3, 2025</UpdateDate>
    </PolicyLayout>
  );

  // Terms & Conditions Screen
  const TermsConditionsScreen = () => (
    <PolicyLayout
      title="Terms & Conditions"
      icon={<FileText className="w-6 h-6" />}
      onBack={() => setActiveScreen('menu')}
    >
      <Section title="Agreement to Terms">
        <p>
          By accessing or using ClipStream, you agree to be bound by these Terms and Conditions. 
          If you disagree with any part of these terms, you may not access the service.
        </p>
      </Section>

      <Section title="User Accounts">
        <SubSection title="Account Creation">
          <ul>
            <li>You must be at least 13 years old to create an account</li>
            <li>Provide accurate and complete information</li>
            <li>Maintain security of your account credentials</li>
            <li>One person, one account policy</li>
          </ul>
        </SubSection>

        <SubSection title="Account Responsibilities">
          <ul>
            <li>You are responsible for all activities under your account</li>
            <li>Notify us immediately of unauthorized access</li>
            <li>Do not share your account with others</li>
            <li>Keep your email and contact information updated</li>
          </ul>
        </SubSection>
      </Section>

      <Section title="Acceptable Use">
        <AlertBox type="warning">
          Users must not engage in prohibited activities that violate our community guidelines.
        </AlertBox>

        <SubSection title="Prohibited Content">
          <ul>
            <li>Illegal, harmful, or threatening content</li>
            <li>Harassment, bullying, or hate speech</li>
            <li>Sexually explicit or adult content</li>
            <li>Violence or graphic content</li>
            <li>Copyright infringement</li>
            <li>Spam or misleading information</li>
          </ul>
        </SubSection>

        <SubSection title="Prohibited Activities">
          <ul>
            <li>Impersonating others or creating fake accounts</li>
            <li>Manipulating engagement metrics artificially</li>
            <li>Hacking or circumventing security measures</li>
            <li>Scraping or unauthorized data collection</li>
            <li>Interfering with platform operation</li>
          </ul>
        </SubSection>
      </Section>

      <Section title="Content Ownership & Rights">
        <SubSection title="Your Content">
          <ul>
            <li>You retain ownership of content you upload</li>
            <li>You grant us license to use, display, and distribute your content</li>
            <li>You represent that you have rights to all uploaded content</li>
            <li>You are responsible for your content and its consequences</li>
          </ul>
        </SubSection>

        <SubSection title="Our Rights">
          <ul>
            <li>We may remove content that violates these terms</li>
            <li>We reserve right to moderate all content</li>
            <li>We own all platform features and functionality</li>
            <li>Our trademarks and branding are protected</li>
          </ul>
        </SubSection>
      </Section>

      <Section title="Points & Virtual Currency">
        <ul>
          <li>Points have no real-world cash value</li>
          <li>Points cannot be transferred between users</li>
          <li>Points cannot be exchanged for cash</li>
          <li>Unused points may expire per our policy</li>
          <li>We may adjust point values with notice</li>
        </ul>
      </Section>

      <Section title="Payments & Billing">
        <ul>
          <li>All prices are in USD unless stated otherwise</li>
          <li>Payments are processed securely through third parties</li>
          <li>You authorize charges for selected services</li>
          <li>Refunds are subject to our refund policy</li>
          <li>We reserve right to change pricing with notice</li>
        </ul>
      </Section>

      <Section title="Account Termination">
        <SubSection title="By You">
          <p>You may delete your account at any time through account settings.</p>
        </SubSection>

        <SubSection title="By Us">
          <p>We may suspend or terminate accounts for:</p>
          <ul>
            <li>Violation of these terms</li>
            <li>Illegal activities</li>
            <li>Prolonged inactivity</li>
            <li>Payment disputes or fraud</li>
          </ul>
        </SubSection>

        <SubSection title="Effects of Termination">
          <ul>
            <li>Access to account and content will be lost</li>
            <li>Unused points will be forfeited</li>
            <li>Content may be removed from platform</li>
            <li>Certain provisions of terms will survive termination</li>
          </ul>
        </SubSection>
      </Section>

      <Section title="Disclaimers">
        <AlertBox>
          <p className="font-semibold mb-2">Service Provided "As Is"</p>
          <p className="text-sm">
            We provide the service without warranties of any kind. We don't guarantee 
            uninterrupted, secure, or error-free service. Use at your own risk.
          </p>
        </AlertBox>
      </Section>

      <Section title="Limitation of Liability">
        <p>
          To the maximum extent permitted by law, ClipStream shall not be liable for any 
          indirect, incidental, special, consequential, or punitive damages resulting from 
          your use or inability to use the service.
        </p>
      </Section>

      <Section title="Indemnification">
        <p>
          You agree to indemnify and hold ClipStream harmless from any claims, damages, 
          losses, or expenses arising from your use of the service or violation of these terms.
        </p>
      </Section>

      <Section title="Changes to Terms">
        <p>
          We reserve the right to modify these terms at any time. We will notify users of 
          significant changes. Continued use after changes constitutes acceptance of new terms.
        </p>
      </Section>

      <Section title="Governing Law">
        <p>
          These terms are governed by the laws of the jurisdiction where ClipStream is 
          registered, without regard to conflict of law provisions.
        </p>
      </Section>

      <Section title="Dispute Resolution">
        <ul>
          <li>Contact us first to resolve disputes informally</li>
          <li>Arbitration may be required for unresolved disputes</li>
          <li>Class action lawsuits are waived</li>
          <li>Disputes handled individually</li>
        </ul>
      </Section>

      <Section title="Contact Information">
        <ContactInfo />
      </Section>

      <UpdateDate>Last Updated: December 3, 2025</UpdateDate>
    </PolicyLayout>
  );

  // Helper Components
  const PolicyLayout = ({ title, icon, onBack, children }) => (
    <div className="min-h-screen bg-[#FFC0CB] text-black">
      <div className="sticky top-0 bg-[#FFC0CB]/95 backdrop-blur-lg border-b border-[#ff99b3] z-10 p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-[#ffb3c6] rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-pink-600 to-pink-500 text-white p-2 rounded-lg">
              {icon}
            </div>
            <h1 className="text-xl font-bold">{title}</h1>
          </div>
        </div>
      </div>

      <div className="p-4 pb-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {children}
        </div>
      </div>
    </div>
  );

  const Section = ({ title, children }) => (
    <div className="bg-white/70 backdrop-blur-sm border border-[#ff99b3] rounded-xl p-5">
      <h2 className="text-xl font-bold mb-4 text-pink-700">{title}</h2>
      <div className="space-y-3 text-gray-800">
        {children}
      </div>
    </div>
  );

  const SubSection = ({ title, children }) => (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );

  const AlertBox = ({ type = 'warning', children }) => {
    const styles = {
      warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
      info: 'bg-blue-100 border-blue-500 text-blue-800',
      error: 'bg-red-100 border-red-500 text-red-800'
    };

    const icons = {
      warning: <AlertCircle className="w-5 h-5" />,
      info: <AlertCircle className="w-5 h-5" />,
      error: <AlertCircle className="w-5 h-5" />
    };

    return (
      <div className={`border-2 rounded-lg p-4 ${styles[type]}`}>
        <div className="flex items-start space-x-3">
          {icons[type]}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    );
  };

  const StepCard = ({ number, title, children }) => (
    <div className="bg-[#ffb3c6] border border-[#ff99b3] rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="bg-gradient-to-r from-pink-600 to-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
          {number}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{title}</h4>
          <p className="text-sm text-gray-800">{children}</p>
        </div>
      </div>
    </div>
  );

  const ContactInfo = () => (
    <div className="bg-[#ffb3c6] border border-[#ff99b3] rounded-lg p-4 space-y-3">
      <div className="flex items-center space-x-3">
        <Mail className="w-5 h-5 text-pink-700" />
        <div>
          <p className="text-sm text-gray-700">Email</p>
          <p className="font-semibold">bensongomezsu@theclipstream.com</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Phone className="w-5 h-5 text-pink-700" />
        <div>
          <p className="text-sm text-gray-700">Phone</p>
          <p className="font-semibold">+66937423012</p>
        </div>
      </div>
      <p className="text-sm text-gray-700">
        Support hours: Monday - Friday, 9:00 AM - 6:00 PM EST
      </p>
    </div>
  );

  const UpdateDate = ({ children }) => (
    <div className="text-center text-sm text-gray-700 mt-6 pb-4">
      {children}
    </div>
  );

  // Render appropriate screen
  const screens = {
    menu: <MenuScreen />,
    privacy: <PrivacyPolicyScreen />,
    refund: <RefundPolicyScreen />,
    shipping: <ShippingPolicyScreen />,
    terms: <TermsConditionsScreen />
  };

  return screens[activeScreen] || <MenuScreen />;
};

export default PolicyScreens;