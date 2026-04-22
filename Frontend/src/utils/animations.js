/**
 * Animation Utilities
 * Centralized animation values for consistent, reduced motion
 */

// Reduced scale values for hover effects
export const hoverScale = {
  small: 1.02,    // Subtle hover (was 1.05-1.1)
  medium: 1.03,   // Medium hover (was 1.1)
  large: 1.05,    // Larger hover (was 1.2)
};

// Reduced scale values for tap effects
export const tapScale = {
  small: 0.98,    // Subtle tap (was 0.95)
  medium: 0.97,   // Medium tap (was 0.9)
  large: 0.95,    // Larger tap (was 0.85)
};

// Rotation values
export const rotation = {
  small: 2,       // Subtle rotation (was 5)
  medium: 3,      // Medium rotation (was 10)
  large: 5,       // Larger rotation (was 15)
};

// Spring configurations
export const spring = {
  gentle: {
    type: 'spring',
    stiffness: 300,
    damping: 25
  },
  medium: {
    type: 'spring',
    stiffness: 400,
    damping: 28
  },
  snappy: {
    type: 'spring',
    stiffness: 500,
    damping: 30
  }
};

// Duration values
export const duration = {
  fast: 0.15,
  medium: 0.2,
  slow: 0.3
};

// Common animation variants
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: duration.medium }
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: spring.gentle
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: spring.gentle
};

// Button animations
export const buttonHover = {
  scale: hoverScale.small,
  transition: spring.gentle
};

export const buttonTap = {
  scale: tapScale.small,
  transition: spring.snappy
};

// Icon animations
export const iconHover = {
  scale: hoverScale.medium,
  rotate: rotation.small,
  transition: spring.gentle
};

export const iconTap = {
  scale: tapScale.medium,
  transition: spring.snappy
};
