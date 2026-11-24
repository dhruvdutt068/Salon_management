# Flows & Rules

This document defines the complete application workflow, queue management rules, business logic, and testing checklist for the Salon Queue Management System.

---

# Flow 1: Remote Customer

1. Customer opens the **Home** page.
2. Views salon status, current waiting count, estimated wait, and barber availability.
3. Clicks **Join Queue**.
4. Enters name and valid 10-digit phone number.
5. Selects one or more services (maximum 3).
6. Chooses either a preferred barber or **Any Barber**.
7. Reviews total duration, price, and estimated waiting time.
8. Clicks **Confirm**.
9. Backend validates the request:
   - Phone number is not already in the queue.
   - Queue is open.
   - Selected services are available.
10. System generates a unique token (e.g., **S-014**).
11. Customer is redirected to **My Status**.
12. Customer monitors:
    - Queue position
    - Estimated wait
    - Assigned barber
13. When the customer reaches **2nd in queue**, a banner appears:
    - **"Please start coming to the salon."**
14. Receptionist taps **Call Next**.
15. Customer status changes to **Called**.
16. Customer receives:
    - Full-screen notification
    - Browser notification (if enabled)
    - Optional vibration/sound
17. TV Display flashes the customer's token.
18. Barber presses **Start**.
19. Customer status changes to **In Chair**.
20. Barber presses **Done** after service completion.
21. Customer status changes to **Completed**.
22. Queue updates automatically for all connected screens.

---

# Flow 2: Walk-in Customer

1. Receptionist opens **Reception Dashboard**.
2. Clicks **+ Add Walk-in**.
3. Enters:
   - Name
   - Phone Number
   - Services
   - Preferred Barber
4. Backend validates customer information.
5. Customer receives the next available queue token.
6. Walk-in customer joins the same queue as online customers.
7. Queue order follows **First Come, First Served**.
8. Customer appears immediately on:
   - Reception Dashboard
   - Waiting Area Display
   - Barber View (when assigned)

---

# Flow 3: Reception Management

1. Receptionist monitors live queue.
2. Searches customers by:
   - Token
   - Name
   - Phone Number
3. Calls next customer for a selected barber.
4. Cancels customers if requested.
5. Marks absent customers as **No-show**.
6. Views customers waiting more than 60 minutes.
7. Queue updates instantly across all connected devices.

---

# Flow 4: Barber Workflow

1. Barber logs into their screen.
2. Views assigned customer.
3. Reviews selected services.
4. Presses **Start Service**.
5. Service timer begins.
6. Reception Dashboard updates status.
7. Customer status changes to **In Chair**.
8. Barber completes service.
9. Presses **Done**.
10. Queue automatically assigns the next customer.
11. If barber selects **On Break**, no new customers are assigned until available again.

---

# Flow 5: Waiting Area Display

1. TV Display refreshes automatically.
2. Shows:
   - Current customer for each barber
   - Next five queue tokens
   - Estimated waiting times
3. Newly called customer flashes with animation.
4. Notification sound plays.
5. Display updates without manual refresh.

---

# Flow 6: Owner Management

1. Owner opens **Admin Panel**.
2. Manages services:
   - Add/Edit/Disable
3. Enables or disables barbers.
4. Opens or closes online queue.
5. Views:
   - Customers served
   - Average waiting time
   - No-shows
   - Active queue size
6. Changes apply immediately throughout the application.

---

# Queue Status Flow

```
Waiting
    │
    ▼
Called
    │
    ▼
In Chair
    │
    ▼
Completed
```

Alternative transitions

```
Waiting
    │
    ▼
Cancelled
```

```
Called
    │
    ▼
No-show
```

No status may move backwards.

---

# Queue Assignment Rules

- Queue follows **First Come, First Served**.
- Customers selecting **Any Barber** can be assigned to the first available barber.
- Customers selecting a preferred barber must wait for that barber only.
- Preferred barber customers are never reassigned automatically.
- Every barber can serve only one customer at a time.
- Walk-in customers join the end of the queue.
- Queue order is determined by join time.
- One active queue entry is allowed per phone number.
- Duplicate queue requests are rejected.
- Disabled services cannot be selected.
- Closed queue prevents online joining but still allows walk-ins.

---

# Waiting Time Calculation

Estimated waiting time is calculated using:

```
Total service duration of customers ahead
÷
Number of available barbers
```

Waiting time automatically updates whenever:

- Customer joins
- Customer cancels
- Service starts
- Service completes
- Barber goes on break
- Barber returns from break
- Queue order changes

---

# Barber Rules

- One active customer at a time.
- Cannot start another service while busy.
- Going on break prevents new assignments.
- Current service must finish before break becomes effective.
- Returning from break allows normal assignment again.

---

# Customer Rules

- Phone number must be unique.
- Maximum three services.
- At least one service required.
- Customer may cancel only while in **Waiting** status.
- Cancelled customers are removed permanently.
- Customers marked **No-show** must join again from the end of the queue.

---

# Reception Rules

Reception can:

- Add walk-ins
- Call next customer
- Cancel queue entries
- Mark No-show
- View waiting times
- Search customers

Reception cannot:

- Change queue order manually
- Modify completed records
- Assign customers to unavailable barbers

---

# Owner Rules

Owner can:

- Manage services
- Manage barbers
- Open/Close queue
- View analytics

Owner cannot:

- Modify historical queue records

---

# Realtime Synchronization

The following screens stay synchronized through WebSockets:

- Home
- My Status
- Reception Dashboard
- Barber View
- Waiting Area Display
- Owner Dashboard

Updates should propagate within **5 seconds**.

No manual refresh should ever be required.

---

# Error Handling

Display clear messages for:

- Invalid phone number
- Duplicate phone number
- Queue closed
- Service unavailable
- Barber unavailable
- Lost internet connection
- Server unavailable
- Invalid token
- Customer not found

---

# Test Checklist

## Customer

- [ ] Join queue with one service.
- [ ] Join queue with three services.
- [ ] Phone validation works correctly.
- [ ] Duplicate phone numbers are rejected.
- [ ] Estimated waiting time is calculated correctly.
- [ ] Customer receives a queue token.
- [ ] Customer can cancel while waiting.
- [ ] Customer cannot cancel after being called.

## Reception

- [ ] Walk-in customer joins successfully.
- [ ] Call Next assigns the correct customer.
- [ ] Preferred barber rule is respected.
- [ ] Any Barber customers are assigned correctly.
- [ ] No-show removes customer from active queue.
- [ ] Waiting customers over 60 minutes are highlighted.

## Barber

- [ ] Start changes status to In Chair.
- [ ] Done completes the service.
- [ ] Timer runs correctly.
- [ ] Break mode prevents new assignments.

## Waiting Area Display

- [ ] Current customer updates instantly.
- [ ] Next five tokens display correctly.
- [ ] Newly called token flashes.
- [ ] Display updates automatically.

## Admin

- [ ] Enable/Disable services.
- [ ] Open/Close queue.
- [ ] Statistics update correctly.
- [ ] Disabled services disappear from Join Queue.

## Realtime

- [ ] Customer joins → Reception updates.
- [ ] Reception calls customer → Customer screen updates.
- [ ] Barber starts service → TV updates.
- [ ] Barber finishes service → Queue refreshes everywhere.
- [ ] Multiple browser windows remain synchronized.

---

# Definition of Success

The application is considered complete when:

- All seven screens function correctly.
- Queue rules are enforced consistently.
- Waiting times are accurate.
- Real-time synchronization works across all screens.
- No duplicate queue entries exist.
- Responsive design works on mobile, tablet, desktop, and TV.
- English and Gujarati translations are available.
- The project is deployment-ready with React, FastAPI, PostgreSQL, and WebSocket support.