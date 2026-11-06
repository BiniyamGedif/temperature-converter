/* ============================================================
   Temperature Converter - Logic
   Concepts used: DOM selection, event listeners, functions,
   conditionals, template strings, localStorage.
   ============================================================ */

// ---------- 1. DOM references ----------
// The DOM (Document Object Model) is the browser's in-memory
// representation of the HTML page. JavaScript uses it to read and
// change what the user sees. getElementById finds an element by its id.
const temperatureInput = document.getElementById('temperature');
const fromUnitSelect   = document.getElementById('from-unit');
const toUnitSelect     = document.getElementById('to-unit');
const swapButton       = document.getElementById('swap');
const clearButton      = document.getElementById('clear');
const resultOutput     = document.getElementById('result');
const messageEl        = document.getElementById('message');
const themeToggle      = document.getElementById('theme-toggle');

// ---------- 2. Constants ----------
// Absolute zero in each unit. Any value below this is physically
// impossible, so we reject it.
const ABSOLUTE_ZERO = {
  celsius: -273.15,
  fahrenheit: -459.67,
  kelvin: 0
};

// Display symbols for each unit.
const UNIT_SYMBOLS = {
  celsius: '°C',
  fahrenheit: '°F',
  kelvin: 'K'
};

// ---------- 3. Conversion helpers ----------
// Strategy: convert the source value to Celsius first, then from
// Celsius to the target unit. This covers all 6 directions with
// only two small functions, and avoids duplicating formulas.
function toCelsius(value, unit) {
  switch (unit) {
    case 'celsius':    return value;
    case 'fahrenheit': return (value - 32) * 5 / 9;
    case 'kelvin':     return value - 273.15;
  }
}

function fromCelsius(celsius, unit) {
  switch (unit) {
    case 'celsius':    return celsius;
    case 'fahrenheit': return celsius * 9 / 5 + 32;
    case 'kelvin':     return celsius + 273.15;
  }
}

function convert(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) return value; // identical units: no change
  return fromCelsius(toCelsius(value, fromUnit), toUnit);
}

// ---------- 4. Formatting ----------
// Show up to 6 decimals, then trim trailing zeros / dot.
// This avoids floating-point noise (e.g. 0.1 + 0.2) and keeps
// results clean.
function formatNumber(n) {
  if (!Number.isFinite(n)) return '—';
  return n.toFixed(6).replace(/\.?0+$/, '');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---------- 5. Validation + conversion ----------
function setMessage(text, type) {
  messageEl.textContent = text;
  // type: '' | 'error' | 'success'
  messageEl.className = 'message' + (type ? ' is-' + type : '');
}

function convertAndUpdate() {
  const raw = temperatureInput.value.trim();
  const from = fromUnitSelect.value;
  const to   = toUnitSelect.value;

  // Empty input: reset to initial display, no nagging.
  if (raw === '') {
    resultOutput.textContent = '—';
    setMessage('', '');
    return;
  }

  const value = Number(raw);

  // Invalid numeric input (letters, multiple dots, etc.)
  if (!Number.isFinite(value)) {
    resultOutput.textContent = '—';
    setMessage('Please enter a valid number.', 'error');
    return;
  }

  // Below absolute zero for the selected source unit.
  const min = ABSOLUTE_ZERO[from];
  if (value < min) {
    resultOutput.textContent = '—';
    setMessage(
      'Temperature cannot be below absolute zero (' + min + ' ' + UNIT_SYMBOLS[from] + ') for ' + capitalize(from) + '.',
      'error'
    );
    return;
  }

  // All good: convert and display.
  const result = convert(value, from, to);
  resultOutput.textContent = formatNumber(result) + ' ' + UNIT_SYMBOLS[to];
  setMessage('', '');
}

// ---------- 6. Event listeners ----------
// Automatic conversion: fires on every keystroke / change.
temperatureInput.addEventListener('input', convertAndUpdate);
fromUnitSelect.addEventListener('change', convertAndUpdate);
toUnitSelect.addEventListener('change', convertAndUpdate);

// Swap units: exchange selects, keep the value, recompute.
swapButton.addEventListener('click', function () {
  const from = fromUnitSelect.value;
  fromUnitSelect.value = toUnitSelect.value;
  toUnitSelect.value = from;

  // Small visual spin for feedback.
  swapButton.classList.add('is-spinning');
  window.setTimeout(function () {
    swapButton.classList.remove('is-spinning');
  }, 300);

  convertAndUpdate();
});

// Clear / reset to initial state.
clearButton.addEventListener('click', function () {
  temperatureInput.value = '';
  fromUnitSelect.value = 'celsius';
  toUnitSelect.value = 'fahrenheit';
  resultOutput.textContent = '—';
  setMessage('', '');
  temperatureInput.focus();
});

// ---------- 7. Theme toggle ----------
// The <head> script already applied the saved (or system) theme.
// Here we only handle toggling and persisting the choice.
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('theme', theme);
  } catch (e) {
    // localStorage may be unavailable (private mode); ignore.
  }
}

themeToggle.addEventListener('click', function () {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});
