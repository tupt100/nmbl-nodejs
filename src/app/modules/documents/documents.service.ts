import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBaseResponse } from '../../apiBaseModel/baseResponse';
import { API_BASE_URL } from '../../config/web.config';

@Injectable()

export class DocumentsService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Fetch documents
   * @param data Params data
   */
  listDocument(data): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/documents/`, { params: data });
  }

  /**
   * Fetch document details
   * @param id Document ID
   */
  getDocumentById(id: number): Observable<any> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}projects/api/documents/${id}/`);
  }

  /**
   * Remove document
   * @param id Document ID
   */
  removeDocument(id: number): Observable<any> {
    return this.http.delete<IBaseResponse<any>>(`${API_BASE_URL}projects/api/documents/${id}/`);
  }

  /**
   * Upload document
   * @param file File
   */
  uploadDocument(file): Observable<any> {
    const formData = new FormData();
    formData.append('document', file);
    return this.http.post(`${API_BASE_URL}projects/api/documents/`, formData);
  }

  /**
   * Move/Copy document
   * @param data Document payload for copy/move
   */
  move_or_copy_document(data): Observable<any> {
    return this.http.post(`${API_BASE_URL}projects/api/document_copy_move/`, data);
  }

  /**
   * Rename document
   * @param id Document ID
   * @param data Document payload for renaming name
   */
  renameDocument(id: number, data: any) {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}projects/api/documents/${id}/rename/`, data);
  }

  /**
   * Update document details
   * @param id Document ID
   * @param data Document payload for update
   */
  updateDocument(id: number, data: any) {
    return this.http.patch<IBaseResponse<any>>(`${API_BASE_URL}projects/api/documents/${id}/`, data);
  }

  /**
   * Share document
   * @param data Document payload for share
   */
  shareDocument(data: any) {
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}projects/api/document_share/share_document/`, data);
  }
}
