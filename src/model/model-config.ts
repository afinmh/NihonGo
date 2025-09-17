import type { Live2DModel } from 'pixi-live2d-display';

export interface ModelConfig {
  path: string;
  layout: {
    xFrac?: number;
    yFrac?: number;
    anchorX?: number;
    anchorY?: number;
    targetWidthFrac?: number;
    targetHeightFrac?: number;
    startMotionPref?: string[];
  };
  motions?: { [key: string]: Array<[string, number]> };
  motionGroups?: { [key: string]: string };
  hitHandler?: (model: Live2DModel) => void;
}