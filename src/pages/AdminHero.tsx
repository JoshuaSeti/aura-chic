import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 3 * 1024 * 1024;

interface HeroData {
  subtitle: string;
  title: string;
  description: string;
  cta_text: string;
  cta_link: string;
  image_url: string;
}

const defaultHero: HeroData = {
  subtitle: "New Collection 2026",
  title: "Elegance\nRedefined",
  description: "Discover curated luxury pieces that embody sophistication and timeless style.",
  cta_text: "Shop Now",
  cta_link: "/shop",
  image_url: "",
};

const AdminHero = () => {
  const queryClient = useQueryClient();
  const [hero, setHero] = useState<HeroData>(defaultHero);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: heroSetting, isLoading } = useQuery({
    queryKey: ["site-settings", "hero"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "hero")
        .single();
      return data;
    },
  });

  useEffect(() => {
    if (heroSetting?.value) {
      setHero(heroSetting.value as unknown as HeroData);
    }
  }, [heroSetting]);

  const handleImageUpload = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be under 3MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `hero-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
    setHero((prev) => ({ ...prev, image_url: urlData.publicUrl }));
    setUploading(false);
    toast.success("Image uploaded");
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("site_settings")
        .update({ value: hero as unknown as Record<string, unknown>, updated_at: new Date().toISOString() })
        .eq("key", "hero");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings", "hero"] });
      toast.success("Hero updated");
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) return <div className="font-body text-muted-foreground py-8">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Hero Section</h1>
      </div>

      <div className="bg-card rounded border border-border p-6 space-y-6 max-w-2xl">
        {/* Preview */}
        {hero.image_url && (
          <div className="relative rounded overflow-hidden h-48">
            <img src={hero.image_url} alt="Hero preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
            <div className="absolute bottom-4 left-4 text-card">
              <p className="font-body text-[10px] tracking-[0.3em] uppercase opacity-80">{hero.subtitle}</p>
              <p className="font-display text-xl font-light whitespace-pre-line">{hero.title}</p>
            </div>
          </div>
        )}

        <div>
          <label className="font-body text-xs tracking-wider uppercase block mb-1">Background Image</label>
          <div className="flex gap-2">
            <Input
              value={hero.image_url}
              onChange={(e) => setHero({ ...hero, image_url: e.target.value })}
              placeholder="Image URL or upload"
              className="flex-1"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
                e.target.value = "";
              }}
            />
            <Button type="button" variant="outline" size="icon" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Max 3MB. Recommended: 1920×1080</p>
        </div>

        <div>
          <label className="font-body text-xs tracking-wider uppercase block mb-1">Subtitle</label>
          <Input value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
        </div>

        <div>
          <label className="font-body text-xs tracking-wider uppercase block mb-1">Title</label>
          <Textarea value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} rows={2} />
          <p className="text-xs text-muted-foreground mt-1">Use line breaks for multi-line titles</p>
        </div>

        <div>
          <label className="font-body text-xs tracking-wider uppercase block mb-1">Description</label>
          <Textarea value={hero.description} onChange={(e) => setHero({ ...hero, description: e.target.value })} rows={3} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-body text-xs tracking-wider uppercase block mb-1">Button Text</label>
            <Input value={hero.cta_text} onChange={(e) => setHero({ ...hero, cta_text: e.target.value })} />
          </div>
          <div>
            <label className="font-body text-xs tracking-wider uppercase block mb-1">Button Link</label>
            <Input value={hero.cta_link} onChange={(e) => setHero({ ...hero, cta_link: e.target.value })} />
          </div>
        </div>

        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full bg-primary text-primary-foreground font-body tracking-widest uppercase text-xs py-5"
        >
          {saveMutation.isPending ? "Saving..." : "Save Hero"}
        </Button>
      </div>
    </div>
  );
};

export default AdminHero;
