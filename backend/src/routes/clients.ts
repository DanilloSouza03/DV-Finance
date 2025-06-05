import { FastifyInstance } from "fastify"
import { z } from "zod"
import { prisma } from "../server"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

function capitalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function clientRoutes(app:FastifyInstance) {
  const ClientSchema = z.object({
    name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres." }).transform(capitalizeName),
    email: z.string().email({ message: "Email inválido." }).transform(str => str.trim().toLowerCase()),
    active: z.boolean()
  })

  const ClientUpdateSchema = z.object({
    name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres." }).transform(capitalizeName).optional(),
    email: z.string().email().transform(str => str.trim().toLowerCase()).optional(),
    active: z.boolean().optional()
  }).strict()

  app.post('/', async (request, reply) => {
    const validation = ClientSchema.safeParse(request.body)

    if (!validation.success) {
      return reply.status(400).send({
        error: "Dados de entrada inválidos.",
        details: validation.error.flatten().fieldErrors
      })
    }

    try {
      const client = await prisma.client.create({
        data: validation.data
      })

      return reply.status(201).send(client)
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return reply.status(409).send({ error: "Este email já está cadastrado." })
        }
      }
      app.log.error(error)
      return reply.status(500).send({ error: "Erro interno ao criar o cliente." })
    }
  })

  app.get('/list', async (_, reply) => {
    try {
      const clients = await prisma.client.findMany()
      return reply.send(clients)
    } catch (error) {
      app.log.error(error)
      return reply.status(500).send({ error: "Erro interno ao listar clientes." })
    }
  })

  app.put('/edit/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid({ message: "ID do cliente inválido." })
    })
    const idValidation = paramsSchema.safeParse(request.params)
    const bodyValidation = ClientUpdateSchema.safeParse(request.body)

    if (!idValidation.success) {
       return reply.status(400).send({
        error: "ID do cliente inválido.",
        details: idValidation.error.flatten().fieldErrors
      })
    }

    if (!bodyValidation.success) {
       return reply.status(400).send({
        error: "Dados de atualização inválidos.",
        details: bodyValidation.error.flatten().fieldErrors
      })
    }

    const { id } = idValidation.data
    const bodyData = bodyValidation.data

    if (Object.keys(bodyData).length === 0) {
       return reply.status(400).send({ error: "Nenhum dado fornecido para atualização." });
    }

    try {
      const updatedClient = await prisma.client.update({
        where: { id },
        data: bodyData
      })

      return reply.send(updatedClient)
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return reply.status(404).send({ error: "Cliente não encontrado." })
        }
         if (error.code === 'P2002') {
          return reply.status(409).send({ error: "Este email já está cadastrado para outro cliente." })
        }
      }
      app.log.error(error)
      return reply.status(500).send({ error: "Erro interno ao editar cliente." })
    }
  })

  app.delete('/delete/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid({ message: "ID do cliente inválido." })
    })

    const validation = paramsSchema.safeParse(request.params)

    if (!validation.success) {
      return reply.status(400).send({
        error: "ID do cliente inválido.",
        details: validation.error.flatten().fieldErrors
      })
    }

    const { id } = validation.data

    try {
      const client = await prisma.client.findUnique({ where: { id } });
      if (!client) {
        return reply.status(404).send({ error: "Cliente não encontrado." });
      }

      await prisma.client.delete({
        where: { id }
      })

      return reply.status(204).send()
    } catch (error) {
       if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return reply.status(404).send({ error: "Cliente não encontrado." })
        }
         if (error.code === 'P2003') {
          return reply.status(409).send({ error: "Não é possível apagar o cliente pois ele possui ativos associados." })
        }
      }
      app.log.error(error)
      return reply.status(500).send({ error: "Erro interno ao apagar cliente." })
    }
  })

}