"use client";

import { useEffect, useState } from "react";
import { Flame, Beaker, Database, Download } from "lucide-react";

interface SensorData {
  id?: number;
  created_at?: string;
  ph: number;
  temp: number;
  tds: number;
}

export default function Home() {
  const [data, setData] = useState<SensorData[]>([]);
  const [latest, setLatest] = useState<SensorData>({ ph: 0, temp: 0, tds: 0 });
  const [isConnected, setIsConnected] = useState(false);

  const fetchData = async () => {
    try {
      // cache: 'no-store' agar browser tidak me-cache data lama
      const res = await fetch("/api/sensor", { cache: "no-store" });
      if (res.ok) {
        const result = await res.json();
        const sensorList = Array.isArray(result) ? result : result.data || [];
        
        if (sensorList.length > 0) {
          setData(sensorList);
          setLatest(sensorList[0]); // Ambil data paling baru
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    fetchData(); // Panggil pertama kali saat web dibuka

    // Set interval fetch setiap 5 detik (5000 ms)
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Fungsi untuk download data ke CSV
  const exportToCSV = () => {
    if (data.length === 0) return;
    const headers = "Waktu,pH,Suhu (C),Konsentrasi (PPM)\n";
    const rows = data
      .map(
        (item) =>
          `"${item.created_at || ""}",${item.ph},${item.temp},${item.tds}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data_sensor_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <main className="min-h-screen bg-[#0b131e] text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#111c2a] p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                Rancang Bangun Bioreaktor Pupuk Organik Cair (POC) Berbasis Internet of Things (IoT) Menggunakan Sirkulasi
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Sistem Pemantauan pH, Suhu, dan Konsentrasi Pupuk Cair Real-Time
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
            <span className="text-xs font-semibold tracking-wider text-slate-300">
              {isConnected ? "TERHUBUNG (ONLINE)" : "TERPUTUS (OFFLINE)"}
            </span>
          </div>
        </div>

        {/* Sensor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* pH Card */}
          <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>pH</span>
            </div>
            <div className="text-5xl font-black mt-4">
              {Number(latest.ph || 0).toFixed(2)}
            </div>
          </div>

          {/* Suhu Card */}
          <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Suhu Bioreaktor</span>
            </div>
            <div className="text-5xl font-black mt-4">
              {Number(latest.temp || 0).toFixed(1)} <span className="text-2xl font-bold">°C</span>
            </div>
          </div>

          {/* TDS / Konsentrasi Card */}
          <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
              <Beaker className="w-4 h-4 text-blue-500" />
              <span>Konsentrasi Nutrisi</span>
            </div>
            <div className="text-5xl font-black mt-4">
              {Math.round(latest.tds || 0)} <span className="text-2xl font-bold">ppm</span>
            </div>
          </div>
        </div>

        {/* Table Catatan Data */}
        <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-lg border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Catatan Data</h2>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition"
            >
              <Download className="w-4 h-4" />
              Ekspor CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4 rounded-l-xl">Waktu</th>
                  <th className="p-4">pH</th>
                  <th className="p-4">Suhu (°C)</th>
                  <th className="p-4 rounded-r-xl">Konsentrasi (PPM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {data.length > 0 ? (
                  data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        {row.created_at
                          ? new Date(row.created_at).toLocaleString("id-ID")
                          : "-"}
                      </td>
                      <td className="p-4 font-bold">{Number(row.ph).toFixed(2)}</td>
                      <td className="p-4">{Number(row.temp).toFixed(1)}</td>
                      <td className="p-4">{Math.round(row.tds)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 font-normal">
                      Belum ada data masuk dari ESP32
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}