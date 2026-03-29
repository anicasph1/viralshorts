export interface DialogueLine {
  speaker: 'hero' | 'villain';
  line: string;
}

export interface FoodBattle {
  title: string;
  scene: string;
  hero_food: string;
  villain_food: string;
  dialogue: DialogueLine[];
  image_prompt: string;
  video_prompt: string;
  seo_keywords: string[];
}

export interface GenerationResponse {
  battles: FoodBattle[];
}

export interface ApiError {
  message: string;
  code?: string;
}
