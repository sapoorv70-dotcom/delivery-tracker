import { useRef } from 'react';
import { useLocation, Routes } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Navigation depth per route — deeper = push (slide left), shallower = pop (slide right)
const ROUTE_DEPTH = {
  '/login': 0,
  '/register': 1,
  '/forgot-password': 1,
  '/reset-password': 1,
  '/tracker': 2,
  '/history': 2,
  '/settings': 2
};

// Tab paths share one animation key so Home stays mounted across tab switches
const TAB_PATHS = new Set(['/tracker', '/history', '/settings']);
const getAnimKey = (pathname) => (TAB_PATHS.has(pathname) ? '/tracker' : pathname);

const getDepth = (pathname) => (pathname in ROUTE_DEPTH ? ROUTE_DEPTH[pathname] : 0);

const variants = {
  enter: (dir) => ({ x: dir >= 0 ? '100%' : '-100%' }),
  center: { x: 0 },
  exit: (dir) => ({ x: dir >= 0 ? '-100%' : '100%' })
};

export default function AnimatedRoutes({ children }) {
  const location = useLocation();
  const animKey = getAnimKey(location.pathname);
  const prevDepthRef = useRef(getDepth(animKey));

  const currentDepth = getDepth(animKey);
  const direction = currentDepth >= prevDepthRef.current ? 1 : -1;
  prevDepthRef.current = currentDepth;

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={animKey}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.28 }}
        className="min-h-screen"
      >
        <Routes location={location}>
          {children}
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}