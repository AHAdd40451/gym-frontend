"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { CircleUserRoundIcon } from "lucide-react";

import { usersApi } from "@/lib/api/services/users/users";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useAuth } from "@/lib/api/services/auth/context";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Post from "./Post";

const profileFormSchema = z.object({
  username: z.string().min(2),
  email: z.string().email(),
  bio: z.string().optional(),
  urls: z.array(z.object({ value: z.string().url().or(z.literal("")) })).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Page() {
  const { user, setUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploadedCoverUrl, setUploadedCoverUrl] = useState("");

  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
  });

  const [{ files }, { openFileDialog, getInputProps }] =
    useFileUpload({ accept: "image/*" });

  const [
    { files: coverFiles },
    { openFileDialog: openCoverDialog, getInputProps: getCoverInputProps }
  ] = useFileUpload({ accept: "image/*" });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      email: "",
      bio: "",
      urls: [],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "urls",
  });

  // ================= USER ID =================
  useEffect(() => {
    const id = (user as any)?._id || (user as any)?.id;
    setUserId(id || null);
  }, [user]);

  // ================= LOAD PROFILE =================
  useEffect(() => {
    const load = async () => {
      if (!userId) return;

      const res = await usersApi.getById(userId);

      const u = res?.data?.user || res?.data?.data?.user;
      const counts = res?.data?.counts || res?.data?.data?.counts;

      if (u) {
        setUser(u);

        form.reset({
          username: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
          email: u.email,
          bio: u.bio || "",
          urls: u.urls?.map((x: string) => ({ value: x })) || [],
        });
      }

      if (counts) {
        setStats({
          posts: Number(counts.posts) || 0,
          followers: Number(counts.followers) || 0,
          following: Number(counts.following) || 0,
        });
      }
    };

    load();
  }, [userId]);

  // ================= PROFILE IMAGE UPLOAD =================
  useEffect(() => {
    const upload = async () => {
      if (!files[0]?.file) return;

      const fd = new FormData();
      fd.append("files", files[0].file);

      const res = await fetch(
        "https://dev.syssel.market/api/general/upload",
        { method: "POST", body: fd }
      );

      const data = await res.json();

      if (data?.files?.length) {
        setUploadedImageUrl(data.files[0].fileUrl);
      }
    };

    upload();
  }, [files]);

  // ================= COVER UPLOAD =================
  useEffect(() => {
    const upload = async () => {
      if (!coverFiles[0]?.file) return;

      const fd = new FormData();
      fd.append("files", coverFiles[0].file);

      const res = await fetch(
        "https://dev.syssel.market/api/general/upload",
        { method: "POST", body: fd }
      );

      const data = await res.json();

      if (data?.files?.length) {
        setUploadedCoverUrl(data.files[0].fileUrl);
      }
    };

    upload();
  }, [coverFiles]);

  const previewUrl =
    uploadedImageUrl ||
    (user as any)?.profileImage ||
    "";

  const coverPreview =
    uploadedCoverUrl ||
    (user as any)?.coverImage ||
    "";

  // ================= SAVE =================
  const onSubmit = async (data: ProfileFormValues) => {
    if (!userId) return;

    try {
      setLoading(true);


      const cleanName = data.username.trim();

      // remove multiple spaces
      const parts = cleanName.split(/\s+/);

      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";

      // sanitize (ONLY letters + spaces allowed)
      const safeFirstName = firstName.replace(/[^a-zA-Z ]/g, "");
      const safeLastName = lastName.replace(/[^a-zA-Z ]/g, ""); const payload = {
        firstName: safeFirstName,
        lastName: safeLastName,
        email: data.email,
        bio: data.bio,
        urls: data.urls?.map((u) => u.value),

        profileImage: uploadedImageUrl || (user as any)?.profileImage,
        coverImage: uploadedCoverUrl || (user as any)?.coverImage,
      };

      const res = await usersApi.update(userId, payload);
      const updated = res?.data?.data?.user;

      setUser(updated);
      setUploadedImageUrl(updated?.profileImage || "");

      toast.success("Profile updated");
      setIsEditing(false);
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">

      <Card>
        <CardContent className="p-0">

          {/* COVER */}
          <div className="relative w-full h-48 md:h-64 bg-muted overflow-hidden">
            {coverPreview && (
              <img src={coverPreview} className="w-full h-full object-cover" />
            )}

            {isEditing && (
              <div className="absolute top-4 right-4">
                <Button size="sm" onClick={openCoverDialog}>
                  Change Cover
                </Button>
                <input {...getCoverInputProps()} className="hidden" />
              </div>
            )}
          </div>

          {/* HEADER */}
          <div className="px-4 md:px-6">

            <div className="flex justify-between items-start pt-4">

              {/* AVATAR BLOCK */}
              <div className="flex gap-3">

                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white">
                    <AvatarImage src={previewUrl} />
                    <AvatarFallback>
                      <CircleUserRoundIcon />
                    </AvatarFallback>
                  </Avatar>

                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px]"
                      onClick={openFileDialog}
                    >
                      Edit
                    </Button>
                  )}

                  <input {...getInputProps()} className="hidden" />
                </div>

                <div>
                  <Input
                    {...form.register("username")}
                    disabled={!isEditing}
                    className="font-semibold text-lg border-none"
                  />

                  <p className="text-sm text-muted-foreground mt-1 ml-2">
                    {form.watch("bio")}
                  </p>
                </div>

              </div>

              {/* BUTTONS */}
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button onClick={() => setIsEditing(false)} variant="outline">
                      Cancel
                    </Button>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>
                      Save
                    </Button>
                  </>
                )}
              </div>

            </div>

            {/* STATS */}
            <div className="flex gap-10 mt-4 border-t pt-4">
              <div>
                <p className="font-bold">{stats.posts}</p>
                <p className="text-xs">Posts</p>
              </div>
              <div>
                <p className="font-bold">{stats.followers}</p>
                <p className="text-xs">Followers</p>
              </div>
              <div>
                <p className="font-bold">{stats.following}</p>
                <p className="text-xs">Following</p>
              </div>
            </div>
            <div className="mt-6 border-t pt-4">
              {userId && <Post userId={userId} />}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}