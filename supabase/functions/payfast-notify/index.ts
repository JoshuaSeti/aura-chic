import { createClient } from "npm:@supabase/supabase-js@2";
import { createHash } from "node:crypto";

// PHP-style urlencode
function phpUrlencode(value: string): string {
  return encodeURIComponent(value)
    .replace(/%[0-9a-f]{2}/g, (m) => m.toUpperCase())
    .replace(/%20/g, "+")
    .replace(/!/g, "%21")
    .replace(/\*/g, "%2A")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/~/g, "%7E");
}

function buildSignature(data: Record<string, string>, passphrase?: string): string {
  const pairs = Object.entries(data)
    .filter(([k, v]) => k !== "signature" && v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${phpUrlencode(String(v))}`);
  let s = pairs.join("&");
  if (passphrase && passphrase.length > 0) {
    s += `&passphrase=${phpUrlencode(passphrase)}`;
  }
  return createHash("md5").update(s).digest("hex");
}

// Valid Payfast IP ranges (resolve hostnames at runtime)
const SANDBOX = (Deno.env.get("PAYFAST_SANDBOX") ?? "true").toLowerCase() !== "false";
const PAYFAST_HOSTS = SANDBOX
  ? ["sandbox.payfast.co.za"]
  : ["www.payfast.co.za", "w1w.payfast.co.za", "w2w.payfast.co.za"];

async function isValidSourceIp(ip: string): Promise<boolean> {
  try {
    const lookups = await Promise.all(
      PAYFAST_HOSTS.map((h) => Deno.resolveDns(h, "A").catch(() => [] as string[]))
    );
    const valid = new Set<string>(lookups.flat());
    return valid.has(ip);
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  // Payfast does NOT need CORS — it's a server-to-server POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const passphrase = Deno.env.get("PAYFAST_PASSPHRASE") ?? "";

    // Parse form-encoded body
    const text = await req.text();
    const params = new URLSearchParams(text);
    const data: Record<string, string> = {};
    for (const [k, v] of params.entries()) data[k] = v;

    const receivedSignature = data.signature;
    const dataForSig = { ...data };
    delete dataForSig.signature;

    // 1. Verify signature
    const expectedSignature = buildSignature(dataForSig, passphrase);
    if (expectedSignature !== receivedSignature) {
      console.error("Invalid signature", { expectedSignature, receivedSignature });
      return new Response("Invalid signature", { status: 400 });
    }

    // 2. Verify source IP (best effort)
    const forwarded = req.headers.get("x-forwarded-for") || "";
    const sourceIp = forwarded.split(",")[0].trim();
    if (sourceIp) {
      const okIp = await isValidSourceIp(sourceIp);
      if (!okIp) {
        console.warn("ITN from unrecognised IP:", sourceIp);
        // not fatal — Payfast IPs change; rely on signature + server validation
      }
    }

    // 3. Server-side validate with Payfast
    const validateBody = Object.entries(dataForSig)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    const validateUrl = "https://www.payfast.co.za/eng/query/validate";
    const validateRes = await fetch(validateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: validateBody,
    });
    const validateText = (await validateRes.text()).trim();
    if (!validateText.startsWith("VALID")) {
      console.error("Payfast validate failed:", validateText);
      return new Response("Validation failed", { status: 400 });
    }

    // 4. Update order
    const orderId = data.custom_str1 || data.m_payment_id;
    const pfPaymentId = data.pf_payment_id;
    const paymentStatus = (data.payment_status || "").toUpperCase();

    if (!orderId) return new Response("Missing order id", { status: 400 });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let nextPaymentStatus = "pending";
    let nextStatus = "pending";
    if (paymentStatus === "COMPLETE") {
      nextPaymentStatus = "paid";
      nextStatus = "paid";
    } else if (paymentStatus === "FAILED") {
      nextPaymentStatus = "failed";
      nextStatus = "cancelled";
    } else if (paymentStatus === "CANCELLED") {
      nextPaymentStatus = "cancelled";
      nextStatus = "cancelled";
    }

    // Fetch order to confirm amount matches
    const { data: order } = await supabase
      .from("orders")
      .select("id, total")
      .eq("id", orderId)
      .maybeSingle();

    if (!order) {
      console.error("Order not found:", orderId);
      return new Response("Order not found", { status: 404 });
    }

    const grossAmount = parseFloat(data.amount_gross || "0");
    if (Math.abs(Number(order.total) - grossAmount) > 0.01) {
      console.error("Amount mismatch", { orderTotal: order.total, grossAmount });
      return new Response("Amount mismatch", { status: 400 });
    }

    await supabase
      .from("orders")
      .update({
        payment_status: nextPaymentStatus,
        status: nextStatus,
        payment_reference: pfPaymentId || null,
      })
      .eq("id", orderId);

    return new Response("OK", { status: 200 });
  } catch (e) {
    console.error("payfast-notify error:", e);
    return new Response("error", { status: 500 });
  }
});
