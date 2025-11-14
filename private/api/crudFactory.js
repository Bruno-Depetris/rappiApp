import * as http from "./httpClient.js";

export function createCrud(entity, key = null) {
  return {
    getAll: () => http.get(entity, key),
    getById: (id) => http.get(`${entity}/${id}`, key),
    create: (data) => http.post(entity, data, key),
    update: (id, data) => http.put(`${entity}/${id}`, data, key),
    delete: (id) => http.del(`${entity}/${id}`, key),
  };
}