import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createHash } from "node:crypto";

const SANDBOX = (Deno.env.get("PAYFAST_SANDBOX") ?? "true").toLowerCase() !== "false";
const PAYFAST_URL = SANDBOX
  ? "https://sandbox.payfast.co.za/eng/process"
  : "https://www.payfast.co.za/eng/process";

// PHP-style urlencode: uppercase hex, spaces as '+', encodes ~ as %7E
function phpUrlencode(value: string): string {
  return encodeURIComponent(value)
    .replace(/%[0-9a-f]{2}/g, (m) => m.toUpperCase())
    .replace(/%20/g, "+")
    .replace(/!/g, "%21")
    .replace(/\*/g, "%2A")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
}

function buildSignature(data: Record<string, string>, passphrase?: string): string {
  // Payfast: pairs in the order they're submitted; empties skipped
  const pairs = Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${phpUrlencode(String(v))}`);
  let signatureString = pairs.join("&");
  if (passphrase && passphrase.length > 0) {
    signatureString += `&passphrase=${phpUrlencode(passphrase)}`;
  }
  return createHash("md5").update(signatureString).digest("hex");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const merchantId = SANDBOX ? "10000100" : Deno.env.get("PAYFAST_MERCHANT_ID");
    const merchantKey = SANDBOX ? "46f0cd694581a" : Deno.env.get("PAYFAST_MERCHANT_KEY");
    const passphrase = SANDBOX ? "" : (Deno.env.get("PAYFAST_PASSPHRASE") ?? "");

    if (!merchantId || !merchantKey) {
      return new Response(JSON.stringify({ error: "Payfast not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      items,
      total,
      discount_code,
      discount_amount,
      return_url,
      cancel_url,
    } = body;

    if (!customer_name || !customer_email || !customer_phone || !shipping_address || !items?.length || !total) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Create pending order
    const { data: order, error: insertError } = await supabase
      .from("orders")
      .insert({
        customer_name,
        customer_email,
        customer_phone: customer_phone || null,
        shipping_address,
        items,
        total,
        discount_code: discount_code || null,
        discount_amount: discount_amount || 0,
        status: "pending",
        payment_provider: "payfast",
        payment_status: "pending",
      })
      .select()
      .single();

    if (insertError || !order) {
      console.error("Order insert error:", insertError);
      return new Response(JSON.stringify({ error: "Could not create order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const notifyUrl = `${supabaseUrl}/functions/v1/payfast-notify`;

    // Split customer name
    const nameParts = String(customer_name).trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || firstName;

    // Item summary for Payfast
    const itemName = `SosoFab Order #${order.id.slice(0, 8)}`;
    const itemDescription = Array.isArray(items)
      ? items.map((i: any) => `${i.name} x${i.quantity}`).join(", ").slice(0, 250)
      : "Order";

    // Build data object in the order Payfast expects.
    // Trim every value here so signature input matches what we submit in the URL.
    const rawData: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: return_url || "",
      cancel_url: cancel_url || "",
      notify_url: notifyUrl,
      name_first: firstName,
      name_last: lastName,
      email_address: customer_email,
      // cell_number intentionally omitted — Payfast rejects non-SA formats and causes signature mismatch on their redirect.
      m_payment_id: order.id,
      amount: Number(total).toFixed(2),
      item_name: itemName.slice(0, 100),
      item_description: itemDescription,
      custom_str1: order.id,
    };

    const data: Record<string, string> = {};
    for (const [k, v] of Object.entries(rawData)) {
      const trimmed = String(v ?? "").trim();
      if (trimmed !== "") data[k] = trimmed;
    }

    const signature = buildSignature(data, passphrase);
    const finalParams = { ...data, signature };

    const queryString = Object.entries(finalParams)
      .map(([k, v]) => `${k}=${phpUrlencode(String(v))}`)
      .join("&");

    const redirectUrl = `${PAYFAST_URL}?${queryString}`;

    return new Response(
      JSON.stringify({ redirect_url: redirectUrl, order_id: order.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("payfast-checkout error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
