import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, CustomEase);

// A steep in-out curve for wipes and panels: slow start, fast middle, long settle.
CustomEase.create('wipe', 'M0,0 C0.4,0 0.45,0.14 0.5,0.5 0.56,0.9 0.66,1 1,1');
// Text lines rising into view.
CustomEase.create('rise', 'M0,0 C0.7,0 0.2,1 1,1');

gsap.defaults({ ease: 'power3.out', duration: 0.8 });
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };
