import { NextRequest, NextResponse } from 'next/server'
import { createMovement, getMovements } from '@/lib/services/movements.service'
import { movementSchema, movementFiltersSchema } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = movementSchema.parse(body)
    const movement = await createMovement(validatedData)
    return NextResponse.json(movement, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = {
      productId: searchParams.get('productId') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      type: (searchParams.get('type') as 'IN' | 'OUT') || undefined,
    }

    // Validate filters
    const validatedFilters = movementFiltersSchema.parse(filters)
    const movements = await getMovements(validatedFilters)
    return NextResponse.json(movements)
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
