import { publicPath } from '@/lib/public-path';

const adminTools = [
  {
    href: '/question-editor/',
    label: 'Daily questions',
    file: 'questions.json',
    description: 'Create, schedule, validate, and export the daily question bank.',
  },
  {
    href: '/weekly-editor/',
    label: 'Weekly game',
    file: 'weekly_game.json',
    description: 'Manage the hidden-picture investigation, target location, and weekly schedule.',
  },
  {
    href: '/rotating-orders-editor/',
    label: 'Rotating orders',
    file: 'rotating_orders.json',
    description: 'Edit the rotating executive-order content used by the game.',
  },
  {
    href: '/executive-metrics-editor/',
    label: 'Executive metrics',
    file: 'executive_metrics.json',
    description: 'Update shared numeric answers, counters, polls, and ticker fallback text.',
  },
  {
    href: '/jokes-editor/',
    label: 'Jokes and wording',
    file: 'jokes.json',
    description: 'Maintain ticker headlines, recovery messages, share text, and interface labels.',
  },
];

export default function AdminPage() {
  return (
    <main className="question-editor-shell admin-hub-shell">
      <header className="editor-header admin-hub-header">
        <div>
          <p>PRIVATE CONTENT TOOLS</p>
          <h1>ADMIN HQ</h1>
          <span>One classified doorway to every game editor.</span>
        </div>
        <div className="editor-file-actions">
          <a href={publicPath('/')}>OPEN THE GAME</a>
          <a href={publicPath('/content-guides/ai-content-guide.md')} download>
            DOWNLOAD CONTENT GUIDE
          </a>
        </div>
      </header>

      <section className="admin-hub-panel" aria-labelledby="admin-tools-heading">
        <div className="admin-hub-intro">
          <div>
            <p>EDITOR DIRECTORY</p>
            <h2 id="admin-tools-heading">CHOOSE A CONTROL PANEL</h2>
          </div>
          <span>Bookmark this page. The individual editors can stay unlinked from the public game.</span>
        </div>

        <div className="admin-tool-grid">
          {adminTools.map((tool, index) => (
            <a className="admin-tool-card" href={publicPath(tool.href)} key={tool.href}>
              <span className="admin-tool-number">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <p>{tool.file}</p>
                <h3>{tool.label}</h3>
                <span>{tool.description}</span>
              </div>
              <strong aria-hidden="true">OPEN →</strong>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
