import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Shield, RefreshCw, Truck, FileText, AlertCircle, CheckCircle, Clock, Mail, Phone } from 'lucide-react';

const PolicyScreens = () => {
  const { t } = useTranslation();
  const [activeScreen, setActiveScreen] = useState('menu');

  // Menu Screen
  const MenuScreen = () => (
    <div className="min-h-screen bg-[#FFC0CB] text-black">
      <div className="sticky top-0 bg-[#FFC0CB]/95 backdrop-blur-lg border-b border-[#ff99b3] z-10 p-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">{t('policies.menu.title')}</h1>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <PolicyCard
          icon={<Shield className="w-6 h-6" />}
          title={t('policies.menu.privacyPolicy')}
          description={t('policies.menu.privacyDescription')}
          onClick={() => setActiveScreen('privacy')}
        />
        
        <PolicyCard
          icon={<RefreshCw className="w-6 h-6" />}
          title={t('policies.menu.refundPolicy')}
          description={t('policies.menu.refundDescription')}
          onClick={() => setActiveScreen('refund')}
        />
        
        <PolicyCard
          icon={<Truck className="w-6 h-6" />}
          title={t('policies.menu.deliveryPolicy')}
          description={t('policies.menu.deliveryDescription')}
          onClick={() => setActiveScreen('shipping')}
        />
        
        <PolicyCard
          icon={<FileText className="w-6 h-6" />}
          title={t('policies.menu.termsConditions')}
          description={t('policies.menu.termsDescription')}
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
      title={t('policies.privacy.title')}
      icon={<Shield className="w-6 h-6" />}
      onBack={() => setActiveScreen('menu')}
    >
      <Section title={t('policies.privacy.introduction.title')}>
        <p>
          {t('policies.privacy.introduction.content')}
        </p>
      </Section>

      <Section title={t('policies.privacy.informationWeCollect.title')}>
        <SubSection title={t('policies.privacy.informationWeCollect.personalInformation.title')}>
          <ul>
            <li>{t('policies.privacy.informationWeCollect.personalInformation.nameAndEmail')}</li>
            <li>{t('policies.privacy.informationWeCollect.personalInformation.phoneNumber')}</li>
            <li>{t('policies.privacy.informationWeCollect.personalInformation.profilePicture')}</li>
            <li>{t('policies.privacy.informationWeCollect.personalInformation.paymentInfo')}</li>
            <li>{t('policies.privacy.informationWeCollect.personalInformation.deviceInfo')}</li>
          </ul>
        </SubSection>

        <SubSection title={t('policies.privacy.informationWeCollect.contentAndUsageData.title')}>
          <ul>
            <li>{t('policies.privacy.informationWeCollect.contentAndUsageData.videos')}</li>
            <li>{t('policies.privacy.informationWeCollect.contentAndUsageData.interactions')}</li>
            <li>{t('policies.privacy.informationWeCollect.contentAndUsageData.searchHistory')}</li>
            <li>{t('policies.privacy.informationWeCollect.contentAndUsageData.usagePatterns')}</li>
          </ul>
        </SubSection>
      </Section>

      <Section title={t('policies.privacy.howWeUse.title')}>
        <ul>
          <li>{t('policies.privacy.howWeUse.provideServices')}</li>
          <li>{t('policies.privacy.howWeUse.processTransactions')}</li>
          <li>{t('policies.privacy.howWeUse.improveExperience')}</li>
          <li>{t('policies.privacy.howWeUse.communicate')}</li>
          <li>{t('policies.privacy.howWeUse.ensureSafety')}</li>
          <li>{t('policies.privacy.howWeUse.complyLegal')}</li>
        </ul>
      </Section>

      <Section title={t('policies.privacy.informationSharing.title')}>
        <p>{t('policies.privacy.informationSharing.intro')}</p>
        <ul>
          <li><strong>{t('policies.privacy.informationSharing.serviceProviders')}</strong></li>
          <li><strong>{t('policies.privacy.informationSharing.legalRequirements')}</strong></li>
          <li><strong>{t('policies.privacy.informationSharing.businessTransfers')}</strong></li>
          <li><strong>{t('policies.privacy.informationSharing.withConsent')}</strong></li>
        </ul>
      </Section>

      <Section title={t('policies.privacy.dataSecurity.title')}>
        <p>
          {t('policies.privacy.dataSecurity.content')}
        </p>
      </Section>

      <Section title={t('policies.privacy.yourRights.title')}>
        <ul>
          <li>{t('policies.privacy.yourRights.accessData')}</li>
          <li>{t('policies.privacy.yourRights.correctInfo')}</li>
          <li>{t('policies.privacy.yourRights.deleteAccount')}</li>
          <li>{t('policies.privacy.yourRights.optOut')}</li>
          <li>{t('policies.privacy.yourRights.controlPrivacy')}</li>
        </ul>
      </Section>

      <Section title={t('policies.privacy.childrensPrivacy.title')}>
        <AlertBox>
          {t('policies.privacy.childrensPrivacy.content')}
        </AlertBox>
      </Section>

      <Section title={t('policies.common.contactUs', { defaultValue: 'Contact Us' })}>
        <ContactInfo />
      </Section>

      <UpdateDate>{t('policies.common.lastUpdated')}</UpdateDate>
    </PolicyLayout>
  );

  // Refund Policy Screen
  const RefundPolicyScreen = () => (
    <PolicyLayout
      title={t('policies.refund.title')}
      icon={<RefreshCw className="w-6 h-6" />}
      onBack={() => setActiveScreen('menu')}
    >
      <Section title={t('policies.refund.digitalProductsPolicy.title')}>
        <AlertBox type="info">
          {t('policies.refund.digitalProductsPolicy.content')}
        </AlertBox>
      </Section>

      <Section title={t('policies.refund.pointsAndVirtualCurrency.title')}>
        <SubSection title={t('policies.refund.pointsAndVirtualCurrency.refundEligibility.title')}>
          <ul>
            <li><CheckCircle className="w-4 h-4 inline text-green-600" /> {t('policies.refund.pointsAndVirtualCurrency.refundEligibility.paymentErrors')}</li>
            <li><CheckCircle className="w-4 h-4 inline text-green-600" /> {t('policies.refund.pointsAndVirtualCurrency.refundEligibility.technicalIssues')}</li>
            <li><CheckCircle className="w-4 h-4 inline text-green-600" /> {t('policies.refund.pointsAndVirtualCurrency.refundEligibility.unauthorizedTransactions')}</li>
          </ul>
        </SubSection>

        <SubSection title={t('policies.refund.pointsAndVirtualCurrency.nonRefundable.title')}>
          <ul>
            <li>{t('policies.refund.pointsAndVirtualCurrency.nonRefundable.pointsSpent')}</li>
            <li>{t('policies.refund.pointsAndVirtualCurrency.nonRefundable.changeOfMind')}</li>
            <li>{t('policies.refund.pointsAndVirtualCurrency.nonRefundable.accountDeletion')}</li>
            <li>{t('policies.refund.pointsAndVirtualCurrency.nonRefundable.virtualGifts')}</li>
          </ul>
        </SubSection>
      </Section>

      <Section title={t('policies.refund.refundRequestProcess.title')}>
        <div className="space-y-3">
          <StepCard number="1" title={t('policies.refund.refundRequestProcess.step1Title')}>
            {t('policies.refund.refundRequestProcess.step1Content')}
          </StepCard>
          <StepCard number="2" title={t('policies.refund.refundRequestProcess.step2Title')}>
            {t('policies.refund.refundRequestProcess.step2Content')}
          </StepCard>
          <StepCard number="3" title={t('policies.refund.refundRequestProcess.step3Title')}>
            {t('policies.refund.refundRequestProcess.step3Content')}
          </StepCard>
          <StepCard number="4" title={t('policies.refund.refundRequestProcess.step4Title')}>
            {t('policies.refund.refundRequestProcess.step4Content')}
          </StepCard>
        </div>
      </Section>

      <Section title={t('policies.refund.refundMethods.title')}>
        <ul>
          <li><strong>{t('policies.refund.refundMethods.usdtCrypto')}</strong></li>
          <li><strong>{t('policies.refund.refundMethods.bankTransfer')}</strong></li>
          <li><strong>{t('policies.refund.refundMethods.creditDebitCard')}</strong></li>
        </ul>
        <p className="text-sm text-gray-700 mt-2">
          {t('policies.refund.refundMethods.note')}
        </p>
      </Section>

      <Section title={t('policies.refund.disputesAndChargebacks.title')}>
        <AlertBox type="warning">
          {t('policies.refund.disputesAndChargebacks.content')}
        </AlertBox>
      </Section>

      <Section title={t('policies.common.contactForRefunds', { defaultValue: 'Contact for Refunds' })}>
        <ContactInfo />
      </Section>

      <UpdateDate>{t('policies.common.lastUpdated')}</UpdateDate>
    </PolicyLayout>
  );

  // Service Delivery Policy Screen
  const ShippingPolicyScreen = () => (
    <PolicyLayout
      title={t('policies.delivery.title')}
      icon={<Truck className="w-6 h-6" />}
      onBack={() => setActiveScreen('menu')}
    >
      <Section title={t('policies.delivery.digitalServiceDelivery.title')}>
        <p>
          {t('policies.delivery.digitalServiceDelivery.content')}
        </p>
      </Section>

      <Section title={t('policies.delivery.pointsAndVirtualCurrency.title')}>
        <div className="bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-xl p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">{t('policies.delivery.pointsAndVirtualCurrency.instantDelivery')}</span>
          </div>
          <p className="text-sm">
            {t('policies.delivery.pointsAndVirtualCurrency.instantDeliveryNote')}
          </p>
        </div>

        <SubSection title={t('policies.delivery.pointsAndVirtualCurrency.deliveryTimeline.title')}>
          <ul>
            <li><strong>{t('policies.delivery.pointsAndVirtualCurrency.deliveryTimeline.usdtPayments')}</strong></li>
            <li><strong>{t('policies.delivery.pointsAndVirtualCurrency.deliveryTimeline.bankTransfer')}</strong></li>
            <li><strong>{t('policies.delivery.pointsAndVirtualCurrency.deliveryTimeline.cardPayments')}</strong></li>
          </ul>
        </SubSection>
      </Section>

      <Section title={t('policies.delivery.virtualGiftsAndFeatures.title')}>
        <ul>
          <li>{t('policies.delivery.virtualGiftsAndFeatures.deliveredInstantly')}</li>
          <li>{t('policies.delivery.virtualGiftsAndFeatures.visibleImmediately')}</li>
          <li>{t('policies.delivery.virtualGiftsAndFeatures.cannotBeRecalled')}</li>
          <li>{t('policies.delivery.virtualGiftsAndFeatures.permanentRecord')}</li>
        </ul>
      </Section>

      <Section title={t('policies.delivery.premiumFeatures.title')}>
        <p>
          {t('policies.delivery.premiumFeatures.content')}
        </p>
      </Section>

      <Section title={t('policies.delivery.deliveryIssues.title')}>
        <AlertBox type="info">
          {t('policies.delivery.deliveryIssues.intro')}
        </AlertBox>
        <ul className="mt-3">
          <li>{t('policies.delivery.deliveryIssues.checkHistory')}</li>
          <li>{t('policies.delivery.deliveryIssues.verifyPayment')}</li>
          <li>{t('policies.delivery.deliveryIssues.waitConfirmation')}</li>
          <li>{t('policies.delivery.deliveryIssues.contactSupport')}</li>
        </ul>
      </Section>

      <Section title={t('policies.delivery.failedDeliveries.title')}>
        <p>
          {t('policies.delivery.failedDeliveries.intro')}
        </p>
        <ul>
          <li>{t('policies.delivery.failedDeliveries.retryDelivery')}</li>
          <li>{t('policies.delivery.failedDeliveries.notified')}</li>
          <li>{t('policies.delivery.failedDeliveries.refundProcessed')}</li>
          <li>{t('policies.delivery.failedDeliveries.noCharges')}</li>
        </ul>
      </Section>

      <Section title={t('policies.delivery.serviceAvailability.title')}>
        <SubSection title={t('policies.delivery.serviceAvailability.platformAccess.title')}>
          <p>{t('policies.delivery.serviceAvailability.platformAccess.content')}</p>
        </SubSection>

        <SubSection title={t('policies.delivery.serviceAvailability.scheduledMaintenance.title')}>
          <ul>
            <li>{t('policies.delivery.serviceAvailability.scheduledMaintenance.announced')}</li>
            <li>{t('policies.delivery.serviceAvailability.scheduledMaintenance.scheduled')}</li>
            <li>{t('policies.delivery.serviceAvailability.scheduledMaintenance.completed')}</li>
          </ul>
        </SubSection>
      </Section>

      <Section title={t('policies.delivery.geographicAvailability.title')}>
        <p>
          {t('policies.delivery.geographicAvailability.content')}
        </p>
      </Section>

      <Section title={t('policies.common.supportAndAssistance', { defaultValue: 'Support & Assistance' })}>
        <ContactInfo />
      </Section>

      <UpdateDate>{t('policies.common.lastUpdated')}</UpdateDate>
    </PolicyLayout>
  );

  // Terms & Conditions Screen
  const TermsConditionsScreen = () => (
    <PolicyLayout
      title={t('policies.terms.title')}
      icon={<FileText className="w-6 h-6" />}
      onBack={() => setActiveScreen('menu')}
    >
      <Section title={t('policies.terms.agreementToTerms.title')}>
        <p>
          {t('policies.terms.agreementToTerms.content')}
        </p>
      </Section>

      <Section title={t('policies.terms.userAccounts.title')}>
        <SubSection title={t('policies.terms.userAccounts.accountCreation.title')}>
          <ul>
            <li>{t('policies.terms.userAccounts.accountCreation.ageRequirement')}</li>
            <li>{t('policies.terms.userAccounts.accountCreation.accurateInfo')}</li>
            <li>{t('policies.terms.userAccounts.accountCreation.maintainSecurity')}</li>
            <li>{t('policies.terms.userAccounts.accountCreation.oneAccount')}</li>
          </ul>
        </SubSection>

        <SubSection title={t('policies.terms.userAccounts.accountResponsibilities.title')}>
          <ul>
            <li>{t('policies.terms.userAccounts.accountResponsibilities.responsibleForActivities')}</li>
            <li>{t('policies.terms.userAccounts.accountResponsibilities.notifyUnauthorized')}</li>
            <li>{t('policies.terms.userAccounts.accountResponsibilities.doNotShare')}</li>
            <li>{t('policies.terms.userAccounts.accountResponsibilities.keepUpdated')}</li>
          </ul>
        </SubSection>
      </Section>

      <Section title={t('policies.terms.acceptableUse.title')}>
        <AlertBox type="warning">
          {t('policies.terms.acceptableUse.warning')}
        </AlertBox>

        <SubSection title={t('policies.terms.acceptableUse.prohibitedContent.title')}>
          <ul>
            <li>{t('policies.terms.acceptableUse.prohibitedContent.illegalContent')}</li>
            <li>{t('policies.terms.acceptableUse.prohibitedContent.harassment')}</li>
            <li>{t('policies.terms.acceptableUse.prohibitedContent.explicitContent')}</li>
            <li>{t('policies.terms.acceptableUse.prohibitedContent.violence')}</li>
            <li>{t('policies.terms.acceptableUse.prohibitedContent.copyright')}</li>
            <li>{t('policies.terms.acceptableUse.prohibitedContent.spam')}</li>
          </ul>
        </SubSection>

        <SubSection title={t('policies.terms.acceptableUse.prohibitedActivities.title')}>
          <ul>
            <li>{t('policies.terms.acceptableUse.prohibitedActivities.impersonating')}</li>
            <li>{t('policies.terms.acceptableUse.prohibitedActivities.manipulatingMetrics')}</li>
            <li>{t('policies.terms.acceptableUse.prohibitedActivities.hacking')}</li>
            <li>{t('policies.terms.acceptableUse.prohibitedActivities.scraping')}</li>
            <li>{t('policies.terms.acceptableUse.prohibitedActivities.interfering')}</li>
          </ul>
        </SubSection>
      </Section>

      <Section title={t('policies.terms.contentOwnership.title')}>
        <SubSection title={t('policies.terms.contentOwnership.yourContent.title')}>
          <ul>
            <li>{t('policies.terms.contentOwnership.yourContent.retainOwnership')}</li>
            <li>{t('policies.terms.contentOwnership.yourContent.grantLicense')}</li>
            <li>{t('policies.terms.contentOwnership.yourContent.haveRights')}</li>
            <li>{t('policies.terms.contentOwnership.yourContent.responsible')}</li>
          </ul>
        </SubSection>

        <SubSection title={t('policies.terms.contentOwnership.ourRights.title')}>
          <ul>
            <li>{t('policies.terms.contentOwnership.ourRights.removeContent')}</li>
            <li>{t('policies.terms.contentOwnership.ourRights.moderateContent')}</li>
            <li>{t('policies.terms.contentOwnership.ourRights.ownFeatures')}</li>
            <li>{t('policies.terms.contentOwnership.ourRights.trademarks')}</li>
          </ul>
        </SubSection>
      </Section>

      <Section title={t('policies.terms.pointsAndVirtualCurrency.title')}>
        <ul>
          <li>{t('policies.terms.pointsAndVirtualCurrency.noCashValue')}</li>
          <li>{t('policies.terms.pointsAndVirtualCurrency.cannotTransfer')}</li>
          <li>{t('policies.terms.pointsAndVirtualCurrency.cannotExchange')}</li>
          <li>{t('policies.terms.pointsAndVirtualCurrency.mayExpire')}</li>
          <li>{t('policies.terms.pointsAndVirtualCurrency.adjustValues')}</li>
        </ul>
      </Section>

      <Section title={t('policies.terms.paymentsAndBilling.title')}>
        <ul>
          <li>{t('policies.terms.paymentsAndBilling.pricesInUSD')}</li>
          <li>{t('policies.terms.paymentsAndBilling.secureProcessing')}</li>
          <li>{t('policies.terms.paymentsAndBilling.authorizeCharges')}</li>
          <li>{t('policies.terms.paymentsAndBilling.refundPolicy')}</li>
          <li>{t('policies.terms.paymentsAndBilling.changePricing')}</li>
        </ul>
      </Section>

      <Section title={t('policies.terms.accountTermination.title')}>
        <SubSection title={t('policies.terms.accountTermination.byYou.title')}>
          <p>{t('policies.terms.accountTermination.byYou.content')}</p>
        </SubSection>

        <SubSection title={t('policies.terms.accountTermination.byUs.title')}>
          <p>{t('policies.terms.accountTermination.byUs.content')}</p>
          <ul>
            <li>{t('policies.terms.accountTermination.byUs.violation')}</li>
            <li>{t('policies.terms.accountTermination.byUs.illegalActivities')}</li>
            <li>{t('policies.terms.accountTermination.byUs.inactivity')}</li>
            <li>{t('policies.terms.accountTermination.byUs.paymentDisputes')}</li>
          </ul>
        </SubSection>

        <SubSection title={t('policies.terms.accountTermination.effectsOfTermination.title')}>
          <ul>
            <li>{t('policies.terms.accountTermination.effectsOfTermination.accessLost')}</li>
            <li>{t('policies.terms.accountTermination.effectsOfTermination.pointsForfeited')}</li>
            <li>{t('policies.terms.accountTermination.effectsOfTermination.contentRemoved')}</li>
            <li>{t('policies.terms.accountTermination.effectsOfTermination.provisionsSurvive')}</li>
          </ul>
        </SubSection>
      </Section>

      <Section title={t('policies.terms.disclaimers.title')}>
        <AlertBox>
          <p className="font-semibold mb-2">{t('policies.terms.disclaimers.serviceProvidedAsIs')}</p>
          <p className="text-sm">
            {t('policies.terms.disclaimers.content')}
          </p>
        </AlertBox>
      </Section>

      <Section title={t('policies.terms.limitationOfLiability.title')}>
        <p>
          {t('policies.terms.limitationOfLiability.content')}
        </p>
      </Section>

      <Section title={t('policies.terms.indemnification.title')}>
        <p>
          {t('policies.terms.indemnification.content')}
        </p>
      </Section>

      <Section title={t('policies.terms.changesToTerms.title')}>
        <p>
          {t('policies.terms.changesToTerms.content')}
        </p>
      </Section>

      <Section title={t('policies.terms.governingLaw.title')}>
        <p>
          {t('policies.terms.governingLaw.content')}
        </p>
      </Section>

      <Section title={t('policies.terms.disputeResolution.title')}>
        <ul>
          <li>{t('policies.terms.disputeResolution.contactFirst')}</li>
          <li>{t('policies.terms.disputeResolution.arbitration')}</li>
          <li>{t('policies.terms.disputeResolution.classAction')}</li>
          <li>{t('policies.terms.disputeResolution.handledIndividually')}</li>
        </ul>
      </Section>

      <Section title={t('policies.common.contactInformation', { defaultValue: 'Contact Information' })}>
        <ContactInfo />
      </Section>

      <UpdateDate>{t('policies.common.lastUpdated')}</UpdateDate>
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
          <p className="text-sm text-gray-700">{t('policies.common.email')}</p>
          <p className="font-semibold">bensongomezsu@theclipstream.com</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Phone className="w-5 h-5 text-pink-700" />
        <div>
          <p className="text-sm text-gray-700">{t('policies.common.phone')}</p>
          <p className="font-semibold">+66937423012</p>
        </div>
      </div>
      <p className="text-sm text-gray-700">
        {t('policies.common.supportHours')}
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