from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import drinks, orders, family

app = FastAPI(
    title="Bapoo MixPlay - 家庭水吧菜单游戏API",
    description="一款将轻游戏闯关解锁与自定义菜单相结合的家庭互动工具",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(drinks.router, prefix="/api/drinks", tags=["饮品管理"])
app.include_router(orders.router, prefix="/api/orders", tags=["订单管理"])
app.include_router(family.router, prefix="/api/family", tags=["家庭成员管理"])

@app.get("/")
async def root():
    return {"message": "欢迎使用 Bapoo MixPlay API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
