// src/config/emailConfig.ts
import nodemailer from 'nodemailer';
import config from './environment';

export const emailTransporter = nodemailer.createTransport({
    host: config.emailHost || 'smtp.gmail.com',
    port: parseInt(config.emailPort || '587'),
    secure: false, // true per 465, false per altri
    auth: {
        user: config.emailUser, // Il tuo email
        pass: config.emailPassword, // Password dell'app o password email
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const info = await emailTransporter.sendMail({
            from: `"MoneyManager App" <${config.emailUser}>`,
            to,
            subject,
            html,
        });
        
        console.log('Email inviata:', info.messageId);
        return true;
    } catch (error) {
        console.error('Errore invio email:', error);
        return false;
    }
};