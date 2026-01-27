'use client';

import { useState } from "react";
import { CourseSidebar } from "./components/CourseSidebar";
import { CourseContent } from "./components/CourseContent";
import { Loading } from "@/components/ui/loading";

export default function CoursePlayerPage({ data }: any) {
  const [activeLesson, setActiveLesson] = useState(data?.modules?.[0]?.lessons?.[0]);
  const [openModules, setOpenModules] = useState<string[]>([data?.modules?.[0]?.id]);
  const [loading, setLoading] = useState(false);

  const toggleModule = (id: string) => {
    setOpenModules(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const activeModule = data?.modules?.find((m: any) => 
    m.lessons?.some((l: any) => l.id === activeLesson?.id)
  );

  if (loading) return <Loading />;

  return (
    <div className="flex bg-white min-h-screen animate-in fade-in duration-700">
      <CourseSidebar 
        data={data}
        activeLesson={activeLesson}
        setActiveLesson={setActiveLesson}
        openModules={openModules}
        toggleModule={toggleModule}
      />
      
      <main className="flex-1 ml-[380px]">
        <CourseContent 
          activeLesson={activeLesson}
          moduleTitle={activeModule?.title}
        />
      </main>
    </div>
  );
}