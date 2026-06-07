import React, { useState, useRef, useEffect } from 'react';

/**
 * CaseFileDrawer — a "filing cabinet drawer" themed popup that slides up
 * from the bottom-right when the TOP SECRET folder is clicked.
 */
export default function CaseFileDrawer({
  caseList,
  selectedCaseId,
  setSelectedCaseId,
  onClose,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  // Animate in on mount
  useEffect(() => {
    const t = setTimeout(() => setIsOpen(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const filteredCases = caseList.filter(
    (c) =>
      c.case_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.location && c.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (caseId) => {
    setSelectedCaseId(caseId);
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 350);
  };

  return (
    <>
      {/* Dark backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(2px)',
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}
      />

      {/* Filing cabinet drawer panel */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: `translateX(-50%) translateY(${isOpen ? '0%' : '100%'})`,
          width: 'min(680px, 96vw)',
          height: 'min(72vh, 680px)',
          zIndex: 201,
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '10px 10px 0 0',
          overflow: 'hidden',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.9), 0 -4px 20px rgba(0,0,0,0.7)',
        }}
      >
        {/* ── Drawer handle / tab at top ── */}
        <div
          onClick={handleClose}
          style={{
            background: 'linear-gradient(to bottom, #b8860b, #8b6508)',
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            gap: 10,
            borderBottom: '2px solid #5a4000',
          }}
        >
          <div style={{ width: 60, height: 4, background: 'rgba(0,0,0,0.35)', borderRadius: 2 }} />
          <span style={{
            fontFamily: "'Special Elite', monospace",
            fontSize: 10,
            color: 'rgba(0,0,0,0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}>
            ▼ close drawer
          </span>
          <div style={{ width: 60, height: 4, background: 'rgba(0,0,0,0.35)', borderRadius: 2 }} />
        </div>

        {/* ── Cabinet drawer body ── */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(to bottom, #c8a84b 0%, #b8941b 3%, #d4a820 6%, #e8c84a 100%)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderLeft: '8px solid #7a5c00',
          borderRight: '8px solid #7a5c00',
        }}>
          {/* ── Drawer label plate ── */}
          <div style={{
            background: 'linear-gradient(135deg, #f5e8c0, #e8d090)',
            margin: '12px 16px 8px',
            padding: '10px 16px',
            borderRadius: 3,
            border: '2px solid #8b6508',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3), 2px 3px 8px rgba(0,0,0,0.4)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{
                  fontFamily: "'Special Elite', monospace",
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#3a2000',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}>
                  ⊞ CLASSIFIED CASE FILES
                </div>
                <div style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 10,
                  color: '#7a5500',
                  marginTop: 2,
                }}>
                  {caseList.length} forensic profiles on record
                </div>
              </div>

              {/* Stamp */}
              <div style={{
                border: '3px solid rgba(180,0,0,0.55)',
                borderRadius: 3,
                padding: '3px 8px',
                color: 'rgba(180,0,0,0.55)',
                fontFamily: "'Special Elite', monospace",
                fontSize: 11,
                fontWeight: 'bold',
                letterSpacing: '0.1em',
                transform: 'rotate(-8deg)',
                boxShadow: '0 0 0 1px rgba(180,0,0,0.2)',
              }}>
                TOP SECRET
              </div>
            </div>

            {/* Search box styled as a typed label */}
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                fontFamily: "'Courier Prime', monospace",
                fontSize: 13,
                color: '#7a5500',
              }}>
                🔍
              </span>
              <input
                ref={searchRef}
                id="drawer-search"
                type="text"
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  background: 'rgba(255,255,255,0.45)',
                  border: '1px solid #8b6508',
                  borderRadius: 2,
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 12,
                  color: '#2a1500',
                  outline: 'none',
                }}
                onFocus={(e) => { e.target.style.background = 'rgba(255,255,255,0.7)'; }}
                onBlur={(e) => { e.target.style.background = 'rgba(255,255,255,0.45)'; }}
              />
            </div>
          </div>

          {/* ── File tabs / dividers ── */}
          <div style={{
            display: 'flex',
            gap: 2,
            padding: '0 16px',
            flexShrink: 0,
          }}>
            {['A–F', 'G–L', 'M–R', 'S–Z', 'ALL'].map((tab) => (
              <div key={tab} style={{
                background: 'linear-gradient(to bottom, #c0901a, #a07810)',
                padding: '3px 10px',
                borderRadius: '4px 4px 0 0',
                fontFamily: "'Special Elite', monospace",
                fontSize: 9,
                color: '#f5e8c0',
                border: '1px solid #7a5c00',
                borderBottom: 'none',
              }}>
                {tab}
              </div>
            ))}
          </div>

          {/* ── File list ── */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            margin: '0 16px 16px',
            background: 'rgba(0,0,0,0.08)',
            border: '2px solid #7a5c00',
            borderTop: '3px solid #5a4000',
            borderRadius: '0 4px 4px 4px',
            padding: '4px',
          }}>
            {filteredCases.length === 0 ? (
              <div style={{
                padding: 24,
                textAlign: 'center',
                fontFamily: "'Courier Prime', monospace",
                fontSize: 11,
                color: '#7a5500',
                fontStyle: 'italic',
              }}>
                — No matching files found —
              </div>
            ) : (
              filteredCases.map((c, idx) => {
                const isActive = c.case_id === selectedCaseId;
                return (
                  <button
                    key={c.case_id}
                    id={`drawer-case-${c.case_id}`}
                    onClick={() => handleSelect(c.case_id)}
                    style={{
                      display: 'flex',
                      width: '100%',
                      alignItems: 'center',
                      gap: 10,
                      padding: '7px 10px',
                      marginBottom: 2,
                      background: isActive
                        ? 'linear-gradient(to right, #fff8e1, #fef3c7)'
                        : idx % 2 === 0
                          ? 'rgba(255,255,255,0.15)'
                          : 'rgba(0,0,0,0.06)',
                      border: isActive ? '1px solid #b45309' : '1px solid transparent',
                      borderRadius: 2,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.12s, border-color 0.12s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.35)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = idx % 2 === 0
                        ? 'rgba(255,255,255,0.15)'
                        : 'rgba(0,0,0,0.06)';
                    }}
                  >
                    {/* File folder icon */}
                    <span style={{
                      fontSize: 16,
                      flexShrink: 0,
                      filter: isActive ? 'none' : 'grayscale(0.3)',
                    }}>
                      {isActive ? '📂' : '📁'}
                    </span>

                    {/* File label */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "'Special Elite', monospace",
                        fontSize: 12,
                        color: isActive ? '#92400e' : '#3a2000',
                        fontWeight: isActive ? 'bold' : 'normal',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {c.case_title}
                      </div>
                      <div style={{
                        fontFamily: "'Courier Prime', monospace",
                        fontSize: 9,
                        color: '#8b6508',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: 1,
                      }}>
                        📍 {c.location}
                      </div>
                    </div>

                    {/* Active badge */}
                    {isActive && (
                      <span style={{
                        background: '#b45309',
                        color: '#fff8e1',
                        fontFamily: "'Courier Prime', monospace",
                        fontSize: 8,
                        padding: '1px 5px',
                        borderRadius: 2,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        flexShrink: 0,
                      }}>
                        Active
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
