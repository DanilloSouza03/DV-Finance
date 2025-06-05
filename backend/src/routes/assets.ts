import { FastifyInstance } from "fastify"
import { z } from "zod"
import { prisma } from "../server"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export default async function assetRoutes(app: FastifyInstance) {
  const AssetSchema = z.object({
    name: z.enum(["PETR4", "VALE3", "ITUB4", "Tesouro IPCA+ 2035", "Tesouro Selic 2027", "CDB Banco Inter (1 ano)", "LCI Caixa (2 anos)", "USD/BRL", "EUR/BRL", "Bitcoin", "Ethereum", "Ouro (g)", "Soja (saca 60kg)", "Milho (saca 60kg)", "Café Arábica (saca 60kg)"], { message: "Nome do ativo inválido." }),
    value: z.number({ invalid_type_error: "Valor deve ser um número." }).positive({ message: "Valor deve ser um número positivo." }),
    clientId: z.string().uuid({ message: "ID do cliente inválido." })
  })


  app.post('/', async (request, reply) => {
    const validation = AssetSchema.safeParse(request.body)

    if (!validation.success) {
      return reply.status(400).send({
        error: "Dados de entrada inválidos.",
        details: validation.error.flatten().fieldErrors
      })
    }

    const {name, value, clientId} = validation.data

    try {
      const client = await prisma.client.findUnique({where: {id: clientId}})
      if (!client) {
        return reply.status(404).send({ error: "Cliente não encontrado."})
      }

      if (!client.active) {
        return reply.status(403).send({ error: "Cliente está inativo. Ative-o para adicionar ativos."})
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
      app.log.error(error)
      return reply.status(500).send({error: "Erro interno ao criar ativo."})
    }
  })

  app.get('/', async (_, reply) => {
    try {
      const assets = await prisma.asset.findMany({
        include: {
          client: true
        }
      })

      return reply.status(200).send(assets)
    } catch (error) {
      app.log.error(error)
      return reply.status(500).send({ error: "Erro interno ao listar ativos." })
    }
  })

  app.get('/cliente/:id', async (request, reply) => { // Listar ativos de cada cliente
    const schema = z.object({ id: z.string().uuid({ message: "ID do cliente inválido." }) })
    const validation = schema.safeParse(request.params)
    
    if (!validation.success) {
      return reply.status(400).send({
        error: "ID do cliente inválido.",
        details: validation.error.flatten().fieldErrors
      })
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
      app.log.error(error)
      return reply.status(500).send({ error: "Erro interno ao buscar ativos do cliente." })
    }
  })

  app.delete('/delete/:id', async (request, reply) => {
    const schema = z.object({
      id: z.string().uuid({ message: "ID do ativo inválido." })
    })

    const validation = schema.safeParse(request.params)

    if (!validation.success){
      return reply.status(400).send({
        error: "ID do ativo inválido.",
        details: validation.error.flatten().fieldErrors
      })
    }

    const { id } = validation.data

    try {
      const asset = await prisma.asset.findUnique({ where: {id} })

      if (!asset) {
        return reply.status(404).send({ error: "Ativo não encontrado." })
      }

      await prisma.asset.delete({where: {id }})

      return reply.status(204).send()

    } catch (error) {
       if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return reply.status(404).send({ error: "Ativo não encontrado." })
        }
      }
      app.log.error(error)
      return reply.status(500).send({ error: "Erro interno ao apagar ativo." })
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