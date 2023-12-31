import "reflect-metadata";
import { plainToInstance, classToPlain } from "class-transformer";
import { validate } from "class-validator";
import { Router } from "express";
import { Sucursal } from "../storage/controllers/sucursal.js";

const appMiddlewareSucursalVerify = Router();
const proxySucursal = Router();

appMiddlewareSucursalVerify.use((req, res, next) => {
  if (!req.rateLimit) return;
  let { payload } = req.data;
  const { iat, exp, ...newPayload } = payload;
  payload = newPayload;
  let Clone = JSON.stringify(
    classToPlain(plainToInstance(Sucursal, {}, { ignoreDecorators: true }))
  );
  let Verify = Clone === JSON.stringify(payload);
  !Verify
    ? res.status(406).send({ status: 406, message: "No estás autorizado" })
    : next();
});

proxySucursal.use(async (req, res, next) => {
  try {
    let data = plainToInstance(Sucursal, req.body);
    await validate(data);
    req.body = JSON.parse(JSON.stringify(data));
    req.data = undefined;
    next();
  } catch (err) {
    res.status(err.status).send(err);
  }
});

export { appMiddlewareSucursalVerify, proxySucursal };
