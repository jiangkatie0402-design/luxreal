/** The four homepage story stages, in order. Copy lives in messages under `home.story.stages.<id>`. */
export const storyStages = [
  { id: 'capture', duration: 5000 },
  { id: 'generate', duration: 5500 },
  { id: 'print', duration: 6000 },
  { id: 'game', duration: 6500 },
] as const;

export type StoryStageId = (typeof storyStages)[number]['id'];
