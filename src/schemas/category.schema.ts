import * as z from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  imageUrl: z.string().url("Must be a valid URL").optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
