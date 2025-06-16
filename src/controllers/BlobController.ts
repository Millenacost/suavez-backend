import { FastifyReply, FastifyRequest } from "fastify";
import { app } from "../http/server";
import { generateClientTokenFromReadWriteToken } from "@vercel/blob/client";
import dotenv from 'dotenv';
import { del } from "@vercel/blob";
dotenv.config();

class BlobController {
  async handle(req: FastifyRequest, res: FastifyReply) {
    try {
      const body = req.body as {
        payload: {
          pathname: string;
        };
      };

      const pathname = body.payload.pathname;

      if (!pathname) {
        return res.status(400).send({ error: 'Pathname é obrigatorio' });

      }

      await del(pathname, {
        token: process.env.BLOB_READ_WRITE_TOKEN!})

      const clientToken = await generateClientTokenFromReadWriteToken({
        pathname: pathname,
        token: process.env.BLOB_READ_WRITE_TOKEN!,
        allowOverwrite: true
      });

      return res.send({ clientToken });
    } catch (error) {
      console.error('Erro ao gerar URL de upload:', error);
      return res.status(500).send({ error: 'Erro ao gerar upload URL' });
    }
  }
}

export { BlobController }