class MixPlayApp {
    constructor() {
        this.currentPage = 'menu';
        this.currentCategory = 'all';
        this.selectedDrink = null;
        this.customizations = {
            sweetness: '半糖',
            ice_level: '少冰',
            cup_size: '中杯',
            toppings: []
        };
        this.familyMembers = [];
        this.progress = null;
        this.orderHistory = [];
        
        this.init();
    }

    async init() {
        this.loadFromLocalStorage();
        this.bindEvents();
        await this.renderDrinks();
        this.updateProgressBar();
    }

    loadFromLocalStorage() {
        const savedFamily = localStorage.getItem('mixplay_family');
        if (savedFamily) {
            this.familyMembers = JSON.parse(savedFamily);
        } else {
            this.familyMembers = [
                { id: 1, name: '老公大大', role: '爸爸', is_active: true, assignment_count: 0, icon: '👨' },
                { id: 2, name: '老婆大人', role: '妈妈', is_active: true, assignment_count: 0, icon: '👩' },
                { id: 3, name: '宝贝儿子', role: '儿子', is_active: true, assignment_count: 0, icon: '👦' },
            ];
        }

        const savedProgress = localStorage.getItem('mixplay_progress');
        if (savedProgress) {
            this.progress = JSON.parse(savedProgress);
        } else {
            this.progress = {
                total_orders: 0,
                unlocked_categories: ['基础饮品'],
                achievements: [],
                streak_days: 0
            };
        }

        const savedHistory = localStorage.getItem('mixplay_history');
        if (savedHistory) {
            this.orderHistory = JSON.parse(savedHistory);
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('mixplay_family', JSON.stringify(this.familyMembers));
        localStorage.setItem('mixplay_progress', JSON.stringify(this.progress));
        localStorage.setItem('mixplay_history', JSON.stringify(this.orderHistory));
    }

    bindEvents() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchPage(e.target.dataset.page));
        });

        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchCategory(e.target.dataset.category));
        });

        document.getElementById('add-family-btn').addEventListener('click', () => {
            document.getElementById('add-family-modal').classList.add('active');
        });

        document.getElementById('close-family-modal').addEventListener('click', () => {
            document.getElementById('add-family-modal').classList.remove('active');
        });

        document.getElementById('cancel-family-btn').addEventListener('click', () => {
            document.getElementById('add-family-modal').classList.remove('active');
        });

        document.getElementById('confirm-family-btn').addEventListener('click', () => {
            this.addFamilyMember();
        });

        document.getElementById('close-drink-modal').addEventListener('click', () => {
            document.getElementById('drink-modal').classList.remove('active');
        });

        document.getElementById('cancel-drink-btn').addEventListener('click', () => {
            document.getElementById('drink-modal').classList.remove('active');
        });

        document.getElementById('confirm-order-btn').addEventListener('click', () => {
            this.placeOrder();
        });

        document.getElementById('close-receipt-btn').addEventListener('click', () => {
            document.getElementById('receipt-modal').classList.remove('active');
        });

        document.getElementById('save-receipt-btn').addEventListener('click', () => {
            this.takeScreenshot();
        });

        document.getElementById('share-receipt-btn').addEventListener('click', () => {
            this.shareReceipt();
        });

        document.getElementById('close-unlock-btn').addEventListener('click', () => {
            document.getElementById('unlock-modal').classList.remove('active');
        });

        this.bindModalCloseOnBackground();
        this.bindCustomizationEvents();
    }

    bindModalCloseOnBackground() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    bindCustomizationEvents() {
        document.querySelectorAll('#sweetness-options .custom-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectCustomization('sweetness', e.target.dataset.value, e.target);
            });
        });

        document.querySelectorAll('#ice-options .custom-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectCustomization('ice_level', e.target.dataset.value, e.target);
            });
        });

        document.querySelectorAll('#cup-options .custom-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectCustomization('cup_size', e.target.dataset.value, e.target);
                this.updateTotalPrice();
            });
        });

        document.querySelectorAll('#toppings-options .custom-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleTopping(e.target.dataset.value, parseFloat(e.target.dataset.price), e.target);
            });
        });
    }

    selectCustomization(type, value, element) {
        this.customizations[type] = value;
        
        const container = element.parentElement;
        container.querySelectorAll('.custom-option').forEach(btn => {
            btn.classList.remove('active');
        });
        element.classList.add('active');
    }

    toggleTopping(topping, price, element) {
        const index = this.customizations.toppings.findIndex(t => t.name === topping);
        if (index > -1) {
            this.customizations.toppings.splice(index, 1);
            element.classList.remove('active');
        } else {
            this.customizations.toppings.push({ name: topping, price });
            element.classList.add('active');
        }
        this.updateTotalPrice();
    }

    updateTotalPrice() {
        if (!this.selectedDrink) return;

        let total = this.selectedDrink.base_price;

        if (this.customizations.cup_size === '大杯') {
            total += 2;
        } else if (this.customizations.cup_size === '超大杯') {
            total += 4;
        }

        this.customizations.toppings.forEach(t => {
            total += t.price;
        });

        document.getElementById('total-price').textContent = `¥${total.toFixed(1)}`;
    }

    switchPage(page) {
        this.currentPage = page;

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.page === page) {
                btn.classList.add('active');
            }
        });

        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        document.getElementById(`${page}-page`).classList.add('active');

        if (page === 'family') {
            this.renderFamilyMembers();
        } else if (page === 'history') {
            this.renderHistory();
        }
    }

    switchCategory(category) {
        this.currentCategory = category;

        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.category === category) {
                tab.classList.add('active');
            }
        });

        this.renderDrinks();
    }

    async renderDrinks() {
        const container = document.getElementById('drinks-container');
        let drinks = window.API.getMockDrinks();

        if (this.currentCategory !== 'all') {
            drinks = drinks.filter(d => d.category === this.currentCategory);
        }

        drinks = drinks.map(drink => {
            if (this.progress.unlocked_categories.includes(drink.category)) {
                return { ...drink, is_unlocked: true };
            }
            return drink;
        });

        const drinkIcons = {
            '白开水': '💧',
            '柠檬水': '🍋',
            '蜂蜜水': '🍯',
            '经典珍珠奶茶': '🧋',
            '芋泥奶茶': '🥤',
            '杨枝甘露': '🥭',
            '招牌柠檬茶': '🍵',
            '缤纷水果茶': '🍉',
            '美式咖啡': '☕',
            '拿铁咖啡': '☕',
        };

        container.innerHTML = drinks.map(drink => {
            const icon = drink.icon || drinkIcons[drink.name] || '🥤';
            const isLocked = !drink.is_unlocked;

            return `
                <div class="drink-card ${isLocked ? 'locked' : ''}" data-id="${drink.id}">
                    <div class="drink-icon-wrapper">
                        <span class="drink-icon">${icon}</span>
                        ${isLocked ? `<span class="locked-badge">🔒 ${drink.unlock_condition || '未解锁'}</span>` : ''}
                    </div>
                    <div class="drink-info">
                        <h3 class="drink-name">${drink.name}</h3>
                        <p class="drink-desc">${drink.description}</p>
                        <div class="drink-footer">
                            <span class="drink-price">${drink.base_price.toFixed(1)}</span>
                            <button class="order-btn-small" ${isLocked ? 'disabled' : ''}>
                                ${isLocked ? '🔒 未解锁' : '点单'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.drink-card:not(.locked)').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('order-btn-small')) {
                    this.openDrinkModal(parseInt(card.dataset.id));
                }
            });
            card.querySelector('.order-btn-small').addEventListener('click', (e) => {
                e.stopPropagation();
                this.openDrinkModal(parseInt(card.dataset.id));
            });
        });
    }

    async openDrinkModal(drinkId) {
        const drinks = window.API.getMockDrinks();
        this.selectedDrink = drinks.find(d => d.id === drinkId);
        
        if (!this.selectedDrink) return;

        const drinkIcons = {
            '白开水': '💧',
            '柠檬水': '🍋',
            '蜂蜜水': '🍯',
            '经典珍珠奶茶': '🧋',
            '芋泥奶茶': '🥤',
            '杨枝甘露': '🥭',
            '招牌柠檬茶': '🍵',
            '缤纷水果茶': '🍉',
            '美式咖啡': '☕',
            '拿铁咖啡': '☕',
        };

        document.getElementById('modal-drink-name').textContent = this.selectedDrink.name;
        document.getElementById('modal-drink-icon').textContent = this.selectedDrink.icon || drinkIcons[this.selectedDrink.name] || '🥤';
        document.getElementById('modal-drink-desc').textContent = this.selectedDrink.description;
        document.getElementById('modal-drink-price').textContent = `¥${this.selectedDrink.base_price.toFixed(1)}`;

        this.customizations = {
            sweetness: '半糖',
            ice_level: '少冰',
            cup_size: '中杯',
            toppings: []
        };

        document.querySelectorAll('#sweetness-options .custom-option').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.value === '半糖') btn.classList.add('active');
        });

        document.querySelectorAll('#ice-options .custom-option').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.value === '少冰') btn.classList.add('active');
        });

        document.querySelectorAll('#cup-options .custom-option').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.value === '中杯') btn.classList.add('active');
        });

        document.querySelectorAll('#toppings-options .custom-option').forEach(btn => {
            btn.classList.remove('active');
        });

        this.updateTotalPrice();
        document.getElementById('drink-modal').classList.add('active');
    }

    async placeOrder() {
        if (!this.selectedDrink) return;
        if (this.familyMembers.length === 0) {
            alert('请先添加家庭成员！');
            return;
        }

        let total = this.selectedDrink.base_price;
        if (this.customizations.cup_size === '大杯') total += 2;
        else if (this.customizations.cup_size === '超大杯') total += 4;
        this.customizations.toppings.forEach(t => total += t.price);

        const activeMembers = this.familyMembers.filter(m => m.is_active);
        const randomIndex = Math.floor(Math.random() * activeMembers.length);
        const assignedMember = activeMembers[randomIndex];

        const memberIndex = this.familyMembers.findIndex(m => m.id === assignedMember.id);
        if (memberIndex > -1) {
            this.familyMembers[memberIndex].assignment_count++;
        }

        const orderData = {
            drink_id: this.selectedDrink.id,
            drink_name: this.selectedDrink.name,
            sweetness: this.customizations.sweetness,
            ice_level: this.customizations.ice_level,
            cup_size: this.customizations.cup_size,
            toppings: this.customizations.toppings,
            total_price: total,
            assigned_to: assignedMember.name
        };

        const order = window.API.generateMockOrder(orderData);
        this.orderHistory.unshift(order);

        this.progress.total_orders++;
        this.checkUnlocks();

        this.saveToLocalStorage();

        document.getElementById('drink-modal').classList.remove('active');
        this.showReceipt(order, assignedMember);
    }

    checkUnlocks() {
        const orders = this.progress.total_orders;
        let newUnlock = null;

        if (orders >= 3 && !this.progress.unlocked_categories.includes('奶茶系列')) {
            this.progress.unlocked_categories.push('奶茶系列');
            newUnlock = '奶茶系列';
        }
        if (orders >= 5 && !this.progress.unlocked_categories.includes('果茶系列')) {
            this.progress.unlocked_categories.push('果茶系列');
            newUnlock = newUnlock ? newUnlock + '、果茶系列' : '果茶系列';
        }
        if (orders >= 10 && !this.progress.unlocked_categories.includes('咖啡系列')) {
            this.progress.unlocked_categories.push('咖啡系列');
            newUnlock = newUnlock ? newUnlock + '、咖啡系列' : '咖啡系列';
        }
        if (orders >= 15 && !this.progress.unlocked_categories.includes('特调系列')) {
            this.progress.unlocked_categories.push('特调系列');
            newUnlock = newUnlock ? newUnlock + '、特调系列' : '特调系列';
        }

        if (newUnlock) {
            setTimeout(() => {
                document.getElementById('unlock-message').textContent = `你已解锁${newUnlock}！`;
                document.getElementById('unlock-modal').classList.add('active');
            }, 500);
        }

        this.updateProgressBar();
        this.renderDrinks();
    }

    updateProgressBar() {
        const total = this.progress.total_orders;
        const percentage = Math.min((total / 15) * 100, 100);

        document.querySelector('.progress-count').textContent = `已完成 ${total}/15 单`;
        document.querySelector('.progress-fill').style.width = `${percentage}%`;
    }

    showReceipt(order, assignedMember) {
        const receiptContainer = document.getElementById('receipt-container');
        
        const toppingsText = this.customizations.toppings.length > 0 
            ? this.customizations.toppings.map(t => t.name).join('、') 
            : '无';

        receiptContainer.innerHTML = `
            <div class="receipt-header">
                <div class="receipt-logo">🍹</div>
                <div class="receipt-title">Bapoo MixPlay</div>
                <div class="receipt-subtitle">家庭水吧 · 趣味点单</div>
            </div>
            
            <div class="receipt-order-info">
                <div class="receipt-row">
                    <span class="receipt-label">订单号</span>
                    <span>${order.order_number}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">下单时间</span>
                    <span>${order.formatted_time}</span>
                </div>
            </div>

            <div class="receipt-items">
                <div class="receipt-item-name">${order.drink_name}</div>
                <div class="receipt-item-specs">甜度：${order.sweetness}</div>
                <div class="receipt-item-specs">冰量：${order.ice_level}</div>
                <div class="receipt-item-specs">杯型：${order.cup_size}</div>
                <div class="receipt-item-specs">加料：${toppingsText}</div>
            </div>

            <div class="receipt-total">
                <span>合计</span>
                <span>¥${order.total_price.toFixed(1)}</span>
            </div>

            <div class="receipt-assignment">
                <div class="assignment-title">🎯 系统指派</div>
                <div class="assignment-name">${assignedMember.name}</div>
                <div class="assignment-message">${order.fun_message}</div>
            </div>

            <div class="receipt-footer">
                <div class="receipt-thanks">感谢使用 Bapoo MixPlay！</div>
                <div class="receipt-time">让喝水变得有趣，让家庭充满欢笑 💕</div>
            </div>
        `;

        document.getElementById('receipt-modal').classList.add('active');
    }

    takeScreenshot() {
        alert('请使用手机自带的截图功能保存这张有趣的小票！\n\n截图后可以直接分享到家庭微信群哦~');
    }

    shareReceipt() {
        if (navigator.share) {
            navigator.share({
                title: 'Bapoo MixPlay 点单小票',
                text: '快来看看今天谁是"冤种"饮品师！',
                url: window.location.href
            }).catch(console.error);
        } else {
            alert('请截图后手动分享到家庭微信群！\n\n💡 提示：同时按住电源键和音量减键即可截图');
        }
    }

    renderFamilyMembers() {
        const container = document.getElementById('family-list');
        
        const roleIcons = {
            '爸爸': '👨',
            '妈妈': '👩',
            '儿子': '👦',
            '女儿': '👧',
            '爷爷': '👴',
            '奶奶': '👵',
            '其他': '🧑'
        };

        if (this.familyMembers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">👨‍👩‍👧‍👦</div>
                    <p>还没有添加家庭成员</p>
                    <p class="empty-hint">点击上方按钮添加家人，开始你的"冤种"之旅！</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.familyMembers.map(member => {
            const icon = member.icon || roleIcons[member.role] || '🧑';
            
            return `
                <div class="family-card" data-id="${member.id}">
                    <div class="family-avatar">${icon}</div>
                    <div class="family-info">
                        <div class="family-name">${member.name}</div>
                        <div class="family-role">${member.role}</div>
                    </div>
                    <div class="family-stats">
                        <div class="assignment-count">被指派次数</div>
                        <div class="assignment-badge">${member.assignment_count} 次</div>
                    </div>
                    <button class="delete-family-btn" data-id="${member.id}" title="删除">
                        🗑️
                    </button>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.delete-family-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const memberId = parseInt(btn.dataset.id);
                this.deleteFamilyMember(memberId);
            });
        });
    }

    deleteFamilyMember(memberId) {
        if (this.familyMembers.length <= 1) {
            alert('至少需要保留一个家庭成员！');
            return;
        }

        if (confirm('确定要删除这个家庭成员吗？')) {
            const index = this.familyMembers.findIndex(m => m.id === memberId);
            if (index > -1) {
                this.familyMembers.splice(index, 1);
                this.saveToLocalStorage();
                this.renderFamilyMembers();
            }
        }
    }

    addFamilyMember() {
        const nameInput = document.getElementById('member-name');
        const roleSelect = document.getElementById('member-role');
        
        const name = nameInput.value.trim();
        const role = roleSelect.value;

        if (!name) {
            alert('请输入家庭成员称呼！');
            return;
        }

        const roleIcons = {
            '爸爸': '👨',
            '妈妈': '👩',
            '儿子': '👦',
            '女儿': '👧',
            '爷爷': '👴',
            '奶奶': '👵',
            '其他': '🧑'
        };

        const newMember = {
            id: Date.now(),
            name: name,
            role: role,
            is_active: true,
            assignment_count: 0,
            icon: roleIcons[role] || '🧑'
        };

        this.familyMembers.push(newMember);
        this.saveToLocalStorage();
        this.renderFamilyMembers();

        nameInput.value = '';
        document.getElementById('add-family-modal').classList.remove('active');
    }

    renderHistory() {
        const statsCards = document.querySelectorAll('.stat-card');
        if (statsCards.length >= 2) {
            statsCards[0].querySelector('.stat-number').textContent = this.progress.total_orders;
            
            if (this.familyMembers.length > 0) {
                const sorted = [...this.familyMembers].sort((a, b) => b.assignment_count - a.assignment_count);
                const mostUnlucky = sorted[0];
                if (mostUnlucky.assignment_count > 0) {
                    statsCards[1].querySelector('.stat-number').textContent = mostUnlucky.name;
                    statsCards[1].querySelector('.stat-label').textContent = `被指派 ${mostUnlucky.assignment_count} 次`;
                }
            }
        }

        const container = document.getElementById('history-list');
        
        if (this.orderHistory.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <p>还没有点单记录</p>
                    <p class="empty-hint">快去点一杯饮品开始你的"冤种"之旅吧！</p>
                </div>
            `;
            return;
        }

        const drinkIcons = {
            '白开水': '💧',
            '柠檬水': '🍋',
            '蜂蜜水': '🍯',
            '经典珍珠奶茶': '🧋',
            '芋泥奶茶': '🥤',
            '杨枝甘露': '🥭',
            '招牌柠檬茶': '🍵',
            '缤纷水果茶': '🍉',
            '美式咖啡': '☕',
            '拿铁咖啡': '☕',
        };

        container.innerHTML = this.orderHistory.slice(0, 20).map(order => {
            const toppingsText = order.toppings && order.toppings.length > 0 
                ? order.toppings.map(t => t.name).join('、') 
                : '无';

            return `
                <div class="history-card">
                    <div class="history-header">
                        <span class="history-order-number">#${order.order_number}</span>
                        <span class="history-time">${order.formatted_time}</span>
                    </div>
                    <div class="history-drink">
                        <span class="history-drink-icon">${drinkIcons[order.drink_name] || '🥤'}</span>
                        <div class="history-drink-info">
                            <h4>${order.drink_name}</h4>
                            <div class="history-drink-specs">
                                ${order.sweetness} · ${order.ice_level} · ${order.cup_size} · 加料: ${toppingsText}
                            </div>
                        </div>
                    </div>
                    <div class="history-assignment">
                        <div class="assignment-info">
                            <div class="assigned-to">系统指派</div>
                            <div class="assigned-name">${order.assigned_to}</div>
                        </div>
                        <div class="fun-message-wrapper">
                            <div class="fun-message">${order.fun_message}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new MixPlayApp();
});
