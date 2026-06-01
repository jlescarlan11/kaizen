import { type ReactElement } from 'react'
import { Card } from '../../shared/components/Card'
import { PaymentMethodCreationForm } from './PaymentMethodCreationForm'
import { PaymentMethodList } from './PaymentMethodList'
import { useGetPaymentMethodsQuery } from '../../app/store/api/paymentMethodApi'
import { pageLayout } from '../../shared/styles/layout'

export function PaymentMethodManagementPage(): ReactElement {
  const { data: paymentMethods = [], isLoading, error } = useGetPaymentMethodsQuery()

  return (
    <div className="w-full">
      <section className={pageLayout.sectionGap}>
        {error && (
          <Card variant="warning">
            <p className="text-sm text-text-primary font-medium">Unable to load payment methods.</p>
          </Card>
        )}

        <div className="space-y-8">
          <Card className="max-w-md">
            <h2 className="text-lg font-semibold tracking-tight text-text-primary mb-4">
              Add a custom payment method
            </h2>
            <PaymentMethodCreationForm paymentMethods={paymentMethods} />
          </Card>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight text-text-primary">
              Your payment methods
            </h2>
            <PaymentMethodList paymentMethods={paymentMethods} isLoading={isLoading} />
          </div>
        </div>
      </section>
    </div>
  )
}
