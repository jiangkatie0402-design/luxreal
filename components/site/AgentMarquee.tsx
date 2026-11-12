import { useTranslations } from 'next-intl';

/** Agent clients that can use the Aholo 3D MCP server. Swap the glyph for an official logo when available. */
const NAMES = [
  'Claude Code',
  'Codex',
  'Cursor',
  'OpenClaw',
  'Manus',
  'ZCode',
  'Pi',
  'OpenCode',
  'WorkBuddy',
];

function Row({ hidden }: { hidden?: boolean }) {
  return (
    <div className="flex gap-14" aria-hidden={hidden}>
      {NAMES.map((n) => (
        <span key={n} className="agm-item">
          <span className="agm-glyph" aria-hidden>
            {n.charAt(0)}
          </span>
          {n}
        </span>
      ))}
    </div>
  );
}

/** A slow drifting row of supported agents under the MCP install strip. */
export function AgentMarquee() {
  const t = useTranslations('site.agents.mcp');
  return (
    <div className="agm" aria-label={t('worksWith')}>
      <div className="agm-row">
        <Row />
        <Row hidden />
      </div>
    </div>
  );
}
