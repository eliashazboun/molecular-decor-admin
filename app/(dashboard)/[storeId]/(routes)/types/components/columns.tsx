"use client"

import { ColumnDef } from "@tanstack/react-table"
import CellAction from "./cell-action"

export type TypeColumn = {
  id: string
  name: string
  createdAt: string
  value: string
}

export const columns: ColumnDef<TypeColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({row}) => (
      <div className="flex items-center gap-x-2">
        {row.original.value}
      </div>
    )
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id:"actions",
    cell: ({row}) => <CellAction data={row.original}/>
  }

]
