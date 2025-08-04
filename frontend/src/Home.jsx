import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const Home = () => {
  const [msg, setmsg] = useState('');
  const [subject, setSubject] = useState('');
  const [status, setstatus] = useState(false);
  const [emailList, setEmailList] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);

  useEffect(() => {
    axios.get('https://bulkmail-sender.onrender.com/emaillogs')
      .then((res) => {
        setEmailLogs(res.data);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch email logs:", err);
      });
  }, []);

  const handlefile = (event) => {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith('.xlsx')) {
      alert("⚠️ Please upload a valid .xlsx file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const emails = parsed.flat().filter(email => typeof email === 'string');
      setEmailList(emails);
    };
    reader.readAsBinaryString(file);
  };

  const send = () => {
    if (!subject.trim()) {
      alert("⚠️ Please enter a subject.");
      return;
    }
    if (!msg.trim()) {
      alert("⚠️ Please enter a message.");
      return;
    }
    if (emailList.length === 0) {
      alert("⚠️ Please upload a valid Excel file with email addresses.");
      return;
    }

    setstatus(true);

    axios.post('https://bulkmail-sender.onrender.com/sendemail', {
      msg,
      subject,
      emailList,
    })
      .then((res) => {
        const failed = res.data.failed || [];

        let message = "✅ All Emails Sent Successfully";

        if (failed.length > 0) {
          message += `\n\n❌ Failed to send to:\n${failed.join("\n")}`;
        }

        alert(message);
        setstatus(false);
      })
      .catch((err) => {
        console.error("❌ Error while sending:", err);
        alert("Something went wrong while sending emails.");
        setstatus(false);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-400 text-white">
      <header className="text-center py-6 bg-blue-950 shadow-md">
        <h1 className="text-3xl font-bold tracking-wide">Bulk Mail Sender</h1>
        <p className="text-sm mt-2 text-gray-300">
          Send personalized messages to multiple recipients easily
        </p>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 bg-white text-black shadow-lg rounded-lg mt-10">
        <label htmlFor="subject" className="block text-lg font-semibold mb-2">
          Subject:
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter email subject"
          className="w-full p-3 border border-gray-400 rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label htmlFor="message" className="block text-lg font-semibold mb-2">
          Message:
        </label>
        <textarea
          id="message"
          value={msg}
          onChange={(e) => setmsg(e.target.value)}
          placeholder="Enter your email message here..."
          className="w-full h-32 p-3 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>

        <div className="mt-6">
          <label className="block text-lg font-semibold mb-2">
            Upload Excel File (.xlsx):
          </label>
          <input
            type="file"
            accept=".xlsx"
            onChange={handlefile}
            className="w-full border border-dashed border-blue-600 p-4 rounded-md bg-blue-50 cursor-pointer hover:bg-blue-100 transition"
          />
          <p className="text-sm mt-2 text-gray-600">
            Total Emails Detected: <span className="font-bold">{emailList.length}</span>
          </p>
        </div>

        <button
          onClick={send}
          disabled={status}
          className="mt-6 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded-md transition"
        >
          {status ? 'Sending...' : 'Send Emails'}
        </button>
      </main>

      <footer className="mt-16 text-center text-sm text-gray-300 py-4 bg-blue-950">
        © {new Date().getFullYear()} Bulk Mail App | Powered by React & Node.js
      </footer>
    </div>
  );
};

export default Home;
