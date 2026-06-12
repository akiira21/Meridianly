"""FastAPI middleware decorators for auth, plan, and rate limiting.

Usage:
    @router.get("/admin")
    @require_auth
    @require_admin
    def admin_endpoint(user: dict, ...):
        pass

    @router.get("/premium")
    @require_auth
    @require_plan("mid")
    def premium_endpoint(user: dict, ...):
        pass

    @router.get("/limited")
    @require_auth
    @rate_limit("10/minute")
    def limited_endpoint(user: dict, ...):
        pass
"""

import inspect
from functools import wraps
from fastapi import Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt

from auth.dependencies import get_current_user
from limiter import limiter
from users.models import UserRole, UserPlan
from database import get_db_session
from config import Config

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def require_auth(func):
    """
    Decorator that ensures the user is authenticated via JWT.
    Injects the `user` dict into the endpoint if the endpoint accepts it.
    """
    @wraps(func)
    def wrapper(*args, user: dict = Depends(get_current_user), **kwargs):
        if "user" in inspect.signature(func).parameters:
            kwargs["user"] = user
        return func(*args, **kwargs)
    return wrapper


def require_admin(func):
    """
    Decorator that ensures the authenticated user has the ADMIN role.
    Must be used after @require_auth.
    """
    @wraps(func)
    def wrapper(*args, user: dict = Depends(get_current_user), **kwargs):
        if user["data"].role != UserRole.ADMIN:
            raise HTTPException(
                status_code=403,
                detail="Admin access required"
            )
        if "user" in inspect.signature(func).parameters:
            kwargs["user"] = user
        return func(*args, **kwargs)
    return wrapper


def require_plan(min_plan: str):
    """
    Decorator that ensures the authenticated user has at least the specified plan.
    Must be used after @require_auth.

    Args:
        min_plan: One of "free", "mid", "max"
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
        def wrapper(*args, user: dict = Depends(get_current_user), **kwargs):
            user_plan = getattr(user["data"], "plan", UserPlan.FREE)
            user_order = plan_order.get(user_plan, 0)
            if user_order < min_order:
                raise HTTPException(
                    status_code=403,
                    detail=f"{min_plan} plan or higher required. Current: {user_plan.value}"
                )
            if "user" in inspect.signature(func).parameters:
                kwargs["user"] = user
            return func(*args, **kwargs)
        return wrapper
    return decorator


def rate_limit(limit_str: str):
    """
    Decorator that applies a rate limit to an endpoint.
    Uses the slowapi limiter.

    Args:
        limit_str: Rate limit string, e.g. "10/minute", "5/hour", "100/day"
    """
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            return func(request, *args, **kwargs)
        # Manually update the signature to include `request` as a named param
        # so FastAPI/slowapi can inspect it.
        import inspect
        sig = inspect.signature(wrapper)
        params = list(sig.parameters.values())
        if not any(p.name == "request" for p in params):
            request_param = inspect.Parameter(
                "request",
                inspect.Parameter.POSITIONAL_OR_KEYWORD,
            )
            params.insert(0, request_param)
            wrapper.__signature__ = sig.replace(parameters=params)
        return limiter.limit(limit_str)(wrapper)
    return decorator


def get_user_from_request(request: Request):
    """Helper to get user from request state (if set by middleware)."""
    return getattr(request.state, "user", None)
