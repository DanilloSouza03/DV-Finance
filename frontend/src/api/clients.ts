import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Dev
const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface Client {
  id: string; 
  name?: string;
  email?: string;
  active?: boolean;
}

export const fetchClients = async (): Promise<Client[]> => {
  const { data } = await api.get('/clients/list');
  return data;
};

export const createClient = async (clientData: Omit<Client, 'id'>): Promise<Client> => {
  const { data } = await api.post('/clients', clientData);
  return data;
};

export const updateClient = async (clientData: Client): Promise<Client> => {
  const { id, ...dataWithoutId } = clientData;
  const { data } = await api.put(`/clients/edit/${id}`, dataWithoutId, {
    headers: {
      "Content-Type": "application/json"
    }
  });
  return data;
};

export const deleteClient = async (clientId: string): Promise<void> => { 
  await api.delete(`/clients/delete/${clientId}`);
};

export const fetchClientsForFilter = async (): Promise<Client[]> => {
  const { data } = await api.get(`${API_BASE_URL}/clients/list`);
  return data;
};