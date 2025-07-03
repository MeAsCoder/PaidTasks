export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, company, phone, message } = req.body;

  // Example: Send data to an email service (e.g., SendGrid, Nodemailer)
  // Or integrate with a CRM like HubSpot, Salesforce, etc.
  try {
    // Replace with your actual submission logic
    console.log('Demo request received:', { name, email, company, phone, message });

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}