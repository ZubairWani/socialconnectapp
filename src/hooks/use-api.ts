"use client";

import { useState } from 'react';

type ApiMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface UseApiReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  exec: (body?: any) => Promise<T | undefined>;
}

export function useApi<T>(endpoint: string, method: ApiMethod = 'GET'): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const exec = async (body?: any): Promise<T | undefined> => {
    setIsLoading(true);
    setError(null);

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body && (method === 'POST' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(endpoint, options);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API call failed with status ${response.status}`);
      }
      
      // Handle 204 No Content response for DELETE requests
      if (response.status === 204) {
        setData(null);
        setIsLoading(false);
        return;
      }
      
      const responseData: T = await response.json();
      setData(responseData);
      return responseData;

    } catch (err: any) {
      setError(err);
      throw err; // Re-throw the error so component can also handle it if needed
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, exec };
}
