import { Request, Response } from "express";

export const perform = (req: Request, res: Response) => {
  const { id } = req.params;

  // Для POST запросов с телом
  if (req.method === "POST" && req.body) {
    const { name, email } = req.body;
    return res.status(200).json({
      id,
      name,
      email,
      message: `User ${id} updated`,
    });
  }

  // Для остальных методов (PUT, PATCH, DELETE)
  res.status(200).json({
    id,
    message: `User ${id} updated via ${req.method}`,
  });
};
