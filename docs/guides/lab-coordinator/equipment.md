---
sidebar_position: 4
title: Equipment and licenses
---

# Equipment and licenses

The **Equipment** menu has one page per category: Computing, Display, Debugging, Networking, Power, Accessories,
Samples, Furniture, Instruments, Laboratory, Mechanical and Other, plus **Licenses**.

## How an equipment status is worked out

Lab Mango keeps four separate facts about each unit and shows one status label computed from them:

| Fact | Question | Values |
|---|---|---|
| Lifecycle | Does the lab still have it? | Planned, In service, Transferred out, Retired, Lost |
| Condition | Does it work? | Operational, In maintenance, Out of service |
| Placement | Where is it? | A bench, a station, a room, a location note, or unknown |
| Loan | Who holds it, until when? | An open loan with a borrower and a due date, or none |

Examples:

| Situation | Status shown |
|---|---|
| In service and mounted on a bench | **In use** |
| In service, in a room or in storage | **Available** |
| On a bench but broken | **Broken** |
| Ordered, not delivered | **On order** |
| Handed to someone until Friday | **Borrowed** |
| Given to a partner lab | **Transferred** |

**In service** means the lab owns the unit and it is part of the active inventory. It does **not** mean "on a bench".

## Common tasks

- **Place equipment:** use **Change placement** or **Assign to bench**. Removing a unit from a bench makes it
  **Available**, and its location is unknown until you place it again.
- **Report maintenance or a fault:** use **Change status** to set the condition. This opens a downtime window that
  starts now; ending it returns the unit to operational. Planned downtime shows on the booking calendar.
- **Lend equipment:** hand it over to a borrower with a due date; record the return and its condition when it
  comes back, or extend the loan.
- **Retire, transfer or mark as lost:** change the lifecycle. Only valid lifecycle moves are allowed.

Every change is recorded in the unit's history with who changed what and when.

## Licenses

**Licenses** tracks software license entitlements and their assignments to equipment or people, including active
agreements and audit details. Use the Excel import to load a license register.
