import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function App() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  // Fetch last 5 uploads
  const fetchHistory = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/history/");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.log("History fetch failed");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Upload CSV
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/upload/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setSummary(data);
      setError("");
      fetchHistory();
    } catch {
      setError("Backend error or server not running");
    }
  };

  // Download PDF (NO PAGE REDIRECT)
  const downloadPDF = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/download-pdf/"
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "equipment_report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to download PDF");
    }
  };

  const chartData =
    summary && {
      labels: Object.keys(summary.type_distribution),
      datasets: [
        {
          label: "Equipment Count",
          data: Object.values(summary.type_distribution),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
        },
      ],
    };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>🧪 Chemical Equipment Parameter Visualizer</h1>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <br /><br />
      <button onClick={handleUpload}>Upload CSV</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {summary && (
        <>
          <h2>📊 Summary</h2>
          <p>Total Equipment: {summary.total_equipment}</p>
          <p>Avg Flowrate: {summary.avg_flowrate}</p>
          <p>Avg Pressure: {summary.avg_pressure}</p>
          <p>Avg Temperature: {summary.avg_temperature}</p>

          <button onClick={downloadPDF}>
            📄 Download PDF Report
          </button>

          <h2 style={{ marginTop: "30px" }}>
            🔧 Equipment Type Distribution
          </h2>
          <div style={{ width: "500px" }}>
            <Bar data={chartData} />
          </div>
        </>
      )}

      <h2 style={{ marginTop: "40px" }}>
        🕒 Upload History (Last 5)
      </h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Uploaded At</th>
            <th>Total Equipment</th>
            <th>Avg Flowrate</th>
            <th>Avg Pressure</th>
            <th>Avg Temperature</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h, i) => (
            <tr key={i}>
              <td>{new Date(h.uploaded_at).toLocaleString()}</td>
              <td>{h.total_equipment}</td>
              <td>{h.avg_flowrate}</td>
              <td>{h.avg_pressure}</td>
              <td>{h.avg_temperature}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
