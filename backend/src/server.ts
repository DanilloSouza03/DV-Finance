import fastify from "fastify"
import { PrismaClient } from "@prisma/client"
import clientRoutes from "./routes/clients"
import assetRoutes from "./routes/assets"
import cors from "@fastify/cors"

export const prisma = new PrismaClient()
const app = fastify({ logger: true }) // Dev

app.register(cors, {
  origin: 'http://localhost:3001', 
});

app.register(clientRoutes, {prefix: "/clients"})

app.register(assetRoutes, {prefix: "/assets"})

app.listen({port: 3000, host: "0.0.0.0"}, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`Server rodando aqui ${address}`) // Dev
})