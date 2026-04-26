import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import confetti from "canvas-confetti";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const triggerConfetti = () => {
  const duration = 1.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };
  const randomInRange = (min: number, max: number) =>
    Math.random() * (max - min) + min;

  const interval: any = setInterval(function () {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);
    const particleCount = 25 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 150);
};

export function isSupportOpen(settings: any) {
  if (!settings.supportStatus) return false;

  const agora = new Date();
  const horaAtual = agora.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const diaAtual = agora.getDay(); // 0 = Domingo, 1 = Segunda...

  const diasPermitidos = settings.supportDays.split(",").map(Number);

  const estaNoDia = diasPermitidos.includes(diaAtual);
  const estaNaHora =
    horaAtual >= settings.supportStartTime &&
    horaAtual <= settings.supportEndTime;

  return estaNoDia && estaNaHora;
}
