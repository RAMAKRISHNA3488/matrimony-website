import React, { useRef } from 'react';
import { X, Download, Printer, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function BioDataPrintModal({ isOpen, onClose, profile }) {
  const { showToast } = useApp();
  const printSheetRef = useRef(null);

  if (!isOpen || !profile) return null;

  // Convert image URL to embedded base64 data URI so print/offline document ALWAYS renders the photo perfectly
  const getBase64Image = async (url) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(url);
        reader.readAsDataURL(blob);
      });
    } catch {
      return url;
    }
  };

  const getPartnerExpectationsText = (p) => {
    const prefs = p.partnerPreferences || {};
    const ageMin = prefs.ageMin || (p.age ? p.age : 28);
    const ageMax = prefs.ageMax || (p.age ? p.age + 4 : 32);
    const eduText = Array.isArray(prefs.education)
      ? prefs.education.slice(0, 4).join(', ')
      : (prefs.education || 'B.Tech / M.Tech, MS, MBA');
    const locText = Array.isArray(prefs.locations)
      ? prefs.locations.slice(0, 4).join(', ')
      : (prefs.locations || 'Hyderabad, Bangalore, USA, Europe');
    return `Looking for a bride/groom aged between ${ageMin} to ${ageMax} years, with education in ${eduText}, settled in ${locText}.`;
  };

  const generateHtmlDocument = async () => {
    const candidateName = profile.name || 'Candidate';
    const rawPhotoUrl = (profile.photos && profile.photos[0]) || profile.photo || profile.image || '/assets/profiles/bride_sravani.jpg';
    const base64Photo = await getBase64Image(rawPhotoUrl);
    const expectationsText = getPartnerExpectationsText(profile);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${candidateName} - Telugu Matrimonial Bio-Data | TeluguBandham</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #FFFFFF !important;
      background-color: #FFFFFF !important;
      color: #221F23;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    @media screen {
      body {
        background-color: #F3ECE6 !important;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 24px 16px;
      }
      .biodata-sheet {
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12) !important;
      }
    }

    .biodata-sheet {
      width: 100%;
      max-width: 720px;
      margin: 0 auto;
      background: #FFFFFF !important;
      background-color: #FFFFFF !important;
      border: 2px solid #D4AF37 !important;
      outline: 1px solid #D4AF37;
      outline-offset: -5px;
      border-radius: 6px;
      padding: 24px 28px;
      box-sizing: border-box;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      page-break-after: avoid !important;
      page-break-before: avoid !important;
    }

    .sacred-header {
      text-align: center;
      margin-bottom: 14px;
    }

    .sacred-invocation {
      color: #7A1428;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      margin-bottom: 2px;
    }

    .title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.55rem;
      font-weight: 700;
      color: #5C0E1E;
      margin: 2px 0;
      letter-spacing: 0.03em;
    }

    .profile-id {
      font-size: 0.75rem;
      color: #7A7279;
    }

    .summary-card {
      display: flex;
      align-items: center;
      gap: 18px;
      padding-bottom: 14px;
      border-bottom: 1px dashed #D0C6BD;
      margin-bottom: 14px;
    }

    .profile-photo {
      width: 95px;
      height: 116px;
      object-fit: cover;
      border-radius: 8px;
      border: 2px solid #D4AF37;
      flex-shrink: 0;
      background-color: #F8F5F2;
    }

    .summary-info {
      flex: 1;
    }

    .summary-info h3 {
      font-size: 1.32rem;
      color: #5C0E1E;
      font-family: 'Playfair Display', Georgia, serif;
      margin-bottom: 2px;
      font-weight: 700;
    }

    .summary-info .sub {
      font-size: 0.86rem;
      color: #38333D;
      margin-top: 2px;
    }

    .summary-info .meta {
      font-size: 0.8rem;
      color: #5C5660;
      margin-top: 2px;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      font-size: 0.81rem;
      line-height: 1.45;
    }

    .section-title {
      color: #7A1428;
      font-size: 0.835rem;
      font-weight: 700;
      border-bottom: 1.5px solid #E5DBD2;
      padding-bottom: 4px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .info-table {
      display: grid;
      grid-template-columns: 106px 1fr;
      row-gap: 5px;
      column-gap: 6px;
    }

    .info-label {
      color: #726A74;
      font-weight: 500;
    }

    .info-value {
      color: #221F23;
      font-weight: 600;
    }

    .expectations-box {
      margin-top: 14px;
      padding-top: 10px;
      border-top: 1px dashed #D0C6BD;
      font-size: 0.8rem;
    }

    .footer-bar {
      margin-top: 14px;
      padding-top: 8px;
      border-top: 1px solid #D4AF37;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.72rem;
      color: #726A74;
    }

    @media print {
      html, body {
        background: #FFFFFF !important;
        background-color: #FFFFFF !important;
        padding: 0 !important;
        margin: 0 !important;
        height: 100% !important;
        overflow: visible !important;
      }
      .biodata-sheet {
        background: #FFFFFF !important;
        background-color: #FFFFFF !important;
        box-shadow: none !important;
        border: 2px solid #D4AF37 !important;
        outline: 1px solid #D4AF37 !important;
        outline-offset: -5px !important;
        border-radius: 4px !important;
        max-width: 100% !important;
        width: 100% !important;
        min-height: 256mm !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        margin: 0 auto !important;
        padding: 24px 28px !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-after: avoid !important;
        page-break-before: avoid !important;
      }
    }
  </style>
</head>
<body>
  <div class="biodata-sheet">
    <div>
      <div class="sacred-header">
        <div class="sacred-invocation">॥ శ్రీ విఘ్నేశ్వరాయ నమః ॥ శుభమస్తు ॥</div>
        <h1 class="title">MATRIMONIAL BIO-DATA</h1>
        <div class="profile-id">TeluguBandham Verified Profile ID: ${profile.id || 'TB-1001'}</div>
      </div>

      <div class="summary-card">
        <img src="${base64Photo}" alt="${candidateName}" class="profile-photo" />
        <div class="summary-info">
          <h3>${candidateName}</h3>
          <div class="sub"><strong>${profile.profession || 'Lead AI Data Scientist'}</strong> at ${profile.company || 'Microsoft IDC'}</div>
          <div class="meta">${profile.education || 'M.S. in Data Science (BITS Pilani)'}</div>
          <div class="meta">Annual Package: <strong>${profile.income || '₹38 – 45 Lakhs PA'}</strong> • Location: <strong>${profile.city || 'Hyderabad'}, ${profile.state || 'Telangana'}</strong></div>
        </div>
      </div>

      <div class="details-grid">
        <div>
          <div class="section-title">Personal and Astrological Details</div>
          <div class="info-table">
            <span class="info-label">Age / Height:</span>
            <span class="info-value">${profile.age || 26} yrs / ${profile.height || "5'5\""} (${profile.heightCm || 165} cm)</span>

            <span class="info-label">Marital Status:</span>
            <span class="info-value">${profile.maritalStatus || 'Never Married'}</span>

            <span class="info-label">Community:</span>
            <span class="info-value">${profile.community || 'Reddy'} (${profile.subCaste || 'Motati Reddy'})</span>

            <span class="info-label">Gothram:</span>
            <span class="info-value">${profile.gothram || 'Bharadwaja'}</span>

            <span class="info-label">Raasi:</span>
            <span class="info-value">${profile.raasi || 'Kanya (Virgo)'}</span>

            <span class="info-label">Nakshatram:</span>
            <span class="info-value">${profile.nakshatram || 'Hasta'}</span>

            <span class="info-label">Mother Tongue:</span>
            <span class="info-value">${profile.motherTongue || 'Telugu'}</span>

            <span class="info-label">Food Habits:</span>
            <span class="info-value">${profile.foodHabits || 'Non-Vegetarian'}</span>
          </div>
        </div>

        <div>
          <div class="section-title">Family Background</div>
          <div class="info-table">
            <span class="info-label">Father:</span>
            <span class="info-value">${profile.fatherOccupation || 'Executive Engineer (Retd.), Irrigation Dept'}</span>

            <span class="info-label">Mother:</span>
            <span class="info-value">${profile.motherOccupation || 'Homemaker'}</span>

            <span class="info-label">Brothers:</span>
            <span class="info-value">${profile.brothers || '1 Younger Brother (Software Engineer in US)'}</span>

            <span class="info-label">Sisters:</span>
            <span class="info-value">${profile.sisters || 'None'}</span>

            <span class="info-label">Family Status:</span>
            <span class="info-value">${profile.familyStatus || 'Upper Middle Class'}</span>

            <span class="info-label">Native Place:</span>
            <span class="info-value">${profile.nativePlace || profile.city || 'Kadapa, Andhra Pradesh'}</span>

            <span class="info-label">Residing At:</span>
            <span class="info-value">${profile.familyLocation || profile.city || 'Jubilee Hills, Hyderabad'}</span>
          </div>
        </div>
      </div>

      <div class="expectations-box">
        <div class="section-title">Partner Expectations</div>
        <p style="color: #38333D; line-height: 1.45;">${expectationsText}</p>
      </div>
    </div>

    <div class="footer-bar">
      <div>✓ Verified Matrimonial Record • Generated via TeluguBandham.com</div>
      <div>Contact: +91 98765 43210 • care@telugubandham.com</div>
    </div>
  </div>
</body>
</html>`;
  };

  // Direct Print - Strictly prints only the clean single-page bio-data document matching Save as PDF
  const handlePrint = async () => {
    try {
      showToast("Preparing clean single-page bio-data for printing... 🖨️", "info");
      const htmlContent = await generateHtmlDocument();

      // Clean up previous print iframe if existing
      const oldFrame = document.getElementById('telugu-biodata-print-frame');
      if (oldFrame) {
        oldFrame.remove();
      }

      // Create an invisible iframe for isolated single-page document printing
      const iframe = document.createElement('iframe');
      iframe.id = 'telugu-biodata-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.top = '-10000px';
      iframe.style.left = '-10000px';
      iframe.style.width = '794px';
      iframe.style.height = '1123px';
      iframe.style.border = 'none';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      iframe.setAttribute('aria-hidden', 'true');
      document.body.appendChild(iframe);

      const frameWindow = iframe.contentWindow;
      const frameDoc = frameWindow ? frameWindow.document : iframe.contentDocument;

      if (!frameDoc) {
        window.print();
        return;
      }

      frameDoc.open();
      frameDoc.write(htmlContent);
      frameDoc.close();

      const runPrint = () => {
        try {
          if (iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          }
        } catch (err) {
          console.error("Print execution failed", err);
          window.print();
        }
      };

      // Allow fonts and base64 image to settle
      setTimeout(runPrint, 350);
    } catch (err) {
      console.error("Print failed", err);
      showToast("Print error, opening standard print...", "error");
      window.print();
    }
  };

  // Save as PDF / Choose Local System Location
  const handleSaveAsPdf = async () => {
    try {
      const candidateName = profile.name || 'Candidate';
      const cleanFileName = `${candidateName.replace(/\s+/g, '_')}_Matrimonial_BioData.html`;
      const htmlContent = await generateHtmlDocument();
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });

      // Ask where to save in local system if File System Access API is supported
      if ('showSaveFilePicker' in window) {
        try {
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: cleanFileName,
            types: [
              {
                description: 'Matrimonial Bio-Data Document (*.html)',
                accept: { 'text/html': ['.html', '.htm'] }
              }
            ]
          });
          const writableStream = await fileHandle.createWritable();
          await writableStream.write(blob);
          await writableStream.close();
          showToast("Bio-data document saved successfully! 💾", "success");
          return;
        } catch (pickerErr) {
          if (pickerErr.name === 'AbortError') {
            return;
          }
        }
      }

      // Standard fallback download prompt
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = cleanFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("Bio-data downloaded to your Downloads folder! 📄", "success");
    } catch (err) {
      console.error("Save failed", err);
      showToast("Save failed. Opening print option...", "error");
      handlePrint();
    }
  };

  const expectationsText = getPartnerExpectationsText(profile);
  const photoUrl = (profile.photos && profile.photos[0]) || profile.photo || profile.image || '/assets/profiles/bride_sravani.jpg';

  return (
    <div
      className="biodata-modal-overlay animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(18, 12, 16, 0.82)',
        backdropFilter: 'blur(8px)',
        zIndex: 'var(--z-modal, 1000)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem'
      }}
      onClick={onClose}
    >
      <style>{`
        .biodata-preview-sheet {
          padding: 1.5rem 1.75rem;
          background-color: #FFFFFF;
          margin: 1.25rem;
          border-radius: 6px;
          border: 2px solid #D4AF37;
          outline: 1px solid #D4AF37;
          outline-offset: -5px;
          box-sizing: border-box;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .biodata-preview-summary-card {
          display: flex;
          gap: 1.25rem;
          align-items: center;
          padding-bottom: 0.95rem;
          border-bottom: 1px dashed #D0C6BD;
          margin-bottom: 0.95rem;
        }
        .biodata-preview-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          font-size: 0.8rem;
          line-height: 1.45;
        }
        .biodata-preview-info-table {
          display: grid;
          grid-template-columns: 110px 1fr;
          row-gap: 4px;
          column-gap: 6px;
        }
        .biodata-preview-info-table > span {
          min-width: 0;
          word-break: break-word;
          overflow-wrap: break-word;
        }

        @media (max-width: 640px) {
          .biodata-modal-overlay {
            padding: 0.35rem !important;
          }
          .biodata-modal-container {
            max-height: 96vh !important;
            border-radius: 12px !important;
          }
          .biodata-modal-controls {
            padding: 0.65rem 0.85rem !important;
          }
          .biodata-preview-sheet {
            margin: 0.65rem !important;
            padding: 1.1rem 0.85rem !important;
          }
          .biodata-preview-details-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .biodata-preview-info-table {
            grid-template-columns: 120px 1fr !important;
            row-gap: 5px !important;
          }
        }

        @media (max-width: 480px) {
          .biodata-modal-overlay {
            padding: 0.25rem !important;
          }
          .biodata-preview-sheet {
            margin: 0.4rem !important;
            padding: 0.85rem 0.65rem !important;
            outline-offset: -3px !important;
          }
          .biodata-preview-summary-card {
            gap: 0.75rem !important;
          }
          .biodata-preview-summary-card img {
            width: 80px !important;
            height: 100px !important;
          }
          .biodata-preview-info-table {
            grid-template-columns: 105px 1fr !important;
            font-size: 0.775rem !important;
          }
        }

        @media (max-width: 360px) {
          .biodata-modal-overlay {
            padding: 0 !important;
          }
          .biodata-preview-sheet {
            margin: 0.25rem !important;
            padding: 0.75rem 0.5rem !important;
          }
          .biodata-preview-info-table {
            grid-template-columns: 96px 1fr !important;
            font-size: 0.74rem !important;
            column-gap: 4px !important;
          }
        }
      `}</style>
      <div
        className="biodata-modal-container animate-scale-up no-scrollbar"
        style={{
          width: '100%',
          maxWidth: '740px',
          maxHeight: '92vh',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          backgroundColor: '#FFFFFF',
          padding: '0',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls Header Bar */}
        <div
          className="biodata-modal-controls"
          style={{
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid var(--border-light, #E8E0D9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--primary-900, #5C0E1E)',
            color: '#FFFFFF',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
            <ShieldCheck size={18} style={{ color: '#D4AF37' }} />
            <span>Telugu Matrimonial Bio-Data Document</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
            {/* Print Button */}
            <button
              type="button"
              className="btn btn-gold btn-sm"
              onClick={handlePrint}
              title="Print single page Matrimonial Bio-Data directly"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #B88E18 100%)',
                color: '#2D1B00',
                border: 'none',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8125rem',
                padding: '0.45rem 1rem',
                borderRadius: '20px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.18s ease'
              }}
            >
              <Printer size={14} />
              <span>Print</span>
            </button>

            {/* Save as PDF Button */}
            <button
              type="button"
              className="btn btn-gold btn-sm"
              onClick={handleSaveAsPdf}
              title="Save as PDF and choose location in local computer"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #B88E18 100%)',
                color: '#2D1B00',
                border: 'none',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8125rem',
                padding: '0.45rem 1rem',
                borderRadius: '20px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.18s ease'
              }}
            >
              <Download size={14} />
              <span>Save as PDF</span>
            </button>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                color: '#FFFFFF',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.85,
                marginLeft: '4px'
              }}
              title="Close modal"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Traditional Bio-Data Printable Sheet - Single Page Optimized with Clean White Background */}
        <div
          id="printable-biodata"
          ref={printSheetRef}
          className="biodata-print-sheet biodata-preview-sheet"
        >
          {/* Sacred invocation */}
          <div style={{ textAlign: 'center', marginBottom: '0.9rem' }}>
            <div style={{ color: '#7A1428', fontSize: '0.835rem', fontWeight: 700, letterSpacing: '0.08em' }}>
              ॥ శ్రీ విఘ్నేశ్వరాయ నమః ॥ శుభమస్తు ॥
            </div>
            <h2
              style={{
                fontSize: '1.45rem',
                color: '#5C0E1E',
                margin: '2px 0',
                fontFamily: 'Playfair Display, Georgia, serif',
                fontWeight: 700
              }}
            >
              MATRIMONIAL BIO-DATA
            </h2>
            <div style={{ fontSize: '0.74rem', color: '#7A7279' }}>
              TeluguBandham Verified Profile ID: {profile.id || 'TB-1001'}
            </div>
          </div>

          {/* Top Profile Summary Header */}
          <div className="biodata-preview-summary-card">
            <img
              src={photoUrl}
              alt={profile.name}
              style={{
                width: '94px',
                height: '115px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '2px solid #D4AF37',
                flexShrink: 0,
                backgroundColor: '#F8F5F2'
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: '1.28rem', color: '#5C0E1E', margin: '0 0 2px 0', fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700 }}>
                {profile.name}
              </h3>
              <div style={{ fontSize: '0.84rem', color: '#38333D', marginTop: '2px' }}>
                <strong>{profile.profession || 'Lead AI Data Scientist'}</strong> at {profile.company || 'Microsoft IDC'}
              </div>
              <div style={{ fontSize: '0.79rem', color: '#5C5660', marginTop: '2px' }}>
                {profile.education || 'M.S. in Data Science (BITS Pilani)'}
              </div>
              <div style={{ fontSize: '0.77rem', color: '#5C5660', marginTop: '2px' }}>
                Annual Package: <strong>{profile.income || '₹38 – 45 Lakhs PA'}</strong> • Location: <strong>{profile.city || 'Hyderabad'}, {profile.state || 'Telangana'}</strong>
              </div>
            </div>
          </div>

          {/* Bio Data Sections Grid */}
          <div className="biodata-preview-details-grid">
            {/* Column 1: Personal and Horoscope Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <h4 style={{ color: '#7A1428', borderBottom: '1.5px solid #E5DBD2', paddingBottom: '3px', margin: 0, fontSize: '0.825rem', textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 700 }}>
                Personal and Astrological Details
              </h4>
              <div className="biodata-preview-info-table">
                <span style={{ color: '#726A74', fontWeight: 500 }}>Age / Height:</span>
                <span><strong>{profile.age || 26} yrs</strong> / {profile.height || "5'5\""} ({profile.heightCm || 165} cm)</span>

                <span style={{ color: '#726A74', fontWeight: 500 }}>Marital Status:</span>
                <span>{profile.maritalStatus || 'Never Married'}</span>

                <span style={{ color: '#726A74', fontWeight: 500 }}>Community:</span>
                <span><strong>{profile.community || 'Reddy'}</strong> ({profile.subCaste || 'Motati Reddy'})</span>

                <span style={{ color: '#726A74', fontWeight: 500 }}>Gothram:</span>
                <span><strong>{profile.gothram || 'Bharadwaja'}</strong></span>

                <span style={{ color: '#726A74', fontWeight: 500 }}>Raasi:</span>
                <span>{profile.raasi || 'Kanya (Virgo)'}</span>

                <span style={{ color: '#726A74', fontWeight: 500 }}>Nakshatram:</span>
                <span>{profile.nakshatram || 'Hasta'}</span>

                <span style={{ color: '#726A74', fontWeight: 500 }}>Mother Tongue:</span>
                <span>{profile.motherTongue || 'Telugu'}</span>

                <span style={{ color: '#726A74', fontWeight: 500 }}>Food Habits:</span>
                <span>{profile.foodHabits || 'Non-Vegetarian'}</span>
              </div>
            </div>

            {/* Column 2: Family Background */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <h4 style={{ color: '#7A1428', borderBottom: '1.5px solid #E5DBD2', paddingBottom: '3px', margin: 0, fontSize: '0.825rem', textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 700 }}>
                Family Background
              </h4>
              <div className="biodata-preview-info-table">
                <span style={{ color: '#726A74', fontWeight: 500 }}>Father:</span>
                <span>{profile.fatherOccupation || 'Executive Engineer (Retd.), Irrigation Dept'}</span>

                <span style={{ color: '#726A74', fontWeight: 500 }}>Mother:</span>
                <span>{profile.motherOccupation || 'Homemaker'}</span>

                <span style={{ color: '#726A74', fontWeight: 500 }}>Brothers:</span>
                <span>{profile.brothers || '1 Younger Brother (Software Engineer in US)'}</span>

                <span style={{ color: '#726A74', fontWeight: 500 }}>Sisters:</span>
                <span>{profile.sisters || 'None'}</span>

                <span style={{ color: '#726A74', fontWeight: 500 }}>Family Status:</span>
                <span>{profile.familyStatus || 'Upper Middle Class'}</span>

                <span style={{ color: '#726A74', fontWeight: 500 }}>Native Place:</span>
                <span>{profile.nativePlace || profile.city || 'Kadapa, Andhra Pradesh'}</span>

                <span style={{ color: '#726A74', fontWeight: 500 }}>Residing At:</span>
                <span>{profile.familyLocation || profile.city || 'Jubilee Hills, Hyderabad'}</span>
              </div>
            </div>
          </div>

          {/* Partner Expectations */}
          <div style={{ marginTop: '0.95rem', paddingTop: '0.75rem', borderTop: '1px dashed #D0C6BD' }}>
            <h4 style={{ color: '#7A1428', margin: '0 0 0.25rem 0', fontSize: '0.825rem', textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 700 }}>
              Partner Expectations
            </h4>
            <p style={{ fontSize: '0.785rem', color: '#38333D', lineHeight: 1.45, margin: 0 }}>
              {expectationsText}
            </p>
          </div>

          {/* Footer certification */}
          <div
            style={{
              marginTop: '0.95rem',
              paddingTop: '0.65rem',
              borderTop: '1px solid #D4AF37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
              color: '#726A74'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={14} style={{ color: '#059669' }} />
              <span>Verified Matrimonial Record • Generated via TeluguBandham.com</span>
            </div>
            <div>Contact: +91 98765 43210 • care@telugubandham.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}
