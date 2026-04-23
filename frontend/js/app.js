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
        
        this.currentChallenge = null;
        this.challengeHistory = [];
        this.activeTaskChains = [];
        this.taskChainHistory = [];
        this.earnedAchievements = [];
        this.personalContributions = {};
        this.fastestRelayTime = null;
        this.streakDays = 0;
        this.lastOrderDate = null;
        
        this.selectedChallengeTheme = null;
        this.selectedCollaborationDrink = null;
        this.assignmentType = 'auto';
        this.selectedCollaborationMembers = [];
        
        this.init();
    }

    async init() {
        this.loadFromLocalStorage();
        this.bindEvents();
        await this.renderDrinks();
        this.updateProgressBar();
        this.renderChallengeThemes();
        this.renderTaskStats();
        this.renderAchievements();
        this.renderContributionRanking();
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

        const savedCurrentChallenge = localStorage.getItem('mixplay_current_challenge');
        if (savedCurrentChallenge) {
            this.currentChallenge = JSON.parse(savedCurrentChallenge);
        }

        const savedChallengeHistory = localStorage.getItem('mixplay_challenge_history');
        if (savedChallengeHistory) {
            this.challengeHistory = JSON.parse(savedChallengeHistory);
        }

        const savedActiveTaskChains = localStorage.getItem('mixplay_active_task_chains');
        if (savedActiveTaskChains) {
            this.activeTaskChains = JSON.parse(savedActiveTaskChains);
        }

        const savedTaskChainHistory = localStorage.getItem('mixplay_task_chain_history');
        if (savedTaskChainHistory) {
            this.taskChainHistory = JSON.parse(savedTaskChainHistory);
        }

        const savedEarnedAchievements = localStorage.getItem('mixplay_earned_achievements');
        if (savedEarnedAchievements) {
            this.earnedAchievements = JSON.parse(savedEarnedAchievements);
        }

        const savedPersonalContributions = localStorage.getItem('mixplay_personal_contributions');
        if (savedPersonalContributions) {
            this.personalContributions = JSON.parse(savedPersonalContributions);
        }

        const savedFastestRelayTime = localStorage.getItem('mixplay_fastest_relay_time');
        if (savedFastestRelayTime) {
            this.fastestRelayTime = parseInt(savedFastestRelayTime);
        }

        const savedStreakDays = localStorage.getItem('mixplay_streak_days');
        if (savedStreakDays) {
            this.streakDays = parseInt(savedStreakDays);
        }

        const savedLastOrderDate = localStorage.getItem('mixplay_last_order_date');
        if (savedLastOrderDate) {
            this.lastOrderDate = savedLastOrderDate;
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('mixplay_family', JSON.stringify(this.familyMembers));
        localStorage.setItem('mixplay_progress', JSON.stringify(this.progress));
        localStorage.setItem('mixplay_history', JSON.stringify(this.orderHistory));
        
        if (this.currentChallenge) {
            localStorage.setItem('mixplay_current_challenge', JSON.stringify(this.currentChallenge));
        } else {
            localStorage.removeItem('mixplay_current_challenge');
        }
        
        localStorage.setItem('mixplay_challenge_history', JSON.stringify(this.challengeHistory));
        localStorage.setItem('mixplay_active_task_chains', JSON.stringify(this.activeTaskChains));
        localStorage.setItem('mixplay_task_chain_history', JSON.stringify(this.taskChainHistory));
        localStorage.setItem('mixplay_earned_achievements', JSON.stringify(this.earnedAchievements));
        localStorage.setItem('mixplay_personal_contributions', JSON.stringify(this.personalContributions));
        
        if (this.fastestRelayTime !== null) {
            localStorage.setItem('mixplay_fastest_relay_time', this.fastestRelayTime.toString());
        }
        
        localStorage.setItem('mixplay_streak_days', this.streakDays.toString());
        
        if (this.lastOrderDate) {
            localStorage.setItem('mixplay_last_order_date', this.lastOrderDate);
        }
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

        let challengeTheme = null;
        let challengeCategory = null;
        if (this.currentChallenge) {
            const themes = window.API.getChallengeThemes();
            challengeTheme = themes.find(t => t.id === this.currentChallenge.theme_id);
            if (challengeTheme) {
                challengeCategory = challengeTheme.category;
            }
        }

        drinks = drinks.map(drink => {
            let isUnlocked = this.progress.unlocked_categories.includes(drink.category);
            let isTemporaryUnlock = false;

            if (challengeTheme && !isUnlocked) {
                if (challengeCategory === 'mixed') {
                    isUnlocked = true;
                    isTemporaryUnlock = true;
                } else if (drink.category === challengeCategory) {
                    isUnlocked = true;
                    isTemporaryUnlock = true;
                }
            }

            return { 
                ...drink, 
                is_unlocked: isUnlocked,
                is_temporary_unlock: isTemporaryUnlock
            };
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
            const isTemporary = drink.is_temporary_unlock;

            return `
                <div class="drink-card ${isLocked ? 'locked' : ''} ${isTemporary ? 'temporary-unlock' : ''}" data-id="${drink.id}">
                    <div class="drink-icon-wrapper">
                        <span class="drink-icon">${icon}</span>
                        ${isLocked ? `<span class="locked-badge">🔒 ${drink.unlock_condition || '未解锁'}</span>` : ''}
                        ${isTemporary ? `<span class="temporary-badge">🎯 挑战解锁</span>` : ''}
                    </div>
                    <div class="drink-info">
                        <h3 class="drink-name">${drink.name}</h3>
                        <p class="drink-desc">${drink.description}</p>
                        <div class="drink-footer">
                            <span class="drink-price">${drink.base_price.toFixed(1)}</span>
                            <button class="order-btn-small ${isTemporary ? 'temporary' : ''}" ${isLocked ? 'disabled' : ''}>
                                ${isLocked ? '🔒 未解锁' : (isTemporary ? '🎯 挑战点单' : '点单')}
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
        } else if (page === 'challenge') {
            this.renderChallengeThemes();
            this.renderCurrentChallenge();
            this.renderChallengeHistory();
        } else if (page === 'tasks') {
            this.renderTaskStats();
            this.renderActiveTaskChains();
            this.renderTaskChainHistory();
        } else if (page === 'achievements') {
            this.renderAchievements();
            this.renderContributionRanking();
            this.updateAchievementStats();
        }
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

        this.bindChallengeEvents();
        this.bindTaskEvents();
        this.bindAchievementEvents();
        this.bindModalCloseOnBackground();
        this.bindCustomizationEvents();
    }

    bindChallengeEvents() {
        document.getElementById('close-challenge-detail-modal').addEventListener('click', () => {
            document.getElementById('challenge-detail-modal').classList.remove('active');
        });

        document.getElementById('cancel-challenge-detail-btn').addEventListener('click', () => {
            document.getElementById('challenge-detail-modal').classList.remove('active');
        });

        document.getElementById('start-challenge-btn').addEventListener('click', () => {
            this.startChallenge();
        });
    }

    bindTaskEvents() {
        document.getElementById('close-task-detail-modal').addEventListener('click', () => {
            document.getElementById('task-detail-modal').classList.remove('active');
        });

        document.getElementById('close-task-detail-btn').addEventListener('click', () => {
            document.getElementById('task-detail-modal').classList.remove('active');
        });

        document.getElementById('close-create-collaboration-modal').addEventListener('click', () => {
            document.getElementById('create-collaboration-modal').classList.remove('active');
        });

        document.getElementById('cancel-create-collaboration-btn').addEventListener('click', () => {
            document.getElementById('create-collaboration-modal').classList.remove('active');
        });

        document.getElementById('confirm-create-collaboration-btn').addEventListener('click', () => {
            this.createCollaborationOrder();
        });

        document.querySelectorAll('input[name="assignment-type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.assignmentType = e.target.value;
                const manualSection = document.getElementById('manual-assignment-section');
                if (e.target.value === 'manual') {
                    manualSection.style.display = 'block';
                } else {
                    manualSection.style.display = 'none';
                }
            });
        });
    }

    bindAchievementEvents() {
        document.getElementById('close-achievement-detail-modal').addEventListener('click', () => {
            document.getElementById('achievement-detail-modal').classList.remove('active');
        });

        document.getElementById('close-achievement-detail-btn').addEventListener('click', () => {
            document.getElementById('achievement-detail-modal').classList.remove('active');
        });

        document.getElementById('generate-achievement-receipt-btn').addEventListener('click', () => {
            this.generateAchievementReceipt();
        });

        document.getElementById('close-achievement-receipt-btn').addEventListener('click', () => {
            document.getElementById('achievement-receipt-modal').classList.remove('active');
        });

        document.getElementById('save-achievement-receipt-btn').addEventListener('click', () => {
            this.takeScreenshot();
        });
    }

    renderChallengeThemes() {
        const themes = window.API.getChallengeThemes();
        const container = document.getElementById('challenge-themes-grid');
        
        const difficultyColors = {
            '简单': 'var(--secondary-color)',
            '中等': 'var(--accent-orange)',
            '困难': 'var(--primary-color)',
            '专家': 'var(--accent-purple)'
        };

        container.innerHTML = themes.map(theme => {
            const isActive = this.currentChallenge && this.currentChallenge.theme_id === theme.id;
            const isCompleted = this.challengeHistory.some(h => h.theme_id === theme.id && h.status === 'completed');
            
            return `
                <div class="challenge-theme-card ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" data-theme-id="${theme.id}">
                    <div class="challenge-theme-header">
                        <span class="challenge-theme-icon">${theme.icon}</span>
                        <span class="challenge-theme-name">${theme.name}</span>
                        <span class="challenge-difficulty-badge" style="background: ${difficultyColors[theme.difficulty]}">
                            ${theme.difficulty}
                        </span>
                    </div>
                    <p class="challenge-theme-desc">${theme.description}</p>
                    <div class="challenge-theme-footer">
                        <span class="challenge-target">目标: ${theme.target_orders} 单</span>
                        <span class="challenge-reward">🎁 ${theme.rewards.achievement}</span>
                    </div>
                    ${isActive ? '<div class="active-indicator">进行中</div>' : ''}
                    ${isCompleted ? '<div class="completed-indicator">✓ 已完成</div>' : ''}
                </div>
            `;
        }).join('');

        container.querySelectorAll('.challenge-theme-card').forEach(card => {
            card.addEventListener('click', () => {
                const themeId = card.dataset.themeId;
                this.openChallengeDetail(themeId);
            });
        });
    }

    renderCurrentChallenge() {
        const section = document.getElementById('current-challenge-section');
        const card = document.getElementById('current-challenge-card');
        
        if (!this.currentChallenge) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        
        const themes = window.API.getChallengeThemes();
        const theme = themes.find(t => t.id === this.currentChallenge.theme_id);
        
        if (!theme) return;

        document.getElementById('current-challenge-desc').textContent = theme.name;
        document.getElementById('current-challenge-progress').textContent = 
            `${this.currentChallenge.completed_orders}/${theme.target_orders}`;
        
        const progress = (this.currentChallenge.completed_orders / theme.target_orders) * 100;
        document.getElementById('current-challenge-fill').style.width = `${progress}%`;
        document.getElementById('current-challenge-rewards').textContent = 
            `成就: ${theme.rewards.achievement} | 称号: ${theme.rewards.title}`;
    }

    renderChallengeHistory() {
        const container = document.getElementById('challenge-history-list');
        
        if (this.challengeHistory.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎯</div>
                    <p>还没有挑战记录</p>
                    <p class="empty-hint">选择一个挑战主题开始你的挑战之旅吧！</p>
                </div>
            `;
            return;
        }

        const themes = window.API.getChallengeThemes();
        
        container.innerHTML = this.challengeHistory.slice(0, 10).map(history => {
            const theme = themes.find(t => t.id === history.theme_id);
            const statusClass = history.status === 'completed' ? 'status-completed' : 'status-failed';
            const statusText = history.status === 'completed' ? '✓ 完成' : '✗ 失败';
            
            return `
                <div class="challenge-history-card">
                    <div class="challenge-history-header">
                        <span class="challenge-history-icon">${theme ? theme.icon : '🎯'}</span>
                        <span class="challenge-history-name">${theme ? theme.name : '未知挑战'}</span>
                        <span class="challenge-history-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="challenge-history-details">
                        <span>完成: ${history.completed_orders}/${history.target_orders}</span>
                        <span>开始: ${this.formatDate(history.started_at)}</span>
                        ${history.completed_at ? `<span>完成: ${this.formatDate(history.completed_at)}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    openChallengeDetail(themeId) {
        const themes = window.API.getChallengeThemes();
        const theme = themes.find(t => t.id === themeId);
        
        if (!theme) return;

        this.selectedChallengeTheme = theme;
        
        document.getElementById('challenge-detail-title').textContent = theme.name;
        
        const difficultyColors = {
            '简单': 'var(--secondary-color)',
            '中等': 'var(--accent-orange)',
            '困难': 'var(--primary-color)',
            '专家': 'var(--accent-purple)'
        };

        document.getElementById('challenge-detail-body').innerHTML = `
            <div class="challenge-detail-info">
                <div class="challenge-detail-icon">${theme.icon}</div>
                <p class="challenge-detail-desc">${theme.description}</p>
                
                <div class="challenge-detail-stats">
                    <div class="challenge-detail-stat">
                        <span class="challenge-detail-stat-label">难度</span>
                        <span class="challenge-detail-stat-value" style="color: ${difficultyColors[theme.difficulty]}">
                            ${theme.difficulty}
                        </span>
                    </div>
                    <div class="challenge-detail-stat">
                        <span class="challenge-detail-stat-label">目标订单</span>
                        <span class="challenge-detail-stat-value">${theme.target_orders} 单</span>
                    </div>
                    <div class="challenge-detail-stat">
                        <span class="challenge-detail-stat-label">限制品类</span>
                        <span class="challenge-detail-stat-value">${theme.category === 'mixed' ? '混合品类' : theme.category}</span>
                    </div>
                </div>
                
                <div class="challenge-rewards-section">
                    <h4>🎁 挑战奖励</h4>
                    <div class="challenge-reward-item">
                        <span class="reward-icon">🏆</span>
                        <span class="reward-text">成就: ${theme.rewards.achievement}</span>
                    </div>
                    <div class="challenge-reward-item">
                        <span class="reward-icon">👑</span>
                        <span class="reward-text">专属称号: ${theme.rewards.title}</span>
                    </div>
                </div>
            </div>
        `;

        const startBtn = document.getElementById('start-challenge-btn');
        if (this.currentChallenge) {
            if (this.currentChallenge.theme_id === themeId) {
                startBtn.textContent = '挑战进行中';
                startBtn.disabled = true;
            } else {
                startBtn.textContent = '开始新挑战';
                startBtn.disabled = false;
            }
        } else {
            startBtn.textContent = '开始挑战';
            startBtn.disabled = false;
        }

        document.getElementById('challenge-detail-modal').classList.add('active');
    }

    startChallenge() {
        if (!this.selectedChallengeTheme) return;

        if (this.currentChallenge) {
            if (!confirm('当前有进行中的挑战，开始新挑战将放弃当前挑战，确定继续吗？')) {
                return;
            }
            this.challengeHistory.push({
                ...this.currentChallenge,
                status: 'failed',
                ended_at: new Date().toISOString()
            });
        }

        this.currentChallenge = {
            id: Date.now(),
            theme_id: this.selectedChallengeTheme.id,
            started_at: new Date().toISOString(),
            completed_orders: 0,
            target_orders: this.selectedChallengeTheme.target_orders,
            used_categories: this.selectedChallengeTheme.category === 'mixed' ? [] : null,
            status: 'active'
        };

        this.saveToLocalStorage();
        this.renderChallengeThemes();
        this.renderCurrentChallenge();
        
        document.getElementById('challenge-detail-modal').classList.remove('active');
        
        alert(`挑战开始！\n\n挑战主题: ${this.selectedChallengeTheme.name}\n目标: ${this.selectedChallengeTheme.target_orders} 单\n\n加油！`);
    }

    checkChallengeOrder(drinkCategory) {
        if (!this.currentChallenge) return true;

        const themes = window.API.getChallengeThemes();
        const theme = themes.find(t => t.id === this.currentChallenge.theme_id);
        
        if (!theme) return true;

        if (theme.category === 'mixed') {
            if (!this.currentChallenge.used_categories) {
                this.currentChallenge.used_categories = [];
            }
            if (!this.currentChallenge.used_categories.includes(drinkCategory)) {
                this.currentChallenge.used_categories.push(drinkCategory);
            }
            this.currentChallenge.completed_orders++;
        } else {
            if (drinkCategory !== theme.category) {
                alert(`挑战进行中！当前挑战主题是 "${theme.name}"，只能点单 ${theme.category} 的饮品。`);
                return false;
            }
            this.currentChallenge.completed_orders++;
        }

        if (this.currentChallenge.completed_orders >= theme.target_orders) {
            this.completeChallenge();
        }

        this.saveToLocalStorage();
        this.renderCurrentChallenge();
        
        return true;
    }

    completeChallenge() {
        if (!this.currentChallenge) return;

        const themes = window.API.getChallengeThemes();
        const theme = themes.find(t => t.id === this.currentChallenge.theme_id);
        
        if (!theme) return;

        this.currentChallenge.status = 'completed';
        this.currentChallenge.completed_at = new Date().toISOString();
        
        this.challengeHistory.push({ ...this.currentChallenge });

        const achievementId = `challenge_${theme.id}`;
        if (!this.earnedAchievements.includes(achievementId)) {
            this.earnedAchievements.push(achievementId);
        }

        this.currentChallenge = null;
        this.saveToLocalStorage();

        setTimeout(() => {
            document.getElementById('unlock-message').textContent = 
                `恭喜完成挑战！\n\n获得成就: ${theme.rewards.achievement}\n获得称号: ${theme.rewards.title}`;
            document.getElementById('unlock-modal').classList.add('active');
        }, 500);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    renderTaskStats() {
        const totalCollaborations = this.taskChainHistory.filter(t => t.status === 'completed').length;
        document.getElementById('total-collaborations').textContent = totalCollaborations;

        if (this.fastestRelayTime !== null) {
            const minutes = Math.floor(this.fastestRelayTime / 60);
            const seconds = this.fastestRelayTime % 60;
            document.getElementById('fastest-relay').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        const totalTaskChains = this.taskChainHistory.length;
        const completedTaskChains = this.taskChainHistory.filter(t => t.status === 'completed').length;
        const rate = totalTaskChains > 0 ? Math.round((completedTaskChains / totalTaskChains) * 100) : 0;
        document.getElementById('collaboration-rate').textContent = `${rate}%`;
    }

    renderActiveTaskChains() {
        const container = document.getElementById('active-tasks-list');
        const section = document.getElementById('active-tasks-section');

        if (this.activeTaskChains.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        const taskTypes = window.API.getTaskTypes();

        container.innerHTML = this.activeTaskChains.map(chain => {
            const currentTaskIndex = chain.tasks.findIndex(t => t.status === 'pending');
            const currentTask = chain.tasks[currentTaskIndex];
            const currentTaskType = taskTypes.find(t => t.id === currentTask?.type);

            return `
                <div class="task-chain-card active" data-chain-id="${chain.id}">
                    <div class="task-chain-header">
                        <span class="task-chain-drink">${chain.drink_name}</span>
                        <span class="task-chain-status">进行中</span>
                    </div>
                    <div class="task-chain-progress">
                        <span class="task-chain-progress-text">
                            ${chain.tasks.filter(t => t.status === 'completed').length}/${chain.tasks.length} 任务已完成
                        </span>
                    </div>
                    <div class="task-chain-tasks">
                        ${chain.tasks.map((task, index) => {
                            const taskType = taskTypes.find(t => t.id === task.type);
                            const isCurrent = task.status === 'pending' && index === currentTaskIndex;
                            const isCompleted = task.status === 'completed';
                            
                            return `
                                <div class="task-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}">
                                    <span class="task-item-icon">${taskType?.icon || '📋'}</span>
                                    <span class="task-item-name">${taskType?.name || '未知任务'}</span>
                                    ${task.assigned_to ? `<span class="task-item-assignee">→ ${task.assigned_to}</span>` : ''}
                                    ${isCompleted ? '<span class="task-item-check">✓</span>' : ''}
                                    ${isCurrent ? `
                                        <button class="task-complete-btn" data-chain-id="${chain.id}" data-task-index="${index}">
                                            完成任务
                                        </button>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.task-complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const chainId = parseInt(btn.dataset.chainId);
                const taskIndex = parseInt(btn.dataset.taskIndex);
                this.completeTask(chainId, taskIndex);
            });
        });
    }

    renderTaskChainHistory() {
        const container = document.getElementById('task-history-list');
        
        if (this.taskChainHistory.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔗</div>
                    <p>还没有协作任务链记录</p>
                    <p class="empty-hint">创建协作订单，体验全家接力的乐趣！</p>
                </div>
            `;
            return;
        }

        const taskTypes = window.API.getTaskTypes();

        container.innerHTML = this.taskChainHistory.slice(0, 10).map(chain => {
            const statusClass = chain.status === 'completed' ? 'status-completed' : 'status-cancelled';
            const statusText = chain.status === 'completed' ? '✓ 完成' : '✗ 取消';
            
            let durationText = '';
            if (chain.status === 'completed' && chain.started_at && chain.completed_at) {
                const start = new Date(chain.started_at);
                const end = new Date(chain.completed_at);
                const duration = Math.round((end - start) / 1000);
                const minutes = Math.floor(duration / 60);
                const seconds = duration % 60;
                durationText = `耗时: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            }

            return `
                <div class="task-chain-history-card">
                    <div class="task-chain-history-header">
                        <span class="task-chain-history-drink">${chain.drink_name}</span>
                        <span class="task-chain-history-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="task-chain-history-details">
                        <span>${chain.tasks.length} 个任务</span>
                        <span>开始: ${this.formatDate(chain.started_at)}</span>
                        ${durationText ? `<span>${durationText}</span>` : ''}
                    </div>
                    <div class="task-chain-history-members">
                        <span>参与成员: </span>
                        ${chain.tasks.filter(t => t.assigned_to).map(t => 
                            `<span class="member-badge">${t.assigned_to}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    createCollaborationOrder() {
        if (!this.selectedCollaborationDrink) {
            alert('请选择一杯饮品！');
            return;
        }

        if (this.familyMembers.length < 2) {
            alert('协作任务需要至少2个家庭成员！');
            return;
        }

        const taskTypes = window.API.getTaskTypes();
        const activeMembers = this.familyMembers.filter(m => m.is_active);
        
        let assignedMembers = [];
        if (this.assignmentType === 'auto') {
            const shuffled = [...activeMembers].sort(() => Math.random() - 0.5);
            assignedMembers = shuffled.slice(0, taskTypes.length);
        } else {
            if (this.selectedCollaborationMembers.length < 2) {
                alert('请至少选择2个家庭成员！');
                return;
            }
            assignedMembers = this.selectedCollaborationMembers.slice(0, taskTypes.length);
        }

        const tasks = taskTypes.map((type, index) => ({
            id: Date.now() + index,
            type: type.id,
            status: index === 0 ? 'pending' : 'waiting',
            assigned_to: assignedMembers[index]?.name || null,
            started_at: null,
            completed_at: null
        }));

        const newChain = {
            id: Date.now(),
            drink_id: this.selectedCollaborationDrink.id,
            drink_name: this.selectedCollaborationDrink.name,
            drink_category: this.selectedCollaborationDrink.category,
            tasks: tasks,
            started_at: new Date().toISOString(),
            completed_at: null,
            status: 'active',
            total_duration: null
        };

        this.activeTaskChains.push(newChain);
        this.saveToLocalStorage();

        this.renderTaskStats();
        this.renderActiveTaskChains();
        
        document.getElementById('create-collaboration-modal').classList.remove('active');
        
        alert(`协作任务链已创建！\n\n饮品: ${this.selectedCollaborationDrink.name}\n任务数: ${tasks.length}\n\n开始你的接力之旅吧！`);
    }

    completeTask(chainId, taskIndex) {
        const chainIndex = this.activeTaskChains.findIndex(c => c.id === chainId);
        if (chainIndex === -1) return;

        const chain = this.activeTaskChains[chainIndex];
        const task = chain.tasks[taskIndex];
        
        if (task.status !== 'pending') return;

        task.status = 'completed';
        task.completed_at = new Date().toISOString();

        if (taskIndex + 1 < chain.tasks.length) {
            chain.tasks[taskIndex + 1].status = 'pending';
            chain.tasks[taskIndex + 1].started_at = new Date().toISOString();
        } else {
            chain.status = 'completed';
            chain.completed_at = new Date().toISOString();
            
            const start = new Date(chain.started_at);
            const end = new Date(chain.completed_at);
            const duration = Math.round((end - start) / 1000);
            chain.total_duration = duration;

            if (this.fastestRelayTime === null || duration < this.fastestRelayTime) {
                this.fastestRelayTime = duration;
            }

            this.taskChainHistory.push({ ...chain });
            this.activeTaskChains.splice(chainIndex, 1);

            const collabFirstAchievement = 'collaboration_first';
            if (!this.earnedAchievements.includes(collabFirstAchievement)) {
                const totalCompleted = this.taskChainHistory.filter(t => t.status === 'completed').length;
                if (totalCompleted >= 1) {
                    this.earnedAchievements.push(collabFirstAchievement);
                }
            }

            if (duration <= 300) {
                const fastAchievement = 'collaboration_fast';
                if (!this.earnedAchievements.includes(fastAchievement)) {
                    this.earnedAchievements.push(fastAchievement);
                }
            }

            setTimeout(() => {
                const minutes = Math.floor(duration / 60);
                const seconds = duration % 60;
                document.getElementById('unlock-message').textContent = 
                    `协作任务链完成！\n\n耗时: ${minutes}分${seconds}秒\n\n太棒了，全家协作真愉快！`;
                document.getElementById('unlock-modal').classList.add('active');
            }, 500);
        }

        chain.tasks.forEach(t => {
            if (t.assigned_to) {
                if (!this.personalContributions[t.assigned_to]) {
                    this.personalContributions[t.assigned_to] = {
                        tasks_completed: 0,
                        task_types: {}
                    };
                }
                if (t.status === 'completed') {
                    this.personalContributions[t.assigned_to].tasks_completed++;
                    if (!this.personalContributions[t.assigned_to].task_types[t.type]) {
                        this.personalContributions[t.assigned_to].task_types[t.type] = 0;
                    }
                    this.personalContributions[t.assigned_to].task_types[t.type]++;
                }
            }
        });

        this.saveToLocalStorage();
        this.renderTaskStats();
        this.renderActiveTaskChains();
        this.renderTaskChainHistory();
    }

    renderAchievements() {
        const allAchievements = window.API.getAchievements();
        const container = document.getElementById('family-achievements-grid');

        const rarityColors = {
            '普通': 'var(--text-secondary)',
            '稀有': 'var(--secondary-color)',
            '史诗': 'var(--accent-purple)',
            '传说': 'var(--accent-orange)'
        };

        const rarityBorders = {
            '普通': '2px solid var(--border-color)',
            '稀有': '2px solid var(--secondary-color)',
            '史诗': '2px solid var(--accent-purple)',
            '传说': '2px solid var(--accent-orange)'
        };

        container.innerHTML = allAchievements.map(achievement => {
            const isEarned = this.earnedAchievements.includes(achievement.id);
            
            return `
                <div class="achievement-card ${isEarned ? 'earned' : 'locked'}" 
                     data-achievement-id="${achievement.id}"
                     style="border: ${rarityBorders[achievement.rarity]}">
                    <div class="achievement-icon-wrapper">
                        <span class="achievement-icon">${achievement.icon}</span>
                        ${!isEarned ? '<span class="achievement-lock">🔒</span>' : ''}
                    </div>
                    <div class="achievement-info">
                        <span class="achievement-name">${achievement.name}</span>
                        <span class="achievement-desc">${achievement.description}</span>
                    </div>
                    <div class="achievement-rarity" style="color: ${rarityColors[achievement.rarity]}">
                        ${achievement.rarity}
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.achievement-card').forEach(card => {
            card.addEventListener('click', () => {
                const achievementId = card.dataset.achievementId;
                this.openAchievementDetail(achievementId);
            });
        });
    }

    renderContributionRanking() {
        const container = document.getElementById('contribution-ranking');
        
        const contributions = [];
        
        this.familyMembers.forEach(member => {
            const personalData = this.personalContributions[member.name] || { tasks_completed: 0 };
            contributions.push({
                name: member.name,
                icon: member.icon,
                assignment_count: member.assignment_count,
                tasks_completed: personalData.tasks_completed,
                total: member.assignment_count + personalData.tasks_completed
            });
        });

        contributions.sort((a, b) => b.total - a.total);

        if (contributions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">👥</div>
                    <p>还没有贡献数据</p>
                    <p class="empty-hint">添加家庭成员并开始点单吧！</p>
                </div>
            `;
            return;
        }

        const medals = ['🥇', '🥈', '🥉'];

        container.innerHTML = contributions.map((member, index) => `
            <div class="contribution-rank-item ${index < 3 ? 'top-three' : ''}">
                <span class="rank-number">${medals[index] || (index + 1)}</span>
                <span class="rank-icon">${member.icon}</span>
                <span class="rank-name">${member.name}</span>
                <div class="rank-stats">
                    <span class="rank-stat">指派: ${member.assignment_count}</span>
                    <span class="rank-stat">任务: ${member.tasks_completed}</span>
                </div>
                <span class="rank-total">${member.total} 分</span>
            </div>
        `).join('');
    }

    updateAchievementStats() {
        document.getElementById('family-total-orders').textContent = this.progress.total_orders;
        document.getElementById('family-unlocked-categories').textContent = this.progress.unlocked_categories.length;
        document.getElementById('family-achievements').textContent = this.earnedAchievements.length;
        document.getElementById('family-streak').textContent = this.streakDays;
    }

    openAchievementDetail(achievementId) {
        const allAchievements = window.API.getAchievements();
        const achievement = allAchievements.find(a => a.id === achievementId);
        
        if (!achievement) return;

        const isEarned = this.earnedAchievements.includes(achievementId);

        const rarityColors = {
            '普通': 'var(--text-secondary)',
            '稀有': 'var(--secondary-color)',
            '史诗': 'var(--accent-purple)',
            '传说': 'var(--accent-orange)'
        };

        document.getElementById('achievement-detail-title').textContent = achievement.name;
        document.getElementById('achievement-detail-body').innerHTML = `
            <div class="achievement-detail-info">
                <div class="achievement-detail-icon ${isEarned ? '' : 'locked'}">
                    ${achievement.icon}
                </div>
                <p class="achievement-detail-desc">${achievement.description}</p>
                
                <div class="achievement-detail-stats">
                    <div class="achievement-detail-stat">
                        <span class="achievement-detail-stat-label">稀有度</span>
                        <span class="achievement-detail-stat-value" style="color: ${rarityColors[achievement.rarity]}">
                            ${achievement.rarity}
                        </span>
                    </div>
                    <div class="achievement-detail-stat">
                        <span class="achievement-detail-stat-label">分类</span>
                        <span class="achievement-detail-stat-value">${this.getAchievementCategoryName(achievement.category)}</span>
                    </div>
                    <div class="achievement-detail-stat">
                        <span class="achievement-detail-stat-label">状态</span>
                        <span class="achievement-detail-stat-value ${isEarned ? 'earned' : 'locked'}">
                            ${isEarned ? '✓ 已获得' : '🔒 未获得'}
                        </span>
                    </div>
                </div>
                
                ${!isEarned ? `
                    <div class="achievement-hint">
                        <p>💡 提示: ${this.getAchievementHint(achievement)}</p>
                    </div>
                ` : ''}
            </div>
        `;

        document.getElementById('achievement-detail-modal').classList.add('active');
    }

    getAchievementCategoryName(category) {
        const categoryNames = {
            'order': '订单成就',
            'unlock': '解锁成就',
            'challenge': '挑战成就',
            'collaboration': '协作成就',
            'streak': '连续成就'
        };
        return categoryNames[category] || '其他';
    }

    getAchievementHint(achievement) {
        const hints = {
            'first_order': '完成第一笔订单即可获得',
            'order_10': '完成10笔订单即可获得',
            'order_50': '完成50笔订单即可获得',
            'order_100': '完成100笔订单即可获得',
            'unlock_milk_tea': '解锁奶茶系列即可获得',
            'unlock_fruit_tea': '解锁果茶系列即可获得',
            'unlock_coffee': '解锁咖啡系列即可获得',
            'unlock_all': '解锁所有饮品系列即可获得',
            'challenge_milk_tea': '完成奶茶狂欢日挑战即可获得',
            'challenge_fruit_tea': '完成果茶清新日挑战即可获得',
            'challenge_coffee': '完成咖啡时光日挑战即可获得',
            'challenge_mixed': '完成混合挑战日挑战即可获得',
            'collaboration_first': '完成第一次协作任务链即可获得',
            'collaboration_10': '完成10次协作任务链即可获得',
            'collaboration_fast': '在5分钟内完成一次协作任务链即可获得',
            'streak_7': '连续7天有点单记录即可获得',
            'streak_30': '连续30天有点单记录即可获得'
        };
        return hints[achievement.id] || '继续努力吧！';
    }

    generateAchievementReceipt() {
        const receiptContainer = document.getElementById('achievement-receipt-container');
        
        const totalOrders = this.progress.total_orders;
        const unlockedCategories = this.progress.unlocked_categories.length;
        const earnedAchievements = this.earnedAchievements.length;
        const totalAchievements = window.API.getAchievements().length;
        const streakDays = this.streakDays;
        const totalCollaborations = this.taskChainHistory.filter(t => t.status === 'completed').length;

        const recentAchievements = window.API.getAchievements()
            .filter(a => this.earnedAchievements.includes(a.id))
            .slice(0, 5);

        receiptContainer.innerHTML = `
            <div class="receipt-header">
                <div class="receipt-logo">🏆</div>
                <div class="receipt-title">Bapoo MixPlay</div>
                <div class="receipt-subtitle">家庭成就报告</div>
            </div>
            
            <div class="receipt-order-info">
                <div class="receipt-row">
                    <span class="receipt-label">生成时间</span>
                    <span>${new Date().toLocaleString('zh-CN')}</span>
                </div>
            </div>

            <div class="receipt-items">
                <div class="receipt-item-name">📊 家庭统计</div>
                <div class="receipt-item-specs">累计点单: ${totalOrders} 单</div>
                <div class="receipt-item-specs">解锁品类: ${unlockedCategories} 个</div>
                <div class="receipt-item-specs">获得成就: ${earnedAchievements}/${totalAchievements}</div>
                <div class="receipt-item-specs">连续天数: ${streakDays} 天</div>
                <div class="receipt-item-specs">协作完成: ${totalCollaborations} 次</div>
            </div>

            ${recentAchievements.length > 0 ? `
                <div class="receipt-items">
                    <div class="receipt-item-name">🎖️ 近期成就</div>
                    ${recentAchievements.map(a => `
                        <div class="receipt-item-specs">${a.icon} ${a.name}</div>
                    `).join('')}
                </div>
            ` : ''}

            <div class="receipt-total">
                <span>成就进度</span>
                <span>${Math.round((earnedAchievements / totalAchievements) * 100)}%</span>
            </div>

            <div class="receipt-assignment">
                <div class="assignment-title">✨ 继续加油</div>
                <div class="assignment-message">
                    ${earnedAchievements >= totalAchievements 
                        ? '太棒了！你已经收集了所有成就！' 
                        : `还有 ${totalAchievements - earnedAchievements} 个成就等待解锁！`
                    }
                </div>
            </div>

            <div class="receipt-footer">
                <div class="receipt-thanks">感谢使用 Bapoo MixPlay！</div>
                <div class="receipt-time">让每一杯饮品都充满爱与欢笑 💕</div>
            </div>
        `;

        document.getElementById('achievement-receipt-modal').classList.add('active');
    }

    checkAchievements() {
        const allAchievements = window.API.getAchievements();

        allAchievements.forEach(achievement => {
            if (this.earnedAchievements.includes(achievement.id)) return;

            let earned = false;

            switch (achievement.category) {
                case 'order':
                    if (typeof achievement.target === 'number') {
                        earned = this.progress.total_orders >= achievement.target;
                    }
                    break;

                case 'unlock':
                    if (achievement.target === 'all') {
                        const allCategories = ['基础饮品', '奶茶系列', '果茶系列', '咖啡系列', '特调系列'];
                        earned = allCategories.every(cat => this.progress.unlocked_categories.includes(cat));
                    } else {
                        earned = this.progress.unlocked_categories.includes(achievement.target);
                    }
                    break;

                case 'collaboration':
                    if (achievement.id === 'collaboration_first') {
                        const completed = this.taskChainHistory.filter(t => t.status === 'completed').length;
                        earned = completed >= 1;
                    } else if (achievement.id === 'collaboration_10') {
                        const completed = this.taskChainHistory.filter(t => t.status === 'completed').length;
                        earned = completed >= 10;
                    }
                    break;

                case 'streak':
                    if (typeof achievement.target === 'number') {
                        earned = this.streakDays >= achievement.target;
                    }
                    break;
            }

            if (earned) {
                this.earnedAchievements.push(achievement.id);
                
                setTimeout(() => {
                    document.getElementById('unlock-message').textContent = 
                        `🎉 恭喜获得成就！\n\n${achievement.icon} ${achievement.name}\n${achievement.description}`;
                    document.getElementById('unlock-modal').classList.add('active');
                }, 300);
            }
        });

        this.saveToLocalStorage();
    }

    updateStreak() {
        const today = new Date().toDateString();
        
        if (!this.lastOrderDate) {
            this.streakDays = 1;
        } else {
            const lastDate = new Date(this.lastOrderDate);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastDate.toDateString() === yesterday.toDateString()) {
                this.streakDays++;
            } else if (lastDate.toDateString() !== today) {
                this.streakDays = 1;
            }
        }
        
        this.lastOrderDate = today;
        this.saveToLocalStorage();
    }

    async placeOrder() {
        if (!this.selectedDrink) return;
        if (this.familyMembers.length === 0) {
            alert('请先添加家庭成员！');
            return;
        }

        if (this.currentChallenge) {
            if (!this.checkChallengeOrder(this.selectedDrink.category)) {
                return;
            }
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
        this.updateStreak();
        this.checkUnlocks();
        this.checkAchievements();

        this.saveToLocalStorage();

        document.getElementById('drink-modal').classList.remove('active');
        this.showReceipt(order, assignedMember);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new MixPlayApp();
});
