// src/config/emailConfig.ts
import nodemailer from 'nodemailer';
import config from './environment';
import logger from '../logger/logger';

// Configurazione diversa per sviluppo e produzione
const createTransporter = () => {
    if (config.isDevelopment) {
        // DEVELOPMENT: Usa Mailtrap
        return nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: 2525,
            auth: {
                user: config.emailUser, // Mailtrap username
                pass: config.emailPassword, // Mailtrap password
            },
        });
    } else {
        // PRODUCTION: Usa Brevo
        return nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: {
                user: config.emailUser, // Brevo email
                pass: config.emailPassword, // Brevo SMTP key
            },
        });
    }
};

export const emailTransporter = createTransporter();

// Verifica configurazione al startup
emailTransporter.verify((error, success) => {
    if (error) {
        logger.error('Configurazione email NON valida:', error);
    } else {
        logger.info(`Email configurata per ${config.isDevelopment ? 'DEVELOPMENT (Mailtrap)' : 'PRODUCTION (Brevo)'}`);
    }
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const info = await emailTransporter.sendMail({
            from: '"MoneyManager App" <noreply@moneymanager.app>',
            to,
            subject,
            html,
        });
        
        if (config.isDevelopment) {
            logger.info(`Email inviata (TEST): ${info.messageId}`);
            logger.info(`Preview Mailtrap: https://mailtrap.io/inboxes`);
        } else {
            logger.info(`Email inviata (PROD): ${info.messageId}`);
        }
        
        return true;
    } catch (error) {
        logger.error('Errore invio email:', error);
        return false;
    }
};