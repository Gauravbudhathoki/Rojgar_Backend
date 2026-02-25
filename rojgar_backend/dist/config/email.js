"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error("EMAIL_USER or EMAIL_PASS is missing in .env");
}
exports.transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});
const sendEmail = async (to, subject, html) => {
    const mailOptions = {
        from: `Rojgar Nepal <${EMAIL_USER}>`,
        to,
        subject,
        html,
    };
    await exports.transporter.sendMail(mailOptions);
};
exports.sendEmail = sendEmail;
// transporter.verify((error, success) => {
//   if (error) {
//     console.log("Transporter Error:", error);
//   } else {
//     console.log("Email server ready");
//   }
// });
//# sourceMappingURL=email.js.map