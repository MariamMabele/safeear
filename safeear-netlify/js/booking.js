// Three-step booking sheet: what you need → when → your details.
class BookingFlow {
  static TITLES = ['What would help?', 'When suits you?', 'Almost done'];

  constructor(root) {
    this.root = root;
    this.submitter = new BookingSubmitter();
    this.slots = buildSlots(SafeEar.firstHour, SafeEar.lastHour);
    this.root.addEventListener('click', e => this.onClick(e));
    this.root.addEventListener('input', e => this.onInput(e));
    this.root.addEventListener('change', e => this.onInput(e));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && this.isOpen) this.close(); });
  }

  open(sessionId = '') {
    const tz = TimeZones.detected();
    const today = BookingFlow.todayIn(tz);
    this.state = {
      step: 1, sessionId, methodId: '', tz, day: null, time: '',
      name: '', email: '', note: '', month: new Date(today.getFullYear(), today.getMonth(), 1),
      result: null, sending: false,
    };
    this.isOpen = true;
    document.body.classList.add('no-scroll');
    this.render();
    this.root.querySelector('.sheet').focus();
  }

  close() {
    this.isOpen = false;
    this.root.innerHTML = '';
    document.body.classList.remove('no-scroll');
  }

  onClick(e) {
    if (e.target.classList.contains('sheet-backdrop')) return this.close();
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const s = this.state;
    const act = el.dataset.act;
    const val = el.dataset.val;

    if (act === 'close') return this.close();
    if (act === 'retry') s.result = null;
    if (act === 'session') s.sessionId = val;
    if (act === 'method') s.methodId = val;
    if (act === 'month') s.month = new Date(s.month.getFullYear(), s.month.getMonth() + Number(val), 1);
    if (act === 'day') { s.day = new Date(Number(val)); s.time = ''; }
    if (act === 'time') s.time = val;
    if (act === 'back') s.step -= 1;
    if (act === 'next') return s.step < 3 ? this.go(s.step + 1) : this.submit();
    this.render();
  }

  // Typing must not re-render, or the field would lose focus.
  onInput(e) {
    const field = e.target.dataset.field;
    if (!field) return;
    this.state[field] = e.target.value;
    if (field === 'tz') { this.state.time = ''; this.render(); return; }
    this.root.querySelector('[data-act="next"]').disabled = !this.canContinue();
  }

  go(step) {
    this.state.step = step;
    this.render();
    this.root.querySelector('.sheet-body').scrollTop = 0;
  }

  canContinue() {
    const s = this.state;
    if (s.step === 1) return Boolean(s.sessionId && s.methodId);
    if (s.step === 2) return Boolean(s.day && s.time);
    return s.name.trim().length > 1 && /^\S+@\S+\.\S+$/.test(s.email.trim());
  }

  async submit() {
    this.state.sending = true;
    this.render();
    const ok = await this.submitter.send(this.booking());
    this.state.sending = false;
    this.state.result = ok ? 'done' : 'error';
    this.render();
  }

  booking() {
    const s = this.state;
    return {
      session: SafeEar.sessions.find(x => x.id === s.sessionId),
      method: SafeEar.methods.find(x => x.id === s.methodId),
      clientTz: s.tz,
      instant: TimeZones.toInstant(s.day, s.time, s.tz),
      name: s.name.trim(),
      email: s.email.trim(),
      note: s.note.trim(),
    };
  }

  render() {
    const s = this.state;
    const body = s.result ? this.resultView() : [this.stepWhat, this.stepWhen, this.stepDetails][s.step - 1].call(this);
    this.root.innerHTML = `
      <div class="sheet-backdrop">
        <div class="sheet" role="dialog" aria-modal="true" aria-label="Book a session" tabindex="-1">
          ${s.result ? '' : this.headerView()}
          <div class="sheet-body">${body}</div>
          ${s.result ? '' : this.footerView()}
        </div>
      </div>`;
  }

  headerView() {
    const { step } = this.state;
    return `
      <div class="sheet-head">
        <div class="sheet-head-row">
          <span class="sheet-step">Step ${step} of 3</span>
          <button class="icon-btn" data-act="close" aria-label="Close">✕</button>
        </div>
        <h3 class="sheet-title">${BookingFlow.TITLES[step - 1]}</h3>
        <div class="progress"><span style="width:${step / 3 * 100}%"></span></div>
      </div>`;
  }

  footerView() {
    const { step, sending } = this.state;
    const label = sending ? 'Sending…' : step < 3 ? 'Continue →' : 'Confirm booking';
    return `
      <div class="sheet-foot">
        ${step > 1 ? '<button class="btn btn-ghost" data-act="back">← Back</button>' : ''}
        <button class="btn btn-primary sheet-next" data-act="next" ${this.canContinue() && !sending ? '' : 'disabled'}>${label}</button>
      </div>`;
  }

  stepWhat() {
    const s = this.state;
    const sessions = SafeEar.sessions.map(x => `
      <button class="choice ${s.sessionId === x.id ? 'on' : ''}" data-act="session" data-val="${x.id}" aria-pressed="${s.sessionId === x.id}">
        <span><b>${x.name}</b>${x.popular ? ' <em class="tag">Popular</em>' : ''}<small>${x.duration} · ${x.note}</small></span>
        <span class="choice-price">${x.price}</span>
      </button>`).join('');
    const methods = SafeEar.methods.map(x => `
      <button class="method ${s.methodId === x.id ? 'on' : ''}" data-act="method" data-val="${x.id}" aria-pressed="${s.methodId === x.id}">
        <span class="method-icon">${x.icon}</span>${x.label}
      </button>`).join('');
    return `
      <p class="field-label">Session</p>
      <div class="choices">${sessions}</div>
      <p class="field-label">How would you like to talk?</p>
      <div class="methods">${methods}</div>`;
  }

  stepWhen() {
    const s = this.state;
    const tzOptions = TimeZones.options()
      .map(([tz, label]) => `<option value="${tz}" ${tz === s.tz ? 'selected' : ''}>${label}</option>`).join('');
    return `
      <label class="field-label" for="tz">Your time zone</label>
      <select id="tz" class="input" data-field="tz">${tzOptions}</select>
      <p class="hint">We picked this from your device. Times below are in your time.</p>
      ${new BookingCalendar(s, SafeEar.daysAhead).html()}
      ${s.day ? this.slotsView() : ''}`;
  }

  slotsView() {
    const s = this.state;
    const soon = Date.now() + 60 * 60000;
    const buttons = this.slots.map(t => {
      const past = TimeZones.toInstant(s.day, t, s.tz).getTime() < soon;
      return `<button class="slot ${s.time === t ? 'on' : ''}" data-act="time" data-val="${t}" ${past ? 'disabled' : ''}>${slotLabel(t)}</button>`;
    }).join('');
    const tzTime = s.time
      ? `<p class="note-box">That's <b>${TimeZones.timeIn(TimeZones.toInstant(s.day, s.time, s.tz), SafeEar.operatorTimeZone)}</b> in ${SafeEar.operatorLabel}, where your listener is.</p>`
      : '';
    return `<p class="field-label">Pick a time</p><div class="slots">${buttons}</div>${tzTime}`;
  }

  stepDetails() {
    const s = this.state;
    return `
      ${this.summaryView()}
      <label class="field-label" for="bk-name">Your name <span class="hint-inline">(a first name or nickname is fine)</span></label>
      <input id="bk-name" class="input" data-field="name" value="${esc(s.name)}" autocomplete="given-name" placeholder="Jane">
      <label class="field-label" for="bk-email">Your email</label>
      <input id="bk-email" class="input" type="email" data-field="email" value="${esc(s.email)}" autocomplete="email" placeholder="jane@example.com">
      <label class="field-label" for="bk-note">Anything you'd like me to know? <span class="hint-inline">(optional)</span></label>
      <textarea id="bk-note" class="input" rows="3" data-field="note" placeholder="You can leave this empty.">${esc(s.note)}</textarea>
      <p class="hint">Your booking goes privately to SafeEar. You'll get a confirmation and payment details by email.</p>`;
  }

  summaryView() {
    const b = this.booking();
    return `
      <div class="note-box summary">
        <b>${b.session.name}</b> · ${b.session.duration} · ${b.session.price} · ${b.method.label}<br>
        ${TimeZones.dateIn(b.instant, b.clientTz)} at ${TimeZones.timeIn(b.instant, b.clientTz)}
        <small>${SafeEar.operatorLabel} time: ${TimeZones.timeIn(b.instant, SafeEar.operatorTimeZone)}</small>
      </div>`;
  }

  resultView() {
    if (this.state.result === 'error') {
      return `
        <div class="result">
          <div class="result-icon warn">!</div>
          <h3 class="sheet-title">That didn't go through</h3>
          <p>Please check your connection and try again, or email your booking to us directly.</p>
          <a class="btn btn-primary" href="${this.submitter.mailtoLink(this.booking())}">Email my booking</a>
          <button class="btn btn-ghost" data-act="retry">Try again</button>
        </div>`;
    }
    const s = this.state;
    const free = s.sessionId === 'intro';
    return `
      <div class="result">
        <div class="result-icon">✓</div>
        <h3 class="sheet-title">You're booked, ${esc(s.name.trim().split(' ')[0])}</h3>
        <p>Thank you for reaching out. That takes courage. We'll email <b>${esc(s.email.trim())}</b> to confirm your time.</p>
        ${this.summaryView()}
        ${free ? '' : '<p class="pay-note"><b>Payment info</b> comes by email. Pay via Payoneer, WorldRemit, Remitly or NALA.</p>'}
        <button class="btn btn-ghost" data-act="close">Close</button>
      </div>`;
  }

  static todayIn(tz) {
    const [m, d, y] = TimeZones.format(new Date(), tz, { year: 'numeric', month: 'numeric', day: 'numeric' }).split('/').map(Number);
    return new Date(y, m - 1, d);
  }
}

// Month grid. Dates are plain wall-clock days in the visitor's chosen zone.
class BookingCalendar {
  constructor(state, daysAhead) {
    this.state = state;
    this.today = BookingFlow.todayIn(state.tz);
    this.last = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() + daysAhead);
  }

  html() {
    const { month } = this.state;
    const title = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const canPrev = month > new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    const canNext = new Date(month.getFullYear(), month.getMonth() + 1, 1) <= this.last;
    const heads = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => `<span class="cal-head">${d}</span>`).join('');
    return `
      <div class="cal">
        <div class="cal-top">
          <button class="icon-btn" data-act="month" data-val="-1" ${canPrev ? '' : 'disabled'} aria-label="Previous month">‹</button>
          <b>${title}</b>
          <button class="icon-btn" data-act="month" data-val="1" ${canNext ? '' : 'disabled'} aria-label="Next month">›</button>
        </div>
        <div class="cal-grid">${heads}${this.cells()}</div>
      </div>`;
  }

  cells() {
    const { month, day } = this.state;
    const lead = (month.getDay() + 6) % 7; // Monday first
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    let out = '<span></span>'.repeat(lead);
    for (let n = 1; n <= count; n++) {
      const d = new Date(month.getFullYear(), month.getMonth(), n);
      const off = d < this.today || d > this.last;
      const on = day && d.getTime() === day.getTime();
      const isToday = d.getTime() === this.today.getTime();
      out += `<button class="cal-day ${on ? 'on' : ''} ${isToday ? 'today' : ''}" data-act="day" data-val="${d.getTime()}" ${off ? 'disabled' : ''}>${n}</button>`;
    }
    return out;
  }
}

function esc(text) {
  return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
