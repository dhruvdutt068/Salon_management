# Screens & Features

## Screen 1: Home (`/`)
**User:** Customer

- Salon logo & name
- Open/Closed status badge with closing time
- Live queue card (people waiting + estimated wait)
- Barber status chips (Available / Busy / On Break)
- Quick salon information
- Large **Join Queue** button
- Language toggle (EN/GU)

---

## Screen 2: Join Queue (`/join`)
**User:** Customer

- Customer name & 10-digit phone number
- Service cards (multi-select, max 3)
- Preferred barber or **Any Barber**
- Live summary (services, duration, total price, estimated wait)
- Form validation
- **Confirm** button → redirects to My Status

---

## Screen 3: My Status (`/status/:token`)
**User:** Customer

- Queue token displayed prominently
- Current position in queue
- Live estimated waiting time
- Progress status (Waiting → Called → In Chair → Done)
- "Start coming to the salon" alert when 2nd in queue
- Full-screen "It's Your Turn" notification
- Cancel queue option with confirmation

---

## Screen 4: Reception Dashboard (`/reception`)
**User:** Receptionist (Tablet)

- Barber cards with current customer & remaining time
- **Call Next** button for each barber
- Live waiting list with token, customer, services & wait time
- **Add Walk-in** customer
- **No-show** and **Cancel** actions
- Waiting >60 min highlighted
- Live queue statistics

---

## Screen 5: Barber View (`/barber/:name`)
**User:** Barber

- Current customer details
- Service timer
- **Start** / **Done** buttons
- Next assigned customer
- Availability toggle (Available / On Break)
- Auto-updates from reception

---

## Screen 6: Waiting Area Display (`/display`)
**User:** Waiting Area TV

- Live status for every barber
- Current customer token
- Next 5 queue tokens
- Estimated waiting times
- Flash animation & chime for newly called customers
- Auto-refresh via WebSocket

---

## Screen 7: Owner Settings (`/admin`)
**User:** Owner / Admin

- Manage services (EN/GU, duration, price, availability)
- Manage barbers on duty
- Open/Close online queue
- Daily statistics (customers served, average wait, no-shows)
- Basic salon configuration