import { FastifyInstance } from "fastify"
import { z } from "zod"
import { prisma } from "../server"

export default async function clientRoutes(app:FastifyInstance) {
  const ClientSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    active: z.boolean()
  })

  const ClientUpdateSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    active: z.boolean().optional()
  }).strict()

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

  app.put('/edit/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.coerce.number().int().positive()
    })
    const idValidation = paramsSchema.safeParse(request.params)
    const bodyValidation = ClientUpdateSchema.safeParse(request.body)

    if (!idValidation || !bodyValidation) {
      return reply.status(400).send({
        erro: 'ID ou dados inválidos!',
        details: {
          params: idValidation.error,
          body: bodyValidation.error
        }
      })
    }

    const { id } = idValidation.data!
    const bodyData = bodyValidation.data!

    try {
      const updateClient = await prisma.client.update({
        where: { id },
        data: bodyData
      })    
      
      return reply.send(updateClient)
    } catch (error) {
      return reply.status(400).send({ error: "Erro ao editar cliente."})
    }
  })

  app.delete('/delete/:id', async (request, reply) => { //Apagar Cliente
    const paramsSchema = z.object({
      id: z.coerce.number().int().positive()
    })
    
    const validation = paramsSchema.safeParse(request.params)

    if (!validation) {
      return reply.status(400).send({ erro: "Erro ao apagar o cliente." })
    }

    const { id } = validation.data!

    try {
      await prisma.client.delete({
        where: { id }
      })

      return reply.status(204).send()
    } catch (error) {
      return reply.status(404).send({error: "Cliente não encontrado"})
    }
  })

}