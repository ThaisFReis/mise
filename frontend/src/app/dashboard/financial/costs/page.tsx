'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import CostInputForm from '@/components/financial/CostInputForm'
import CostHistoryTable from '@/components/financial/CostHistoryTable'
import SupplierManager from '@/components/financial/SupplierManager'

export default function CostsPage() {
  const [activeTab, setActiveTab] = useState('register')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestão de Custos</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie custos de produtos, fornecedores e histórico de alterações
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="register">Cadastro de Custos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="mt-6">
          <Card className="p-6">
            <CostInputForm />
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="p-6">
            <CostHistoryTable />
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="mt-6">
          <Card className="p-6">
            <SupplierManager />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
