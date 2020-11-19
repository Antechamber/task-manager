const sgMail = require('@sendgrid/mail')

// authenticate sendgrid usage with API key ('task app' is the secret)
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const fromEmailAddress = 'brianlionlion@gmail.com'

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: fromEmailAddress,
        subject: 'Thanks for Joining!',
        text: `Welcome to Task App, ${name}. Please send any feedback or suggestions.`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: fromEmailAddress,
        subject: 'Sorry to see you go...',
        text: `Goodbye, ${name}. We're sorry to see you go. Please let our team know if there's anything we could have done differently.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}