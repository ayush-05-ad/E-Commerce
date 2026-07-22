import * as z from "zod";

export const reviewSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  rating: z.coerce.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().min(5, "Review must be at least 5 characters long").max(500, "Review is too long").optional(),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
