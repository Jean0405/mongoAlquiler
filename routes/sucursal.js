import { Router } from "express";
import { connectDB } from "../db/conexion.js";
import { ObjectId } from "mongodb";
import {
  appMiddlewareSucursalVerify,
  proxySucursal,
} from "../middleware/proxySucursal.js";

const SUCURSAL = Router();
let db = await connectDB();

SUCURSAL.post(
  "/",
  appMiddlewareSucursalVerify,
  proxySucursal,
  async (req, res) => {
    const collection = db.collection("sucursal");
    await collection.insertOne(req.body);
    console.log(req.rateLimit);
    res.send({ message: "Nueva sucursal creada", info: req.body });
    try {
    } catch (error) {
      res.status(500).json({
        message: "Error al insertar una sucural",
        error: error.message,
      });
    }
  }
);

SUCURSAL.get("/", appMiddlewareSucursalVerify, async (req, res) => {
  try {
    const collection = db.collection("sucursal");
    const data = await collection.find().toArray();
    res.send(data);
  } catch (error) {
    res.status(500).json({
      message: "Error al listar las sucursales",
      error: error.message,
    });
  }
});

SUCURSAL.put("/:id", appMiddlewareSucursalVerify, async (req, res) => {
  const { id } = req.params;
  const collection = db.collection("sucursal");
  // await collection.deleteOne({ _id: new ObjectId(id) });
  await collection.updateOne({ _id: new ObjectId(id) }, { $set: req.body });
  res.send("La sucursal ha sido actualizada");
  try {
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar una sucursal",
      error: error.message,
    });
  }
});

SUCURSAL.delete("/:id", appMiddlewareSucursalVerify, async (req, res) => {
  const { id } = req.params;
  const collection = db.collection("sucursal");
  await collection.deleteOne({ _id: new ObjectId(id) });
  res.send("La sucursal ha sido borrada");
  try {
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar una sucursal",
      error: error.message,
    });
  }
});

SUCURSAL.get(
  "/automoviles_disponibles",
  appMiddlewareSucursalVerify,
  async (req, res) => {
    const collection = db.collection("sucursal");
    const data = await collection
      .aggregate([
        {
          $lookup: {
            from: "sucursal",
            localField: "ID_sucursal",
            foreignField: "_id",
            as: "sucursal_info",
          },
          $lookup: {
            from: "automovil",
            localField: "ID_automovil",
            foreignField: "_id",
            as: "automovil_info",
          },
        },

        {
          $unwind: "$sucursal_info",
          $unwind: "$automovil_info",
        },
        {
          $group: {
            _id: "$ID_sucursal",
            cantidad_total_automoviles: { $sum: "$cantidad_disponible" },
          },
        },
      ])
      .toArray();
    res.send(data);
    try {
    } catch (error) {
      res.status(500).json({
        message: "Error al eliminar una sucursal",
        error: error.message,
      });
    }
  }
);

//Mostrar la cantidad total de automóviles en cada sucursal junto con su dirección.
SUCURSAL.get("/disponibles", appMiddlewareSucursalVerify, async (req, res) => {
  const collection = db.collection("sucursal");
  const data = await collection
    .aggregate([
      {
        $lookup: {
          from: "sucursal",
          localField: "_id",
          foreignField: "ID_sucursal",
          as: "Sucursal_Info",
        },
      },
      {
        $group: {
          _id: "$ID_sucursal",
          Cantidad_Total_Automoviles: { $sum: "$cantidad_disponible" },
        },
      },
      {
        $project: {
          _id: 1,
          Sucursal: "$Sucursal_Info.nombre",
          Cantidad_Total_Automoviles: 1,
        },
      },
    ])
    .toArray();
  res.send(data);
  try {
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al insertar una sucural", error: error.message });
  }
});

export default SUCURSAL;
