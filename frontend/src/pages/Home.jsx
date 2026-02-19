import { Container } from '@/components'

export default function Home() {
  return (
    <Container>
      <div className='space-y-3'>
        <h1 className='text-xl font-medium'>Home Budgeting</h1>
        <p className='max-w-prose text-sm leading-6'>
          Provide a simple platform to plan and track monthly budgets by entering projected and
          actual incomes, savings and expenses and to review monthly summaries and history.
        </p>
      </div>
    </Container>
  )
}
