import { request } from "@/lib/api";

export const CUSTOMER_STATUSES = ["ACTIVE", "INACTIVE", "CHURNED"];

export function listCustomers(params) {
  return request({ url: "/customers", method: "GET", params });
}

export function createCustomer(payload) {
  return request({ url: "/customers", method: "POST", data: payload });
}

export function updateCustomer(id, payload) {
  return request({ url: `/customers/${id}`, method: "PUT", data: payload });
}

export function deleteCustomer(id) {
  return request({ url: `/customers/${id}`, method: "DELETE" });
}
