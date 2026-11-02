/**
 * Agent use-case videos for the homepage. Put files in /public/videos and set
 * `src` (mp4/webm). Until then the poster image is shown with a placeholder tag.
 * Copy lives in messages under `home.agentVideo.cases.<id>`.
 */
export interface AgentVideo {
  id: 'game' | 'shop' | 'print' | 'film';
  poster: string;
  src?: string;
  duration: string;
  agent: string;
}

export const agentVideos: AgentVideo[] = [
  { id: 'game', poster: '/cover/game.webp', duration: '1:24', agent: 'Claude Code' },
  { id: 'shop', poster: '/cover/model.webp', duration: '0:58', agent: 'Cursor' },
  { id: 'print', poster: '/cover/print.webp', duration: '1:12', agent: 'Codex' },
  { id: 'film', poster: '/scenes/film-street.webp', duration: '1:40', agent: 'Claude Code' },
];

export const MCP_COMMAND = 'npx add-mcp @lux3d/mcp-server --env LUX3D_API_KEY=lux_YOUR_API_KEY';
