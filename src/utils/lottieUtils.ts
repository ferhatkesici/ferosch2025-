// Utility functions for Lottie animations
export function updateLottieColors(animation: any, color: string) {
  // Convert hex to RGB
  const rgb = hexToRgb(color);
  if (!rgb) return animation;

  // Create a deep copy of the animation
  const updatedAnimation = JSON.parse(JSON.stringify(animation));

  // Update colors in layers
  if (updatedAnimation.layers) {
    updatedAnimation.layers.forEach((layer: any) => {
      if (layer.shapes) {
        layer.shapes.forEach((shape: any) => {
          if (shape.it) {
            shape.it.forEach((item: any) => {
              // Update stroke colors
              if (item.ty === 'st' && item.c?.k) {
                item.c.k = [rgb.r / 255, rgb.g / 255, rgb.b / 255, 1];
              }
            });
          }
        });
      }
    });
  }

  return updatedAnimation;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}