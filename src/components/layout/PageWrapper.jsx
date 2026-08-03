import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter:   { opacity: 1, y: 0,  transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2,  ease: [0.4, 0, 0.2, 1] } },
};

/**
 * PageWrapper — wraps every page with a Framer Motion transition.
 */
const PageWrapper = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="enter"
    exit="exit"
  >
    {children}
  </motion.div>
);

export default PageWrapper;
