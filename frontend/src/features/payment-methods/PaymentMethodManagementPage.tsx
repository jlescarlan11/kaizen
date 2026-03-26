import { type ReactElement } from 'react'
import { Card } from '../../shared/components/Card'
import { PaymentMethodCreationForm } from './PaymentMethodCreationForm'
import { PaymentMethodList } from './PaymentMethodList'
import { useGetPaymentMethodsQuery } from '../../../app/store/api/paymentMethodApi'
import { pageLayout } from '../../shared/styles/layout'

export function PaymentMethodManagementPage(): ReactElement {
  const { data: paymentMethods = [], isLoading, error } = useGetPaymentMethodsQuery()

  return (
    <section className={pageLayout.sectionGap}>
      <header className={pageLayout.headerGap}>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Payment Methods</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Manage the payment methods you use for your transactions.
          </p>
        </div>
      </header>

      {error && (
        <Card tone="warning">
          <p className="text-sm text-foreground font-medium">Unable to load payment methods.</p>
        </Card>
      )}

      <div className="space-y-8">
        <Card className="max-w-md">
          <h2 className="text-lg font-semibold tracking-tight text-foreground mb-4">
            Add a custom payment method
          </h2>
          <PaymentMethodCreationForm paymentMethods={paymentMethods} />
        </Card>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Your payment methods
          </h2>
          <PaymentMethodList paymentMethods={paymentMethods} isLoading={isLoading} />
        </div>
      </div>
    </section>
  )
}
