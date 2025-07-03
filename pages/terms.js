import Layout from '@/components/Layout';
import Head from 'next/head';
import Link from 'next/link';

export default function TermsAndConditions() {
  return (
    <Layout> 
    <div className="bg-gray-50 min-h-screen">
      <Head>
        <title>Terms & Conditions | Your Company</title>
        <meta name="description" content="Terms and conditions governing the use of our services." />
      </Head>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 sm:p-8 text-white">
            <h1 className="text-3xl font-bold">Terms & Conditions</h1>
            <p className="mt-2 opacity-90">Last Updated: {new Date().toLocaleDateString()}</p>
          </div>

          {/* Content Container */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
              <p className="text-gray-600">
                Welcome to <span className="font-medium">Your Company</span>. By accessing or using our website/services, 
                you agree to comply with these Terms & Conditions. If you disagree, please refrain from using our platform.
              </p>
            </section>

            {/* User Obligations */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">2. User Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>You must provide accurate information when creating an account.</li>
                <li>Prohibited activities include spamming, hacking, or distributing malware.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Intellectual Property</h2>
              <p className="text-gray-600">
                All content (logos, text, graphics) is owned by <span className="font-medium">Your Company</span> or its licensors. 
                Unauthorized use, reproduction, or distribution is strictly prohibited.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Limitation of Liability</h2>
              <p className="text-gray-600">
                <span className="font-medium">Your Company</span> shall not be liable for:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-600">
                <li>Indirect, incidental, or consequential damages.</li>
                <li>Losses resulting from third-party services linked to our platform.</li>
              </ul>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Termination</h2>
              <p className="text-gray-600">
                We reserve the right to suspend or terminate your access for violations of these terms, 
                with or without notice.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Governing Law</h2>
              <p className="text-gray-600">
                These terms are governed by the laws of <span className="font-medium">[Your Jurisdiction]</span>. 
                Disputes will be resolved in the courts of <span className="font-medium">[Your Jurisdiction]</span>.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Amendments</h2>
              <p className="text-gray-600">
                We may update these terms periodically. Continued use after changes constitutes acceptance. 
                Check this page for the latest version.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">8. Contact Us</h2>
              <p className="text-gray-600">
                Questions? Email us at{' '}
                <Link href="mailto:legal@yourcompany.com" className="text-blue-600 hover:underline">
                  legal@yourcompany.com
                </Link>.
              </p>
            </section>

            {/* Acceptance Button (Optional) */}
            <div className="pt-6 border-t border-gray-200">
              <Link
                href="/"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
              >
                I Accept
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
}