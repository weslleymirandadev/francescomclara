// CoursePlayerPage.tsx
'use client';

import { useState } from "react";
import { CourseSidebar } from "./components/CourseSidebar";
import { CourseContent } from "./components/CourseContent";
import { Loading } from "@/components/ui/loading";

export default function CoursePlayerPage({ data: initialData }: any) {
  const [courseData, setCourseData] = useState(initialData);
  const [activeLesson, setActiveLesson] = useState(courseData?.modules?.[0]?.lessons?.[0]);
  const [openModules, setOpenModules] = useState<string[]>([courseData?.modules?.[0]?.id]);

  const handleMarkAsCompleted = (lessonId: string) => {
    setCourseData((prev: any) => {
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

  return (
    <div className="flex bg-white min-h-screen pt-10">
      <CourseSidebar 
        data={courseData}
        activeLesson={activeLesson}
        setActiveLesson={setActiveLesson}
        openModules={openModules}
        toggleModule={(id: string) => setOpenModules(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])}
      />
      
      <main className="flex-1 ml-[380px]">
        <CourseContent 
          activeLesson={activeLesson}
          moduleTitle={activeModule?.title}
          onLessonComplete={handleMarkAsCompleted}
        />
      </main>
    </div>
  );
}