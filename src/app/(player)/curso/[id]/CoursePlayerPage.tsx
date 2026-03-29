// CoursePlayerPage.tsx
'use client';

import { useState } from "react";
import { CourseSidebar } from "./components/CourseSidebar";
import { CourseContent } from "./components/CourseContent";
import { Loading } from "@/components/ui/loading";
import { FiLayers } from "react-icons/fi";

export default function CoursePlayerPage({ data: initialData }: any) {
  const [courseData, setCourseData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [activeLesson, setActiveLesson] = useState(courseData?.modules?.[0]?.lessons?.[0]);
  const [openModules, setOpenModules] = useState<string[]>([courseData?.modules?.[0]?.id]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMarkAsCompleted = (lessonId: string) => {
    setCourseData((prev: any) => {FiLayers
      const currentCompleted = prev?.completedLessons || [];
      
      if (currentCompleted.includes(lessonId)) return prev;

      return {
        ...prev,
        completedLessons: [...currentCompleted, lessonId]
      };
    });
  };

  const activeModule = courseData?.modules?.find((m: any) => 
    m.lessons?.some((l: any) => l.id === activeLesson?.id)
  );

  if (loading) return <Loading />;

  return (
    <div className="flex bg-white min-h-screen pt-10 relative">
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-60 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-2 active:scale-95 transition-transform"
      >
        <FiLayers size={20} />
        <span className="text-[10px] font-black uppercase tracking-widest">Aulas</span>
      </button>
      <CourseSidebar 
        data={courseData}
        activeLesson={activeLesson}
        setActiveLesson={(lesson: any) => {
          setActiveLesson(lesson);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        openModules={openModules}
        toggleModule={(id: string) => setOpenModules(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])}
      />
      
      <main className="flex-1 lg:ml-[380px] w-full">
        <CourseContent 
          activeLesson={activeLesson}
          moduleTitle={activeModule?.title}
          onLessonComplete={handleMarkAsCompleted}
        />
      </main>
    </div>
  );
}