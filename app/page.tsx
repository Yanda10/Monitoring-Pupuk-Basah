'use client';

import { useEffect, useState } from 'react';
import { 
  Download, 
  Clock, 
  Database, 
  XCircle, 
  Flame, 
  Beaker 
} from 'lucide-react';

// 1. Definisikan tipe data untuk TypeScript
interface SensorLog {
  id?: number;
  created_at: string;
  ph: number;
  temp: number;
  tds: number;
}

export default function Dashboard() {
  // 2. Tentukan tipe data pada useState
  const [logs, setLogs] = useState<SensorLog[]>([]);
  const [latest, setLatest] = useState<SensorLog>({ ph: 0, temp: 0, tds: 0, created_at: '' });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/sensor');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setLogs(data);
        setLatest(data[0]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const exportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Waktu', 'pH', 'Suhu (C)', 'Konsentrasi (ppm)'];
    const rows = logs.map((item) => [
      new Date(item.created_at).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      item.ph,
      item.temp,
      item.tds,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `bioreaktor_data_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0d131d] text-slate-100 font-sans p-4 md:p-8">
      {/* Header Utama */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Database size={24} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-100 leading-snug">
              Rancang Bangun Bioreaktor Pupuk Organik Cair (POC) Berbasis Internet of Things (IoT) Menggunakan Sirkulasi
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Sistem Pemantauan pH, Suhu, dan Konsentrasi Pupuk Cair Real-Time
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          TERHUBUNG (ONLINE)
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto mt-6 space-y-6">
        {/* Ringkasan Parameter (3 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card pH */}
          <div className="bg-white text-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <XCircle size={18} className="text-emerald-500" />
              pH
            </div>
            <div className="text-4xl font-extrabold text-slate-900 mt-4 mb-2">
              {Number(latest.ph).toFixed(2)}
            </div>
          </div>

          {/* Card Suhu */}
          <div className="bg-white text-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <Flame size={18} className="text-amber-500" />
              Suhu Bioreaktor
            </div>
            <div className="text-4xl font-extrabold text-slate-900 mt-4 mb-2">
              {Number(latest.temp).toFixed(1)}{' '}
              <span className="text-2xl font-semibold">°C</span>
            </div>
          </div>

          {/* Card Konsentrasi */}
          <div className="bg-white text-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <Beaker size={18} className="text-blue-500" />
              Konsentrasi Nutrisi
            </div>
            <div className="text-4xl font-extrabold text-slate-900 mt-4 mb-2">
              {Math.round(latest.tds)}{' '}
              <span className="text-2xl font-semibold">ppm</span>
            </div>
          </div>
        </div>

        {/* Tabel Catatan Data */}
        <div className="bg-white text-slate-800 rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">Catatan Data</h2>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition"
            >
              <Download size={16} />
              Ekspor CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-500 text-xs font-semibold uppercase tracking-wider rounded-lg">
                  <th className="p-3 rounded-l-lg">Waktu</th>
                  <th className="p-3">pH</th>
                  <th className="p-3">Suhu (°C)</th>
                  <th className="p-3 rounded-r-lg">Konsentrasi (ppm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium">
                {logs.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/80">
                    <td className="p-3 flex items-center gap-2 text-slate-700">
                      <Clock size={16} className="text-slate-400" />
                      {new Date(item.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {Number(item.ph).toFixed(2)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        {Number(item.temp).toFixed(1)} °C
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {Math.round(item.tds)} ppm
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}