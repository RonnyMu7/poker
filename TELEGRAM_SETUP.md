# Telegram login and Stars subscription setup

The current account screen is a frontend gate only. Real access control requires deploying the app through the Node.js backend; GitHub Pages alone cannot enforce paid access.

## Required configuration

1. Create a Telegram bot with @BotFather and set its domain / Mini App.
2. Deploy the Node.js app on an HTTPS host that supports persistent storage.
3. Configure server-side environment variables for the bot token, webhook secret, session signing secret, and public app URL.
4. Configure the Telegram webhook to the backend endpoint and keep the bot token private.
5. Implement Telegram Web App `initData` validation on the server, create invoices in currency `XTR`, and grant a one-month subscription only after receiving and validating `successful_payment`.
6. Store users and subscription expiry in a persistent database. Every protected API request must verify the authenticated user and active expiry; never trust browser storage or a client-side flag.
7. Test successful payment, cancelled payment, duplicate webhook delivery, expired subscription, and unauthorized requests before production.

## Price

The requested price is 5,999 Telegram Stars per month. Telegram Stars invoices use currency `XTR`; the server must create the invoice and handle pre-checkout and successful-payment updates. Do not put the bot token in frontend JavaScript or commit secrets to this repository.

## Important

This repository's static frontend cannot securely enforce subscriptions when published directly through GitHub Pages. Production must serve the app behind the authenticated backend or protect all application data and functionality through server-checked APIs. Do not treat the visual gate as payment verification.
