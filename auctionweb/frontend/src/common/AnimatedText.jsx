import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AnimatedText = ({
  children,
  distance = 60,         
  reverse = false,
  duration = 2.5,    // Thời gian animation
  ease = "power4.out",     
  initialOpacity = 0,
  animateOpacity = true,
  threshold = 0.5,
  delay = 0,
  stagger = 0.1,           
  onComplete,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const offset = reverse ? distance : -distance; // Text rơi từ trên xuống
    const startPct = (1 - threshold) * 100;

    const targets = el.children.length > 0 ? el.children : [el];

    gsap.set(targets, {
      y: offset,
      opacity: animateOpacity ? initialOpacity : 1,
    });

    gsap.to(targets, {
      y: 0,
      opacity: 1,
      duration,
      ease,
      delay,
      stagger,
      onComplete,
      scrollTrigger: {
        trigger: el,
        start: `top ${startPct}%`,
        toggleActions: "play none none none",
        once: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.killTweensOf(targets);
    };
  }, [
    distance,
    reverse,
    duration,
    ease,
    initialOpacity,
    animateOpacity,
    threshold,
    delay,
    stagger,
    onComplete,
  ]);

  return <div ref={ref}>{children}</div>;
};

export default AnimatedText;
