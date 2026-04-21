const API_BASE_URL = 'http://localhost:8000/api';

const API = {
    async getDrinks(category = null, unlocked = null) {
        let url = `${API_BASE_URL}/drinks/`;
        const params = new URLSearchParams();
        
        if (category) params.append('category', category);
        if (unlocked !== null) params.append('unlocked', unlocked);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('获取饮品列表失败');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return this.getMockDrinks(category, unlocked);
        }
    },

    async getCategories() {
        try {
            const response = await fetch(`${API_BASE_URL}/drinks/categories`);
            if (!response.ok) throw new Error('获取分类失败');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { categories: ['基础饮品', '奶茶系列', '果茶系列', '咖啡系列'] };
        }
    },

    async getCustomizations() {
        try {
            const response = await fetch(`${API_BASE_URL}/drinks/customizations`);
            if (!response.ok) throw new Error('获取定制选项失败');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return {
                sweetness: ['全糖', '七分糖', '半糖', '三分糖', '无糖'],
                ice_level: ['正常冰', '少冰', '去冰', '热饮', '常温'],
                cup_size: ['中杯', '大杯', '超大杯'],
                toppings: [
                    { name: '珍珠', price: 2.0 },
                    { name: '椰果', price: 2.0 },
                    { name: '芋圆', price: 3.0 },
                    { name: '红豆', price: 2.0 },
                    { name: '烧仙草', price: 3.0 },
                    { name: '布丁', price: 3.0 },
                ]
            };
        }
    },

    async getDrinkById(drinkId) {
        try {
            const response = await fetch(`${API_BASE_URL}/drinks/${drinkId}`);
            if (!response.ok) throw new Error('获取饮品详情失败');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            const drinks = this.getMockDrinks();
            return drinks.find(d => d.id === drinkId) || null;
        }
    },

    async createOrder(orderData) {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });
            if (!response.ok) throw new Error('创建订单失败');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return this.generateMockOrder(orderData);
        }
    },

    async getFamilyMembers() {
        try {
            const response = await fetch(`${API_BASE_URL}/family/`);
            if (!response.ok) throw new Error('获取家庭成员失败');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return this.getMockFamilyMembers();
        }
    },

    async addFamilyMember(memberData) {
        try {
            const response = await fetch(`${API_BASE_URL}/family/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(memberData)
            });
            if (!response.ok) throw new Error('添加家庭成员失败');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            const newMember = {
                id: Date.now(),
                name: memberData.name,
                role: memberData.role,
                is_active: true,
                assignment_count: 0,
                created_at: new Date().toISOString()
            };
            return newMember;
        }
    },

    async getProgress() {
        try {
            const response = await fetch(`${API_BASE_URL}/progress/`);
            if (!response.ok) throw new Error('获取进度失败');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return this.getMockProgress();
        }
    },

    getMockDrinks(category = null, unlocked = null) {
        const drinks = [
            { id: 1, name: '白开水', category: '基础饮品', description: '纯净的白开水，健康又解渴', base_price: 0.0, is_unlocked: true, icon: '💧' },
            { id: 2, name: '柠檬水', category: '基础饮品', description: '新鲜柠檬切片泡水，清新爽口', base_price: 3.0, is_unlocked: true, icon: '🍋' },
            { id: 3, name: '蜂蜜水', category: '基础饮品', description: '纯正蜂蜜调配，甜蜜又营养', base_price: 5.0, is_unlocked: true, icon: '🍯' },
            { id: 4, name: '经典珍珠奶茶', category: '奶茶系列', description: '香浓奶茶配Q弹珍珠，经典之选', base_price: 12.0, is_unlocked: false, unlock_condition: '完成3次点单解锁', icon: '🧋' },
            { id: 5, name: '芋泥奶茶', category: '奶茶系列', description: '绵密芋泥搭配香浓奶茶，口感丰富', base_price: 14.0, is_unlocked: false, unlock_condition: '完成3次点单解锁', icon: '🥤' },
            { id: 6, name: '杨枝甘露', category: '奶茶系列', description: '芒果、西柚、椰奶的完美融合', base_price: 16.0, is_unlocked: false, unlock_condition: '完成3次点单解锁', icon: '🥭' },
            { id: 7, name: '招牌柠檬茶', category: '果茶系列', description: '香水柠檬锤打爆香，茶底清新', base_price: 10.0, is_unlocked: false, unlock_condition: '完成5次点单解锁', icon: '🍵' },
            { id: 8, name: '缤纷水果茶', category: '果茶系列', description: '多种新鲜水果搭配，维C满满', base_price: 15.0, is_unlocked: false, unlock_condition: '完成5次点单解锁', icon: '🍉' },
            { id: 9, name: '美式咖啡', category: '咖啡系列', description: '经典美式，纯粹咖啡香', base_price: 12.0, is_unlocked: false, unlock_condition: '完成10次点单解锁', icon: '☕' },
            { id: 10, name: '拿铁咖啡', category: '咖啡系列', description: '香浓咖啡搭配丝滑牛奶', base_price: 15.0, is_unlocked: false, unlock_condition: '完成10次点单解锁', icon: '☕' },
        ];

        let filtered = drinks;
        if (category && category !== 'all') {
            filtered = filtered.filter(d => d.category === category);
        }
        if (unlocked !== null) {
            filtered = filtered.filter(d => d.is_unlocked === unlocked);
        }
        return filtered;
    },

    getMockFamilyMembers() {
        return [
            { id: 1, name: '老公大大', role: '爸爸', is_active: true, assignment_count: 0, icon: '👨' },
            { id: 2, name: '老婆大人', role: '妈妈', is_active: true, assignment_count: 0, icon: '👩' },
            { id: 3, name: '宝贝儿子', role: '儿子', is_active: true, assignment_count: 0, icon: '👦' },
        ];
    },

    getMockProgress() {
        const savedProgress = localStorage.getItem('mixplay_progress');
        if (savedProgress) {
            return JSON.parse(savedProgress);
        }
        return {
            total_orders: 0,
            unlocked_categories: ['基础饮品'],
            achievements: [],
            streak_days: 0
        };
    },

    generateMockOrder(orderData) {
        const orderNumber = 'MP' + Date.now().toString().slice(-8);
        const now = new Date();
        
        const funMessages = [
            '速速前往厨房制作！',
            '快去给家人做杯好喝的！',
            '辛苦了，这次轮到你表现了！',
            '谁抽到谁倒霉，快去做饮料吧！',
            '恭喜你获得"今日饮品师"称号！',
            '家庭重任交给你了！',
        ];

        return {
            id: Date.now(),
            order_number: orderNumber,
            drink_id: orderData.drink_id,
            drink_name: orderData.drink_name,
            sweetness: orderData.sweetness,
            ice_level: orderData.ice_level,
            cup_size: orderData.cup_size,
            toppings: orderData.toppings || [],
            total_price: orderData.total_price,
            assigned_to: orderData.assigned_to,
            fun_message: funMessages[Math.floor(Math.random() * funMessages.length)],
            status: 'pending',
            created_at: now.toISOString(),
            formatted_time: now.toLocaleString('zh-CN')
        };
    }
};

export default API;
