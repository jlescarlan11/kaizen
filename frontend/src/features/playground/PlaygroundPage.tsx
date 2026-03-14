import type { ChangeEvent, ReactElement } from 'react'
import { useState } from 'react'
import { Badge, Button, Card, Input, Modal } from '../../shared/components'

export function PlaygroundPage(): ReactElement {
  const [name, setName] = useState<string>('')
  const [isModalOpen, setModalOpen] = useState<boolean>(false)

  function handleNameChange(event: ChangeEvent<HTMLInputElement>): void {
    setName(event.target.value)
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-foreground">
          Base Components Playground
        </h1>
        <p className="text-lg leading-7 text-muted-foreground">
          Use this route to manually verify base UI behavior while developing features.
        </p>
      </header>

      <Card className="grid gap-4 sm:grid-cols-2">
        <Button onClick={() => setModalOpen(true)}>Open modal</Button>
        <Button variant="secondary" disabled>
          Disabled action
        </Button>
        <Button variant="ghost">Ghost action</Button>
        <Button variant="destructive">Delete account</Button>
        <Input
          id="name"
          label="Name"
          name="name"
          placeholder="Type your name"
          value={name}
          onChange={handleNameChange}
        />
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight leading-snug text-foreground">
            Badge Recipes
          </h2>
          <div className="flex flex-wrap gap-2">
            <Badge>Draft</Badge>
            <Badge>Announcement</Badge>
            <Badge tone="success">Paid</Badge>
            <Badge tone="warning">Pending review</Badge>
            <Badge tone="error">Failed</Badge>
            <Badge tone="error" emphasis="solid">
              Blocked
            </Badge>
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight leading-snug text-foreground">
            Callout Recipes
          </h2>
          <div className="space-y-3">
            <Card tone="accent" className="rounded-lg p-4">
              <p className="text-sm font-medium leading-none">Accent highlight</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Use the green brand system for selection, focus, and emphasis.
              </p>
            </Card>
            <Card tone="warning" className="rounded-lg p-4">
              <p className="text-sm font-medium leading-none">Warning callout</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Reserve orange and red for the rare cases where meaning truly matters.
              </p>
            </Card>
          </div>
        </Card>
      </section>

      <Modal
        open={isModalOpen}
        title="Headless UI Modal"
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>Confirm</Button>
          </div>
        }
      >
        <p className="text-sm leading-6 text-muted-foreground">
          Hello{name ? `, ${name}` : ''}. This modal confirms Headless UI is integrated and
          render-safe.
        </p>
      </Modal>
    </section>
  )
}
