import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendGoogleLoginConfirmation = async (email, name) => {
  try {
    await transporter.sendMail({
      from: `"Atlas Kicks" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Connexion confirmée — Atlas Kicks',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111; color: #fff; padding: 40px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #eab308; font-size: 28px; margin: 0;">Atlas Kicks</h1>
            <p style="color: #888; font-size: 14px;">Premium Moroccan Football Gear</p>
          </div>
          <div style="background: #1a1a1a; border-radius: 8px; padding: 30px;">
            <h2 style="color: #22c55e; margin-top: 0;">✅ Connexion réussie</h2>
            <p style="color: #ccc; line-height: 1.6;">Bonjour <strong style="color: #fff;">${name}</strong>,</p>
            <p style="color: #ccc; line-height: 1.6;">Vous vous êtes connecté à votre compte Atlas Kicks avec Google.</p>
            <p style="color: #ccc; line-height: 1.6;">Si ce n'était pas vous, veuillez nous contacter immédiatement.</p>
          </div>
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Atlas Kicks. Tous droits réservés.</p>
          </div>
        </div>
      `,
    });
    console.log(`Confirmation email sent to ${email}`);
  } catch (err) {
    console.error('Failed to send confirmation email:', err.message);
  }
};
