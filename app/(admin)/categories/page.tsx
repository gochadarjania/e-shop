'use client';

import { useState, useEffect, useRef } from 'react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdCheckCircle, MdCancel } from 'react-icons/md';
import categoryService from '@/lib/services/categoryService';
import CategoryDrawer from '@/components/categories/CategoryDrawer';

interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  parentCategoryId?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const hasFetched = useRef(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response: any = await categoryService.getCategoriesAdmin(1, 100);

      if (Array.isArray(response)) {
        setCategories(response);
      } else if (response.items || response.data) {
        setCategories(response.items || response.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      let errorMessage = (err as Error).message || 'Failed to fetch categories';

      if (errorMessage.includes('500')) {
        errorMessage = 'Server error occurred. Please try again later or contact support.';
      }

      setError(errorMessage);
      console.error('Fetch categories error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Prevent double fetch in React Strict Mode (development)
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsDrawerOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedCategory(null);
  };

  const handleDrawerSuccess = () => {
    fetchCategories();
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${categoryName}"?`)) {
      return;
    }

    try {
      await categoryService.deleteCategory(categoryId);
      fetchCategories();
    } catch (err) {
      alert((err as Error).message || 'Failed to delete category');
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      if (category.isActive) {
        await categoryService.deactivateCategory(category.id);
      } else {
        await categoryService.activateCategory(category.id);
      }
      fetchCategories();
    } catch (err) {
      alert((err as Error).message || 'Failed to update category status');
    }
  };

  // Get parent category name
  const getParentName = (parentId?: string | null) => {
    if (!parentId) return 'Root';
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? parent.name : 'Unknown';
  };

  const filteredCategories = categories.filter(category =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort by display order
  const sortedCategories = [...filteredCategories].sort((a, b) =>
    (a.displayOrder || 0) - (b.displayOrder || 0)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded m-6">
        {error}
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800">Categories</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAddCategory}
            className="flex items-center px-3 md:px-4 py-2 text-xs md:text-sm text-white bg-[#a3c133] rounded hover:bg-[#92b01f]"
          >
            <MdAdd className="mr-1 md:mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 md:mb-6">
        <div className="p-3 md:p-4 space-y-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for Category"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="px-3 md:px-4 pb-3 text-xs md:text-sm text-gray-600">
          {sortedCategories.length} categories
        </div>
      </div>

      {/* Categories Table - Desktop */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCategories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No categories found
                </td>
              </tr>
            ) : (
              sortedCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {category.displayOrder}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                      {category.description && (
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                          {category.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{category.slug || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {getParentName(category.parentCategoryId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(category)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        category.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {category.isActive ? (
                        <>
                          <MdCheckCircle className="mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <MdCancel className="mr-1" />
                          Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                        title="Edit category"
                      >
                        <MdEdit className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                        title="Delete category"
                      >
                        <MdDelete className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Categories Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {sortedCategories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
            No categories found
          </div>
        ) : (
          sortedCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      #{category.displayOrder}
                    </span>
                    <button
                      onClick={() => handleToggleActive(category)}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        category.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {category.isActive ? (
                        <>
                          <MdCheckCircle className="mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <MdCancel className="mr-1" />
                          Inactive
                        </>
                      )}
                    </button>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="text-gray-600">Slug: {category.slug || '-'}</span>
                    <span className="text-gray-600">
                      Parent: {getParentName(category.parentCategoryId)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 ml-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded"
                    title="Edit category"
                  >
                    <MdEdit className="text-lg" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id, category.name)}
                    className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded"
                    title="Delete category"
                  >
                    <MdDelete className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Category Drawer */}
      <CategoryDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        category={selectedCategory}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  );
}
