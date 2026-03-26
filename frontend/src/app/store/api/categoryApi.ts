import { baseApi } from './baseApi'

export interface CategoryResponse {
  id: number
  name: string
  isGlobal: boolean
  icon: string
  color: string
}

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryResponse[], void>({
      query: () => '/categories',
      providesTags: ['Categories'],
    }),
  }),
})

export const { useGetCategoriesQuery } = categoryApi
