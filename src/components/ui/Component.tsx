"use client";
import React, { useState } from "react";
import LeftMenu from "./leftMenu/LeftMenu";
import Header from "./header/Header";
import { usePathname } from "next/navigation";
import GetTopkenGuest from "../elements/trigger/GetTopkenGuest";
import { useBranding } from "@/hooks/useBranding";
import { useAudioStore } from "@/store/useAudioStore";
import AudioPlayer from "./player/AudioPlayer";

export default function Component({ children }: { children: React.ReactNode }) {
  const [openMenu] = useState(false);
  const pathName = usePathname();
  const branding = useBranding();
  const { currentAudio, stop } = useAudioStore();

  const isAdmin = pathName?.includes("admin");
  return (
    <main className="component__main">
      {!isAdmin && <GetTopkenGuest />}
      {isAdmin && <Header logo={branding?.logo as string} />}
      <div style={{ paddingRight: !isAdmin ? "0" : "" }}>
        {isAdmin && <LeftMenu open={openMenu} />}
        {children}
      </div>

      {currentAudio && (
        <AudioPlayer
          id={currentAudio.id}
          src={currentAudio.src}
          title={currentAudio.title}
          author={currentAudio.author}
          image={currentAudio.image}
          onClose={stop}
        />
      )}
    </main>
  );
}
