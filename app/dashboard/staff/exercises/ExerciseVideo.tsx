"use client";

interface Props {
  src: string;
  title: string;
}

const getEmbedUrl = (url: string) => {
  if (!url.includes("youtube.com/watch")) return url; // fallback
  const videoId = url.split("v=")[1]?.split("&")[0];
  if (!videoId) return url;
  return `https://www.youtube.com/embed/${videoId}`;
};

const ExerciseVideo = ({ src, title }: Props) => {
  const embedUrl = getEmbedUrl(src);

  return (
    <div className="aspect-video w-full">
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full rounded-lg"
        allowFullScreen
      />
    </div>
  );
};

export default ExerciseVideo;
