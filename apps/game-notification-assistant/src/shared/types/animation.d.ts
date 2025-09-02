export type AnimationType =
  | 'fade'
  | 'scale'
  | 'slide'
  | 'bounce'
  | 'zoom'
  | 'none';
export type AnimationDirection = 'up' | 'down' | 'left' | 'right' | 'center';

export interface AnimationConfig {
  type: AnimationType;
  direction?: AnimationDirection;
  duration?: number;
}
