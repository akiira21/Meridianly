"""FastAPI middleware decorators for auth, plan, and rate limiting.

Usage:
    @router.get("/admin")
    @require_auth
    @require_admin
    @rate_limit("30/minute")
    def admin_endpoint(user: dict, ...):
        pass

    @router.get("/premium")
    @require_auth
    @require_plan("mid")
    @rate_limit("10/minute")
    def premium_endpoint(user: dict, ...):
        pass

Important: @require_auth must be the first decorator (closest to the function),
so it wraps the original endpoint and preserves its signature for FastAPI.
"""

import inspect
from functools import wraps
from fastapi import Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from auth.dependencies import get_current_user
from limiter import limiter
from users.models import UserRole, UserPlan

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def _add_param_to_sig(func, name, default=None, annotation=None, kind=inspect.Parameter.KEYWORD_ONLY):
    """Add a parameter to the function signature and return the new signature."""
    sig = inspect.signature(func)
    params = list(sig.parameters.values())
    if not any(p.name == name for p in params):
        new_param = inspect.Parameter(
            name,
            kind,
            default=default,
            annotation=annotation,
        )
        params.append(new_param)
    return sig.replace(parameters=params)


def require_auth(func):
    """
    Decorator that ensures the user is authenticated via JWT.
    Injects the `user` dict into the endpoint if the endpoint accepts it.
    
    Must be applied FIRST (closest to the function) so FastAPI sees the
    original signature with the added `user` dependency.
    """
    @wraps(func)
    async def async_wrapper(*args, **kwargs):
        if "user" in kwargs:
            user = kwargs["user"]
            if user is None:
                raise HTTPException(status_code=401, detail="Not authenticated")
        return await func(*args, **kwargs)

    @wraps(func)
    def sync_wrapper(*args, **kwargs):
        if "user" in kwargs:
            user = kwargs["user"]
            if user is None:
                raise HTTPException(status_code=401, detail="Not authenticated")
        return func(*args, **kwargs)

    # Use the correct wrapper based on whether the function is async
    is_async = inspect.iscoroutinefunction(func)
    wrapper = async_wrapper if is_async else sync_wrapper

    # Add `user` to the signature so FastAPI can inject it
    new_sig = _add_param_to_sig(
        func, "user",
        default=Depends(get_current_user),
        annotation=dict,
        kind=inspect.Parameter.KEYWORD_ONLY,
    )
    wrapper.__signature__ = new_sig
    return wrapper


def require_admin(func):
    """
    Decorator that ensures the authenticated user has the ADMIN role.
    Must be used after @require_auth.
    """
    @wraps(func)
    async def async_wrapper(*args, **kwargs):
        user = kwargs.get("user")
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        if user["data"].role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Admin access required")
        return await func(*args, **kwargs)

    @wraps(func)
    def sync_wrapper(*args, **kwargs):
        user = kwargs.get("user")
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        if user["data"].role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Admin access required")
        return func(*args, **kwargs)

    is_async = inspect.iscoroutinefunction(func)
    wrapper = async_wrapper if is_async else sync_wrapper

    # Preserve the original signature
    wrapper.__signature__ = inspect.signature(func)
    return wrapper


def require_plan(min_plan: str):
    """
    Decorator that ensures the authenticated user has at least the specified plan.
    Must be used after @require_auth.
    """
    plan_order = {
        UserPlan.FREE: 0,
        UserPlan.MID: 1,
        UserPlan.MAX: 2,
    }
    min_plan_enum = UserPlan(min_plan)
    min_order = plan_order.get(min_plan_enum, 0)

    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            user = kwargs.get("user")
            if not user:
                raise HTTPException(status_code=401, detail="Not authenticated")
            user_plan = getattr(user["data"], "plan", UserPlan.FREE)
            user_order = plan_order.get(user_plan, 0)
            if user_order < min_order:
                raise HTTPException(
                    status_code=403,
                    detail=f"{min_plan} plan or higher required. Current: {user_plan.value}"
                )
            return await func(*args, **kwargs)

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            user = kwargs.get("user")
            if not user:
                raise HTTPException(status_code=401, detail="Not authenticated")
            user_plan = getattr(user["data"], "plan", UserPlan.FREE)
            user_order = plan_order.get(user_plan, 0)
            if user_order < min_order:
                raise HTTPException(
                    status_code=403,
                    detail=f"{min_plan} plan or higher required. Current: {user_plan.value}"
                )
            return func(*args, **kwargs)

        is_async = inspect.iscoroutinefunction(func)
        wrapper = async_wrapper if is_async else sync_wrapper

        # Preserve the original signature
        wrapper.__signature__ = inspect.signature(func)
        return wrapper
    return decorator


def rate_limit(limit_str: str):
    """
    Decorator that applies a rate limit to an endpoint.
    Uses the slowapi limiter.
    
    Must be applied AFTER @require_auth (further from the function).
    """
    def decorator(func):
        # Build the new signature with `request` as the first parameter
        sig = inspect.signature(func)
        params = list(sig.parameters.values())
        
        request_param = inspect.Parameter(
            "request",
            inspect.Parameter.POSITIONAL_OR_KEYWORD,
            annotation=Request,
        )
        
        # Insert request at the beginning
        params.insert(0, request_param)
        new_sig = sig.replace(parameters=params)
        
        # Create wrapper that preserves the new signature
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            kwargs.pop('request', None)
            return await func(*args, **kwargs)

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            kwargs.pop('request', None)
            return func(*args, **kwargs)

        is_async = inspect.iscoroutinefunction(func)
        wrapper = async_wrapper if is_async else sync_wrapper
        
        # Set signature on both wrapper and limiter wrapper so FastAPI
        # and slowapi can both see the request parameter
        wrapper.__signature__ = new_sig
        
        limited = limiter.limit(limit_str)(wrapper)
        limited.__signature__ = new_sig
        
        return limited
    return decorator
