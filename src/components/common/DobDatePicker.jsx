import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';

/**
 * DobDatePicker
 * 
 * A unified DOB date-picker for desktop & mobile:
 * - Enforces adult DOB range (minimum 18 years, up to 100 years).
 * - Prohibits future dates & infinite past navigation.
 * - Desktop: anchored popover dropdown under input.
 * - Mobile (<=640px): touch-friendly modal fitting perfectly inside small screens.
 * - Supports month & year navigation with constrained year list.
 * - Cancel and OK buttons.
 * - Manual typing support with automatic normalization & validation.
 */
export default function DobDatePicker({
  id = 'reg-dob',
  name = 'dob',
  value = '',
  onChange,
  onBlur,
  error = '',
  placeholder = 'YYYY-MM-DD',
  disabled = false,
  minAge = 18,
  maxAge = 100,
  className = ''
}) {
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const modalContentRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState(value || '');

  // Calculate Date Boundaries
  const today = useMemo(() => new Date(), []);

  const maxDate = useMemo(() => {
    const d = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
    return d;
  }, [today, minAge]);

  const minDate = useMemo(() => {
    const d = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());
    return d;
  }, [today, maxAge]);

  const maxYear = maxDate.getFullYear();
  const minYear = minDate.getFullYear();

  // Helper to format year, month (0-11), day (1-31) to YYYY-MM-DD
  const formatIso = useCallback((y, m, d) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }, []);

  // Helper to parse YYYY-MM-DD safely
  const parseIso = useCallback((str) => {
    if (!str || typeof str !== 'string') return null;
    const parts = str.trim().split('-');
    if (parts.length !== 3) return null;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    const dateObj = new Date(y, m, d);
    if (dateObj.getFullYear() !== y || dateObj.getMonth() !== m || dateObj.getDate() !== d) {
      return null;
    }
    return { year: y, month: m, day: d, date: dateObj };
  }, []);

  // Initial Calendar View State
  const initialParsed = useMemo(() => parseIso(value), [value, parseIso]);
  const defaultYear = initialParsed ? initialParsed.year : Math.max(minYear, maxYear - 7); // ~25 years old default
  const defaultMonth = initialParsed ? initialParsed.month : 0;

  const [viewYear, setViewYear] = useState(defaultYear);
  const [viewMonth, setViewMonth] = useState(defaultMonth);
  const [tempDate, setTempDate] = useState(value || '');

  const prevValueRef = useRef(value);
  // Keep inputText and tempDate in sync when external value changes
  useEffect(() => {
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      setInputText(value || '');
      setTempDate(value || '');
      const parsed = parseIso(value);
      if (parsed) {
        setViewYear(parsed.year);
        setViewMonth(parsed.month);
      }
    }
  }, [value, parseIso]);

  // Generate Year Options strictly between minYear and maxYear
  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = maxYear; y >= minYear; y--) {
      years.push(y);
    }
    return years;
  }, [maxYear, minYear]);

  const monthNames = useMemo(() => [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ], []);

  // Open Calendar
  const handleOpen = () => {
    if (disabled) return;
    const parsed = parseIso(value);
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
      setTempDate(value);
    } else {
      // Sensible initial view: ~25 years old or maxYear
      const suggestedYear = Math.max(minYear, maxYear - 7);
      setViewYear(suggestedYear);
      setViewMonth(today.getMonth());
      setTempDate('');
    }
    setIsOpen(true);
  };

  // Close & Cancel
  const handleCancel = useCallback(() => {
    setTempDate(value || '');
    setIsOpen(false);
    onBlur?.();
  }, [value, onBlur]);

  // Confirm & OK
  const handleConfirm = useCallback(() => {
    if (tempDate) {
      onChange?.(tempDate);
      setInputText(tempDate);
    }
    setIsOpen(false);
    onBlur?.();
  }, [tempDate, onChange, onBlur]);

  // Click outside listener for desktop popover & mobile modal
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      // If modal/popover content does not contain the click target
      if (modalContentRef.current && !modalContentRef.current.contains(e.target)) {
        // Also ensure we didn't click inside the toggle button
        if (containerRef.current && containerRef.current.contains(e.target)) {
          return;
        }
        handleCancel();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleCancel]);

  // Month navigation
  const canPrevMonth = useMemo(() => {
    if (viewYear > minYear) return true;
    return viewMonth > minDate.getMonth();
  }, [viewYear, minYear, viewMonth, minDate]);

  const canNextMonth = useMemo(() => {
    if (viewYear < maxYear) return true;
    return viewMonth < maxDate.getMonth();
  }, [viewYear, maxYear, viewMonth, maxDate]);

  const handlePrevMonth = () => {
    if (!canPrevMonth) return;
    if (viewMonth === 0) {
      setViewYear((prev) => prev - 1);
      setViewMonth(11);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (!canNextMonth) return;
    if (viewMonth === 11) {
      setViewYear((prev) => prev + 1);
      setViewMonth(0);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value, 10);
    setViewYear(newYear);

    // If new year is maxYear and month exceeds maxDate month, clamp month
    if (newYear === maxYear && viewMonth > maxDate.getMonth()) {
      setViewMonth(maxDate.getMonth());
    }
    // If new year is minYear and month precedes minDate month, clamp month
    if (newYear === minYear && viewMonth < minDate.getMonth()) {
      setViewMonth(minDate.getMonth());
    }
  };

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value, 10);
    setViewMonth(newMonth);
  };

  // Calendar Day Grid Computation
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun, 1 = Mon ...

    const cells = [];

    // Empty lead slots for month alignment
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ day: null, key: `empty-${i}` });
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(viewYear, viewMonth, d);
      // Boundary check
      const isPastMax = dayDate > maxDate;
      const isBeforeMin = dayDate < minDate;
      const isDisabled = isPastMax || isBeforeMin;
      const iso = formatIso(viewYear, viewMonth, d);
      const isSelected = tempDate === iso;

      cells.push({
        day: d,
        iso,
        isDisabled,
        isSelected,
        key: `day-${d}`
      });
    }

    return cells;
  }, [viewYear, viewMonth, maxDate, minDate, formatIso, tempDate]);

  // Manual Input Change & Normalization
  const handleInputChange = (e) => {
    const raw = e.target.value;
    setInputText(raw);

    const trimmed = raw.trim();
    if (!trimmed) {
      onChange?.('');
      setTempDate('');
      return;
    }

    // Check YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const parsed = parseIso(trimmed);
      if (parsed) {
        const { date } = parsed;
        if (date <= maxDate && date >= minDate) {
          onChange?.(trimmed);
          setTempDate(trimmed);
          setViewYear(parsed.year);
          setViewMonth(parsed.month);
        } else {
          // Keep raw value to trigger parent under-18 / invalid validation error
          onChange?.(trimmed);
        }
      } else {
        onChange?.(trimmed);
      }
    } else if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(trimmed)) {
      // DD-MM-YYYY or DD/MM/YYYY
      const parts = trimmed.split(/[-/]/);
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const iso = formatIso(y, m, d);
      const parsed = parseIso(iso);
      if (parsed) {
        onChange?.(iso);
        setTempDate(iso);
      } else {
        onChange?.(trimmed);
      }
    } else {
      onChange?.(trimmed);
    }
  };

  const handleInputBlur = () => {
    const trimmed = inputText.trim();
    if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(trimmed)) {
      const parts = trimmed.split(/[-/]/);
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const iso = formatIso(y, m, d);
      setInputText(iso);
      onChange?.(iso);
    }
    onBlur?.();
  };

  return (
    <div className={`dob-picker-wrapper ${className}`} ref={containerRef}>
      <div className="dob-input-group">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="bday"
          aria-label="Date of Birth"
          className={`form-input-control dob-input-field ${error ? 'input-error' : ''}`}
        />
        <button
          type="button"
          className="dob-calendar-toggle-btn"
          onClick={handleOpen}
          disabled={disabled}
          aria-label="Open DOB Calendar"
          title="Open Calendar"
        >
          <CalendarIcon size={18} className="dob-toggle-icon" />
        </button>
      </div>

      {/* Calendar Overlay / Popover */}
      {isOpen && (
        <div className="dob-calendar-portal-overlay">
          <div
            className="dob-calendar-card"
            ref={modalContentRef}
            role="dialog"
            aria-modal="true"
            aria-label="Select Date of Birth"
          >
            {/* Calendar Header: Month, Year & Navigation */}
            <div className="dob-header-bar">
              <div className="dob-select-row">
                {/* Month Dropdown */}
                <select
                  className="dob-month-select"
                  value={viewMonth}
                  onChange={handleMonthChange}
                  aria-label="Select Month"
                >
                  {monthNames.map((name, idx) => {
                    const isDisabled =
                      (viewYear === maxYear && idx > maxDate.getMonth()) ||
                      (viewYear === minYear && idx < minDate.getMonth());
                    return (
                      <option key={name} value={idx} disabled={isDisabled}>
                        {name}
                      </option>
                    );
                  })}
                </select>

                {/* Year Dropdown */}
                <select
                  className="dob-year-select"
                  value={viewYear}
                  onChange={handleYearChange}
                  aria-label="Select Year"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prev / Next Nav Buttons */}
              <div className="dob-nav-group">
                <button
                  type="button"
                  className="dob-nav-btn"
                  onClick={handlePrevMonth}
                  disabled={!canPrevMonth}
                  aria-label="Previous Month"
                  title="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  className="dob-nav-btn"
                  onClick={handleNextMonth}
                  disabled={!canNextMonth}
                  aria-label="Next Month"
                  title="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Weekday Names Header */}
            <div className="dob-weekdays-row" aria-hidden="true">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Days Grid */}
            <div className="dob-days-grid" role="grid">
              {calendarDays.map((cell) => {
                if (!cell.day) {
                  return <div key={cell.key} className="dob-empty-cell" />;
                }

                return (
                  <button
                    key={cell.key}
                    type="button"
                    className={`dob-day-cell ${cell.isSelected ? 'selected' : ''} ${cell.isDisabled ? 'disabled' : ''}`}
                    disabled={cell.isDisabled}
                    onClick={() => setTempDate(cell.iso)}
                    aria-label={`${cell.day} ${monthNames[viewMonth]} ${viewYear}`}
                    aria-selected={cell.isSelected}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Preview */}
            <div className="dob-preview-status">
              {tempDate ? (
                <span className="dob-selected-text">
                  Selected: <strong>{tempDate}</strong>
                </span>
              ) : (
                <span className="dob-hint-sub">Please select your date of birth</span>
              )}
            </div>

            {/* Footer Action Buttons: Cancel and OK */}
            <div className="dob-actions-footer">
              <button
                type="button"
                className="dob-action-btn dob-btn-cancel"
                onClick={handleCancel}
                aria-label="Cancel date selection"
              >
                Cancel
              </button>
              <button
                type="button"
                className="dob-action-btn dob-btn-ok"
                onClick={handleConfirm}
                disabled={!tempDate}
                aria-label="Confirm date selection"
              >
                <Check size={14} className="dob-check-icon" /> OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
