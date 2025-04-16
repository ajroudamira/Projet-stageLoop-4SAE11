import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(path: string, params: HttpParams = new HttpParams()): Observable<ApiResponse<T>> {
    const url = this.getFullUrl(path);
    console.log(`Making GET request to: ${url}`);
    
    try {
      return this.http.get<ApiResponse<T>>(url, { params })
        .pipe(
          catchError(error => {
            // For missing endpoints, try alternative paths if needed
            if (error.status === 404) {
              // Check if the path contains analytics
              if (path.includes('analytics')) {
                // Try to find a suitable alternative endpoint
                const altPath = this.getAlternativeEndpoint(path);
                if (altPath !== path) {
                  console.log(`Endpoint not found, trying alternative: ${altPath}`);
                  return this.http.get<ApiResponse<T>>(this.getFullUrl(altPath), { params })
                    .pipe(
                      catchError(altError => this.handleError(altError, `GET ${altPath} (alternative)`))
                    );
                }
              }
            }
            return this.handleError(error, `GET ${path}`);
          })
        );
    } catch (e) {
      console.error('Exception during API call setup:', e);
      return of({ 
        success: false, 
        message: 'Failed to set up API request', 
        data: {} as T 
      }) as Observable<ApiResponse<T>>;
    }
  }

  post<T>(path: string, body: any): Observable<ApiResponse<T>> {
    const url = this.getFullUrl(path);
    console.log(`Making POST request to: ${url}`, body);
    
    try {
      return this.http.post<ApiResponse<T>>(url, body)
        .pipe(
          catchError(error => this.handleError(error, `POST ${path}`))
        );
    } catch (e) {
      console.error('Exception during API call setup:', e);
      return of({ 
        success: false, 
        message: 'Failed to set up API request', 
        data: {} as T 
      }) as Observable<ApiResponse<T>>;
    }
  }

  put<T>(path: string, body: any): Observable<ApiResponse<T>> {
    const url = this.getFullUrl(path);
    console.log(`Making PUT request to: ${url}`, body);
    
    try {
      return this.http.put<ApiResponse<T>>(url, body)
        .pipe(
          catchError(error => this.handleError(error, `PUT ${path}`))
        );
    } catch (e) {
      console.error('Exception during API call setup:', e);
      return of({ 
        success: false, 
        message: 'Failed to set up API request', 
        data: {} as T 
      }) as Observable<ApiResponse<T>>;
    }
  }

  delete<T>(path: string): Observable<ApiResponse<T>> {
    const url = this.getFullUrl(path);
    console.log(`Making DELETE request to: ${url}`);
    
    try {
      return this.http.delete<ApiResponse<T>>(url)
        .pipe(
          catchError(error => this.handleError(error, `DELETE ${path}`))
        );
    } catch (e) {
      console.error('Exception during API call setup:', e);
      return of({ 
        success: false, 
        message: 'Failed to set up API request', 
        data: {} as T 
      }) as Observable<ApiResponse<T>>;
    }
  }

  private getAlternativeEndpoint(path: string): string {
    // Map analytics endpoints to potential alternatives
    if (path.includes('/stats/status') || path.includes('analytics/status')) {
      return '/ticket/stats/byStatus';
    } else if (path.includes('/stats/priority') || path.includes('analytics/priority')) {
      return '/ticket/stats/byPriority';
    } else if (path.includes('/stats/category') || path.includes('analytics/category')) {
      return '/ticket/stats/byCategory';
    }
    
    // Map notification endpoints
    if (path.includes('/unread/')) {
      const userId = path.split('/').pop();
      return `/notification/unread/${userId}`;
    }
    
    // Map user endpoints
    if (path.includes('/user/GetAllUsers')) {
      console.log('Using alternative user endpoint for GetAllUsers');
      return '/user/getAllUsers'; // Try lowercase version as alternative
    }
    
    return path;
  }

  private handleError(error: HttpErrorResponse, operation: string): Observable<never> {
    let errorMessage = `Error in ${operation}: `;
    
    if (error.status === 0) {
      // A client-side or network error occurred
      errorMessage += 'Network error - please check your connection';
      console.error(`${errorMessage}`, error);
      return of({ success: false, message: errorMessage, data: {} }) as any;
    } else if (error.status === 404) {
      // Endpoint not found
      errorMessage += `API endpoint not found (404) - please check the URL`;
      console.warn(`${errorMessage}`, error);
      return of({ success: false, message: errorMessage, data: {} }) as any;
    } else if (error.status === 500) {
      // Server error
      errorMessage += `Server error (500) - please contact administrator`;
      console.error(`${errorMessage}`, error);
      
      // Log more details if available
      if (error.error) {
        try {
          console.error('Server error details:', error.error);
        } catch (e) {
          console.error('Could not parse server error response');
        }
      }
      return of({ success: false, message: errorMessage, data: {} }) as any;
    } else if (error.status === 403) {
      // Forbidden - permission issue
      errorMessage += 'Permission denied - you may not have the required role';
      console.warn(`${errorMessage}`, error);
      return of({ success: false, message: errorMessage, data: {} }) as any;
    } else {
      // The backend returned an unsuccessful response code
      errorMessage += `Backend returned code ${error.status}, body was: `;
      errorMessage += error.error instanceof Object ? JSON.stringify(error.error) : error.error;
      console.error(`${errorMessage}`, error);
      return of({ success: false, message: errorMessage, data: {} }) as any;
    }
  }

  private getFullUrl(path: string): string {
    // Ensure path starts with slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // Fix issue with redundant api/service in the path
    if (normalizedPath.includes('/api/service') && this.apiUrl.includes('/api/service')) {
      // Extract the part after /api/service to avoid duplication
      const pathAfterApiService = normalizedPath.replace(/^.*?\/api\/service/, '');
      return `${this.apiUrl}${pathAfterApiService}`;
    }
    
    return `${this.apiUrl}${normalizedPath}`;
  }
} 