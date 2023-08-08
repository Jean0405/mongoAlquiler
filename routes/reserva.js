import { Router } from "express";
import { connectDB } from "../db/conexion.js";
import { limitRequests } from "../middleware/limit.js";

const RESERVA = Router();
let db = await connectDB();

RESERVA.use(limitRequests);

RESERVA.get("/pendientes", async (req, res) => {
  try {
    const collection = db.collection("reserva");
    const data = await collection
      .aggregate([
        {
          $lookup: {
            from: "cliente",
            localField: "ID_cliente",
            foreignField: "DNI",
            as: "clientes",
          },
          $lookup: {
            from: "automovil",
            localField: "ID_automovil",
            foreignField: "_id",
            as: "automoviles",
          },
        },
        {
          $match: { estado: "PENDIENTE" },
        },
        {
          $group: {
            _id: "$_id",
            DNI_cliente: {
              $first: "$ID_cliente",
            },
            fecha_reserva: {
              $first: "$fecha_reserva",
            },
            fecha_inicio: {
              $first: "$fecha_inicio",
            },
            fecha_fin: {
              $first: "$fecha_fin",
            },
            estado: {
              $first: "$estado",
            },
            detalles_cliente: { $push: "$clientes" },
            detalles_automoviles: { $push: "$automoviles" },
          },
        },
      ])
      .toArray();
    res.send(data);
  } catch (error) {
    es.status(500).json({
      message: "Error al listar los automoviles",
      error: error,
    });
  }
});

export default RESERVA;