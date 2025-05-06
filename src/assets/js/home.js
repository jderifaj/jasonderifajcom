import gsap  from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const tl = gsap.timeline({ defaults: { duration: 0.75, ease: "power1.out" } });
export function initScrollAnimation() {
tl.to('.line', {
  scrollTrigger: {
    trigger: ".work",
    start: "top top",
    end: "bottom top",
    scrub: true,
    pin: true,
    markers: true
  },
  width: '100%',
  stagger: 0.25
});
}