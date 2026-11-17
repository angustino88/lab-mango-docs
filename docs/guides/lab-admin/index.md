---
sidebar_position: 1
sidebar_label: Overview
title: Lab admin guide
---

# Lab admin guide

A lab admin has every [coordinator](../lab-coordinator/index.md) right, plus:

- **Who has which role:** see the user groups and their members, and keep role assignments right.
  See [Roles and access](./roles-and-access.md).
- **Support desk configuration:** categories, priorities, statuses, teams, labels, workflow transitions,
  canned responses and desk settings. See [Support desk configuration](./support-desk-configuration.md).
- **Support desk admin:** admins are support admins, not only agents.

## Lab admin and superuser are different

| | Lab admin (Labs role `admin`) | Superuser (Django) |
|---|---|---|
| Comes from | Membership of a URS group mapped to `admin` | Set on the user account by another superuser |
| Uses | The Lab Mango app | The Lab Mango app and the backend's Django admin site |
| Can change role mappings | No | Yes |

Changing which URS group grants which role is a **superuser** task in Django admin. A lab admin who needs a role
changed asks a superuser. The steps are in [Roles and access](./roles-and-access.md#change-a-role-superusers).
