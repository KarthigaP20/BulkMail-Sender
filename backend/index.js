const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();

app.use(cors({
  origin: "https://bulk-mail-sender-five.vercel.app",
  methods: ["GET", "POST", "DELETE"],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb+srv://karthigaparthiban17:karthiga21@cluster0.g4juucu.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("Connected to DB"))
  .catch(() => console.log("Failed to connect DB"));

const credential = mongoose.model("credential", {}, "bulkmail");

const emailRecordSchema = new mongoose.Schema({
  subject: String,
  body: String,
  recipients: String,
  success: String,
  failed: String,
  status: String,
  sentAt: { type: Date, default: Date.now }
});

const EmailRecord = mongoose.model("EmailRecord", emailRecordSchema, "emailrecords");

app.delete("/emaillogs/:id", async (req, res) => {
  try {
    await EmailRecord.findByIdAndDelete(req.params.id);
    res.status(200).send("Deleted");
  } catch (err) {
    res.status(500).send("Error deleting log");
  }
});

// Send email route
app.post("/sendemail", function (req, res) {
  const { msg, subject, emailList, senderEmail } = req.body;

    if (senderEmail !== "karthigaparthiban17@gmail.com") {
    return res.status(403).send({ error: "Unauthorized: Email not allowed to send." });
  }
  credential.find().then(function (data) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: data[0].toJSON().user,
        pass: data[0].toJSON().pass,
      },
    });

    const sent = [];
    const failed = [];

    const sendAllEmails = async () => {
      for (let i = 0; i < emailList.length; i++) {
        try {
          await transporter.sendMail({
            from: "karthigaparthiban17@gmail.com",
            to: emailList[i],
            subject: subject,
            text: msg
          });
          console.log("Email sent to: " + emailList[i]);
          sent.push(emailList[i]);
        } catch (err) {
          console.log("Failed to send email to: " + emailList[i]);
          failed.push(emailList[i]);
        }
      }

      const record = new EmailRecord({
        subject,
        body: msg,
        recipients: emailList.join(", "),
        success: sent.join(", "),
        failed: failed.join(", "),
        status:
          failed.length > 0
            ? sent.length > 0
              ? "Partial Success"
              : "Failed"
            : "Success",
        sentAt: new Date()
      });

      await record.save();
      res.send({ success: true, failed });
    };

    sendAllEmails();
  }).catch(function (error) {
    console.log(error);
    res.status(500).send({ success: false });
  });
});

// Get logs (sorted newest first)
app.get("/emaillogs", async (req, res) => {
  try {
    const logs = await EmailRecord.find().sort({ sentAt: -1 });
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch email logs" });
  }
});

app.listen(5000, function () {
  console.log("Server Started");
});
