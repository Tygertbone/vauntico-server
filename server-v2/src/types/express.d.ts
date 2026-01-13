import "express";

declare global {
  namespace Express {
    interface Request {
      params: {
        [key: string]: string | undefined;
      };
      query: {
        [key: string]: string | string[] | undefined;
      };
      body: any;
      headers: {
        [key: string]: string | undefined;
      };
      requestId?: string;
      user?: { userId?: string };
    }
    interface Response {
      locals: any;
      statusCode?: number;
      statusMessage?: string;
    }
  }
}

export {};
