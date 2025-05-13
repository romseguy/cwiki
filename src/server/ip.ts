// Custom https://www.npmjs.com/package/request-ip
import { NextApiRequest, NextApiResponse } from "next";
import { NextHandler } from "next-connect";
import { is } from "./is";

export function getClientIpFromXForwardedFor(value: string): string | null {
  if (!is.existy(value)) {
    return null;
  }

  if (is.not.string(value)) {
    throw new TypeError(`Expected a string, got "${typeof value}"`);
  }

  // x-forwarded-for may return multiple IP addresses in the format:
  // "client IP, proxy 1 IP, proxy 2 IP"
  // Therefore, the right-most IP address is the IP address of the most recent proxy
  // and the left-most IP address is the IP address of the originating client.
  // source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For
  // Azure Web App's also adds a port for some reason, so we'll only use the first part (the IP)
  const forwardedIps = value.split(",").map((e: string) => {
    const ip = e.trim();
    if (ip.includes(":")) {
      const splitted = ip.split(":");
      // make sure we only use this if it's ipv4 (ip:port)
      if (splitted.length === 2) {
        return splitted[0];
      }
    }
    return ip;
  });

  // Sometimes IP addresses in this header can be 'unknown' (http://stackoverflow.com/a/11285650).
  // Therefore taking the right-most IP address that is not unknown
  // A Squid configuration directive can also set the value to "unknown" (http://www.squid-cache.org/Doc/config/forwarded_for/)
  for (let i = 0; i < forwardedIps.length; i++) {
    if (is.ipAddress(forwardedIps[i])) {
      return forwardedIps[i];
    }
  }

  // If no value in the split list is an ip, return null
  return null;
}

export function getClientIp(req: NextApiRequest | any): string | null {
  // Server is probably behind a proxy.
  if (req.headers) {
    // Standard headers used by Amazon EC2, Heroku, and others.
    if (is.ipAddress(req.headers["x-client-ip"])) {
      return req.headers["x-client-ip"];
    }

    // Load-balancers (AWS ELB) or proxies.
    const xForwardedFor = getClientIpFromXForwardedFor(
      req.headers["x-forwarded-for"]
    );
    if (is.ipAddress(xForwardedFor)) {
      return xForwardedFor;
    }

    // Cloudflare.
    // @see https://support.cloudflare.com/hc/en-us/articles/200170986-How-does-Cloudflare-handle-HTTP-Request-headers-
    // CF-Connecting-IP - applied to every request to the origin.
    if (is.ipAddress(req.headers["cf-connecting-ip"])) {
      return req.headers["cf-connecting-ip"];
    }

    // DigitalOcean.
    // @see https://www.digitalocean.com/community/questions/app-platform-client-ip
    // DO-Connecting-IP - applied to app platform servers behind a proxy.
    if (is.ipAddress(req.headers["do-connecting-ip"])) {
      return req.headers["do-connecting-ip"];
    }

    // Fastly and Firebase hosting header (When forwared to cloud function)
    if (is.ipAddress(req.headers["fastly-client-ip"])) {
      return req.headers["fastly-client-ip"];
    }

    // Akamai and Cloudflare: True-Client-IP.
    if (is.ipAddress(req.headers["true-client-ip"])) {
      return req.headers["true-client-ip"];
    }

    // Default nginx proxy/fcgi; alternative to x-forwarded-for, used by some proxies.
    if (is.ipAddress(req.headers["x-real-ip"])) {
      return req.headers["x-real-ip"];
    }

    // (Rackspace LB and Riverbed's Stingray)
    // http://www.rackspace.com/knowledge_center/article/controlling-access-to-linux-cloud-sites-based-on-the-client-ip-address
    // https://splash.riverbed.com/docs/DOC-1926
    if (is.ipAddress(req.headers["x-cluster-client-ip"])) {
      return req.headers["x-cluster-client-ip"];
    }

    if (is.ipAddress(req.headers["x-forwarded"])) {
      return req.headers["x-forwarded"];
    }

    if (is.ipAddress(req.headers["forwarded-for"])) {
      return req.headers["forwarded-for"];
    }

    if (is.ipAddress(req.headers.forwarded)) {
      return req.headers.forwarded;
    }

    // Google Cloud App Engine
    // https://cloud.google.com/appengine/docs/standard/go/reference/request-response-headers

    if (is.ipAddress(req.headers["x-appengine-user-ip"])) {
      return req.headers["x-appengine-user-ip"];
    }
  }

  // Remote address checks.
  // Deprecated
  if (is.existy(req.connection)) {
    if (is.ipAddress(req.connection.remoteAddress)) {
      return req.connection.remoteAddress;
    }
    if (
      is.existy(req.connection.socket) &&
      is.ipAddress(req.connection.socket.remoteAddress)
    ) {
      return req.connection.socket.remoteAddress;
    }
  }

  if (is.existy(req.socket) && is.ipAddress(req.socket.remoteAddress)) {
    return req.socket.remoteAddress;
  }

  if (is.existy(req.info) && is.ipAddress(req.info.remoteAddress)) {
    return req.info.remoteAddress;
  }

  // AWS Api Gateway + Lambda
  if (
    is.existy(req.requestContext) &&
    is.existy(req.requestContext.identity) &&
    is.ipAddress(req.requestContext.identity.sourceIp)
  ) {
    return req.requestContext.identity.sourceIp;
  }

  // Cloudflare fallback
  // https://blog.cloudflare.com/eliminating-the-last-reasons-to-not-enable-ipv6/#introducingpseudoipv4
  if (req.headers) {
    if (is.ipAddress(req.headers["Cf-Pseudo-IPv4"])) {
      return req.headers["Cf-Pseudo-IPv4"];
    }
  }

  // Fastify https://www.fastify.io/docs/latest/Reference/Request/
  if (is.existy(req.raw)) {
    return getClientIp(req.raw);
  }

  return null;
}

interface IOptions {
  attributeName: string;
}

export default function ip(options?: IOptions) {
  // Defaults.
  const configuration: IOptions | any = is.not.existy(options) ? {} : options;

  // Validation.
  if (is.not.object(configuration)) {
    throw new TypeError("Options must be an object!");
  }

  const attributeName = configuration.attributeName || "clientIp";

  return (req: NextApiRequest, res: NextApiResponse, next: NextHandler) => {
    const ip = getClientIp(req);
    Object.defineProperty(req, attributeName, {
      get: () => ip,
      configurable: true
    });
    next();
  };
}
