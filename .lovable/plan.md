

## WhatsApp Order Updates via Meta Cloud API

### Overview
Build automated WhatsApp notifications that fire when an admin changes an order's status. Customers receive messages like "Your order has been shipped!" to their phone number.

### Prerequisites (from you)
You'll need to set up a **Meta WhatsApp Business account**:
1. Go to [developers.facebook.com](https://developers.facebook.com) → Create an app → Select "Business" type
2. Add the **WhatsApp** product to your app
3. In WhatsApp → API Setup, you'll get a **Phone Number ID** and a temporary **Access Token** (for testing) or a permanent **System User Token** (for production)
4. Create **message templates** in WhatsApp Manager (Meta requires pre-approved templates for business-initiated messages)

You'll need to provide:
- **WHATSAPP_ACCESS_TOKEN** — your permanent access token
- **WHATSAPP_PHONE_NUMBER_ID** — the phone number ID from Meta dashboard

### Technical Plan

**1. Backend function: `send-whatsapp`**
- Edge function that accepts `{ phone, template, orderId, status }`
- Calls Meta's Cloud API: `POST https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages`
- Sends a pre-approved template message with order status as a variable
- Includes CORS headers and auth validation (admin-only)

**2. Update `AdminOrders.tsx`**
- When admin changes order status via the dropdown, after the database update succeeds, call the `send-whatsapp` edge function with the customer's phone and new status
- Only sends if the customer provided a phone number
- Show toast feedback on success/failure

**3. Update `Checkout.tsx`**
- Make the phone field required (or strongly encouraged) with a note: "For order updates via WhatsApp"
- Add proper phone validation (international format)

**4. Config updates**
- Add `[functions.send-whatsapp]` with `verify_jwt = false` to config.toml
- Store the two secrets securely via the secrets tool

### Message Templates
You'll need to create these templates in your Meta WhatsApp Manager:
- **order_confirmed** — "Hi {{1}}, your order #{{2}} has been confirmed!"
- **order_shipped** — "Hi {{1}}, your order #{{2}} has been shipped!"
- **order_delivered** — "Hi {{1}}, your order #{{2}} has been delivered!"

### Flow
```text
Admin changes status → DB update → Edge function called
→ Meta Cloud API → Customer gets WhatsApp message
```

### Next Step
Before I can build this, I'll need you to set up the Meta WhatsApp Business account and provide the two API credentials. Want to proceed?

