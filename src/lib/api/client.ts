import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { supabase } from '@/lib/supabase/client'

export interface ApiError {
  message: string
  code?: string
  status?: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
}

class ApiClient {
  private client: AxiosInstance

  constructor(baseURL?: string) {
    this.client = axios.create({
      baseURL: baseURL || '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add authentication headers
    this.client.interceptors.request.use(
      async (config) => {
        try {
          // Get current session from Supabase
          const { data: { session } } = await supabase.auth.getSession()

          if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`
          }

          // Add Supabase API key if available
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          if (supabaseKey) {
            config.headers['apikey'] = supabaseKey
          }

          return config
        } catch (error) {
          console.error('Error setting up request headers:', error)
          return config
        }
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      async (error) => {
        const originalRequest = error.config

        // Handle 401 unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            // Attempt to refresh the session
            const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()

            if (refreshError || !session?.access_token) {
              // Refresh failed, redirect to login
              if (typeof window !== 'undefined') {
                window.location.href = '/login'
              }
              return Promise.reject(error)
            }

            // Update the authorization header and retry the request
            originalRequest.headers.Authorization = `Bearer ${session.access_token}`
            return this.client(originalRequest)
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError)
            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }
            return Promise.reject(error)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  // Generic request methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, config)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, config)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data, config)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<T>(url, data, config)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, config)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  private handleError(error: any): ApiResponse {
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        message: error.response?.data?.error || error.message || 'An unexpected error occurred',
        code: error.code,
        status: error.response?.status,
      }

      return {
        success: false,
        error: apiError,
      }
    }

    return {
      success: false,
      error: {
        message: error.message || 'An unexpected error occurred',
      },
    }
  }

  // Get the underlying axios instance for advanced usage
  getInstance(): AxiosInstance {
    return this.client
  }
}

// Create and export the default API client instance
export const apiClient = new ApiClient()

// Export the class for creating custom instances if needed
export { ApiClient }