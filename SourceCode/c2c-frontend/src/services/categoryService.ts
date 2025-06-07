import api from '../api';

export interface Category {
    id: number;
    name: string;
    slug: string;
}

/**
 * Lấy tất cả các danh mục sản phẩm.
 * @returns {Promise<Category[]>} Mảng các danh mục.
 */
export const getAllCategories = async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
};
