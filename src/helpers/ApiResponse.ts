export interface ApiResponseData<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta?: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}

export class ApiResponse<T = any> {
  public success: boolean;
  public message: string;
  public data?: T;
  public error?: string;
  public pagination?: ApiResponseData['pagination'];
  public meta: ApiResponseData['meta'];

  constructor(
    success: boolean = true,
    message: string = '',
    data?: T,
    error?: string
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
    this.meta = {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  /**
   * Crea una response di successo
   */
  static success<T>(message: string, data?: T): ApiResponse<T> {
    return new ApiResponse<T>(true, message, data);
  }

  /**
   * Crea una response di errore
   */
  static error(message: string, error?: string): ApiResponse<null> {
    return new ApiResponse<null>(false, message, undefined, error);
  }

  /**
   * Crea una response con paginazione
   */
  static paginated<T>(
    message: string,
    data: T[],
    page: number,
    limit: number,
    total: number
  ): ApiResponse<T[]> {
    const response = new ApiResponse<T[]>(true, message, data);
    response.pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
    return response;
  }

  /**
   * Crea una response di creazione riuscita
   */
  static created<T>(message: string = 'Risorsa creata con successo', data?: T): ApiResponse<T> {
    return new ApiResponse<T>(true, message, data);
  }

  /**
   * Crea una response di aggiornamento riuscito
   */
  static updated<T>(message: string = 'Risorsa aggiornata con successo', data?: T): ApiResponse<T> {
    return new ApiResponse<T>(true, message, data);
  }

  /**
   * Crea una response di eliminazione riuscita
   */
  static deleted(message: string = 'Risorsa eliminata con successo'): ApiResponse<null> {
    return new ApiResponse<null>(true, message);
  }

  /**
   * Crea una response di non trovato
   */
  static notFound(message: string = 'Risorsa non trovata'): ApiResponse<null> {
    return new ApiResponse<null>(false, message);
  }

  /**
   * Crea una response di validazione fallita
   */
  static validationError(message: string = 'Errore di validazione', error?: string): ApiResponse<null> {
    return new ApiResponse<null>(false, message, undefined, error);
  }

  /**
   * Crea una response di non autorizzato
   */
  static unauthorized(message: string = 'Non autorizzato'): ApiResponse<null> {
    return new ApiResponse<null>(false, message);
  }

  /**
   * Crea una response di accesso negato
   */
  static forbidden(message: string = 'Accesso negato'): ApiResponse<null> {
    return new ApiResponse<null>(false, message);
  }

  /**
   * Crea una response di errore interno del server
   */
  static internalError(message: string = 'Errore interno del server', error?: string): ApiResponse<null> {
    return new ApiResponse<null>(false, message, undefined, error);
  }

  /**
   * Aggiunge metadata personalizzati
   */
  withMeta(meta: { requestId?: string }): this {
    if (this.meta) {
      this.meta = { ...this.meta, ...meta };
    }
    return this;
  }

  /**
   * Aggiunge un ID di richiesta per il tracking
   */
  withRequestId(requestId: string): this {
    if (this.meta) {
      this.meta.requestId = requestId;
    }
    return this;
  }

  /**
   * Converte la response in JSON
   */
  toJSON(): ApiResponseData<T> {
    return {
      success: this.success,
      message: this.message,
      data: this.data,
      error: this.error,
      pagination: this.pagination,
      meta: this.meta
    };
  }
}
