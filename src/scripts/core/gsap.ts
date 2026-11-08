import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, CustomEase, ScrollToPlugin);

// A steep in-out curve for wipes and panels: slow start, fast middle, long settle.
CustomEase.create('wipe', 'M0,0 C0.354,0 0.464,0.133 0.498,0.502 0.532,0.872 0.651,1 1,1');
// Text lines rising into view.
CustomEase.create('rise', 'M0,0 C0.7,0 0.2,1 1,1');

gsap.defaults({ ease: 'power3.out', duration: 0.8 });
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };
