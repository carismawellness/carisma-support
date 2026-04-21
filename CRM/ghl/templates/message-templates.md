# Message Templates

SMS and email templates for Carisma GHL automations. All use GHL merge tag syntax.

---

## SMS Templates

### First Contact — Aesthetics
```
Hola {{contact.first_name}}! Soy de Carisma Aesthetics. Vi que te interesaste en nuestros tratamientos. 
¿Tienes unos minutos para hablar hoy? 📞
```

### First Contact — Spa (English)
```
Hi {{contact.first_name}}, this is {{user.first_name}} from Carisma Spa & Wellness! 
I saw you were interested in our services. Are you free for a quick chat? 😊
```

### Follow-up 1
```
Hi {{contact.first_name}}, I tried reaching you earlier but couldn't get through. 
I'd love to tell you about our current offer at Carisma. When's a good time to call? 📞
```

### Appointment Confirmation
```
Hi {{contact.first_name}}! Just confirming your appointment at {{location.name}} on 
{{appointment.start_time}}. See you then! If anything changes, reply here 😊
```

### Appointment Reminder (24h before)
```
Reminder: You have an appointment at {{location.name}} tomorrow at {{appointment.start_time}}. 
Looking forward to seeing you, {{contact.first_name}}! 🌟
```

### Appointment Reminder (2h before)
```
Hi {{contact.first_name}}! Your appointment is in 2 hours at {{appointment.start_time}}. 
See you soon at {{location.name}}! 📍
```

### No Show — Reschedule
```
Hi {{contact.first_name}}, we missed you today! No worries — let's find another time that works better. 
When would you be available? 💙
```

### Reactivation (120+ days)
```
Hi {{contact.first_name}}! It's been a while since we last spoke. We have some exciting new treatments 
at {{location.name}} — would you like to hear more? 🌸
```

---

## Email Templates

### Appointment Confirmation
**Subject:** Your appointment is confirmed! ✓

```html
Hi {{contact.first_name}},

Your appointment at {{location.name}} is confirmed for:

📅 {{appointment.start_time}}

We're looking forward to seeing you!

If you need to reschedule, just reply to this email or call us at {{location.phone}}.

Warm regards,
The {{location.name}} Team
```

### Post-Consultation Follow-up
**Subject:** How did we do, {{contact.first_name}}?

```html
Hi {{contact.first_name}},

It was a pleasure having you at {{location.name}} today!

We hope your experience was everything you hoped for. If you have any questions about next steps 
or would like to book your next appointment, we're here for you.

You can book directly here: {{location.website}}

Warmly,
The {{location.name}} Team
```

### Review Request
**Subject:** Share your experience with us 🌟

```html
Hi {{contact.first_name}},

Thank you for visiting {{location.name}}! We'd love to hear about your experience.

Your feedback helps us improve and helps others discover us:
👉 Leave a Google Review: [GOOGLE_REVIEW_LINK]

It only takes 2 minutes and means the world to us!

With gratitude,
The {{location.name}} Team
```

---

## Notes

- SMS: Keep under 160 characters to avoid multi-part messages.
- Always include opt-out: "Reply STOP to unsubscribe" for marketing SMS (not required for transactional).
- Merge tags are resolved by GHL at send time — test with a real contact before deploying in workflows.
- Custom field merge tags format: `{{contact.your_field_key}}`
