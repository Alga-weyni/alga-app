import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Shield, FileText, Lock, Database, Clock } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-cream dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-dark-brown dark:text-cream mb-2">
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Alga One Member PLC (TIN: 0101809194)
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Last Updated: November 12, 2025
            </p>
          </div>

          <Separator className="mb-8" />

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold text-dark-brown dark:text-cream mb-4">
                  Welcome to Alga
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Alga (አልጋ - "bed" in Amharic) is Ethiopia's premier property rental platform,
                  connecting travelers with unique accommodations across the country. By using
                  our services, you agree to these terms and our commitment to safe, legal,
                  and culturally immersive hospitality experiences.
                </p>
              </section>

              {/* E-SIGNATURE POLICY - NEW SECTION */}
              <section className="border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6 bg-blue-50 dark:bg-blue-950">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-2xl font-semibold text-dark-brown dark:text-cream">
                    Electronic Signature Policy
                  </h2>
                </div>

                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="text-lg font-semibold text-dark-brown dark:text-cream mb-2 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Legal Authority
                    </h3>
                    <p className="leading-relaxed">
                      Alga's electronic signature system is fully compliant with Ethiopian law
                      and operates under the authority of:
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li><strong>Electronic Signature Proclamation No. 1072/2018</strong> - Governing the use and validity of electronic signatures in Ethiopia</li>
                      <li><strong>Electronic Transactions Proclamation No. 1205/2020</strong> - Establishing legal framework for electronic commerce and transactions</li>
                      <li><strong>INSA (Information Network Security Agency)</strong> - Regulatory authority for electronic signature compliance</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-dark-brown dark:text-cream mb-2 flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      What Constitutes Your Electronic Signature
                    </h3>
                    <p className="leading-relaxed">
                      When you click "I Agree" on any action within the Alga platform (including
                      but not limited to bookings, payments, contracts, and registrations), you are
                      providing your legally binding electronic signature. This action has the same
                      legal force and effect as a handwritten signature.
                    </p>
                    <p className="mt-2 leading-relaxed">
                      Each signature is recorded with:
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>Your verified user identity (via OTP or Fayda ID)</li>
                      <li>Exact date and time of signature</li>
                      <li>Action being signed</li>
                      <li>Encrypted IP address and device information</li>
                      <li>Immutable cryptographic hash (SHA-256) for verification</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-dark-brown dark:text-cream mb-2 flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Data Retention and Storage
                    </h3>
                    <p className="leading-relaxed">
                      Alga retains encrypted signature logs for <strong>five (5) years</strong> from
                      the date of signature, as required by Ethiopian law and international best
                      practices. This retention period ensures:
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>Legal traceability for dispute resolution</li>
                      <li>Compliance with tax and financial regulations</li>
                      <li>Protection for both guests and hosts</li>
                      <li>INSA audit readiness</li>
                    </ul>
                    <p className="mt-2 leading-relaxed">
                      All signature data is:
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li><strong>Encrypted</strong> - IP addresses and device info use AES-256 encryption</li>
                      <li><strong>Immutable</strong> - Signature hashes cannot be altered</li>
                      <li><strong>Backed up</strong> - Off-site backups ensure data integrity</li>
                      <li><strong>Access-controlled</strong> - Only authorized personnel for audit purposes</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-dark-brown dark:text-cream mb-2 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Your Rights: Audit Copies and PDF Receipts
                    </h3>
                    <p className="leading-relaxed">
                      You have the right to request audit copies of your electronic signature events
                      at any time. To request a PDF receipt containing:
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>Your name and verified identity</li>
                      <li>Action signed and date/time</li>
                      <li>Signature verification token (hash)</li>
                      <li>Legal reference to Ethiopian proclamations</li>
                    </ul>
                    <p className="mt-2 leading-relaxed">
                      Please contact: <a href="mailto:info@alga.et" className="text-blue-600 dark:text-blue-400 underline">info@alga.et</a>
                    </p>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded p-4 mt-4">
                    <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                      ⚠️ Important Notice
                    </p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-2">
                      By using Alga's services, you consent to electronic signatures and acknowledge
                      that they carry the same legal weight as traditional handwritten signatures.
                      If you do not agree to electronic signatures, please do not use our platform.
                    </p>
                  </div>

                  <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
                    <p className="text-xs text-muted-foreground text-center">
                      Compliance Reference: Ethiopian Electronic Signature Proclamation No. 1072/2018,
                      Electronic Transactions Proclamation No. 1205/2020 | Regulated by INSA
                    </p>
                  </div>
                </div>
              </section>

              {/* User Accounts */}
              <section>
                <h2 className="text-2xl font-semibold text-dark-brown dark:text-cream mb-4">
                  User Accounts
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  To access certain features, you must create an account and verify your identity
                  through OTP (phone or email) or Fayda ID. You are responsible for maintaining
                  the security of your account credentials.
                </p>
              </section>

              {/* Property Listings */}
              <section>
                <h2 className="text-2xl font-semibold text-dark-brown dark:text-cream mb-4">
                  Property Listings and Bookings
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  Hosts must ensure their listings comply with all local regulations and include
                  mandatory safety equipment:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>Smart lockbox (TTLock-compatible, 4-digit PIN, offline capable)</li>
                  <li>Security cameras for guest safety and incident documentation</li>
                </ul>
              </section>

              {/* Payment and Commissions */}
              <section>
                <h2 className="text-2xl font-semibold text-dark-brown dark:text-cream mb-4">
                  Payment and Commissions
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  All payments are processed through Alga Pay, our secure payment gateway. Alga
                  charges a service fee on each booking. Delala agents earn a 5% commission on
                  properties they refer for 36 months.
                </p>
              </section>

              {/* Privacy and Data Protection */}
              <section>
                <h2 className="text-2xl font-semibold text-dark-brown dark:text-cream mb-4">
                  Privacy and Data Protection
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We are committed to protecting your privacy. All personal data is handled in
                  accordance with Ethiopian data protection laws and international best practices.
                  Sensitive information (including signature logs) is encrypted and stored securely.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-2xl font-semibold text-dark-brown dark:text-cream mb-4">
                  Limitation of Liability
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  While Alga strives to provide a safe and reliable platform, we are not responsible
                  for disputes between hosts and guests, property damage, or incidents occurring
                  during stays. Users are encouraged to maintain appropriate insurance.
                </p>
              </section>

              {/* Governing Law */}
              <section>
                <h2 className="text-2xl font-semibold text-dark-brown dark:text-cream mb-4">
                  Governing Law
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  These terms are governed by the laws of the Federal Democratic Republic of
                  Ethiopia. Any disputes shall be resolved in accordance with Ethiopian law.
                </p>
              </section>

              {/* Contact Information */}
              <section className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-dark-brown dark:text-cream mb-4">
                  Contact Us
                </h2>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Alga One Member PLC</strong></p>
                  <p>TIN: 0101809194</p>
                  <p>Email: <a href="mailto:info@alga.et" className="text-blue-600 dark:text-blue-400 underline">info@alga.et</a></p>
                  <p>Support: <a href="mailto:info@alga.et" className="text-blue-600 dark:text-blue-400 underline">info@alga.et</a></p>
                </div>
              </section>

              {/* Company Identity */}
              <section className="border-t pt-6">
                <p className="text-sm text-muted-foreground text-center italic">
                  🌸 Alga is a women-run, women-owned, and women-operated company committed to
                  empowering Ethiopian hospitality and fostering cultural immersion.
                </p>
              </section>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
