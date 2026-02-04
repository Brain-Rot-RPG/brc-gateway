import { Router, Request, Response } from 'express';
import httpProxy from 'http-proxy';
import microservices, { MicroserviceConfig } from '../config/microservices';
import { ClientRequest, IncomingMessage, ServerResponse } from 'http'; // Imports requis

export class RoutingSystem {
  private router: Router;

  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    Object.entries(microservices).forEach(([name, config]) => {
      this.addMicroserviceRoute(name, config);
    });

    this.router.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Route not found',
        message: `Aucun microservice ne correspond à la route: ${req.path}`,
        availableServices: this.getAvailableServices()
      });
    });
  }

  private addMicroserviceRoute(name: string, config: MicroserviceConfig): void {
    const proxy = httpProxy.createProxyServer({
      target: config.url,
      changeOrigin: true
    });

    // Utilisation des types attendus par @types/http-proxy
    proxy.on('proxyReq', (proxyReq: ClientRequest, req: IncomingMessage, res: ServerResponse) => {
      // Cast de req en Request d'Express pour accéder à .body
      const expressReq = req as Request;
      
      if (expressReq.body && Object.keys(expressReq.body).length > 0) {
        const bodyData = JSON.stringify(expressReq.body);
        
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        
        proxyReq.write(bodyData);
      }
    });

    proxy.on('error', (err, req, res) => {
      const response = res as Response;
      if (!response.headersSent) {
        response.status(503).json({
          error: 'Service unavailable',
          message: `Le microservice ${name} est indisponible`,
          service: config.url
        });
      }
    });

    this.router.use(config.path, (req: Request, res: Response) => {
      const originalUrl = req.url;
      const rewrittenUrl = req.url.replace(new RegExp(`^${config.path}`), '');
      req.url = rewrittenUrl.length === 0 ? '/' : rewrittenUrl;

      console.log(`Proxying request to [${name}] ${config.url}${req.url}`);
      
      proxy.web(req, res);

      const restoreUrl = () => {
        req.url = originalUrl;
      };
      res.on('finish', restoreUrl);
      res.on('close', restoreUrl);
    });
  }

  
  private getAvailableServices(): string[] {
    return Object.entries(microservices).map(
      ([, config]) => `${config.path} → ${config.url}`
    );
  }


  public getRouter(): Router {
    return this.router;
  }
}

export default new RoutingSystem();
