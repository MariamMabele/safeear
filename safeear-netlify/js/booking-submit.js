// Sends a booking to Netlify Forms. Turn on email alerts in Netlify: Forms → booking → Notifications.
class BookingSubmitter {
  // Returns true when Netlify Forms saved the booking.
  async send(booking) {
    return this.postNetlify(this.fields(booking));
  }

  mailtoLink(booking) {
    const fields = this.fields(booking);
    const subject = `New Booking — ${fields.client_name}`;
    return `mailto:${SafeEar.operatorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fields.summary)}`;
  }

  // Field names match the hidden form in index.html.
  fields(b) {
    const clientTime = `${TimeZones.timeIn(b.instant, b.clientTz)} (${TimeZones.label(b.clientTz)})`;
    const operatorTime = `${TimeZones.timeIn(b.instant, SafeEar.operatorTimeZone)} (${SafeEar.operatorLabel})`;
    const date = TimeZones.dateIn(b.instant, b.clientTz);
    const summary = [
      '📅 NEW SAFEEAR BOOKING',
      '─────────────────────────',
      `👤 Client: ${b.name}`,
      `📧 Email: ${b.email}`,
      `📦 Session: ${b.session.name} · ${b.session.duration} · ${b.session.price}`,
      `📆 Date: ${date}`,
      `🕐 Client time: ${clientTime}`,
      `🇹🇿 Your Tanzania time: ${TimeZones.dateIn(b.instant, SafeEar.operatorTimeZone)}, ${operatorTime}`,
      `Method: ${b.method.label}`,
      b.note ? `📝 Note: ${b.note}` : '',
    ].filter(Boolean).join('\n');

    return {
      client_name: b.name,
      client_email: b.email,
      session_name: b.session.name,
      duration: b.session.duration,
      price: b.session.price,
      date,
      client_time: clientTime,
      operator_time: operatorTime,
      call_type: b.method.id,
      method: b.method.label,
      platform: b.method.id,
      note: b.note,
      summary,
    };
  }

  async postNetlify(fields) {
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 'form-name': 'booking', ...fields }).toString(),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
