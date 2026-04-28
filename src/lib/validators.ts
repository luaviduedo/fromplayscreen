import { z } from "zod";

export const steamIdSchema = z.object({
  steamId: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Steam ID é obrigatório."
          : "Steam ID inválido.",
    })
    .min(1, { error: "Steam ID é obrigatório." })
    .regex(/^\d{17}$/, { error: "Steam ID deve conter 17 dígitos numéricos." }),
});
