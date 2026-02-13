from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)


class DealBase(BaseSchema):
    title: str
    marketplace: str
    category: str
    price: float
    original_price: float
    discount_percent: int
    product_url: str
    image_url: str
    is_active: bool = True


class DealResponse(DealBase):
    id: int
    created_at: datetime
    updated_at: datetime


class DealSearchResponse(BaseSchema):
    deals: list[DealResponse]
    total: int


class MarketplaceRefreshRequest(BaseSchema):
    query: str | None = None
    categories: list[str] = Field(default_factory=list)
    limit: int = Field(default=18, ge=3, le=50)


class UserInterestBase(BaseSchema):
    device_id: str
    category: str
    keyword: str
    priority: int = Field(default=1, ge=1, le=5)


class UserInterestCreate(UserInterestBase):
    pass


class UserInterestResponse(UserInterestBase):
    id: int
    created_at: datetime


class FavoriteDealCreate(BaseSchema):
    device_id: str
    deal_id: int


class FavoriteDealResponse(BaseSchema):
    id: int
    device_id: str
    deal_id: int
    created_at: datetime
    deal: DealResponse


class DealAlertBase(BaseSchema):
    device_id: str
    alert_type: str
    query: str
    min_discount: int = Field(default=10, ge=0, le=95)
    is_enabled: bool = True


class DealAlertCreate(DealAlertBase):
    pass


class DealAlertUpdate(BaseSchema):
    min_discount: int | None = Field(default=None, ge=0, le=95)
    is_enabled: bool | None = None


class DealAlertResponse(DealAlertBase):
    id: int
    created_at: datetime
    updated_at: datetime
    last_triggered_at: datetime | None = None


class ShareDealCreate(BaseSchema):
    device_id: str
    deal_id: int
    channel: str
    message: str


class ShareDealResponse(BaseSchema):
    id: int
    device_id: str
    deal_id: int
    channel: str
    message: str
    created_at: datetime


class RecommendationResponse(BaseSchema):
    device_id: str
    recommendations: list[DealResponse]
