"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import { Plus, ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import {
  createStory,
  getStories,
  viewStory,
  deleteStory
} from "@/lib/api/services/story/story";

export function SocialMediaStories() {
  const [stories, setStories] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const [open, setOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const openDeleteConfirm = (storyId: string) => {
    setSelectedStoryId(storyId);
    setDeleteModalOpen(true);
  };
  // STORY VIEW
  const [activeIndex, setActiveIndex] = useState(0);
  const [storyOpen, setStoryOpen] = useState(false);

  // SEEN MODAL
  const [seenModal, setSeenModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // const currentUser = JSON.parse(
  //   localStorage.getItem("currentUser") || "{}"
  // );
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const token = localStorage.getItem("authToken") || undefined;

  // =========================
  // GET STORIES
  // =========================
  const fetchStories = async () => {
    try {
      const res = await getStories(token);
      const list = res?.data?.stories || [];
      setStories(Array.isArray(list) ? list : []);
    } catch (err) {
      console.log(err);
      setStories([]);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // =========================
  // UPLOAD IMAGE
  // =========================
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files[0];
    setFile(file);

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("files", file);

      const res = await fetch(
        "https://dev.syssel.market/api/general/upload",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await res.json();
      setUploadedUrl(data.files?.[0]?.fileUrl);

      toast.success("Uploaded");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateStory = async () => {
    if (!uploadedUrl) return toast.error("Upload image first");

    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");

    if (!user?._id) return toast.error("User not found");

    try {
      await createStory(
        {
          image: uploadedUrl,
          caption,
          userId: user._id,
        },
        localStorage.getItem("authToken") || undefined
      );

      toast.success("Story created");

      setFile(null);
      setUploadedUrl("");
      setCaption("");
      setOpen(false);

      fetchStories();
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  const handleDeleteStory = async () => {
    if (!selectedStoryId) return;

    try {
      await deleteStory(selectedStoryId, token);

      toast.success("Story deleted");

      setStories((prev) =>
        prev.filter((s) => s._id !== selectedStoryId)
      );

      setStoryOpen(false);
      setDeleteModalOpen(false);
      setSelectedStoryId(null);

    } catch (err: any) {
      toast.error(err.message || "Failed to delete story");
    }
  };
  // =========================
  // OPEN STORY + VIEW API
  // =========================
  const openStory = async (index: number) => {
    const story = stories[index];
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");

    setActiveIndex(index);
    setStoryOpen(true);

    const token = localStorage.getItem("authToken") || undefined;

    // ❌ DO NOTHING IF OWN STORY
    if (story?.userId?._id === user?._id) return;

    try {
      await viewStory(story._id, token);

      // ✅ SAFE UI UPDATE (NO DUPLICATE)
      setStories((prev) => {
        const updated = [...prev];

        const alreadyViewed = updated[index].viewers?.some(
          (v: any) => v.userId?._id === user._id
        );

        if (!alreadyViewed) {
          updated[index].viewers = updated[index].viewers || [];

          updated[index].viewers.push({
            userId: user,
            viewedAt: new Date().toISOString(),
          });
        }

        return updated;
      });

    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // AUTO NEXT STORY
  // =========================
  useEffect(() => {
    if (!storyOpen) return;

    const timer = setTimeout(() => {
      if (activeIndex < stories.length - 1) {
        setActiveIndex((p) => p + 1);
      } else {
        setStoryOpen(false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [activeIndex, storyOpen]);

  // =========================
  // VIEWERS COUNT (DEDUPED)
  // =========================
  const getUniqueViews = (viewers: any[]) => {
    if (!viewers) return 0;
    const unique = new Set(
      viewers.map((v) => v.userId?._id || v.userId)
    );
    return unique.size;
  };

  return (
    <div className="space-y-4">

      {/* =========================
          STORY LIST
      ========================= */}
      <div className="flex gap-4 overflow-x-auto px-2 py-3">

        {stories.map((story, index) => (
          <div
            key={story._id}
            onClick={() => openStory(index)}
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="p-[2px] rounded-full bg-gradient-to-tr from-green-500 to-emerald-300">
              <Avatar className="h-14 w-14 border-2 border-background">
                <AvatarImage src={story.userId?.profileImage} />
                <AvatarFallback>
                  {story.userId?.firstName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <p className="text-[11px] mt-1 text-muted-foreground">
              {story.userId?._id === currentUser?._id
                ? "Your Story"
                : story.userId?.firstName}
            </p>

            <p className="text-[10px] text-gray-400">
              {getUniqueViews(story.viewers)} views
            </p>
          </div>
        ))}



        {/* CREATE */}
        <div
          onClick={() => setOpen(true)}
          className="flex flex-col items-center cursor-pointer"
        >
          <div className="h-14 w-14 rounded-full border-dashed border-2 flex items-center justify-center">
            <Plus />
          </div>
          <p className="text-[11px] mt-1">Create</p>
        </div>
      </div>

      {/* =========================
          STORY VIEWER
      ========================= */}
      <Dialog open={storyOpen} onOpenChange={setStoryOpen}>
        <DialogContent className="p-0 bg-black border-0 max-w-md h-[85vh] overflow-hidden">

          {stories[activeIndex] && (
            <div className="relative w-full h-full">

              {/* IMAGE */}
              <img
                src={stories[activeIndex].image}
                className="w-full h-full object-cover"
              />

              {/* TOP GRADIENT */}
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/70 to-transparent" />

              {/* BOTTOM GRADIENT */}
              <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-t from-black/70 to-transparent" />

              {/* USER HEADER */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">

                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9 border border-white/30">
                    <AvatarImage src={stories[activeIndex].userId?.profileImage} />
                  </Avatar>

                  <div className="flex flex-col">
                    <p className="text-white text-sm font-medium">
                      {stories[activeIndex].userId?._id === currentUser?._id
                        ? "Your Story"
                        : stories[activeIndex].userId?.firstName}
                    </p>

                    {/* time optional */}
                    <p className="text-[11px] text-gray-300">
                      {new Date(stories[activeIndex].createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mr-8">

                  {/* 🗑️ DELETE BUTTON (ONLY OWNER) */}
                  {stories[activeIndex]?.userId?._id === currentUser?._id && (
                    <button
                      onClick={() => openDeleteConfirm(stories[activeIndex]._id)}
                      className="text-white bg-red-500/70 hover:bg-red-600 p-2 rounded-full transition cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                </div>
                {/* CLOSE BUTTON */}

              </div>

              {/* CAPTION */}
              {stories[activeIndex].caption && (
                <div className="absolute bottom-16 w-full flex justify-center px-4">
                  <p className="text-white text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm max-w-[90%] text-center">
                    {stories[activeIndex].caption}
                  </p>
                </div>
              )}

              {/* SEEN BUTTON (ONLY OWNER) */}
              {stories[activeIndex]?.userId?._id === currentUser?._id && (
                <button
                  onClick={() => setSeenModal(true)}
                  className="absolute bottom-6 right-4 flex items-center gap-1 text-white text-xs bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm hover:bg-black/70 transition cursor-pointer"
                >
                  👁 {getUniqueViews(stories[activeIndex]?.viewers)}
                </button>
              )}

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* =========================
          SEEN BY MODAL
      ========================= */}
      <Dialog open={seenModal} onOpenChange={setSeenModal}>
        <DialogContent className="sm:max-w-md p-0 rounded-2xl overflow-hidden">

          {/* HEADER */}
          <div className="px-4 py-3 border-b flex items-center justify-between ">
            <DialogTitle className="text-sm font-semibold ">
              Seen by
            </DialogTitle>


          </div>

          {/* LIST */}
          <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">

            {stories[activeIndex]?.viewers?.length ? (
              stories[activeIndex].viewers.map((v: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between hover:bg-muted/40 p-2 rounded-lg transition"
                >

                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={v.userId?.profileImage} />
                      <AvatarFallback>
                        {v.userId?.firstName?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="text-sm font-medium">
                        {v.userId?.firstName}
                      </p>

                      {/* optional time */}
                      <p className="text-xs text-gray-400">
                        {new Date(v.viewedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* eye icon (optional feel) */}
                  <span className="text-xs text-gray-400">👁</span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <p className="text-sm">No views yet</p>
              </div>
            )}

          </div>
        </DialogContent>
      </Dialog>

      {/* =========================
          CREATE STORY
      ========================= */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">

          {/* HEADER */}
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <DialogTitle className="text-sm font-semibold">
              Create Story
            </DialogTitle>
          </div>

          <div className="p-4 space-y-4">

            {/* UPLOAD BOX */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl h-44 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/40 transition"
            >
              {!file ? (
                <>
                  <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Click to upload image
                  </p>
                </>
              ) : (
                <img
                  src={URL.createObjectURL(file)}
                  className="h-full w-full object-cover rounded-xl"
                />
              )}
            </div>

            <input
              type="file"
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            {/* CAPTION */}
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              rows={3}
            />

            {/* ACTION BUTTON */}
            <Button
              onClick={handleCreateStory}
              disabled={uploading}
              className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600"
            >
              {uploading ? "Uploading..." : "Share Story"}
            </Button>

          </div>
        </DialogContent>

        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent className="sm:max-w-sm rounded-xl">

            <DialogTitle className="text-base font-semibold">
              Delete Story?
            </DialogTitle>

            <p className="text-sm text-muted-foreground">
              This action cannot be undone. Are you sure you want to delete this story?
            </p>

            <div className="flex justify-end gap-2 mt-4">

              <Button
                variant="outline"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleDeleteStory}
              >
                Delete
              </Button>

            </div>

          </DialogContent>
        </Dialog>
      </Dialog>

    </div>
  );
}