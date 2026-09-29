// Time zone helpers. Uses the browser's Intl data, so daylight saving is handled.
class TimeZones {
  static COMMON = [
    ['America/New_York', '🇺🇸 USA — New York'], ['America/Chicago', '🇺🇸 USA — Chicago'],
    ['America/Denver', '🇺🇸 USA — Denver'], ['America/Los_Angeles', '🇺🇸 USA — Los Angeles'],
    ['America/Toronto', '🇨🇦 Canada — Toronto'], ['America/Vancouver', '🇨🇦 Canada — Vancouver'],
    ['America/Mexico_City', '🇲🇽 Mexico — Mexico City'], ['America/Sao_Paulo', '🇧🇷 Brazil — São Paulo'],
    ['America/Argentina/Buenos_Aires', '🇦🇷 Argentina — Buenos Aires'],
    ['Europe/London', '🇬🇧 UK — London'], ['Europe/Dublin', '🇮🇪 Ireland — Dublin'],
    ['Europe/Berlin', '🇩🇪 Germany — Berlin'], ['Europe/Paris', '🇫🇷 France — Paris'],
    ['Europe/Rome', '🇮🇹 Italy — Rome'], ['Europe/Madrid', '🇪🇸 Spain — Madrid'],
    ['Europe/Amsterdam', '🇳🇱 Netherlands — Amsterdam'], ['Europe/Brussels', '🇧🇪 Belgium — Brussels'],
    ['Europe/Zurich', '🇨🇭 Switzerland — Zurich'], ['Europe/Vienna', '🇦🇹 Austria — Vienna'],
    ['Europe/Warsaw', '🇵🇱 Poland — Warsaw'], ['Europe/Stockholm', '🇸🇪 Sweden — Stockholm'],
    ['Europe/Oslo', '🇳🇴 Norway — Oslo'], ['Europe/Copenhagen', '🇩🇰 Denmark — Copenhagen'],
    ['Europe/Helsinki', '🇫🇮 Finland — Helsinki'], ['Europe/Athens', '🇬🇷 Greece — Athens'],
    ['Europe/Bucharest', '🇷🇴 Romania — Bucharest'], ['Europe/Kyiv', '🇺🇦 Ukraine — Kyiv'],
    ['Africa/Lagos', '🇳🇬 Nigeria — Lagos'], ['Africa/Johannesburg', '🇿🇦 South Africa — Johannesburg'],
    ['Africa/Nairobi', '🇰🇪 Kenya — Nairobi'], ['Africa/Kampala', '🇺🇬 Uganda — Kampala'],
    ['Africa/Dar_es_Salaam', '🇹🇿 Tanzania — Dar es Salaam'],
    ['Asia/Riyadh', '🇸🇦 Saudi Arabia — Riyadh'], ['Asia/Dubai', '🇦🇪 UAE — Dubai'],
    ['Asia/Kolkata', '🇮🇳 India — Mumbai'], ['Asia/Singapore', '🇸🇬 Singapore'],
    ['Asia/Tokyo', '🇯🇵 Japan — Tokyo'], ['Australia/Sydney', '🇦🇺 Australia — Sydney'],
    ['Pacific/Auckland', '🇳🇿 New Zealand — Auckland'],
  ];

  static detected() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }

  // The visitor's own zone comes first, even when it is not in the common list.
  static options() {
    const own = this.detected();
    const list = this.COMMON.slice();
    if (!list.some(([tz]) => tz === own)) list.unshift([own, `📍 ${own.replace(/_/g, ' ')}`]);
    return list;
  }

  static label(tz) {
    const found = this.COMMON.find(([id]) => id === tz);
    return found ? found[1].replace(/^\S+\s/, '') : tz.replace(/_/g, ' ');
  }

  // Converts a wall-clock date and "HH:MM" in `tz` to a real instant.
  static toInstant(day, hhmm, tz) {
    const [h, m] = hhmm.split(':').map(Number);
    const guess = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), h, m);
    const first = guess - this.offsetMinutes(tz, new Date(guess)) * 60000;
    // A second pass fixes the result when the guess falls across a DST change.
    return new Date(guess - this.offsetMinutes(tz, new Date(first)) * 60000);
  }

  static format(instant, tz, opts) {
    return new Intl.DateTimeFormat('en-US', { timeZone: tz, ...opts }).format(instant);
  }

  static timeIn(instant, tz) {
    return this.format(instant, tz, { hour: 'numeric', minute: '2-digit' });
  }

  static dateIn(instant, tz) {
    return this.format(instant, tz, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  static offsetMinutes(tz, instant) {
    const parts = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23',
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
    }).formatToParts(instant).forEach(p => { parts[p.type] = Number(p.value); });
    const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
    return Math.round((asUtc - instant.getTime()) / 60000);
  }
}

// "HH:MM" slot values every 30 minutes, in the visitor's own time.
function buildSlots(firstHour, lastHour) {
  const slots = [];
  for (let h = firstHour; h < lastHour; h++) {
    const hh = String(h).padStart(2, '0');
    slots.push(`${hh}:00`, `${hh}:30`);
  }
  return slots;
}

function slotLabel(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}
