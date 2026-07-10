import type { ComponentProp } from '@velin-dev/core-vue/render-shared'

export const promptProps: ComponentProp[] = [
  {
    key: 'topic',
    title: 'topic',
    type: 'string',
    value: 'React runtime',
  },
  {
    key: 'steps',
    title: 'steps',
    type: 'number',
    value: 3,
  },
]

export default function Prompt({
  steps,
  topic,
}: {
  steps: number
  topic: string
}) {
  return (
    <section>
      <h1>{topic}</h1>
      <p>Render this prompt from a React TSX component.</p>
      <ol>
        {Array.from({ length: steps }, (_, index) => (
          <li key={index}>
            Step
            {' '}
            {index + 1}
          </li>
        ))}
      </ol>
    </section>
  )
}
