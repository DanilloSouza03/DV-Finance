import { FastifyInstance } from "fastify"
import { z } from "zod"
import { prisma } from "../server"

export default async function assetRoutes(app: FastifyInstance) {
  const AssetSchema = z.object({
    name: z.string().min(1),
    value: z.number(),
    clientId: z.number().int().positive()
  })
  

  app.post('/', async (request, reply) => { // Ativo para cliente
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
  
}