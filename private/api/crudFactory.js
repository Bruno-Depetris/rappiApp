import * as http from "./httpClient.js";

export function createCrud(entity) {
  return {
    getAll: () => http.get(entity),
    getById: (id) => http.get(`${entity}/${id}`),
    create: (data) => http.post(entity, data),
    update: (id, data) => http.put(`${entity}/${id}`, data),
    delete: (id) => http.del(`${entity}/${id}`),
  };
}