import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = `${API_BASE}/sweets`;

export const getAllSweets = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch sweets');
  }
};

export const getSweetById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch sweet');
  }
};

export const searchSweets = async (filters) => {
  try {
    const response = await axios.get(`${API_URL}/search`, { params: filters });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Search failed');
  }
};

export const createSweet = async (sweetData) => {
  try {
    const response = await axios.post(API_URL, sweetData);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create sweet');
  }
};

export const updateSweet = async (id, sweetData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, sweetData);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update sweet');
  }
};

export const deleteSweet = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete sweet');
  }
};

export const purchaseSweet = async (id, quantity) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/purchase`, { quantity });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Purchase failed');
  }
};

export const restockSweet = async (id, quantity) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/restock`, { quantity });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Restock failed');
  }
};
