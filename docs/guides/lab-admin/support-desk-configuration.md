---
sidebar_position: 3
title: Support desk configuration
---

# Support desk configuration

Admins configure how the support desk works. Coordinators work tickets; requesters create them.

| What | Purpose |
|---|---|
| **Categories** and **request types** | What a ticket is about; used to route and report |
| **Priorities** | Order of urgency, with response and resolution targets (SLA) per priority |
| **Statuses** and **transitions** | The ticket workflow: which status can follow which, who may do it, and whether a reason or resolution code is required. Statuses can pause the SLA clock |
| **Teams** | Groups of agents. New and routed tickets notify the team's members, or all agents if there is no team |
| **Labels** | Free tags for agents |
| **Canned responses** | Reusable reply templates for agents |
| **Settings** | Desk-wide options, for example whether requesters can set the priority, whether SLA is on, attachment limits and the rating window |

## Priority when a requester does not choose one

If the requester gives no priority, or is not allowed to, Lab Mango works it out from **impact × urgency**. If that
is not possible it uses the default priority. If no priority can be found, ticket creation is refused, so keep at
least one active default priority.
