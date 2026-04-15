"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TourStep {
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
  highlight?: string; // element description for accessibility
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to Carisma Cockpit",
    description: "Your AI-powered CEO dashboard. Let me show you around — it'll take 30 seconds.",
    position: "bottom",
    highlight: "Welcome",
  },
  {
    title: "Department Navigation",
    description: "Switch between CEO overview, Marketing, Sales, Finance, HR, Operations, and Data views. Tip: press 1-7 on your keyboard.",
    position: "right",
    highlight: "Sidebar navigation",
  },
  {
    title: "Date & Brand Filters",
    description: "Filter all data by date range and brand. Every chart and KPI updates instantly.",
    position: "bottom",
    highlight: "Filter controls",
  },
  {
    title: "KPI Cards",
    description: "Your key metrics at a glance. Gold progress bars show target achievement. Sparklines show the trend.",
    position: "bottom",
    highlight: "KPI cards row",
  },
  {
    title: "Executive Summary",
    description: "AI-generated analysis that updates when you change filters. It highlights what matters most.",
    position: "bottom",
    highlight: "Executive summary section",
  },
  {
    title: "Carisma Intelligence",
    description: "Your AI assistant. Ask any question about your data — 'What's our best performing location?' or 'Why did CPL spike this week?'. Press / to open.",
    position: "top",
    highlight: "CI Chat button",
  },
  {
    title: "Dark Mode & Shortcuts",
    description: "Toggle dark mode with the moon icon. Press Shift+? anytime to see all keyboard shortcuts.",
    position: "bottom",
    highlight: "Top bar controls",
  },
  {
    title: "You're All Set!",
    description: "Explore your data. The dashboard gets smarter as more data flows in. Enjoy Cockpit!",
    position: "bottom",
    highlight: "Tour complete",
  },
];

const STORAGE_KEY = "cockpit-onboarding-complete";

export function OnboardingTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const complete = localStorage.getItem(STORAGE_KEY);
    if (!complete) {
      // Delay start to let page render
      const timer = setTimeout(() => setActive(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const finish = useCallback(() => {
    setActive(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  const next = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!active) return null;

  const currentStep = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  const isFirst = step === 0;

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Tooltip card — centered for simplicity */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#162535] rounded-2xl shadow-2xl border border-gold/20 p-6 w-[400px] max-w-full relative">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-gold" : i < step ? "w-1.5 bg-gold/40" : "w-1.5 bg-warm-border"
                }`}
              />
            ))}
          </div>

          {/* Close button */}
          <button
            onClick={finish}
            className="absolute top-3 right-3 text-text-secondary hover:text-charcoal"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          {isFirst && (
            <div className="flex justify-center mb-3">
              <div className="h-12 w-12 rounded-2xl bg-gold/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-gold" />
              </div>
            </div>
          )}

          <h3 className="text-base font-semibold text-charcoal text-center mb-2">
            {currentStep.title}
          </h3>
          <p className="text-sm text-text-secondary text-center leading-relaxed mb-5">
            {currentStep.description}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div>
              {!isFirst && (
                <Button variant="ghost" size="sm" onClick={prev} className="text-text-secondary gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={finish} className="text-xs text-text-secondary hover:text-charcoal">
                Skip tour
              </button>
              <Button size="sm" onClick={next} className="bg-gold hover:bg-gold-dark text-white gap-1">
                {isLast ? "Get Started" : "Next"}
                {!isLast && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
