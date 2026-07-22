import * as z from "zod";

export const productVariantSchema = z.object({
  sku: z.string().min(3, "SKU is required"),
  size: z.string().optional(),
  color: z.string().optional(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
});

export const productImageSchema = z.object({
  url: z.string().min(1, "Image path is required"),
  isPrimary: z.boolean().default(false),
});

export const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description is too short"),
  categoryId: z.string().uuid("Invalid category ID"),
  brandId: z.string().uuid("Invalid brand ID").nullable().optional(),
  storeId: z.string().uuid("Invalid store ID"),
  originalPrice: z.coerce.number().min(0.01, "Price must be greater than 0"),
  offerPrice: z.coerce.number().min(0.01, "Offer Price must be greater than 0"),
  isFeatured: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  variants: z.array(productVariantSchema).min(1, "At least one variant is required"),
  images: z.array(productImageSchema).min(1, "At least one image is required"),
}).refine((data) => data.offerPrice <= data.originalPrice, {
  message: "Offer price cannot be greater than original price",
  path: ["offerPrice"],
});

export type ProductFormValues = z.infer<typeof productSchema>;
