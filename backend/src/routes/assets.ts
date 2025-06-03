import { FastifyInstance } from "fastify"
import { z } from "zod"
import { prisma } from "../server"

export default async function assetRoutes(app: FastifyInstance) {
  const AssetSchema = z.object({
    name: z.enum(["PETR4", "VALE3", "ITUB4", "Tesouro IPCA+ 2035", "Tesouro Selic 2027", "CDB Banco Inter (1 ano)", "LCI Caixa (2 anos)", "USD/BRL", "EUR/BRL", "Bitcoin", "Ethereum", "Ouro (g)", "Soja (saca 60kg)", "Milho (saca 60kg)", "Café Arábica (saca 60kg)"]),
    value: z.number(),
    clientId: z.number().int().positive()
  })
  

  app.post('/', async (request, reply) => { // Criar ativo para cliente
    const validation = AssetSchema.safeParse(request.body)
    
    if (!validation.success) {
      return reply.status(400).send(validation.error)
    }
    
    const {name, value, clientId} = validation.data
    
    try {
      const validationClient = await prisma.client.findUnique({where: {id: clientId}})
      if (!validationClient) {
        return reply.status(400).send({ error: "Cliente não encontrado."})
      }
      
      if (!validationClient.active) {
        return reply.status(403).send({ erro: "Cliente está inativo, caso queira prosseguir terá que ativar."})
      }
      
      const asset = await prisma.asset.create({
        data: {
          name,
          value,
          clientId
        }
      })
      
      return reply.status(201).send(asset)
    } catch (error) {
      return reply.status(500).send({error: "Erro ao criar ativo."})
    }
  })
  
  app.get('/', async (_, reply) => { // Listar todos ativos
    const assets = await prisma.asset.findMany({
      include: {
        client: true
      }
    })
    
    return reply.status(200).send(assets)
  })
  
  app.get('/cliente/:id', async (request, reply) => { // Listar ativos de cada cliente
    const schema = z.object({ id: z.coerce.number().int().positive() })
    const validation = schema.safeParse(request.params)
    
    if (!validation.success) {
      return reply.status(400).send(validation.error)
    }
    
    const { id } = validation.data
    
    try {
      const client = await prisma.client.findUnique({
        where: { id }
      })
      
      if (!client) {
        return reply.status(404).send({ error: "Cliente não encontrado." })
      }
      
      const assets = await prisma.asset.findMany({
        where: {
          clientId: id
        }
      })
       
      return reply.send(assets)
    } catch (error) {
      return reply.status(500).send({ error: "Erro ao buscar ativos" })
    }
  })

  app.get('/catalog', async (_, reply) => { // Rota para trazer ativos mocados com valores fixos
    const assetsFix = [
        { name: "PETR4", tipo: "ação", value: 39.50 },
        { name: "VALE3", tipo: "ação", value: 67.80 },
        { name: "ITUB4", tipo: "ação", value: 30.20 },
        { name: "Tesouro IPCA+ 2035", tipo: "título público", value: 2900.00 },
        { name: "Tesouro Selic 2027", tipo: "título público", value: 11800.00 },
        { name: "CDB Banco Inter (1 ano)", tipo: "título privado", value: 1000.00 },
        { name: "LCI Caixa (2 anos)", tipo: "título privado", value: 5000.00 },
        { name: "USD/BRL", tipo: "moeda", value: 5.25 },
        { name: "EUR/BRL", tipo: "moeda", value: 5.65 },
        { name: "Bitcoin", tipo: "cripto", value: 355000.00 },
        { name: "Ethereum", tipo: "cripto", value: 18000.00 },
        { name: "Ouro (g)", tipo: "commodity", value: 370.00 }, 
        { name: "Soja (saca 60kg)", tipo: "commodity", value: 150.00 },
        { name: "Milho (saca 60kg)", tipo: "commodity", value: 65.00 },
        { name: "Café Arábica (saca 60kg)", tipo: "commodity", value: 950.00 }
    ]
    
    return reply.status(200).send(assetsFix)
  })

}