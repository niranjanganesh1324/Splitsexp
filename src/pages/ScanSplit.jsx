import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { addExpense, getGroups } from '../services/db';
import Tesseract from 'tesseract.js';

function ScanSplit({ user }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Scan & OCR States
  const [title, setTitle] = useState("Receipt Scan");
  const [totalAmount, setTotalAmount] = useState(0.00);
  const [scannedItems, setScannedItems] = useState([]);
  const [imageSrc, setImageSrc] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState("");
  const [ocrError, setOcrError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  // Camera Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    if (user) {
      getGroups(user.id)
        .then(data => {
          setGroups(data);
          if (data.length > 0) {
            setSelectedGroup(data[0]); // default to first group
          }
        })
        .catch(err => console.error("Error loading groups in ScanSplit:", err));
    }
  }, [user]);

  // Custom Split States
  const [splitMode, setSplitMode] = useState('equal'); // 'equal' | 'exact' | 'percentage'
  const [exactAmounts, setExactAmounts] = useState({}); // { [memberId]: string }
  const [percentages, setPercentages] = useState({}); // { [memberId]: string }

  // Reset custom splits when group changes
  useEffect(() => {
    setSplitMode('equal');
    setExactAmounts({});
    setPercentages({});
  }, [selectedGroup]);

  // Recalculate when totalAmount or selectedGroup changes
  useEffect(() => {
    if (!selectedGroup) return;
    if (splitMode === 'exact') {
      const baseShare = totalAmount / selectedGroup.members.length;
      const initialAmounts = {};
      selectedGroup.members.forEach(m => {
        initialAmounts[m.id] = baseShare.toFixed(2);
      });
      setExactAmounts(initialAmounts);
    } else if (splitMode === 'percentage') {
      const basePercent = 100 / selectedGroup.members.length;
      const initialPercents = {};
      selectedGroup.members.forEach(m => {
        initialPercents[m.id] = basePercent.toFixed(1);
      });
      setPercentages(initialPercents);
    }
  }, [totalAmount, selectedGroup]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const numMembers = selectedGroup ? selectedGroup.members.length : 0;
  const splitAmount = numMembers > 0 ? totalAmount / numMembers : 0;

  // Validation logic
  const sumExact = Object.values(exactAmounts).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
  const diffExact = Math.abs(sumExact - totalAmount);
  const isExactValid = diffExact < 0.01;

  const sumPercent = Object.values(percentages).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
  const diffPercent = Math.abs(sumPercent - 100);
  const isPercentValid = diffPercent < 0.2; // tolerance for 33.3% * 3 = 99.9%

  const handleSwitchSplitMode = (mode) => {
    setSplitMode(mode);
    if (!selectedGroup) return;

    if (mode === 'exact') {
      const baseShare = totalAmount / selectedGroup.members.length;
      const initialAmounts = {};
      selectedGroup.members.forEach(m => {
        initialAmounts[m.id] = baseShare.toFixed(2);
      });
      setExactAmounts(initialAmounts);
    } else if (mode === 'percentage') {
      const basePercent = 100 / selectedGroup.members.length;
      const initialPercents = {};
      selectedGroup.members.forEach(m => {
        initialPercents[m.id] = basePercent.toFixed(1);
      });
      setPercentages(initialPercents);
    }
  };

  const getUserShare = () => {
    if (!selectedGroup) return totalAmount / 3;
    if (splitMode === 'equal') {
      return splitAmount;
    }
    if (splitMode === 'exact') {
      return parseFloat(exactAmounts[user.id]) || 0;
    }
    if (splitMode === 'percentage') {
      const pct = parseFloat(percentages[user.id]) || 0;
      return totalAmount * (pct / 100);
    }
    return 0;
  };

  const myShareAmount = getUserShare();

  // Camera handlers
  const handleStartCamera = async () => {
    setIsCameraActive(true);
    setOcrError(null);
    setImageSrc(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setOcrError("Could not start live camera. Please use the device photo selector or drag/drop option.");
      setIsCameraActive(false);
    }
  };

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImageSrc(dataUrl);
      
      // Stop stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setIsCameraActive(false);
    }
  };

  const handleStopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // Upload/File Selection handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setImageSrc(null);
    setOcrProgress(0);
    setOcrStatus("");
    setOcrError(null);
    setScannedItems([]);
    setTotalAmount(0.00);
  };

  const handleAddItem = (name, price) => {
    const parsedPrice = parseFloat(price) || 0;
    const newItems = [...scannedItems, { name, price: parsedPrice.toFixed(2) }];
    setScannedItems(newItems);
    
    // Recalculate total amount as sum of all items
    const newTotal = newItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    setTotalAmount(parseFloat(newTotal.toFixed(2)));
    setIsAddingItem(false);
  };

  const handleDeleteItem = (indexToDelete) => {
    const newItems = scannedItems.filter((_, idx) => idx !== indexToDelete);
    setScannedItems(newItems);
    
    // Recalculate total amount as sum of all items
    const newTotal = newItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    setTotalAmount(parseFloat(newTotal.toFixed(2)));
  };

  const handleUpdateItemName = (index, newName) => {
    const newItems = [...scannedItems];
    newItems[index].name = newName;
    setScannedItems(newItems);
  };

  const handleUpdateItemPrice = (index, newPrice) => {
    const newItems = [...scannedItems];
    newItems[index].price = newPrice;
    setScannedItems(newItems);
    
    // Recalculate total amount as sum of all items
    const newTotal = newItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    setTotalAmount(parseFloat(newTotal.toFixed(2)));
  };

  const handleBlurPrice = (index, value) => {
    const parsed = parseFloat(value) || 0;
    const newItems = [...scannedItems];
    newItems[index].price = parsed.toFixed(2);
    setScannedItems(newItems);
  };

  // Image Preprocessing Helper to resize and prepare image for OCR
  const preprocessImage = (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Scale down image if it's too large to improve performance and quality
        const maxDim = 1200;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        
        try {
          resolve(canvas.toDataURL('image/jpeg', 0.95));
        } catch (e) {
          console.error("Canvas export error:", e);
          resolve(src); // Fallback to original image if export fails
        }
      };
      img.onerror = () => {
        resolve(src);
      };
      img.src = src;
    });
  };

  // OCR Processing and Extraction
  const extractItemsAndTotal = (text) => {
    const lines = text.split('\n');
    const items = [];
    let detectedTotal = 0;
    
    // Keywords
    const totalKeywords = /total|grand\s*total|amount\s*due|net\s*total|balance|sum/i;
    const subtotalKeywords = /subtotal|sub\s*total/i;
    const taxKeywords = /tax|gst|vat/i;
    const headerKeywords = /item|qty|price|amount|desc|no\./i;

    let previousUnmatchedLine = "";

    for (let rawLine of lines) {
      // Clean up OCR line: normalize spaces and common decimal formats
      let line = rawLine.trim()
        .replace(/\s+/g, ' ')
        .replace(/(\d+)\s*[\.,]\s*(\d{1,2})/g, '$1.$2')
        .replace(/(\d+)\s+(\d{1,2})\s*$/g, '$1.$2');
      
      if (!line) continue;
      
      // Match price-like string with 1 or 2 decimal digits at the end of the line
      const priceRegex = /[:\-\$]?\s*([0-9]+[\.,][0-9SOsoIil]{1,2})\s*([^0-9]*)$/;
      const match = line.match(priceRegex);
      
      if (match) {
        // Correct OCR characters back to numbers in the price part
        let priceStr = match[1]
          .replace(/O|o/g, '0')
          .replace(/S|s/g, '5')
          .replace(/I|i|l/g, '1')
          .replace(',', '.');
          
        const priceVal = parseFloat(priceStr);
        if (isNaN(priceVal)) continue;

        // Slice up to the start of the matched price
        let namePart = line.substring(0, match.index).trim();

        // Prepend previous unmatched line if applicable
        if (
          previousUnmatchedLine &&
          previousUnmatchedLine.length > 2 &&
          !totalKeywords.test(previousUnmatchedLine) &&
          !headerKeywords.test(previousUnmatchedLine)
        ) {
          namePart = previousUnmatchedLine + " " + namePart;
        }
        previousUnmatchedLine = ""; // Reset

        // Clean up trailing garbage, unit price, quantity, and leading numbers from item name
        let cleanedName = namePart
          .replace(/[^a-zA-Z0-9)]+$/, '') // strip trailing symbols
          .replace(/\s+[:\-\$]?\s*\d+[\.,]\d{1,2}\s*$/, '') // strip unit price
          .replace(/\s+\d+\s*$/, '') // strip quantity
          .replace(/^\d+\s+/, '') // strip leading item numbers
          .trim();
          
        if (totalKeywords.test(line)) {
          if (priceVal > detectedTotal) {
            detectedTotal = priceVal;
          }
        } else if (subtotalKeywords.test(line) || taxKeywords.test(line)) {
          // Skip subtotal / tax lines
        } else if (cleanedName.length > 2) {
          items.push({
            name: cleanedName,
            price: priceStr
          });
        }
      } else {
        // If line has no price, keep it as a previous line description candidate if it's not a header/total/tax
        const trimmed = rawLine.trim();
        if (
          trimmed.length > 2 &&
          !totalKeywords.test(trimmed) &&
          !subtotalKeywords.test(trimmed) &&
          !taxKeywords.test(trimmed) &&
          !headerKeywords.test(trimmed)
        ) {
          previousUnmatchedLine = trimmed;
        } else {
          previousUnmatchedLine = "";
        }
      }
    }
    
    // Fallback: use highest price if no total keyword matches or to verify against OCR inaccuracies
    const prices = items.map(i => parseFloat(i.price) || 0);
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    
    let fallbackUsed = false;
    if (maxPrice > detectedTotal) {
      detectedTotal = maxPrice;
      fallbackUsed = true;
    }
    
    // Only remove the max price item if we used it as fallback for total amount
    if (fallbackUsed) {
      const totalItemIndex = items.findIndex(i => (parseFloat(i.price) || 0) === detectedTotal);
      if (totalItemIndex !== -1) {
        items.splice(totalItemIndex, 1);
      }
    }
    
    return { items, total: detectedTotal };
  };

  const handleScanReceipt = async () => {
    if (!imageSrc) return;
    setOcrProgress(1);
    setOcrStatus("Preprocessing image for accuracy...");
    setOcrError(null);

    try {
      // Step 1: Preprocess the image
      const processedSrc = await preprocessImage(imageSrc);
      
      // Step 2: Run Tesseract on processed high-contrast image
      setOcrStatus("Initializing OCR engine...");
      const result = await Tesseract.recognize(
        processedSrc,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setOcrProgress(m.progress * 100);
              setOcrStatus(`Extracting bill details...`);
            } else {
              setOcrStatus(m.status.charAt(0).toUpperCase() + m.status.slice(1) + "...");
            }
          },
          workerPath: '/tesseract/worker.min.js',
          corePath: '/tesseract',
          workerBlobURL: false, // Bypasses browser Content Security Policy (CSP) limitations on Blob workers (safe now since hosted on same-origin)
          parameters: {
            tessedit_pageseg_mode: '4', // Assume a single column of text (best for columns layout like bills)
            tessedit_char_whitelist: '0123456789.,$+-/ \n\rABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#()&[]:%'
          }
        }
      );

      const text = result.data.text;
      const { items, total } = extractItemsAndTotal(text);
      
      setScannedItems(items);
      setTotalAmount(total);
      setOcrProgress(100);
      setOcrStatus("Scan complete!");
      
      // Auto fill title if we can detect vendor name on line 1 or 2
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
      if (lines.length > 0) {
        const possibleVendor = lines[0].slice(0, 30);
        if (!/total|date|invoice|receipt/i.test(possibleVendor)) {
          setTitle(`Scan: ${possibleVendor}`);
        } else {
          setTitle("Scanned Receipt");
        }
      } else {
        setTitle("Scanned Receipt");
      }
      
    } catch (err) {
      console.error("OCR scanning error:", err);
      setOcrError("Failed to parse the receipt. Please enter the amount manually or try another image.");
      setOcrProgress(0);
    }
  };

  const handleConfirm = async () => {
    if (saving) return;

    if (selectedGroup) {
      if (splitMode === 'exact' && !isExactValid) {
        console.error("The sum of individual amounts does not match the total amount.");
        return;
      }
      if (splitMode === 'percentage' && !isPercentValid) {
        console.error("The percentages must sum up to 100%.");
        return;
      }
    }

    setSaving(true);

    let participants = [];
    if (selectedGroup) {
      if (splitMode === 'equal') {
        participants = selectedGroup.members.map(m => ({
          id: m.id,
          name: m.name,
          amount: splitAmount
        }));
      } else if (splitMode === 'exact') {
        participants = selectedGroup.members.map(m => ({
          id: m.id,
          name: m.name,
          amount: parseFloat(exactAmounts[m.id]) || 0
        }));
      } else if (splitMode === 'percentage') {
        participants = selectedGroup.members.map(m => ({
          id: m.id,
          name: m.name,
          amount: totalAmount * ((parseFloat(percentages[m.id]) || 0) / 100)
        }));
      }
    } else {
      participants = [
        { id: user.id, name: user.name, amount: totalAmount / 3 },
        { id: "mock-friend-1", name: "Sarah Ross", amount: totalAmount / 3 },
        { id: "mock-friend-2", name: "Mike Jenkins", amount: totalAmount / 3 }
      ];
    }

    try {
      await addExpense({
        title: title || "Scanned Receipt",
        amount: totalAmount,
        paidBy: user.id,
        group: selectedGroup ? selectedGroup.name : "No Group",
        participants
      });
      navigate('/dashboard');
    } catch (err) {
      console.error("Error creating split:", err);
      setSaving(false);
    }
  };

  return (
    <main className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-lg">
      <div className="mb-md flex flex-col md:flex-row md:items-center justify-between gap-sm">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Scan Receipt</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Upload a receipt or take a live photo to automatically analyze and split the bill.</p>
        </div>
        <Link 
          to="/manual" 
          className="flex items-center gap-xs text-primary font-label-md hover:underline"
        >
          <span className="material-symbols-outlined text-[20px]">edit_note</span>
          Or enter manually
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md items-start">
        {/* Left: Bill Scanning/Upload Column */}
        <section className="lg:col-span-5 space-y-md">
          <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant">
            <div className="flex items-center justify-between mb-md">
              <h2 className="font-headline-md text-headline-md text-on-surface">Receipt Scan</h2>
              <span className="text-primary material-symbols-outlined text-[32px]">camera_enhance</span>
            </div>

            {/* Hidden Input Files */}
            <input 
              type="file" 
              accept="image/*" 
              id="file-upload" 
              className="hidden" 
              onChange={handleFileChange} 
            />
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              id="camera-upload" 
              className="hidden" 
              onChange={handleFileChange} 
            />

            {/* Live Camera Viewfinder */}
            {isCameraActive ? (
              <div className="relative aspect-[3/4] bg-black rounded-lg overflow-hidden border border-outline-variant flex flex-col justify-between">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover" 
                  playsInline 
                  muted 
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-md z-10">
                  <button 
                    onClick={handleCapturePhoto} 
                    className="p-sm bg-primary text-on-primary rounded-full hover:opacity-90 transition-opacity flex items-center justify-center shadow-lg"
                    title="Capture Photo"
                  >
                    <span className="material-symbols-outlined text-[28px]">photo_camera</span>
                  </button>
                  <button 
                    onClick={handleStopCamera} 
                    className="p-sm bg-error text-on-error rounded-full hover:opacity-90 transition-opacity flex items-center justify-center shadow-lg"
                    title="Cancel"
                  >
                    <span className="material-symbols-outlined text-[28px]">close</span>
                  </button>
                </div>
              </div>
            ) : imageSrc ? (
              /* Image Preview View */
              <div className="relative aspect-[3/4] bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant">
                <img 
                  src={imageSrc} 
                  alt="Scanned Receipt Preview" 
                  className="w-full h-full object-contain" 
                />
                <button 
                  onClick={handleRetake} 
                  className="absolute top-2 right-2 p-xs bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                  title="Clear Image"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            ) : (
              /* Drag and Drop File Selection View */
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload').click()}
                className={`relative group aspect-[3/4] bg-surface-container-low rounded-lg overflow-hidden border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer ${
                  isDragOver ? 'border-primary bg-primary-container/10' : 'border-outline-variant hover:border-primary'
                }`}
              >
                <div className="text-center p-lg pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[48px] mb-base">cloud_upload</span>
                  <p className="font-label-md text-label-md text-on-surface-variant">Drag and drop or click to upload receipt</p>
                  <p className="font-body-sm text-body-sm text-outline mt-xs">PNG, JPG, JPEG or WebP files</p>
                </div>
              </div>
            )}

            {/* Controls */}
            {!isCameraActive && (
              <div className="mt-md flex flex-col gap-sm">
                {imageSrc ? (
                  <div className="flex gap-base">
                    <button 
                      onClick={handleScanReceipt} 
                      disabled={ocrProgress > 0 && ocrProgress < 100}
                      className="flex-grow py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-xs disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[20px]">document_scanner</span>
                      {ocrProgress > 0 && ocrProgress < 100 ? "Scanning..." : "Scan Receipt"}
                    </button>
                    <button 
                      onClick={handleRetake} 
                      className="px-md py-sm border border-outline-variant text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-xs">
                    <div className="flex gap-xs">
                      <button 
                        onClick={handleStartCamera} 
                        className="flex-1 py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-xs"
                      >
                        <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                        Live Camera
                      </button>
                      <button 
                        onClick={() => document.getElementById('camera-upload').click()} 
                        className="flex-1 py-sm border border-outline text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center justify-center gap-xs"
                      >
                        <span className="material-symbols-outlined text-[20px]">smartphone</span>
                        Device Cam
                      </button>
                    </div>
                    <button 
                      onClick={() => document.getElementById('file-upload').click()} 
                      className="w-full py-sm border border-outline-variant text-on-surface rounded-lg font-label-sm text-label-sm hover:bg-surface-container-high transition-colors"
                    >
                      Select File from Gallery
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* OCR Progress display */}
            {ocrProgress > 0 && ocrProgress < 100 && (
              <div className="mt-md p-sm bg-primary-container/20 border border-primary/20 rounded-lg">
                <div className="flex justify-between font-label-sm text-label-sm text-primary mb-xs">
                  <span>{ocrStatus}</span>
                  <span>{Math.round(ocrProgress)}%</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300" 
                    style={{ width: `${ocrProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* OCR Error Display */}
            {ocrError && (
              <div className="mt-md p-sm bg-error-container text-on-error-container border border-error/20 rounded-lg flex items-center gap-xs font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-error text-[18px]">error</span>
                <span>{ocrError}</span>
              </div>
            )}
          </div>
          
          {/* Group Selector */}
          <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant">
            <h2 className="font-label-md text-label-md text-on-surface-variant mb-sm">Assign to Group</h2>
            {groups.length > 0 ? (
              <div className="relative">
                <select 
                  className="w-full p-sm border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none font-body-md text-body-md"
                  value={selectedGroup ? selectedGroup.id : ""}
                  onChange={e => {
                    const g = groups.find(x => x.id === e.target.value);
                    setSelectedGroup(g || null);
                  }}
                >
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.members.length} members)</option>
                  ))}
                  <option value="">No Group (Custom Split)</option>
                </select>
                <span className="material-symbols-outlined text-outline absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
              </div>
            ) : (
              <div className="p-sm border border-outline-variant border-dashed rounded-lg text-center text-body-sm text-outline">
                No groups created yet. Create a group first under Group Management!
              </div>
            )}
          </div>
        </section>

        {/* Right: Itemized List and Split Logic */}
        <section className="lg:col-span-7 space-y-md">
          <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant overflow-hidden">
            
            {/* Title & Total Review Block */}
            <div className="p-md border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-md">
              <div className="flex-grow">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Analysis Result</span>
                <input 
                  type="text" 
                  className="w-full mt-xs p-xs border-b border-dashed border-outline hover:border-primary focus:border-primary outline-none font-headline-md text-headline-md text-on-surface bg-transparent"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Expense Title (e.g. Walmart Run)"
                />
              </div>
              <div className="text-left sm:text-right flex flex-col sm:items-end">
                <span className="font-label-sm text-label-sm text-outline">Total Amount ($)</span>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-32 mt-xs p-xs text-left sm:text-right font-headline-md text-headline-md text-primary bg-transparent border-b border-dashed border-primary hover:border-primary/80 focus:border-primary outline-none"
                  value={totalAmount === 0 ? "" : totalAmount}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    setTotalAmount(val);
                  }}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            {/* Scanned Items Header */}
            <div className="p-sm bg-surface-container-low border-b border-outline-variant">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Scanned Items Breakdown</span>
            </div>

            {/* Item List */}
            <div className="divide-y divide-outline-variant max-h-[300px] overflow-y-auto">
              {scannedItems.length > 0 ? (
                scannedItems.map((item, idx) => (
                  <div key={idx} className="p-sm flex items-center justify-between hover:bg-surface-container-low transition-colors gap-xs">
                    <input 
                      type="text"
                      className="flex-grow p-xs font-label-md text-label-md text-on-surface bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary focus:bg-surface-container-lowest outline-none rounded transition-all font-semibold"
                      value={item.name}
                      onChange={e => handleUpdateItemName(idx, e.target.value)}
                      placeholder="Item name"
                    />
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-on-surface-variant font-label-sm font-semibold">$</span>
                      <input 
                        type="text"
                        className="w-20 p-xs font-label-md text-label-md text-on-surface bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary focus:bg-surface-container-lowest outline-none rounded text-right transition-all font-semibold"
                        value={item.price}
                        onChange={e => handleUpdateItemPrice(idx, e.target.value)}
                        onBlur={e => handleBlurPrice(idx, e.target.value)}
                        placeholder="0.00"
                      />
                      <button 
                        onClick={() => handleDeleteItem(idx)}
                        className="text-error opacity-60 hover:opacity-100 transition-opacity flex items-center justify-center bg-transparent border-none cursor-pointer p-xs"
                        title="Delete item"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-lg text-center text-outline text-body-sm">
                  {ocrProgress > 0 && ocrProgress < 100 ? (
                    <span>Extracting items from receipt...</span>
                  ) : (
                    <span>No items scanned. Upload/capture a receipt to automatically parse items.</span>
                  )}
                </div>
              )}

              {/* Add Item form inside list */}
              {isAddingItem && (
                <div className="p-sm bg-surface-container-low flex items-center gap-xs border-t border-outline-variant">
                  <input 
                    type="text" 
                    placeholder="Item name"
                    className="flex-grow p-xs border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-body-sm outline-none focus:border-primary"
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                  />
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    className="w-20 p-xs border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-body-sm text-right outline-none focus:border-primary"
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(e.target.value)}
                  />
                  <button 
                    onClick={() => {
                      if (newItemName.trim()) {
                        handleAddItem(newItemName.trim(), newItemPrice);
                        setNewItemName("");
                        setNewItemPrice("");
                      }
                    }}
                    className="p-xs bg-primary text-on-primary rounded hover:opacity-90 transition-opacity flex items-center justify-center shrink-0 border-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-white">check</span>
                  </button>
                  <button 
                    onClick={() => {
                      setIsAddingItem(false);
                      setNewItemName("");
                      setNewItemPrice("");
                    }}
                    className="p-xs border border-outline-variant text-on-surface rounded hover:bg-surface-container-high transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              )}
            </div>

            {/* Add Item Button */}
            {!isAddingItem && (
              <button 
                onClick={() => setIsAddingItem(true)} 
                className="w-full py-sm text-primary font-label-sm hover:bg-surface-container-high transition-colors flex items-center justify-center gap-xs border-t border-outline-variant bg-transparent border-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Item
              </button>
            )}

            {/* Split Mode Selector (only if group selected) */}
            {selectedGroup && (
              <>
                <div className="p-sm bg-surface-container border-t border-b border-outline-variant flex flex-col sm:flex-row gap-sm items-center justify-between">
                  <span className="font-label-md text-on-surface-variant">Split Mode</span>
                  <div className="flex bg-surface-container-lowest rounded-lg p-xs border border-outline-variant w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleSwitchSplitMode('equal')}
                      className={`flex-1 sm:flex-none px-md py-[6px] rounded-md font-label-sm text-label-sm transition-all ${splitMode === 'equal' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                    >
                      Equally
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchSplitMode('exact')}
                      className={`flex-1 sm:flex-none px-md py-[6px] rounded-md font-label-sm text-label-sm transition-all ${splitMode === 'exact' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                    >
                      Exact
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchSplitMode('percentage')}
                      className={`flex-1 sm:flex-none px-md py-[6px] rounded-md font-label-sm text-label-sm transition-all ${splitMode === 'percentage' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                    >
                      Percent
                    </button>
                  </div>
                </div>

                <div className="p-sm bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between">
                  <span className="font-body-sm text-outline">
                    {splitMode === 'equal' && "Splitting equally"}
                    {splitMode === 'exact' && "Splitting by exact amounts"}
                    {splitMode === 'percentage' && "Splitting by percentage share"}
                    {" in "}
                    <span className="font-semibold text-on-surface">{selectedGroup.name}</span>
                  </span>
                  <span className="font-label-sm bg-primary-container text-on-primary-container px-xs py-[2px] rounded-full border border-primary/10">
                    {numMembers} members
                  </span>
                </div>

                <div className="divide-y divide-outline-variant max-h-[250px] overflow-y-auto">
                  {selectedGroup.members.map((member, index) => {
                    const isUser = member.id === user.id;
                    const computedShare = splitMode === 'percentage' 
                      ? totalAmount * ((parseFloat(percentages[member.id]) || 0) / 100)
                      : splitMode === 'exact'
                        ? parseFloat(exactAmounts[member.id]) || 0
                        : splitAmount;

                    return (
                      <div key={member.id || index} className="p-md flex items-center justify-between hover:bg-surface-container-low transition-colors">
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-body-md text-on-surface font-semibold">{member.name}</span>
                            {isUser && <span className="text-body-xs text-outline ml-xs">(You Paid)</span>}
                            {splitMode === 'percentage' && (
                              <p className="text-body-sm text-outline">
                                Share: ${computedShare.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>

                        {splitMode === 'equal' && (
                          <span className="font-label-md text-label-md text-on-surface">
                            ${splitAmount.toFixed(2)}
                          </span>
                        )}

                        {splitMode === 'exact' && (
                          <div className="flex items-center gap-xs">
                            <span className="text-on-surface-variant font-label-sm font-semibold">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="w-24 px-xs py-xs text-right border border-outline-variant rounded-md bg-surface-container-lowest focus:ring-1 focus:ring-primary focus:border-primary outline-none font-body-md"
                              value={exactAmounts[member.id] || ''}
                              onChange={(e) => {
                                setExactAmounts(prev => ({
                                  ...prev,
                                  [member.id]: e.target.value
                                }));
                              }}
                            />
                          </div>
                        )}

                        {splitMode === 'percentage' && (
                          <div className="flex items-center gap-xs">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              className="w-20 px-xs py-xs text-right border border-outline-variant rounded-md bg-surface-container-lowest focus:ring-1 focus:ring-primary focus:border-primary outline-none font-body-md"
                              value={percentages[member.id] || ''}
                              onChange={(e) => {
                                setPercentages(prev => ({
                                  ...prev,
                                  [member.id]: e.target.value
                                }));
                              }}
                            />
                            <span className="text-on-surface-variant font-label-sm font-semibold">%</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {splitMode !== 'equal' && (
                  <div className="p-md bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
                    {splitMode === 'exact' ? (
                      isExactValid ? (
                        <div className="flex items-center gap-xs text-secondary font-label-sm">
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          Total matches: ${sumExact.toFixed(2)} / ${totalAmount.toFixed(2)}
                        </div>
                      ) : (
                        <div className="flex items-center gap-xs text-error font-label-sm">
                          <span className="material-symbols-outlined text-[18px]">warning</span>
                          Total mismatch: Sum is ${sumExact.toFixed(2)} (should be ${totalAmount.toFixed(2)})
                        </div>
                      )
                    ) : (
                      isPercentValid ? (
                        <div className="flex items-center gap-xs text-secondary font-label-sm">
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          Total matches: {sumPercent.toFixed(1)}% / 100% (${(totalAmount * (sumPercent / 100)).toFixed(2)} split)
                        </div>
                      ) : (
                        <div className="flex items-center gap-xs text-error font-label-sm">
                          <span className="material-symbols-outlined text-[18px]">warning</span>
                          Total mismatch: Sum is {sumPercent.toFixed(1)}% (must sum to 100%)
                        </div>
                      )
                    )}
                  </div>
                )}
              </>
            )}
            
            {/* Footer Summary */}
            <div className="bg-surface-container-high p-md">
              <div className="flex justify-between items-center mb-sm">
                <span className="font-body-md text-body-md text-on-surface-variant">Your Share ({user.name})</span>
                <span className="font-headline-md text-headline-md text-on-surface">${myShareAmount.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleConfirm} 
                disabled={
                  saving ||
                  totalAmount <= 0 ||
                  (selectedGroup && splitMode === 'exact' && !isExactValid) ||
                  (selectedGroup && splitMode === 'percentage' && !isPercentValid)
                } 
                className="w-full py-md bg-primary text-on-primary rounded-xl font-label-md text-label-md shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-base disabled:opacity-50"
              >
                {saving ? 'Creating Split...' : 'Confirm and Create Split'}
                {!saving && <span className="material-symbols-outlined">arrow_forward</span>}
              </button>
            </div>
          </div>
          
          {/* Insights Tip */}
          <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex items-start gap-md">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
              <span className="material-symbols-outlined">lightbulb</span>
            </div>
            <div>
              <h4 className="font-label-md text-label-md text-on-surface">Scan & Split Insights</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Verify the scanned title and total. Items matching prices will be automatically listed above. You can easily click and edit any details if needed.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ScanSplit;
