import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Dev
const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface Asset {
  id: string; 
  name: string;
  value: number;
  clientId?: string; 
}

export interface CatalogAsset {
  name: string;
  tipo: string;
  value: number;
}

export type CreateAssetPayload = {
  name: string;
  value: number;
  clientId: string; 
};

export const fetchAllAssets = async (): Promise<Asset[]> => {
  const { data } = await api.get(`${API_BASE_URL}/assets/`);
  return data;
};

export const fetchClientAssets = async (clientId: string): Promise<Asset[]> => { 
  const { data } = await api.get(`${API_BASE_URL}/assets/cliente/${clientId}`);
  return data;
};

export const fetchCatalogAssets = async (): Promise<CatalogAsset[]> => {
  const { data } = await api.get(`${API_BASE_URL}/assets/catalog`);
  return data;
};

export const createAsset = async (assetData: CreateAssetPayload): Promise<Asset> => {
  const { data } = await api.post(`${API_BASE_URL}/assets/`, assetData);
  return data;
};

export const deleteAsset = async (assetId: string): Promise<void> => {
  await api.delete(`${API_BASE_URL}/assets/delete/${assetId}`);
};