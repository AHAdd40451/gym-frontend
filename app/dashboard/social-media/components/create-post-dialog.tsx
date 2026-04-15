import { useState, ChangeEvent, useRef } from "react";
import { Plus, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createPost } from "@/lib/api/services/post/post";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreatePostDialog() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const uploadingSet = useRef<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  // ✅ unique file id (duplicate fix)
  const getFileId = (file: File) =>
    `${file.name}-${file.size}-${file.lastModified}`;

  // =========================
  // 1️⃣ SELECT + AUTO UPLOAD
  // =========================
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);

    // preview state
    setFiles((prev) => [...prev, ...selectedFiles]);

    // filter duplicates
    const newFiles = selectedFiles.filter(
      (file) => !uploadingSet.current.has(getFileId(file))
    );

    newFiles.forEach((file) =>
      uploadingSet.current.add(getFileId(file))
    );

    await uploadFiles(newFiles);
  };

  // =========================
  // 2️⃣ UPLOAD API (PARALLEL)
  // =========================
  const uploadFiles = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Please login again");
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("files", file);

        const res = await fetch("https://dev.syssel.market/api/general/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Upload failed");
        }

        return data.files?.[0]?.fileUrl;
      });

      const urls = await Promise.all(uploadPromises);

      setUploadedUrls((prev) => [...prev, ...urls]);

      console.log("UPDATED URLs:", urls);

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Upload failed ❌");
    } finally {
      setUploading(false);
    }
  };

  const handlePost = async () => {
    if (uploading) {
      toast.error("Wait for upload to finish");
      return;
    }

    if (uploadedUrls.length === 0) {
      toast.error("No uploaded images");
      return;
    }

    const token = localStorage.getItem("authToken");

    try {
      await createPost(
        {
          caption: caption.trim(), // ✅ ADD THIS
          media: uploadedUrls, // ✅ URLs send
          // caption bhi add kar sakte ho yahan
        },
        token || undefined
      );

      toast.success("Post created 🎉");
      setOpen(false);

      // reset
      setFiles([]);
      setUploadedUrls([]);
      setCaption("");
      uploadingSet.current.clear();
    } catch (err: any) {
      toast.error(err.message || "Error creating post");
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mt-4">
          <Plus />
          Create Post
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg"

      >
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Caption</label>

          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full border rounded p-2 text-sm"
          />
        </div>
        <div className="space-y-4">
          {/* UPLOAD */}
          <div className="border border-dashed p-8 text-center rounded-lg">
            <ImageIcon className="mx-auto text-muted-foreground size-8" />

            <p className="text-sm text-muted-foreground mt-2">
              Select images (auto upload)
            </p>

            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => fileInputRef.current?.click()}
            >
              Select Files
            </Button>

            {/* <input
              type="file"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            /> */}
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          {/* PREVIEW */}
          {files.length > 0 && (
            <div className="grid grid-cols-3 gap-2">

              {files.map((file, i) => {
                const url = URL.createObjectURL(file);

                return file.type.startsWith("video/") ? (
                  <video
                    key={i}
                    src={url}
                    className="h-20 w-full object-cover rounded"
                    controls
                  />
                ) : (
                  <img
                    key={i}
                    src={url}
                    className="h-20 w-full object-cover rounded"
                  />
                );
              })}
            </div>
          )}

          {/* STATUS */}
          {uploading && (
            <p className="text-sm text-blue-500">Uploading...</p>
          )}

          {/* POST */}
          <div className="flex justify-end">
            <Button onClick={handlePost} disabled={uploading}>
              {uploading ? "Uploading..." : "Create Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}