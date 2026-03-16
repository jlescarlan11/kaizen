import type { ChangeEvent, ReactElement } from 'react'
import { useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Checkbox,
  DailyLineChart,
  Input,
  LineChart,
  Modal,
  PhoneInput,
  ProgressBar,
  Radio,
  ResponsiveModal,
  Select,
} from '../../shared/components'

const DAILY_TREND_DATA = Array.from({ length: 31 }, (_, i) => ({
  day: i + 1,
  value: 20 + Math.random() * 60,
}))

export function PlaygroundPage(): ReactElement {
  const [name, setName] = useState<string>('')
  const [category, setCategory] = useState<string>('expense')
  const [phone, setPhone] = useState<string>('9175550199')
  const [isModalOpen, setModalOpen] = useState<boolean>(false)
  const [isFormModalOpen, setFormModalOpen] = useState<boolean>(false)

  const [rememberMe, setRememberMe] = useState<boolean>(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('free')
  const [progress, setProgress] = useState<number>(65)
  const [activeTrendIndex, setActiveTrendIndex] = useState<number>(11)
  const [activeDayIndex, setActiveDayIndex] = useState<number>(14)

  const trendData = [
    { label: 'Mar', value: 30 },
    { label: 'Apr', value: 35 },
    { label: 'May', value: 45 },
    { label: 'Jun', value: 40 },
    { label: 'Jul', value: 50 },
    { label: 'Aug', value: 55 },
    { label: 'Sep', value: 45 },
    { label: 'Oct', value: 60 },
    { label: 'Nov', value: 65 },
    { label: 'Dec', value: 75 },
    { label: 'Jan', value: 70 },
    { label: 'Feb', value: 85 },
  ]

  function handleNameChange(event: ChangeEvent<HTMLInputElement>): void {
    setName(event.target.value)
  }

  const categoryOptions = [
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
    { value: 'savings', label: 'Savings' },
  ]

  const accountTypeOptions = [
    { value: 'checking', label: 'Checking' },
    { value: 'savings', label: 'Savings' },
    { value: 'credit', label: 'Credit' },
  ]

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' },
  ]

  const modalCategoryOptions = [
    { value: 'utilities', label: 'Utilities' },
    { value: 'rent', label: 'Rent' },
    { value: 'food', label: 'Food' },
  ]

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

      <Card className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight leading-snug text-foreground">
            Field Recipes
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Manual coverage for common input types and field states.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Input id="name" label="Name" name="name" value={name} onChange={handleNameChange} />
          <PhoneInput
            id="phone"
            label="Phone"
            value={phone}
            onChange={setPhone}
            helperText="Philippine mobile number."
          />
          <Input
            id="email"
            type="email"
            label="Email"
            name="email"
            defaultValue="dev@kaizen.test"
            helperText="We'll never share your email."
          />
          <Input
            id="password"
            type="password"
            label="Password"
            name="password"
            defaultValue="password123"
            helperText="Minimum 8 characters."
          />
          <Input
            id="website"
            type="url"
            label="Website"
            name="website"
            defaultValue="https://kaizen.test"
          />
          <Input
            id="search"
            type="search"
            label="Search"
            name="search"
            defaultValue="Recurring payments"
          />
          <Input
            id="amount"
            type="number"
            label="Amount"
            name="amount"
            defaultValue="1200"
            endAdornment="PHP"
            min="0"
          />
          <Input id="date" type="date" label="Date" name="date" defaultValue="2026-03-15" />
          <Input id="time" type="time" label="Time" name="time" defaultValue="09:30" />
          <Input
            id="readonly"
            label="Read only"
            name="readonly"
            defaultValue="System generated"
            readOnly
          />
          <Input
            id="disabled"
            label="Disabled"
            name="disabled"
            defaultValue="Unavailable"
            disabled
          />
          <Input
            id="error"
            label="Error state"
            name="error"
            defaultValue="bad input"
            error="This value needs attention"
            helperText="Provide a valid input."
          />
          <Select
            id="category"
            label="Category"
            options={categoryOptions}
            value={category}
            onChange={setCategory}
            helperText="Select the most appropriate category."
          />
          <Select
            id="account-type"
            label="Account type"
            options={accountTypeOptions}
            defaultValue="checking"
          />
          <Select
            id="status"
            label="Status"
            options={statusOptions}
            defaultValue=""
            error="Please choose a status"
          />
        </div>
      </Card>

      <Card className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <Button onClick={() => setModalOpen(true)}>Open standard modal</Button>
        <Button variant="secondary" onClick={() => setFormModalOpen(true)}>
          Open form drawer
        </Button>
      </Card>

      <Card className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight leading-snug text-foreground">
            Button Recipes
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Coverage for all button variants and their interactive states.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Primary
            </p>
            <Button className="w-full">Action</Button>
            <Button className="w-full" disabled>
              Disabled
            </Button>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Secondary
            </p>
            <Button variant="secondary" className="w-full">
              Action
            </Button>
            <Button variant="secondary" className="w-full" disabled>
              Disabled
            </Button>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Ghost
            </p>
            <Button variant="ghost" className="w-full">
              Action
            </Button>
            <Button variant="ghost" className="w-full" disabled>
              Disabled
            </Button>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Destructive
            </p>
            <Button variant="destructive" className="w-full">
              Action
            </Button>
            <Button variant="destructive" className="w-full" disabled>
              Disabled
            </Button>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight leading-snug text-foreground">
            Selection Recipes
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Manual coverage for toggle and choice components.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Checkboxes
            </p>
            <Checkbox
              id="remember-me"
              label="Remember this device"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              helperText="You'll stay logged in for 30 days."
            />
            <Checkbox
              id="terms"
              label="I accept the terms and conditions"
              error="You must accept to continue"
            />
            <Checkbox id="marketing" label="Subscribe to newsletter" disabled />
          </div>

          <div className="space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Radio Group
            </p>
            <Radio
              name="plan"
              id="plan-free"
              label="Free Plan"
              checked={selectedPlan === 'free'}
              onChange={() => setSelectedPlan('free')}
              helperText="Up to 5 projects."
            />
            <Radio
              name="plan"
              id="plan-pro"
              label="Pro Plan"
              checked={selectedPlan === 'pro'}
              onChange={() => setSelectedPlan('pro')}
              helperText="$12/month, unlimited projects."
            />
            <Radio name="plan" id="plan-enterprise" label="Enterprise" disabled />
          </div>

          <div className="space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Validation States
            </p>
            <Radio
              id="radio-error"
              label="Invalid choice"
              error="This option is currently unavailable"
            />
            <Checkbox
              id="checkbox-error"
              label="Required acknowledgment"
              error="Please check this box"
            />
          </div>
        </div>
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

      <Card className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight leading-snug text-foreground">
            Visual & Feedback Recipes
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Manual coverage for data visualization and progress indicators.
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Progress Bar
              </p>
              <span className="text-xs font-medium text-ui-text-muted">{progress}% complete</span>
            </div>
            <ProgressBar value={progress} />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setProgress(Math.max(0, progress - 10))}>
                -10%
              </Button>
              <Button variant="secondary" onClick={() => setProgress(Math.min(100, progress + 10))}>
                +10%
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Trend Line Chart
            </p>
            <LineChart
              data={trendData}
              activeIndex={activeTrendIndex}
              onPointSelect={setActiveTrendIndex}
              height={240}
            />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Daily Trend Chart (31 Days)
            </p>
            <DailyLineChart
              data={DAILY_TREND_DATA}
              activeIndex={activeDayIndex}
              onPointSelect={setActiveDayIndex}
              height={200}
            />
          </div>
        </div>
      </Card>

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

      <ResponsiveModal
        open={isFormModalOpen}
        onClose={() => setFormModalOpen(false)}
        footer={
          <div className="grid grid-cols-2 gap-4">
            <Button variant="secondary" onClick={() => setFormModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setFormModalOpen(false)}>Add</Button>
          </div>
        }
      >
        <div className="space-y-6">
          <Select label="Select Categories" options={modalCategoryOptions} defaultValue="" />
          <Input label="Amount" placeholder="0.00" type="number" endAdornment="PHP" min="0" />
          <Input label="Period" placeholder="Select period" />
        </div>
      </ResponsiveModal>
    </section>
  )
}
