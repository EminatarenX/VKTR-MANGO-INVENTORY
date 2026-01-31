import { NextRequest, NextResponse } from 'next/server'
import { getReportSummary } from '@/lib/services/reports.service'
import { reportFiltersSchema } from '@/lib/validators'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const productId = searchParams.get('productId') || undefined

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Los parámetros from y to son requeridos' },
        { status: 400 }
      )
    }

    const filters = reportFiltersSchema.parse({ from, to, productId })
    const report = await getReportSummary(filters.from, filters.to, filters.productId)
    return NextResponse.json(report)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Filtros inválidos', details: error },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
