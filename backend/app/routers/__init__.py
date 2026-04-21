from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class DrinkBase(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    base_price: float
    unlock_condition: Optional[str] = None
    is_unlocked: bool = True

class Drink(DrinkBase):
    id: int
    
    class Config:
        orm_mode = True

mock_drinks = [
    {"id": 1, "name": "白开水", "category": "基础饮品", "description": "纯净的白开水，健康又解渴", "base_price": 0.0, "is_unlocked": True},
    {"id": 2, "name": "柠檬水", "category": "基础饮品", "description": "新鲜柠檬切片泡水，清新爽口", "base_price": 3.0, "is_unlocked": True},
    {"id": 3, "name": "蜂蜜水", "category": "基础饮品", "description": "纯正蜂蜜调配，甜蜜又营养", "base_price": 5.0, "is_unlocked": True},
    {"id": 4, "name": "经典珍珠奶茶", "category": "奶茶系列", "description": "香浓奶茶配Q弹珍珠，经典之选", "base_price": 12.0, "is_unlocked": False, "unlock_condition": "完成3次点单解锁"},
    {"id": 5, "name": "芋泥奶茶", "category": "奶茶系列", "description": "绵密芋泥搭配香浓奶茶，口感丰富", "base_price": 14.0, "is_unlocked": False, "unlock_condition": "完成3次点单解锁"},
    {"id": 6, "name": "杨枝甘露", "category": "奶茶系列", "description": "芒果、西柚、椰奶的完美融合", "base_price": 16.0, "is_unlocked": False, "unlock_condition": "完成3次点单解锁"},
    {"id": 7, "name": "招牌柠檬茶", "category": "果茶系列", "description": "香水柠檬锤打爆香，茶底清新", "base_price": 10.0, "is_unlocked": False, "unlock_condition": "完成5次点单解锁"},
    {"id": 8, "name": "缤纷水果茶", "category": "果茶系列", "description": "多种新鲜水果搭配，维C满满", "base_price": 15.0, "is_unlocked": False, "unlock_condition": "完成5次点单解锁"},
    {"id": 9, "name": "美式咖啡", "category": "咖啡系列", "description": "经典美式，纯粹咖啡香", "base_price": 12.0, "is_unlocked": False, "unlock_condition": "完成10次点单解锁"},
    {"id": 10, "name": "拿铁咖啡", "category": "咖啡系列", "description": "香浓咖啡搭配丝滑牛奶", "base_price": 15.0, "is_unlocked": False, "unlock_condition": "完成10次点单解锁"},
]

@router.get("/", response_model=List[Drink])
async def get_drinks(category: Optional[str] = None, unlocked: Optional[bool] = None):
    """获取所有饮品列表"""
    drinks = mock_drinks
    if category:
        drinks = [d for d in drinks if d["category"] == category]
    if unlocked is not None:
        drinks = [d for d in drinks if d["is_unlocked"] == unlocked]
    return drinks

@router.get("/categories")
async def get_categories():
    """获取饮品分类"""
    categories = list(set([d["category"] for d in mock_drinks]))
    return {"categories": categories}

@router.get("/customizations")
async def get_customizations():
    """获取可定制选项"""
    return {
        "sweetness": ["全糖", "七分糖", "半糖", "三分糖", "无糖"],
        "ice_level": ["正常冰", "少冰", "去冰", "热饮", "常温"],
        "cup_size": ["中杯", "大杯", "超大杯"],
        "toppings": [
            {"name": "珍珠", "price": 2.0},
            {"name": "椰果", "price": 2.0},
            {"name": "芋圆", "price": 3.0},
            {"name": "红豆", "price": 2.0},
            {"name": "烧仙草", "price": 3.0},
            {"name": "布丁", "price": 3.0},
        ]
    }

@router.get("/{drink_id}", response_model=Drink)
async def get_drink(drink_id: int):
    """获取单个饮品详情"""
    for drink in mock_drinks:
        if drink["id"] == drink_id:
            return drink
    raise HTTPException(status_code=404, detail="饮品不存在")
