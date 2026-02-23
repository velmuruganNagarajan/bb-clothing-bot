import { config } from 'dotenv';
import axios from 'axios';

config();

const BASE_URL = process.env.BASE_URL || 'https://api.bigandbroz.com';

// Create axios instance with base configuration
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Get inventory list with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Promise<Object>} Inventory data
 */
export async function getInventory(page = 1, limit = 10) {
    try {
        const response = await apiClient.get('/api/inventory', {
            params: {
                page,
                limit,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory:', error);
        if (error.response) {
            throw new Error(`HTTP error! status: ${error.response.status} - ${error.response.data?.message || error.message}`);
        }
        throw error;
    }
}

/**
 * Get inventory by variant ID
 * @param {number} variantId - Variant ID
 * @returns {Promise<Object>} Variant inventory data
 */
export async function getInventoryByVariant(variantId) {
    try {
        const response = await apiClient.get(`/api/inventory/variant/${variantId}`);
        return response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching inventory by variant:', error);
        if (error.response) {
            throw new Error(`HTTP error! status: ${error.response.status} - ${error.response.data?.message || error.message}`);
        }
        throw error;
    }
}

/**
 * Update inventory for a variant
 * @param {number} variantId - Variant ID
 * @param {Object} payload - Update payload { stockQuantity, reservedQuantity }
 * @returns {Promise<Object>} Updated inventory data
 */
export async function updateInventory(variantId, payload) {
    try {
        const response = await apiClient.put(`/api/inventory/variant/${variantId}`, payload);
        return response.data.data || response.data;
    } catch (error) {
        console.error('Error updating inventory:', error);
        if (error.response) {
            throw new Error(`HTTP error! status: ${error.response.status} - ${error.response.data?.message || error.message}`);
        }
        throw error;
    }
}

/**
 * Add stock to a variant
 * @param {number} variantId - Variant ID
 * @param {Object} payload - Add stock payload { quantity }
 * @returns {Promise<Object>} Updated inventory data
 */
export async function addStock(variantId, payload) {
    try {
        const response = await apiClient.post(`/api/inventory/variant/${variantId}/add-stock`, payload);
        return response.data.data || response.data;
    } catch (error) {
        console.error('Error adding stock:', error);
        if (error.response) {
            throw new Error(`HTTP error! status: ${error.response.status} - ${error.response.data?.message || error.message}`);
        }
        throw error;
    }
}
