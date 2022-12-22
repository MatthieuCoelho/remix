import {
  defer as routerDefer,
  type DeferredData,
  type TrackedPromise,
} from "@remix-run/router";

import { serializeError } from "./errors";

export type DeferFunction = <Data extends Record<string, unknown>>(
  data: Data,
  init?: number | ResponseInit
) => unknown;

export type JsonFunction = <Data extends unknown>(
  data: Data,
  init?: number | ResponseInit
) => TypedResponse<Data>;

// must be a type since this is a subtype of response
// interfaces must conform to the types they extend
export type TypedResponse<T extends unknown = unknown> = Omit<
  Response,
  "json"
> & {
  json(): Promise<T>;
};

/**
 * This is a shortcut for creating `application/json` responses. Converts `data`
 * to JSON and sets the `Content-Type` header.
 *
 * @see https://remix.run/api/remix#json
 */
export const json: JsonFunction = (data, init = {}) => {
  let responseInit = typeof init === "number" ? { status: init } : init;

  let headers = new Headers(responseInit.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  }

  return new Response(JSON.stringify(data), {
    ...responseInit,
    headers,
  });
};

/**
 * This is a shortcut for creating `application/json` responses. Converts `data`
 * to JSON and sets the `Content-Type` header.
 *
 * @see https://remix.run/api/remix#json
 */
export const defer: DeferFunction = (data, init = {}) => {
  let responseInit = typeof init === "number" ? { status: init } : init;

  let headers = new Headers(responseInit.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  }

  return routerDefer(data, {
    ...responseInit,
    headers,
  });
};

export type RedirectFunction = (
  url: string,
  init?: number | ResponseInit
) => TypedResponse<never>;

/**
 * A redirect response. Sets the status code and the `Location` header.
 * Defaults to "302 Found".
 *
 * @see https://remix.run/api/remix#redirect
 */
export const redirect: RedirectFunction = (url, init = 302) => {
  let responseInit = init;
  if (typeof responseInit === "number") {
    responseInit = { status: responseInit };
  } else if (typeof responseInit.status === "undefined") {
    responseInit.status = 302;
  }

  let headers = new Headers(responseInit.headers);
  headers.set("Location", url);

  return new Response(null, {
    ...responseInit,
    headers,
  }) as TypedResponse<never>;
};

export function isDeferredData(value: any): value is DeferredData {
  let deferred: DeferredData = value;
  return (
    deferred &&
    typeof deferred === "object" &&
    typeof deferred.data === "object" &&
    typeof deferred.subscribe === "function" &&
    typeof deferred.cancel === "function" &&
    typeof deferred.resolveData === "function"
  );
}

export function isResponse(value: any): value is Response {
  return (
    value != null &&
    typeof value.status === "number" &&
    typeof value.statusText === "string" &&
    typeof value.headers === "object" &&
    typeof value.body !== "undefined"
  );
}

const redirectStatusCodes = new Set([301, 302, 303, 307, 308]);
export function isRedirectResponse(response: Response): boolean {
  return redirectStatusCodes.has(response.status);
}

function isTrackedPromise(value: any): value is TrackedPromise {
  return (
    value != null && typeof value.then === "function" && value._tracked === true
  );
}

const DEFERRED_VALUE_PLACEHOLDER_PREFIX = "__deferred_promise:";
export function createDeferredReadableStream(
  deferredData: DeferredData,
  signal: AbortSignal
): ReadableStream<Uint8Array> {
  let encoder = new TextEncoder();
  let stream = new ReadableStream({
    async start(controller) {
      let criticalData: any = {};

      let preresolvedKeys: string[] = [];
      for (let [key, value] of Object.entries(deferredData.data)) {
        if (isTrackedPromise(value)) {
          criticalData[key] = `${DEFERRED_VALUE_PLACEHOLDER_PREFIX}${key}`;
          if (
            typeof value._data !== "undefined" ||
            typeof value._error !== "undefined"
          ) {
            preresolvedKeys.push(key);
          }
        } else {
          criticalData[key] = value;
        }
      }

      // Send the critical data
      controller.enqueue(encoder.encode(JSON.stringify(criticalData) + "\n\n"));

      for (let preresolvedKey of preresolvedKeys) {
        enqueueTrackedPromise(
          controller,
          encoder,
          preresolvedKey,
          deferredData.data[preresolvedKey] as TrackedPromise
        );
      }

      let unsubscribe = deferredData.subscribe((aborted, settledKey) => {
        if (settledKey) {
          enqueueTrackedPromise(
            controller,
            encoder,
            settledKey,
            deferredData.data[settledKey] as TrackedPromise
          );
        }
      });
      await deferredData.resolveData(signal);
      unsubscribe();
      controller.close();
    },
  });

  return stream;
}

function enqueueTrackedPromise(
  controller: ReadableStreamDefaultController<any>,
  encoder: TextEncoder,
  settledKey: string,
  promise: TrackedPromise
) {
  if ("_error" in promise) {
    controller.enqueue(
      encoder.encode(
        "error:" +
          JSON.stringify({
            [settledKey]: serializeError(promise._error),
          }) +
          "\n\n"
      )
    );
  } else {
    controller.enqueue(
      encoder.encode(
        "data:" +
          JSON.stringify({ [settledKey]: promise._data ?? null }) +
          "\n\n"
      )
    );
  }
}
