export type ChatItemProps = {
  id: number;
  name?: string;
  image?: string;
  date?: string;
  status?: "sent" | "forwarded" | "read";
  is_archive?: boolean;
  last_message?: string;
  messages?: ChatMessageProps[];
  user_id: number;
  user: UserPropsTypes;
};

export interface ChatMessageProps {
  content?: string;
  own_message?: boolean;
  type?: string;
  status?: string;
  time?: string;   // ✅ add this
  data?: {
    file_name?: string;
    size?: string;
    cover?: string;
    duration?: string;
    path?: string;
    images?: string[];
  };
}


export type ChatMessageDataProps = {
  file_name?: string;
  cover?: string;
  path?: string;
  duration?: string;
  size?: string;
  images?: [];
};

export type UserPropsTypes = {
  id: number;
  name: string;
  avatar?: string;
  about?: string;
  phone?: string;
  country?: string;
  email?: string;
  gender?: string;
  website?: string;
  online_status?: "success" | "warning" | "danger";
  last_seen?: string;
  social_links?: {
    name?: string;
    url?: string;
  }[];
  medias?: {
    type?: string;
    path?: string;
  }[];
};

export type MediaListItemType = {
  type: string;
};

export type MessageStatusIconType = {
  status?: string;
};
