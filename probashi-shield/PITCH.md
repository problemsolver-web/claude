# 🎤 Probashi Shield - Pitch & Demo Playbook

Everything you need to win the room: the 5-minute pitch script, a click-by-click
live demo, judge Q&A prep, and the one-liners that land.

---

## ⏱️ The 5-Minute Pitch (word-for-word)

### 0:00 - HOOK (30s)
> "Raise your hand if you know someone who went abroad for work."
>
> *(pause - most hands go up)*
>
> "Now keep it up if that person, or their family, was cheated by a recruiting
> agent. A fake job. A wrong salary. Money that vanished."
>
> *(many hands stay up)*
>
> "That's the problem. Every year, thousands of Bangladeshi families sell their
> land and take loans to pay an agent 3 to 5 lakh taka - for a job that doesn't
> exist."

### 0:30 - PROBLEM (1m)
> "Bangladesh sends over 10 million workers abroad. They send home around 22
> billion dollars a year - one of the biggest pillars of our economy.
>
> But before they leave, there is no easy way to check if an agent is real.
> The official BMET licensed-agency list exists - but a farmer in Jamalpur
> cannot navigate a government website on a basic phone. So they trust the
> well-dressed *dalal* in the next village. And they lose everything.
>
> The information that could save them already exists. It is just locked away
> from the people who need it most."

### 1:30 - SOLUTION (1m)
> "Probashi Shield puts that information one search away.
>
> A worker types an agency's name - on the web, or by SMS on a 200-taka phone -
> and instantly gets a verdict: Green, safe and licensed. Yellow, licensed but
> reported. Red, blacklisted - do not pay.
>
> It is built on the official BMET list, plus crowd-sourced fraud reports from
> workers themselves. And it works in Bangla, offline, by SMS - because that is
> how real people in real villages actually communicate."

### 2:30 - LIVE DEMO (1m 30s)
*(See the demo script below. Keep it to three moves: a red result, the SMS, and a report.)*

### 4:00 - BUSINESS MODEL + IMPACT (45s)
> "How does it sustain itself? Licensed agencies pay for a verified trust badge -
> being on the green list brings them business. The Ministry of Expatriates'
> Welfare can fund it as public infrastructure. And telecoms can sponsor the
> SMS line as social good.
>
> If we stop just one in ten of these frauds, we protect thousands of families
> and crores of taka every year."

### 4:45 - ASK + CLOSE (15s)
> "We are asking for support to integrate the live BMET feed and pilot in three
> high-migration districts. Probashi Shield turns a government list nobody reads
> into a shield every family can hold. Thank you."

---

## 🖥️ Live Demo Script (click-by-click)

> **Before you start:** backend running on :4000, frontend on :3000, database
> seeded. Have the browser open at `http://localhost:3000`. Switch language to
> বাংলা once to show judges it works - then switch back to English.

**Move 1 - The "Red" moment (the gut punch)**
1. On the home page, type **`Dubai Dream`** and hit Verify.
2. Point at the 🔴 **DANGER** badge: "This agency is blacklisted - 3 verified
   fraud cases, over 9 lakh taka reported lost."
3. Click the result → on the detail page, scroll to **Recent Reports**: read one
   line aloud - *"Paid 4.2 lakh for a UAE job. Agent disappeared. We sold land."*

**Move 2 - The "Green" contrast (2 seconds)**
4. Search **`Al-Amin`** → 🟢 **VERIFIED**, Premium badge, license active.
   "Same search, instant trust. This is how a worker chooses safely."

**Move 3 - The SMS reality (the differentiator)**
5. Go to **SMS Demo**. In the phone mockup, tap the **`VERIFY Dubai Dream`**
   chip. Show the instant warning reply.
   "No smartphone. No internet. No app to download. This is the version that
   reaches the village."

**Move 4 - Closing the loop (accountability)**
6. Open **Report Fraud**, submit a quick report → show the **tracking number**.
7. Open **Impact**: "Every search and report is counted here - public
   accountability, in real time."

*(Optional, if judges are technical)* Log into **Admin** (`/admin/login`) and
show the Ministry dashboard: change a complaint to "verified fraud" and
one-click blacklist an agency. "This is the government control panel."

**Total demo time: ~90 seconds. Practice it 5 times until it's muscle memory.**

---

## 🛡️ Judge Q&A - Prepared Answers

**Q: Where does the data come from? Is it real?**
> The licensed-agency list is official public BMET data - today via a scheduled
> importer (we have the CSV import pipeline built), and via direct feed once the
> Ministry partners. Fraud reports are crowd-sourced and then verified by a
> Ministry review step before they're marked "verified" - so we don't defame
> honest agencies.

**Q: What stops people filing fake reports to damage a competitor?**
> Three layers: reports start as "unverified" and are clearly labelled as such;
> only the Ministry review team can mark a report "verified"; and we rate-limit
> and log submissions. The public verdict weighs verified reports far more
> heavily than raw crowd reports.

**Q: Why will workers actually use it?**
> Because it meets them where they are - Bangla language, SMS on basic phones,
> no app, no internet. And the moment of use is exactly when they're about to
> pay a large sum, which is when fear and motivation are highest.

**Q: How is this different from the BMET website?**
> The data exists but is unusable for our audience. We turn a government
> directory into a one-word answer - safe or not - delivered by SMS in Bangla.
> Distribution and simplicity are the product.

**Q: How do you make money / sustain it?**
> Verified trust badges for honest agencies (they want to be on the green list),
> Ministry funding as public-safety infrastructure, and telecom CSR sponsorship
> of the SMS shortcode. The marginal cost per verification is a fraction of a
> taka.

**Q: What's the moat?**
> The verified-report dataset compounds over time, the Ministry/BMET integration
> is a partnership others can't easily replicate, and trust + distribution in
> rural areas is hard-won.

**Q: Can it scale to all 64 districts?**
> Day one. It's a national dataset plus SMS - no per-district logistics, no
> fleet, no inventory. Scaling is a marketing problem, not an operations one.

---

## 💬 One-liners that land
- "We turn a government list nobody reads into a shield every family can hold."
- "The information to stop this fraud already exists - we just deliver it to the
  person about to pay."
- "Green, yellow, red. That's the whole product. Simplicity is the feature."
- "It works on a 200-taka phone, in Bangla, with no internet - because that's
  who we're protecting."

---

## ✅ Pre-demo checklist
- [ ] Backend running (`http://localhost:4000/health` returns ok)
- [ ] Frontend running (`http://localhost:3000`)
- [ ] Database seeded (search "Dubai Dream" returns a red result)
- [ ] Language toggle works (switch to বাংলা and back once on stage)
- [ ] SMS demo chips respond
- [ ] Admin login works (`admin@probashishield.gov.bd` / `admin123`)
- [ ] Backup: screen-recording of the demo in case the laptop/wifi fails
- [ ] Phone hotspot ready as network backup
