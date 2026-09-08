import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { ApiError, HealthStatus, HistoryList, ImagineRequest, ImagineResult, MeResponse } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * Returns server health status
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get current authenticated user (or null)
 */
export declare const getGetMeUrl: () => string;
export declare const getMe: (options?: RequestInit) => Promise<MeResponse>;
export declare const getGetMeQueryKey: () => readonly ["/api/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<unknown>;
/**
 * @summary Get current authenticated user (or null)
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Generate ideas from a prompt using a chosen model
 */
export declare const getImagineUrl: () => string;
export declare const imagine: (imagineRequest: ImagineRequest, options?: RequestInit) => Promise<ImagineResult>;
export declare const getImagineMutationOptions: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof imagine>>, TError, {
        data: BodyType<ImagineRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof imagine>>, TError, {
    data: BodyType<ImagineRequest>;
}, TContext>;
export type ImagineMutationResult = NonNullable<Awaited<ReturnType<typeof imagine>>>;
export type ImagineMutationBody = BodyType<ImagineRequest>;
export type ImagineMutationError = ErrorType<ApiError>;
/**
 * @summary Generate ideas from a prompt using a chosen model
 */
export declare const useImagine: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof imagine>>, TError, {
        data: BodyType<ImagineRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof imagine>>, TError, {
    data: BodyType<ImagineRequest>;
}, TContext>;
/**
 * @summary List the signed-in user's idea history (newest first)
 */
export declare const getListHistoryUrl: () => string;
export declare const listHistory: (options?: RequestInit) => Promise<HistoryList>;
export declare const getListHistoryQueryKey: () => readonly ["/api/history"];
export declare const getListHistoryQueryOptions: <TData = Awaited<ReturnType<typeof listHistory>>, TError = ErrorType<ApiError>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listHistory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListHistoryQueryResult = NonNullable<Awaited<ReturnType<typeof listHistory>>>;
export type ListHistoryQueryError = ErrorType<ApiError>;
/**
 * @summary List the signed-in user's idea history (newest first)
 */
export declare function useListHistory<TData = Awaited<ReturnType<typeof listHistory>>, TError = ErrorType<ApiError>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Clear all history for the signed-in user
 */
export declare const getClearHistoryUrl: () => string;
export declare const clearHistory: (options?: RequestInit) => Promise<void>;
export declare const getClearHistoryMutationOptions: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof clearHistory>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof clearHistory>>, TError, void, TContext>;
export type ClearHistoryMutationResult = NonNullable<Awaited<ReturnType<typeof clearHistory>>>;
export type ClearHistoryMutationError = ErrorType<ApiError>;
/**
 * @summary Clear all history for the signed-in user
 */
export declare const useClearHistory: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof clearHistory>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof clearHistory>>, TError, void, TContext>;
/**
 * @summary Delete a single history entry
 */
export declare const getDeleteHistoryEntryUrl: (id: string) => string;
export declare const deleteHistoryEntry: (id: string, options?: RequestInit) => Promise<void>;
export declare const getDeleteHistoryEntryMutationOptions: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteHistoryEntry>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteHistoryEntry>>, TError, {
    id: string;
}, TContext>;
export type DeleteHistoryEntryMutationResult = NonNullable<Awaited<ReturnType<typeof deleteHistoryEntry>>>;
export type DeleteHistoryEntryMutationError = ErrorType<ApiError>;
/**
 * @summary Delete a single history entry
 */
export declare const useDeleteHistoryEntry: <TError = ErrorType<ApiError>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteHistoryEntry>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteHistoryEntry>>, TError, {
    id: string;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map