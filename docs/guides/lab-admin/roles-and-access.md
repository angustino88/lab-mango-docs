---
sidebar_position: 2
title: Roles and access
---

# Roles and access

## How a person gets a role

1. People are members of company **URS groups** (User Rights Service). URS is the source of truth.
2. In Lab Mango, each URS group is linked to one **Labs role**: `admin`, `coord` (coordinator), `user`, or no
   role.
3. A scheduled sync copies URS membership into Lab Mango. New members get an account automatically. Members who
   are in no group any more are deactivated.
4. A person's roles are the roles of all their groups. Roles include the lower ones: **admin > coordinator >
   user**. Superusers hold every role.

Lab Mango denies by default: a person with no mapped group has no role and cannot change anything. Roles are read
on every request, so a change applies on the person's next request, with no new sign-in needed.

## Give someone access

Ask the person's manager or the URS group owner to add them to the right URS group. After the next sync, the person
has the role. A superuser can run the sync straight away (see below).

## See who has which role

As a lab admin you can list the user groups and their members. Membership shows who holds which role, which is why
only admins can see it.

## Change a role (superusers)

Role mappings are changed in the backend's **Django admin** site, under **People and access**. Only superusers can
add, change or delete URS groups; other staff can only view them.

1. Open **URS groups**.
2. Add a group (URS id, name, **Labs role**, **active**) or change an existing one.
3. Save. For an active group, Lab Mango creates its Django group if needed and queues a sync of that group right away.
4. To re-sync later, select groups and run the action **Sync selected URS groups**, then refresh the list to see
   the result.

The URS group list shows each group's role, members and the last sync (time, status and message). The **users**
list shows each person's Labs roles, the URS groups that grant them, last sign-in and whether a Microsoft account
is linked.

:::info Every change is audited
Changes to URS groups, user privileges and group permissions, and every membership or activity change made by the
sync, are written to an append-only **role audit log** that nobody can edit or delete. Superusers can read it in
Django admin under **Role audit events**.
:::

## Sync results

| Last sync status | Meaning | What to do |
|---|---|---|
| **applied** | Membership was updated from URS | Nothing |
| **failed** | URS could not be reached or answered wrongly. Membership was **not** changed | Check the message, then sync again |
| **blocked** | The optional safety check stopped a large removal. Nothing was changed | Confirm the removal is intended, then a superuser runs **Sync selected URS groups and apply blocked removals** |

## Troubleshooting access

| Symptom | Likely cause |
|---|---|
| Can sign in but cannot book | The person is in no group with a Labs role. Check the user's Labs roles in Django admin |
| A coordinator sees **Access denied (403)** on Spaces | Their group is mapped to `user`, or the group is inactive |
| A new team member has no account yet | They were added to URS after the last sync. Run a sync for that group |
| Someone left but still has access | Their URS group still lists them, or the last sync of that group failed |
