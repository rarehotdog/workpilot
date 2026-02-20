import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="rounded-md border border-border bg-muted px-4 py-3 font-mono text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
        {number}
      </div>
      <div className="space-y-2 pt-1 w-full">
        <h3 className="font-semibold text-base">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export function TutorialPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 md:px-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="w-fit">Tutorial</Badge>
          <Badge className="w-fit">Beginner</Badge>
          <Badge className="w-fit">5 min video</Badge>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Create motion graphics with AI
        </h1>
        <p className="text-muted-foreground">
          A simple tutorial for beginners. You can create videos just from prompting — this is an easy way to get started with Remotion!
        </p>
      </section>

      <Separator />

      {/* Prerequisites */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Prerequisites</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            You first need to install the following tools before getting started:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <span>
                <strong>Claude Code</strong> — requires a paid subscription
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <span>
                <strong>Node.js</strong> — JavaScript runtime
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Steps */}
      <section className="space-y-8">
        <h2 className="text-xl font-semibold">Getting started</h2>

        <Step number={1} title="Start a new project">
          <p className="text-sm text-muted-foreground">
            Create a new Remotion project using the following command:
          </p>
          <CodeBlock>npx create-video@latest</CodeBlock>
          <p className="text-sm text-muted-foreground">
            This will scaffold a new project. We recommend the following settings:
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold shrink-0">✓</span>
              Select the <strong className="text-foreground">Blank</strong> template
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold shrink-0">✓</span>
              Say <strong className="text-foreground">yes</strong> to use TailwindCSS
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold shrink-0">✓</span>
              Say <strong className="text-foreground">yes</strong> to install Skills
            </li>
          </ul>
        </Step>

        <Step number={2} title="Start the preview">
          <p className="text-sm text-muted-foreground">
            Go into the directory that was created. If you named your project{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">my-video</code>,
            run:
          </p>
          <CodeBlock>cd my-video</CodeBlock>
          <p className="text-sm text-muted-foreground">Install dependencies:</p>
          <CodeBlock>npm install</CodeBlock>
          <p className="text-sm text-muted-foreground">Start the project:</p>
          <CodeBlock>npm run dev</CodeBlock>
        </Step>

        <Step number={3} title="Start Claude">
          <p className="text-sm text-muted-foreground">
            Open a <strong>separate terminal window</strong> and start Claude Code from inside your project directory:
          </p>
          <CodeBlock>{`cd my-video\nclaude`}</CodeBlock>
          <p className="text-sm text-muted-foreground">
            You can now prompt a video! Describe the motion graphic you want to create and Claude will generate the Remotion code for you.
          </p>
        </Step>
      </section>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Tips for prompting</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              title: 'Be specific about motion',
              description: 'Describe timing, easing, and transitions. For example: "fade in over 20 frames, then slide up."'
            },
            {
              title: 'Reference design details',
              description: 'Mention colors, fonts, and layout. Claude will translate these into Tailwind or inline styles.'
            },
            {
              title: 'Iterate incrementally',
              description: 'Start simple, then refine. Ask Claude to "make the text larger" or "add a bounce effect."'
            },
            {
              title: 'Ask for sequences',
              description: 'You can describe multi-scene animations: "First show the title, then transition to bullet points."'
            }
          ].map((tip) => (
            <Card key={tip.title} className="bg-muted/40">
              <CardContent className="pt-4 pb-4 space-y-1">
                <p className="text-sm font-semibold">{tip.title}</p>
                <p className="text-xs text-muted-foreground">{tip.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
