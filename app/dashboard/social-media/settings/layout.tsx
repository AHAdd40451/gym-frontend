import { SocialMediaSidebar } from "../components/social-media-sidebar";
import { SidebarNav } from "./components/sidebar-nav";

export const metadata = {
  title: "Settings",
  description: "Manage your account settings.",
};

export default function UserSettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="space-y-0.5">
        
      </div>
      <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
        <aside className="lg:w-64">
          {/* <SidebarNav /> */}
          <SocialMediaSidebar/>
        </aside>
        <div className="flex-1 ">{children}</div>
      </div>
    </div>
  );
}
