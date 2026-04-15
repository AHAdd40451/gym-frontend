"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { CircleUserRoundIcon, Trash2Icon } from "lucide-react";

import { usersApi } from "@/lib/api/services/users/users";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useAuth } from "@/lib/api/services/auth/context";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

  // 👉 Dummy stats
  const [stats] = useState({
    posts: 12,
    followers: 2450,
    following: 180,
  });

  // 👉 Profile image upload
  const [{ files }, { openFileDialog, getInputProps }] =
    useFileUpload({ accept: "image/*" });

  // 👉 Cover image upload
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "urls",
  });

  // ========================
  // SET USER ID
  // ========================
  useEffect(() => {
    const id = (user as any)?._id || (user as any)?.id;
    setUserId(id || null);
  }, [user]);

  // ========================
  // LOAD PROFILE
  // ========================
  useEffect(() => {
    const load = async () => {
      if (!userId) return;

      const res = await usersApi.getById(userId);
      const u = res?.data?.data?.user;

      if (u) {
        setUser(u);

        form.reset({
          username: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
          email: u.email,
          bio: u.bio || "",
          urls: u.urls?.map((x: string) => ({ value: x })) || [],
        });
      }
    };

    load();
  }, [userId]);

  // ========================
  // PROFILE IMAGE UPLOAD
  // ========================
  useEffect(() => {
    const upload = async () => {
      if (!files[0]?.file) return;

      const fd = new FormData();
      fd.append("files", files[0].file);

      const res = await fetch("https://dev.syssel.market/api/general/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (data?.files?.length) {
        setUploadedImageUrl(data.files[0].fileUrl);
      }
    };

    upload();
  }, [files]);

  // ========================
  // COVER IMAGE UPLOAD
  // ========================
  useEffect(() => {
    const upload = async () => {
      if (!coverFiles[0]?.file) return;

      const fd = new FormData();
      fd.append("files", coverFiles[0].file);

      const res = await fetch("https://dev.syssel.market/api/general/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (data?.files?.length) {
        setUploadedCoverUrl(data.files[0].fileUrl);
      }
    };

    upload();
  }, [coverFiles]);

  const previewUrl =
    files[0]?.preview ||
    uploadedImageUrl ||
    (user as any)?.profileImage ||
    "";

  const coverPreview =
    uploadedCoverUrl ||
    (user as any)?.coverImage ||
    "";

  // ========================
  // SAVE PROFILE
  // ========================
  const onSubmit = async (data: ProfileFormValues) => {
    if (!userId) return;

    try {
      setLoading(true);

      const [firstName, ...last] = data.username.split(" ");

      const payload = {
        firstName,
        lastName: last.join(" "),
        email: data.email,
        bio: data.bio,
        urls: data.urls?.map((u) => u.value),

        profileImage:
          uploadedImageUrl || (user as any)?.profileImage,

        coverImage:
          uploadedCoverUrl || (user as any)?.coverImage,
      };

      const res = await usersApi.update(userId, payload);
      const updated = res?.data?.data?.user;

      setUser(updated);

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

      <Card className="rounded-none md:rounded-xl">
        <CardContent className="p-0">

          {/* ================= COVER ================= */}
          <div className="w-full h-48 md:h-64 bg-muted overflow-hidden">

            {coverPreview && (
              <img
                src={coverPreview}
                className="w-full h-full object-cover"
              />
            )}

            {/* COVER UPLOAD BUTTON (RESTORED) */}
            {isEditing && (
              <div className="absolute md:top-30 top-44 md:right-16 right-6">
                <Button type="button" onClick={openCoverDialog}>
                  Change Cover
                </Button>
                <input {...getCoverInputProps()} className="hidden" />
              </div>
            )}
          </div>

          {/* ================= PROFILE HEADER (INSTAGRAM STYLE) ================= */}
          <div className="px-4 md:px-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4">

              {/* LEFT: AVATAR + NAME */}
              <div className="flex flex-col md:flex-row md:items-center gap-3">

                <div className="relative -mt-12 md:-mt-16">
                  <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-white shadow-sm">
                    <AvatarImage src={previewUrl} />
                    <AvatarFallback>
                      <CircleUserRoundIcon />
                    </AvatarFallback>
                  </Avatar>

                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs"
                      onClick={openFileDialog}
                    >
                      Edit
                    </Button>
                  )}

                  <input {...getInputProps()} className="hidden" />
                </div>

                {/* NAME + BIO */}
                <div className="text-center md:text-left space-y-1">
                  <Input
                    {...form.register("username")}
                    disabled={!isEditing}
                    className="font-semibold text-lg border-none shadow-none p-0 h-auto"
                  />

                  <p className="text-sm text-muted-foreground">
                    {form.watch("bio")}
                  </p>
                </div>
              </div>

              {/* RIGHT: ACTIONS */}
              <div className="flex gap-2 justify-center md:justify-end">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* ================= STATS ================= */}
            <div className="flex justify-center md:justify-start gap-10 mt-4 border-t md:border-none pt-4 md:pt-2 text-center md:text-left">

              <div>
                <p className="font-bold">{stats.posts}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>

              <div>
                <p className="font-bold">{stats.followers}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>

              <div>
                <p className="font-bold">{stats.following}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>

            </div>

            {/* ================= EMAIL ================= */}
            <div className="mt-4">
              <Input
                {...form.register("email")}
                disabled
                className="bg-muted"
              />
            </div>

            {/* ================= LINKS ================= */}
            <div className="mt-4 space-y-2">
              {fields.map((f, i) => (
                <div key={f.id} className="flex gap-2">
                  <Input
                    {...form.register(`urls.${i}.value`)}
                    disabled={!isEditing}
                  />

                  {isEditing && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => remove(i)}
                    >
                      <Trash2Icon />
                    </Button>
                  )}
                </div>
              ))}

              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ value: "" })}
                >
                  Add Link
                </Button>
              )}
            </div>

            {/* ================= POSTS (INSTAGRAM GRID) ================= */}
            <div className="mt-6 border-t pt-4">

              <div className="flex gap-1 md:gap-2">
                {/* <Post/> */}
                {/* <Post userId={userId!} /> */}
                {userId && <Post userId={userId} />}
              </div>

            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}