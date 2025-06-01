import { FastifyInstance } from "fastify"
import { z } from "zod"
import { prisma } from "../server"

export default async function clientRoutes(app:FastifyInstance) {
  const ClientSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    active: z.boolean()
  })

  app.post('/', async (request, reply) => { // Criar o cliente
    const validation = ClientSchema.safeParse(request.body)

    if (!validation.success) {
      return reply.status(400).send(validation.error)
    }

    try {
      const client = await prisma.client.create({
        data: validation.data
      })
      
      return reply.status(201).send(client)
    } catch (error) {
      return reply.status(500).send({error: "Erro ao criar o client"})
    }
  })

  app.get('/list', async (_, reply) => { // Listar clientes
    const clients = await prisma.client.findMany()
    return reply.send(clients)
  })
}