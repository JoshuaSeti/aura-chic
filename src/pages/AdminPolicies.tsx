import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const POLICIES = [
  { key: "terms_and_conditions", label: "Terms & Conditions" },
  { key: "return_policy", label: "Return Policy" },
  { key: "privacy_policy", label: "Privacy Policy" },
  { key: "shipping_policy", label: "Shipping Policy" },
];

interface PolicyData {
  title: string;
  content: string;
}

const AdminPolicies = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(POLICIES[0].key);
  const [editData, setEditData] = useState<Record<string, PolicyData>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-policy-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .in("key", POLICIES.map((p) => p.key));
      const map: Record<string, PolicyData> = {};
      for (const row of data || []) {
        map[row.key] = row.value as unknown as PolicyData;
      }
      return map;
    },
  });

  useEffect(() => {
    if (settings) {
      setEditData(settings);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (key: string) => {
      const value = editData[key];
      if (!value) return;
      const { error } = await supabase
        .from("site_settings")
        .update({ value: value as any, updated_at: new Date().toISOString() })
        .eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-policy-settings"] });
      toast.success("Policy saved");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateField = (key: string, field: keyof PolicyData, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || { title: "", content: "" }), [field]: value },
    }));
  };

  if (isLoading) return <div className="font-body text-muted-foreground py-8">Loading...</div>;

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Policies & Legal Pages</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="font-body flex-wrap">
          {POLICIES.map((p) => (
            <TabsTrigger key={p.key} value={p.key} className="text-xs tracking-wider uppercase">
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {POLICIES.map((p) => (
          <TabsContent key={p.key} value={p.key}>
            <div className="bg-card rounded border border-border p-6 space-y-4 max-w-3xl">
              <div>
                <label className="font-body text-xs tracking-wider uppercase block mb-1">Page Title</label>
                <Input
                  value={editData[p.key]?.title || ""}
                  onChange={(e) => updateField(p.key, "title", e.target.value)}
                />
              </div>
              <div>
                <label className="font-body text-xs tracking-wider uppercase block mb-1">Content</label>
                <Textarea
                  value={editData[p.key]?.content || ""}
                  onChange={(e) => updateField(p.key, "content", e.target.value)}
                  rows={20}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use **bold text** for headings. Separate paragraphs with blank lines. Use "- " for bullet points and "1. " for numbered lists.
                </p>
              </div>
              <Button
                onClick={() => saveMutation.mutate(p.key)}
                disabled={saveMutation.isPending}
                className="bg-primary text-primary-foreground font-body tracking-widest uppercase text-xs py-5"
              >
                {saveMutation.isPending ? "Saving..." : "Save Policy"}
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminPolicies;
