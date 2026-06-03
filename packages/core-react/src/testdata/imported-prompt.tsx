import { Fragment, useMemo } from 'react'

import { ImportedLabel } from './nested/imported-label'

export function ImportedPrompt({ name }: { name: string }) {
  const upperName = useMemo(() => name.toUpperCase(), [name])

  return (
    <Fragment>
      <h1>Imported</h1>
      <p>
        <ImportedLabel value={upperName} />
      </p>
    </Fragment>
  )
}
