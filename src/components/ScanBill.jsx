import React, { useState, useRef } from 'react';
import AddExpense from './AddExpense';

function ScanBill({ user, onComplete }) {
  const [file, setFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleScan = () => {
    if (!file) return;
    setIsScanning(true);

    // Mocking an AI vision API response
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        description: `Receipt from ${new Date().toLocaleDateString()}`,
        amount: (Math.random() * 100 + 20).toFixed(2)
      });
    }, 2500);
  };

  if (scanResult) {
    return <AddExpense user={user} onComplete={onComplete} initialData={scanResult} />;
  }

  return (
    <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '1rem' }} className="text-gradient">
        AI Bill Scanner
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Upload a picture of your receipt. Our AI will extract the total amount and generate the expense automatically!
      </p>

      <div 
        style={{ 
          border: '2px dashed var(--aurora-3)', 
          borderRadius: '16px', 
          padding: '3rem 2rem',
          background: 'rgba(0, 240, 255, 0.05)',
          marginBottom: '2rem',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        onClick={() => !isScanning && fileInputRef.current.click()}
      >
        <input 
          type="file" 
          accept="image/*" 
          style={{ display: 'none' }} 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        {file ? (
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
            <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{file.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ready to scan</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
            <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>Click to upload receipt</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Supports JPG, PNG</div>
          </div>
        )}
      </div>

      <button 
        className={isScanning ? "btn btn-outline" : "btn btn-scan"} 
        style={{ 
          width: '100%', 
          padding: '16px', 
          fontSize: '1.1rem',
          pointerEvents: isScanning || !file ? 'none' : 'auto',
          opacity: !file ? 0.5 : 1
        }}
        onClick={handleScan}
      >
        {isScanning ? '✨ Analyzing Receipt...' : 'Scan Now'}
      </button>

      {isScanning && (
        <div style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>
          <div style={{ 
            width: '100%', 
            height: '4px', 
            background: 'var(--bg-panel)', 
            borderRadius: '2px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '50%',
              background: 'linear-gradient(to right, var(--aurora-3), var(--aurora-2))',
              animation: 'slide 1.5s infinite linear'
            }} />
          </div>
          <style>{`
            @keyframes slide {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(200%); }
            }
          `}</style>
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Extracting line items and prices using AI...</div>
        </div>
      )}
    </div>
  );
}

export default ScanBill;
