import json
import os
from datetime import datetime

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app import models, schemas
from app.dependencies import get_db

router = APIRouter(prefix="/deals", tags=["deals"])

GATEWAY_URL = os.environ.get(
    "GATEWAY_URL", "https://appifex-gateway.appifex-ai.workers.dev"
)


def _get_gateway_api_key() -> str:
    api_key = os.environ.get("APPIFEX_GATEWAY_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gateway API key not configured")
    return api_key


def _fallback_deals() -> list[dict]:
    return [
        {
            "title": "Apple AirPods Pro (2nd Gen)",
            "marketplace": "Amazon",
            "category": "Electronics",
            "price": 189.99,
            "original_price": 249.99,
            "discount_percent": 24,
            "product_url": "https://amazon.com/deal/airpods-pro",
            "image_url": "https://images.unsplash.com/photo-1606220838315-056192d5e927",
        },
        {
            "title": "Ninja 10-in-1 Air Fryer Oven",
            "marketplace": "Walmart",
            "category": "Home & Kitchen",
            "price": 139.0,
            "original_price": 229.0,
            "discount_percent": 39,
            "product_url": "https://walmart.com/deal/ninja-air-fryer",
            "image_url": "https://images.unsplash.com/photo-1614495039368-525273956716",
        },
        {
            "title": "Threshold 6-Cube Storage Organizer",
            "marketplace": "Target",
            "category": "Home",
            "price": 64.0,
            "original_price": 90.0,
            "discount_percent": 29,
            "product_url": "https://target.com/deal/storage-organizer",
            "image_url": "https://images.unsplash.com/photo-1484101403633-562f891dc89a",
        },
        {
            "title": "Instant Pot Duo 7-in-1 6Qt",
            "marketplace": "Amazon",
            "category": "Kitchen",
            "price": 69.95,
            "original_price": 119.95,
            "discount_percent": 42,
            "product_url": "https://amazon.com/deal/instant-pot",
            "image_url": "https://images.unsplash.com/photo-1585238342024-78d387f4a707",
        },
        {
            "title": "LEGO Creator 3-in-1 Space Shuttle",
            "marketplace": "Target",
            "category": "Toys",
            "price": 31.49,
            "original_price": 44.99,
            "discount_percent": 30,
            "product_url": "https://target.com/deal/lego-space-shuttle",
            "image_url": "https://images.unsplash.com/photo-1587654780291-39c9404d746b",
        },
        {
            "title": "Samsung 55-inch 4K UHD Smart TV",
            "marketplace": "Walmart",
            "category": "Electronics",
            "price": 348.0,
            "original_price": 498.0,
            "discount_percent": 30,
            "product_url": "https://walmart.com/deal/samsung-55-4k",
            "image_url": "https://images.unsplash.com/photo-1593784991095-a205069470b6",
        },
    ]


def _extract_json_content(content: str) -> list[dict]:
    cleaned = content.strip().replace("```json", "").replace("```", "")
    parsed = json.loads(cleaned)
    if not isinstance(parsed, list):
        raise ValueError("Expected JSON array from gateway")
    return parsed


def _fetch_gateway_deals(
    query: str | None,
    categories: list[str],
    limit: int,
) -> list[dict]:
    category_text = ", ".join(categories) if categories else "all categories"
    search_text = query or "best trending deals"

    prompt = (
        "Return recent product deals as strict JSON array only. "
        "No markdown, no commentary. "
        "Each item must include keys: "
        "title, marketplace, category, price, original_price, discount_percent, product_url, image_url. "
        "Use only marketplaces: Amazon, Walmart, Target. "
        f"Focus query: {search_text}. Categories: {category_text}. "
        f"Return exactly {limit} items with realistic prices and discounts."
    )

    payload = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.4,
        "max_tokens": 1600,
        "response_format": {"type": "json_object"},
    }

    try:
        with httpx.Client(timeout=35.0) as client:
            response = client.post(
                f"{GATEWAY_URL}/llm/chat/completions",
                json=payload,
                headers={"x-appifex-key": _get_gateway_api_key()},
            )

        if response.status_code != 200:
            return _fallback_deals()

        data = response.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")

        parsed = json.loads(content)
        if isinstance(parsed, dict) and "deals" in parsed and isinstance(parsed["deals"], list):
            return parsed["deals"]
        if isinstance(parsed, list):
            return parsed
        return _extract_json_content(content)
    except Exception:
        return _fallback_deals()


def _normalize_deal_payload(raw: dict) -> dict:
    title = str(raw.get("title", "Untitled Deal"))
    marketplace = str(raw.get("marketplace", "Amazon")).title()
    category = str(raw.get("category", "General"))
    price = float(raw.get("price", 0))
    original_price = float(raw.get("original_price", max(price, 1)))

    if original_price <= 0:
        original_price = max(price, 1)

    discount_percent = int(raw.get("discount_percent", 0))
    if discount_percent <= 0 and original_price > 0:
        discount_percent = int(max(0, round((1 - (price / original_price)) * 100)))

    discount_percent = max(0, min(discount_percent, 95))

    product_url = str(raw.get("product_url", "https://example.com/deal"))
    image_url = str(
        raw.get(
            "image_url",
            "https://images.unsplash.com/photo-1556740738-b6a63e27c4df",
        )
    )

    return {
        "title": title[:255],
        "marketplace": marketplace[:50],
        "category": category[:100],
        "price": round(max(price, 0.5), 2),
        "original_price": round(max(original_price, price), 2),
        "discount_percent": discount_percent,
        "product_url": product_url[:500],
        "image_url": image_url[:500],
    }


@router.get("", response_model=schemas.DealSearchResponse)
def search_deals(
    q: str | None = Query(default=None),
    category: str | None = Query(default=None),
    min_discount: int = Query(default=0, ge=0, le=95),
    marketplace: str | None = Query(default=None),
    limit: int = Query(default=40, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(models.Deal).filter(models.Deal.is_active.is_(True))

    if q:
        query = query.filter(models.Deal.title.ilike(f"%{q}%"))
    if category:
        query = query.filter(models.Deal.category == category)
    if marketplace:
        query = query.filter(models.Deal.marketplace == marketplace)

    query = query.filter(models.Deal.discount_percent >= min_discount)

    deals = query.order_by(models.Deal.discount_percent.desc()).limit(limit).all()
    return schemas.DealSearchResponse(deals=deals, total=len(deals))


@router.get("/categories", response_model=list[str])
def get_categories(db: Session = Depends(get_db)):
    rows = db.query(models.Deal.category).distinct().order_by(models.Deal.category.asc()).all()
    return [row[0] for row in rows]


@router.post("/refresh", response_model=schemas.DealSearchResponse)
def refresh_marketplace_deals(
    payload: schemas.MarketplaceRefreshRequest,
    db: Session = Depends(get_db),
):
    raw_deals = _fetch_gateway_deals(payload.query, payload.categories, payload.limit)

    persisted_ids: list[int] = []

    for raw in raw_deals[: payload.limit]:
        normalized = _normalize_deal_payload(raw)

        existing = (
            db.query(models.Deal)
            .filter(
                models.Deal.title == normalized["title"],
                models.Deal.marketplace == normalized["marketplace"],
            )
            .first()
        )

        if existing:
            existing.category = normalized["category"]
            existing.price = normalized["price"]
            existing.original_price = normalized["original_price"]
            existing.discount_percent = normalized["discount_percent"]
            existing.product_url = normalized["product_url"]
            existing.image_url = normalized["image_url"]
            existing.is_active = True
            persisted_ids.append(existing.id)
        else:
            new_deal = models.Deal(**normalized)
            db.add(new_deal)
            db.flush()
            persisted_ids.append(new_deal.id)

    db.commit()

    deals = (
        db.query(models.Deal)
        .filter(models.Deal.id.in_(persisted_ids))
        .order_by(models.Deal.discount_percent.desc())
        .all()
    )

    return schemas.DealSearchResponse(deals=deals, total=len(deals))


@router.post("/favorites", response_model=schemas.FavoriteDealResponse)
def add_favorite_deal(payload: schemas.FavoriteDealCreate, db: Session = Depends(get_db)):
    deal = db.query(models.Deal).filter(models.Deal.id == payload.deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    existing = (
        db.query(models.FavoriteDeal)
        .filter(
            models.FavoriteDeal.device_id == payload.device_id,
            models.FavoriteDeal.deal_id == payload.deal_id,
        )
        .first()
    )
    if existing:
        existing.deal = deal
        return existing

    favorite = models.FavoriteDeal(device_id=payload.device_id, deal_id=payload.deal_id)
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    return favorite


@router.get("/favorites/{device_id}", response_model=list[schemas.FavoriteDealResponse])
def get_favorite_deals(device_id: str, db: Session = Depends(get_db)):
    favorites = (
        db.query(models.FavoriteDeal)
        .options(joinedload(models.FavoriteDeal.deal))
        .filter(models.FavoriteDeal.device_id == device_id)
        .order_by(models.FavoriteDeal.created_at.desc())
        .all()
    )
    return favorites


@router.delete("/favorites/{device_id}/{deal_id}")
def remove_favorite_deal(device_id: str, deal_id: int, db: Session = Depends(get_db)):
    favorite = (
        db.query(models.FavoriteDeal)
        .filter(
            models.FavoriteDeal.device_id == device_id,
            models.FavoriteDeal.deal_id == deal_id,
        )
        .first()
    )
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite deal not found")

    db.delete(favorite)
    db.commit()
    return {"success": True}


@router.post("/interests", response_model=schemas.UserInterestResponse)
def add_interest(payload: schemas.UserInterestCreate, db: Session = Depends(get_db)):
    interest = models.UserInterest(**payload.model_dump())
    db.add(interest)
    db.commit()
    db.refresh(interest)
    return interest


@router.get("/interests/{device_id}", response_model=list[schemas.UserInterestResponse])
def get_interests(device_id: str, db: Session = Depends(get_db)):
    return (
        db.query(models.UserInterest)
        .filter(models.UserInterest.device_id == device_id)
        .order_by(models.UserInterest.priority.desc(), models.UserInterest.created_at.desc())
        .all()
    )


@router.post("/alerts", response_model=schemas.DealAlertResponse)
def create_alert(payload: schemas.DealAlertCreate, db: Session = Depends(get_db)):
    alert = models.DealAlert(**payload.model_dump())
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@router.get("/alerts/{device_id}", response_model=list[schemas.DealAlertResponse])
def get_alerts(device_id: str, db: Session = Depends(get_db)):
    return (
        db.query(models.DealAlert)
        .filter(models.DealAlert.device_id == device_id)
        .order_by(models.DealAlert.created_at.desc())
        .all()
    )


@router.patch("/alerts/{alert_id}", response_model=schemas.DealAlertResponse)
def update_alert(alert_id: int, payload: schemas.DealAlertUpdate, db: Session = Depends(get_db)):
    alert = db.query(models.DealAlert).filter(models.DealAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(alert, key, value)

    if alert.is_enabled:
        alert.last_triggered_at = datetime.utcnow()

    db.commit()
    db.refresh(alert)
    return alert


@router.get("/recommendations/{device_id}", response_model=schemas.RecommendationResponse)
def get_recommendations(device_id: str, db: Session = Depends(get_db)):
    interests = db.query(models.UserInterest).filter(models.UserInterest.device_id == device_id).all()

    favorite_categories = {
        favorite.deal.category
        for favorite in db.query(models.FavoriteDeal)
        .options(joinedload(models.FavoriteDeal.deal))
        .filter(models.FavoriteDeal.device_id == device_id)
        .all()
        if favorite.deal
    }

    deals = db.query(models.Deal).filter(models.Deal.is_active.is_(True)).all()

    scored_deals: list[tuple[float, models.Deal]] = []
    for deal in deals:
        score = float(deal.discount_percent)

        for interest in interests:
            if deal.category.lower() == interest.category.lower():
                score += 15 * interest.priority
            if interest.keyword.lower() in deal.title.lower():
                score += 10 * interest.priority

        if deal.category in favorite_categories:
            score += 18

        scored_deals.append((score, deal))

    ranked = [deal for _, deal in sorted(scored_deals, key=lambda item: item[0], reverse=True)[:12]]
    return schemas.RecommendationResponse(device_id=device_id, recommendations=ranked)


@router.post("/share", response_model=schemas.ShareDealResponse)
def share_deal(payload: schemas.ShareDealCreate, db: Session = Depends(get_db)):
    deal = db.query(models.Deal).filter(models.Deal.id == payload.deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    share = models.SharedDeal(**payload.model_dump())
    db.add(share)
    db.commit()
    db.refresh(share)
    return share
