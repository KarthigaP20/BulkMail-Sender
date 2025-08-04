import { useEffect, useState } from "react";
import axios from "axios";

const EmailLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = () => {
    axios
      .get("https://bulkmail-sender.onrender.com/emaillogs")
      .then((res) => {
        setLogs(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching email logs:", err);
        setLoading(false);
      });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;

    try {
      await axios.delete(`https://bulkmail-sender.onrender.com/emaillogs/${id}`);
      setLogs(logs.filter((log) => log._id !== id));
    } catch (err) {
      console.error("Error deleting log:", err);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString("en-GB");
  };

  const getStatus = (successList, failedList) => {
    if (failedList.length > 0) return "Partial Success";
    return "Success";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 mt-10">
      <h2 className="text-2xl font-bold text-center text-blue-800 mb-8">Email Logs</h2>

      {loading ? (
        <p className="text-center text-gray-600">Loading email logs...</p>
      ) : logs.length === 0 ? (
        <p className="text-center text-gray-600">No email logs found.</p>
      ) : (
        <div className="space-y-8">
          {logs.map((log) => {
            const successList = (log.success || "").split(",").map(s => s.trim()).filter(s => s);
            const failedList = (log.failed || "").split(",").map(f => f.trim()).filter(f => f);
            const status = getStatus(successList, failedList);

            return (
              <div
                key={log._id}
                className="bg-gray-50 p-5 rounded-lg shadow border text-sm sm:text-base relative"
              >
                <button
                  onClick={() => handleDelete(log._id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                >
                  Delete ✖
                </button>

                <p><span className="font-semibold">Sent At:</span> {formatDate(log.sentAt)}</p>
                <p><span className="font-semibold">Subject:</span> {log.subject}</p>
                <p><span className="font-semibold">Message:</span> {log.body}</p>
                <p><span className="font-semibold">Recipients:</span> {log.recipients}</p>

                {successList.length > 0 && (
                  <p className="text-green-700 font-medium">
                    ✅ Success: {successList.join(", ")}
                  </p>
                )}

                {failedList.length > 0 && (
                  <p className="text-red-600 font-medium">
                    ❌ Failed: {failedList.join(", ")}
                  </p>
                )}

                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={
                      status === "Success"
                        ? "text-green-700 font-bold"
                        : "text-yellow-600 font-bold"
                    }
                  >
                    {status}
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmailLogs;
