import type { ChangeEvent, ReactElement } from 'react'
import { useState } from 'react'
import { Button, Input, Modal } from '../../shared/components'

export function PlaygroundPage(): ReactElement {
  const [name, setName] = useState<string>('')
  const [isModalOpen, setModalOpen] = useState<boolean>(false)

  function handleNameChange(event: ChangeEvent<HTMLInputElement>): void {
    setName(event.target.value)
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Base Components Playground</h1>
        <p className="text-sm text-slate-600">
          Use this route to manually verify base UI behavior while developing features.
        </p>
      </header>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <Button onClick={() => setModalOpen(true)}>Open modal</Button>
        <Button variant="secondary" disabled>
          Disabled action
        </Button>
        <Input
          id="name"
          label="Name"
          name="name"
          placeholder="Type your name"
          value={name}
          onChange={handleNameChange}
        />
      </div>

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
        <p className="text-sm text-slate-600">
          Hello{name ? `, ${name}` : ''}. This modal confirms Headless UI is integrated and
          render-safe.
        </p>
      </Modal>
    </section>
  )
}
