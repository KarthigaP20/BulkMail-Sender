import { useState } from "react";
import Home from "./Home";
import EmailLogs from "./EmailLogs";

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-gray-800">
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold text-blue-600">Email Dashboard</h1>
        <div className="space-x-4">
          <button
            onClick={() => setPage("home")}
            className={`px-4 py-2 rounded ${page === "home" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Send Email
          </button>
          <button
            onClick={() => setPage("logs")}
            className={`px-4 py-2 rounded ${page === "logs" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Email Logs
          </button>
        </div>
      </nav>

      <div className="p-6">
        {page === "home" && <Home />}
        {page === "logs" && <EmailLogs />}
      </div>
    </div>
  );
}
