'use client'; // Wajib karena kita melakukan koneksi dari sisi browser user

import { useEffect, useState } from 'react';
import mqtt from 'mqtt';

// Karena Vercel menggunakan HTTPS, wajib gunakan protokol Secure WebSocket (wss)
const MQTT_BROKER = 'wss://broker.emqx.io:8084/mqtt'; 

export default function Home() {
  const [ph, setPh] = useState('0.00');
  const [suhu, setSuhu] = useState('0.00');
  const [status, setStatus] = useState('Menghubungkan ke Broker...');

  useEffect(() => {
    // 1. Lakukan koneksi ke MQTT Broker
    const client = mqtt.connect(MQTT_BROKER, {
      clientId: 'vercel_web_' + Math.random().toString(16).substr(2, 8),
    });

    client.on('connect', () => {
      setStatus('Terhubung (Real-time)');
      // 2. Subscribe ke topik yang sama dengan ESP32
      client.subscribe('kelompokx/monitor/ph');
      client.subscribe('kelompokx/monitor/suhu');
    });

    client.on('error', (err) => {
      console.error('MQTT Error: ', err);
      setStatus('Koneksi Gagal');
      client.end();
    });

    // 3. Terima data masuk
    client.on('message', (topic, message) => {
      const payload = message.toString();
      if (topic === 'kelompokx/monitor/ph') {
        setPh(payload);
      } else if (topic === 'kelompokx/monitor/suhu') {
        setSuhu(payload);
      }
    });

    // Putus koneksi otomatis jika tab browser ditutup
    return () => {
      if (client) client.end();
    };
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1>Dashboard Monitoring Air IoT</h1>
      <p>Status Server: <strong>{status}</strong></p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
        {/* Box Nilai pH */}
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '200px' }}>
          <h3>Nilai pH</h3>
          <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#0070f3', margin: '10px 0' }}>{ph}</p>
        </div>

        {/* Box Nilai Suhu */}
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '200px' }}>
          <h3>Suhu Air</h3>
          <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#ff0000', margin: '10px 0' }}>{suhu}°C</p>
        </div>
      </div>
    </div>
  );
}