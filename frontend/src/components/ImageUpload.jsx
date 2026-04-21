import { useState, useRef } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { resolveImageUrl } from "@/lib/utils";

export default function ImageUpload({ value, onChange, fallback = "U", testId = "image-upload" }) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await api.post("/upload/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(r.data.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16 border border-border">
        <AvatarImage src={resolveImageUrl(value)} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
          data-testid={`${testId}-input`}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          data-testid={`${testId}-btn`}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (
            <><Upload className="h-4 w-4 mr-2" strokeWidth={1.5} /> Upload image</>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-1.5">PNG, JPG or WebP · max 5 MB</p>
      </div>
    </div>
  );
}
