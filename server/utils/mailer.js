const nodemailer = require('nodemailer');

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services like 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com', // Your email address
    pass: process.env.EMAIL_PASSWORD || 'your-password' // Your email password or app password
  }
});

/**
 * Send an email notification for a new enquiry
 * @param {Object} enquiry - The enquiry object
 * @returns {Promise} - Nodemailer send mail promise
 */
const sendEnquiryNotification = async (enquiry) => {
  try {
    // The email recipient (your email)
    const to = process.env.NOTIFICATION_EMAIL || 'your-email@gmail.com';
    
    // Create the email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: to,
      subject: `New Enquiry: ${enquiry.subject}`,
      html: `
        <h2>New Enquiry Received</h2>
        <p><strong>From:</strong> ${enquiry.name} (${enquiry.email})</p>
        ${enquiry.phone ? `<p><strong>Phone:</strong> ${enquiry.phone}</p>` : ''}
        <p><strong>Subject:</strong> ${enquiry.subject}</p>
        <h3>Message:</h3>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${enquiry.message.replace(/\n/g, '<br>')}
        </div>
        <p style="margin-top: 20px; color: #666;">
          This is an automated notification from your website. Please do not reply to this email.
        </p>
      `
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Enquiry notification sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending enquiry notification:', error);
    // Don't throw the error to prevent affecting the main workflow
    return null;
  }
};

module.exports = {
  sendEnquiryNotification
}; 