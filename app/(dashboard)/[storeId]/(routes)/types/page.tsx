import { Heading } from "@/components/ui/heading"
import { TypesClient } from "./components/client"
import prismadb from "@/lib/prismadb"
import { TypeColumn } from "./components/columns"
import {format} from "date-fns"

const TypesPage = async ({
  params
}:{
  params: {storeId:string}
}) => {

  const types = await prismadb.type.findMany({
    where:{
      storeId:params.storeId
    },
    orderBy:{
      createdAt: 'desc'
    }
  })

  const formattedTypes : TypeColumn[] = types.map((item) => ({
    id: item.id,
    name:item.name,
    value:item.value,
    createdAt: format(item.createdAt,"MMMM do, yyyy")

  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <TypesClient data={formattedTypes}/>
      </div>
      
    </div>
  )
}

export default TypesPage