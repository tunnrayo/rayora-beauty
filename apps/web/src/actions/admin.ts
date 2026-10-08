"use server";

import { redirect } from "next/navigation";
import { apiCall, requireAdminUser } from "@/lib/session";
import type { FormState } from "./auth";

const text = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const list = (v: string) => v.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
const toKobo = (v: string) => Math.round(Number(v) * 100);
const goBack = (path: string, error: string) => redirect(`${path}?error=${encodeURIComponent(error)}`);

// ---------- products ----------
export async function saveProductAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdminUser();
  const id = text(formData, "id");
  const price = text(formData, "priceNaira");
  const previous = text(formData, "compareAtNaira");
  if (!price || Number.isNaN(Number(price))) return { error: "Please enter a valid price." };

  const body = {
    name: text(formData, "name"),
    description: text(formData, "description"),
    categoryId: text(formData, "categoryId"),
    priceKobo: toKobo(price),
    compareAtPriceKobo: previous ? toKobo(previous) : null,
    size: text(formData, "size"),
    ingredients: text(formData, "ingredients"),
    skinTypes: list(text(formData, "skinTypes")),
    shades: list(text(formData, "shades")),
    stock: Math.floor(Number(text(formData, "stock") || 0)),
    status: text(formData, "status") || "active",
    isFeatured: formData.get("isFeatured") === "on",
    isNew: formData.get("isNew") === "on",
    isBestSeller: formData.get("isBestSeller") === "on",
    imageUrl: text(formData, "imageUrl") || null,
  };
  const r = id
    ? await apiCall(`/products/admin/${id}`, { method: "PUT", auth: true, body })
    : await apiCall("/products/admin", { method: "POST", auth: true, body });
  if (!r.ok) return { error: r.error ?? "We could not save the product." };
  redirect("/admin/products?saved=1");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdminUser();
  const r = await apiCall(`/products/admin/${text(formData, "id")}`, { method: "DELETE", auth: true });
  if (!r.ok) goBack("/admin/products", r.error ?? "Could not delete the product.");
  redirect("/admin/products?saved=1");
}

export async function updateStockAction(formData: FormData) {
  await requireAdminUser();
  const stock = Math.floor(Number(text(formData, "stock")));
  if (!Number.isFinite(stock) || stock < 0) goBack("/admin/inventory", "Stock must be 0 or more.");
  const r = await apiCall(`/products/admin/${text(formData, "id")}/stock`, { method: "PATCH", auth: true, body: { stock } });
  if (!r.ok) goBack("/admin/inventory", r.error ?? "Could not update stock.");
  redirect("/admin/inventory?saved=1");
}

// ---------- product images ----------
export type ImageState = { error?: string; url?: string; ok?: string } | undefined;

export async function generateImageAction(_prev: ImageState, formData: FormData): Promise<ImageState> {
  await requireAdminUser();
  const r = await apiCall<{ id: string; url: string }>("/ai/generate-image", {
    method: "POST",
    auth: true,
    body: {
      productName: text(formData, "productName"),
      description: text(formData, "description"),
      productType: text(formData, "productType"),
      style: text(formData, "style") || undefined,
      background: text(formData, "background") || undefined,
      aspectRatio: text(formData, "aspectRatio") || "4:5",
      extra: text(formData, "extra"),
    },
  });
  if (!r.data) return { error: r.error ?? "Image generation failed. Please try again." };
  return { url: r.data.url };
}

export async function applyImageAction(formData: FormData) {
  await requireAdminUser();
  const productId = text(formData, "productId");
  const imageUrl = text(formData, "imageUrl");
  if (!productId) goBack("/admin/image-generator", "Choose a product first.");
  const r = await apiCall(`/products/admin/${productId}/image`, { method: "PATCH", auth: true, body: { imageUrl } });
  if (!r.ok) goBack("/admin/image-generator", r.error ?? "Could not save the image.");
  redirect(`/admin/products/${productId}?saved=1`);
}

export async function removeImageAction(formData: FormData) {
  await requireAdminUser();
  const productId = text(formData, "productId");
  const r = await apiCall(`/products/admin/${productId}/image`, { method: "PATCH", auth: true, body: { imageUrl: null } });
  if (!r.ok) goBack(`/admin/products/${productId}`, r.error ?? "Could not remove the image.");
  redirect(`/admin/products/${productId}?saved=1`);
}

// ---------- categories ----------
export async function saveCategoryAction(formData: FormData) {
  await requireAdminUser();
  const id = text(formData, "id");
  const body = {
    name: text(formData, "name"),
    description: text(formData, "description"),
    sortOrder: Math.floor(Number(text(formData, "sortOrder") || 0)),
  };
  const r = id
    ? await apiCall(`/products/admin/categories/${id}`, { method: "PUT", auth: true, body })
    : await apiCall("/products/admin/categories", { method: "POST", auth: true, body });
  if (!r.ok) goBack("/admin/categories", r.error ?? "Could not save the category.");
  redirect("/admin/categories?saved=1");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdminUser();
  const r = await apiCall(`/products/admin/categories/${text(formData, "id")}`, { method: "DELETE", auth: true });
  if (!r.ok) goBack("/admin/categories", r.error ?? "Could not delete the category.");
  redirect("/admin/categories?saved=1");
}

// ---------- orders ----------
export async function updateOrderStatusAction(formData: FormData) {
  await requireAdminUser();
  const orderNumber = text(formData, "orderNumber");
  const r = await apiCall(`/orders/admin/${orderNumber}/status`, {
    method: "PATCH",
    auth: true,
    body: { status: text(formData, "status") },
  });
  if (!r.ok) goBack(`/admin/orders/${orderNumber}`, r.error ?? "Could not update the order.");
  redirect(`/admin/orders/${orderNumber}?saved=1`);
}

// ---------- coupons, banners, settings ----------
export async function createCouponAction(formData: FormData) {
  await requireAdminUser();
  const kind = text(formData, "kind");
  const value = Number(text(formData, "value"));
  const expires = text(formData, "expiresAt");
  const r = await apiCall("/store/admin/coupons", {
    method: "POST",
    auth: true,
    body: {
      code: text(formData, "code"),
      percentOff: kind === "percent" ? Math.floor(value) : null,
      amountOffKobo: kind === "amount" ? Math.round(value * 100) : null,
      expiresAt: expires ? new Date(expires).toISOString() : null,
    },
  });
  if (!r.ok) goBack("/admin/coupons", r.error ?? "Could not create the coupon.");
  redirect("/admin/coupons?saved=1");
}

export async function toggleCouponAction(formData: FormData) {
  await requireAdminUser();
  await apiCall(`/store/admin/coupons/${text(formData, "id")}`, {
    method: "PATCH", auth: true, body: { active: formData.get("active") === "1" },
  });
  redirect("/admin/coupons");
}

export async function deleteCouponAction(formData: FormData) {
  await requireAdminUser();
  await apiCall(`/store/admin/coupons/${text(formData, "id")}`, { method: "DELETE", auth: true });
  redirect("/admin/coupons");
}

export async function createBannerAction(formData: FormData) {
  await requireAdminUser();
  const r = await apiCall("/store/admin/banners", {
    method: "POST",
    auth: true,
    body: { title: text(formData, "title"), subtitle: text(formData, "subtitle"), linkUrl: text(formData, "linkUrl") || "/shop" },
  });
  if (!r.ok) goBack("/admin/banners", r.error ?? "Could not create the banner.");
  redirect("/admin/banners?saved=1");
}

export async function toggleBannerAction(formData: FormData) {
  await requireAdminUser();
  await apiCall(`/store/admin/banners/${text(formData, "id")}`, {
    method: "PATCH", auth: true, body: { active: formData.get("active") === "1" },
  });
  redirect("/admin/banners");
}

export async function deleteBannerAction(formData: FormData) {
  await requireAdminUser();
  await apiCall(`/store/admin/banners/${text(formData, "id")}`, { method: "DELETE", auth: true });
  redirect("/admin/banners");
}

export async function saveSettingsAction(formData: FormData) {
  await requireAdminUser();
  const r = await apiCall("/store/admin/settings", {
    method: "PUT",
    auth: true,
    body: { lagosKobo: toKobo(text(formData, "lagos")), otherKobo: toKobo(text(formData, "other")) },
  });
  if (!r.ok) goBack("/admin/settings", r.error ?? "Could not save settings.");
  redirect("/admin/settings?saved=1");
}
