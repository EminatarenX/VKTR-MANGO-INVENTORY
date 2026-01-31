import { NextRequest, NextResponse } from 'next/server'
import { deleteMovement } from '@/lib/services/movements.service'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { error: 'ID de movimiento requerido' },
        { status: 400 }
      )
    }
    await deleteMovement(id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al eliminar movimiento' },
      { status: 500 }
    )
  }
}
