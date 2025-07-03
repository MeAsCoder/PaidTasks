import Layout from '@/components/Layout';
import Head from 'next/head';

export default function LegalCompliance() {
  return (
    <Layout> 
    <div className="bg-gray-50 min-h-screen">
      <Head>
        <title>Legal Compliance | Your Company</title>
        <meta name="description" content="Laws and regulations governing our operations." />
      </Head>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-8 text-white">
            <h1 className="text-3xl font-bold">Legal Compliance</h1>
            <p className="mt-2 opacity-90">Last Reviewed: {new Date().toLocaleDateString()}</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* 1. Data Protection */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">1. Data Protection</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We adhere to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>GDPR</strong> (EU General Data Protection Regulation)</li>
                  <li><strong>CCPA</strong> (California Consumer Privacy Act)</li>
                  <li><strong>PIPEDA</strong> (Canada&apos;s Personal Information Protection Act)</li>
                </ul>
                <p className="italic text-sm text-gray-500">
                  Data Subject Requests (DSARs) may be submitted via <a href="mailto:privacy@yourcompany.com" className="text-blue-600">privacy@yourcompany.com</a>.
                </p>
              </div>
            </section>

            {/* 2. Industry Regulations */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">2. Industry Regulations</h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Healthcare:</strong> HIPAA compliance for protected health information (PHI)</li>
                  <li><strong>Financial:</strong> FINRA/SEC guidelines for financial advisories</li>
                  <li><strong>SaaS:</strong> SOC 2 Type II certified data centers</li>
                </ul>
              </div>
            </section>

            {/* 3. Employment & Operations */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">3. Operational Laws</h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Labor:</strong> FLSA (Fair Labor Standards Act), OSHA workplace safety</li>
                  <li><strong>Anti-Corruption:</strong> FCPA (Foreign Corrupt Practices Act)</li>
                  <li><strong>Export Controls:</strong> ITAR/EAR compliance for international shipments</li>
                </ul>
              </div>
            </section>

            {/* 4. Updates */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">4. Policy Updates</h2>
              <p className="text-gray-700">
                This document is reviewed quarterly by our <strong>Legal & Compliance Team</strong>.
                Significant changes will be notified via email or platform alerts.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
    </Layout>
  );
}