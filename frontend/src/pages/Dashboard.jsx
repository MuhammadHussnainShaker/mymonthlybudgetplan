import { Incomes, Savings, Container } from '@/components'

export default function Dashboard() {
  return (
    <Container>
      <div className='space-y-10'>
        <Incomes />
        <Savings />
      </div>
    </Container>
  )
}
