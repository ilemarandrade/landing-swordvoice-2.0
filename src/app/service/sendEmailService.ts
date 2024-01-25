import nodemailer from "nodemailer";

interface ISendEmail {
  to?: string;
  from: {
    name: string;
    address: string;
  };
  subject: string;
  text: string;
}

export async function sendMailService({ to, from, subject, text }: ISendEmail) {
  var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_TO_SEND_EMAIL, // generated ethereal user
      pass: process.env.PASSWORD_TO_SEND_EMAIL, // generated ethereal password
    },
  });

  const mailOptions = {
    from,
    to: to || process.env.EMAILS_MENTORS,
    subject,
    html: `
        <p>Name and Email: ${from.name} ${from.address} </p>
        <p>Message: ${text} </p>
    `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      throw error;
    } else {
      return true;
    }
  });
}
