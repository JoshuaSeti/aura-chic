import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

const POLICY_KEYS: Record<string, string> = {
  "shipping-policy": "shipping_policy",
  "booking-policy": "booking_policy",
  "trading-hours": "trading_hours",
};

const PolicyPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const settingsKey = slug ? POLICY_KEYS[slug] : null;

  const { data, isLoading } = useQuery({
    queryKey: ["site-settings", settingsKey],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", settingsKey!)
        .single();
      return data?.value as any;
    },
    enabled: !!settingsKey,
  });

  const notFound = !settingsKey || (!isLoading && (!data || data?.visible === false));

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <CartDrawer />
        <div className="flex-1 flex items-center justify-center">
          <p className="font-body text-muted-foreground">Page not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />

      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          ) : (
            <>
              <h1 className="font-display text-4xl md:text-5xl font-light mb-8">
                {data?.title || "Policy"}
              </h1>
              <div className="font-body text-sm text-muted-foreground leading-relaxed space-y-4 prose prose-sm max-w-none">
                {(data?.content || "").split("\n\n").map((block: string, i: number) => {
                  if (block.startsWith("**") && block.endsWith("**")) {
                    return <h3 key={i} className="font-display text-xl mt-8 mb-2 text-foreground">{block.replace(/\*\*/g, "")}</h3>;
                  }
                  if (block.startsWith("**")) {
                    const parts = block.split("**");
                    return (
                      <div key={i}>
                        <h3 className="font-display text-xl mt-8 mb-2 text-foreground">{parts[1]}</h3>
                        <p>{parts.slice(2).join("").trim()}</p>
                      </div>
                    );
                  }
                  if (block.includes("\n- ")) {
                    const lines = block.split("\n");
                    const heading = lines[0];
                    const items = lines.filter(l => l.startsWith("- "));
                    return (
                      <div key={i}>
                        {heading && !heading.startsWith("- ") && (
                          <p className="mb-2">{heading.replace(/\*\*/g, "")}</p>
                        )}
                        <ul className="list-disc pl-5 space-y-1">
                          {items.map((item, j) => (
                            <li key={j}>{item.replace(/^- /, "")}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  if (block.includes("\n1. ")) {
                    const lines = block.split("\n");
                    const heading = lines[0];
                    const items = lines.filter(l => /^\d+\./.test(l));
                    return (
                      <div key={i}>
                        {heading && !/^\d+\./.test(heading) && (
                          <p className="mb-2">{heading.replace(/\*\*/g, "")}</p>
                        )}
                        <ol className="list-decimal pl-5 space-y-1">
                          {items.map((item, j) => (
                            <li key={j}>{item.replace(/^\d+\.\s*/, "")}</li>
                          ))}
                        </ol>
                      </div>
                    );
                  }
                  return <p key={i}>{block}</p>;
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PolicyPage;
