/* ========================================
   DASHBOARD SYSTEM
======================================== */

class DashboardSystem {
    constructor() {
        this.currentUser = null;
        this.selectedMood = null;
        this.init();
    }

    init() {
        // Check authentication
        if (!this.isLoggedIn()) {
            window.location.href = '../auth/login.html';
            return;
        }

        this.currentUser = this.getCurrentUser();
        this.setupEventListeners();
        this.loadDashboard();
    }

    setupEventListeners() {
        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    loadDashboard() {
        const dashboardContent = document.getElementById('dashboardContent');
        const userGreeting = document.getElementById('userGreeting');

        if (userGreeting) {
            userGreeting.textContent = `Hello, ${this.currentUser.name}!`;
        }

        if (dashboardContent) {
            dashboardContent.innerHTML = this.getDashboardHTML();
            this.initializeCharts();
            this.loadRecentEntries();
        }
    }

    getDashboardHTML() {
        const user = this.currentUser;
        const todaysMood = this.getTodaysMood();
        const weeklyAverage = this.getWeeklyMoodAverage();
        const monthlyAverage = this.getMonthlyMoodAverage();

        return `
            <div class="dashboard-header">
                <h1 class="design_text">Welcome back, ${user.name}!</h1>
                <div class="dashboard-actions">
                    <button onclick="dashboardSystem.showQuickMoodEntry()" class="quick-mood-btn">
                        ${todaysMood ? '😊 Update Mood' : '📊 Log Mood'}
                    </button>
                </div>
            </div>

            <!-- Mental Health Overview -->
            <div class="mental-health-overview">
                <h2 class="section-title">Mental Health Overview</h2>
                <div class="overview-stats">
                    <div class="stat-card mood-today">
                        <div class="stat-icon">😊</div>
                        <div class="stat-info">
                            <h3>Today's Mood</h3>
                            <span class="stat-value">${todaysMood ? this.getMoodText(todaysMood.mood) : 'Not logged'}</span>
                        </div>
                    </div>
                    <div class="stat-card mood-week">
                        <div class="stat-icon">📈</div>
                        <div class="stat-info">
                            <h3>Weekly Average</h3>
                            <span class="stat-value">${weeklyAverage ? this.getMoodText(Math.round(weeklyAverage)) : 'No data'}</span>
                        </div>
                    </div>
                    <div class="stat-card mood-month">
                        <div class="stat-icon">📊</div>
                        <div class="stat-info">
                            <h3>Monthly Average</h3>
                            <span class="stat-value">${monthlyAverage ? this.getMoodText(Math.round(monthlyAverage)) : 'No data'}</span>
                        </div>
                    </div>
                    <div class="stat-card streak">
                        <div class="stat-icon">🔥</div>
                        <div class="stat-info">
                            <h3>Tracking Streak</h3>
                            <span class="stat-value">${this.getTrackingStreak()} days</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Mood Chart -->
            <div class="chart-section">
                <h3>Mood Trends (Last 30 Days)</h3>
                <div class="chart-container">
                    <canvas id="moodChart" width="400" height="200"></canvas>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions">
                <h3>Quick Actions</h3>
                <div class="actions-grid">
                    <div class="action-card" onclick="dashboardSystem.showMoodTracker()">
                        <div class="action-icon">📊</div>
                        <h4>Detailed Mood Entry</h4>
                        <p>Log your mood with notes and context</p>
                    </div>
                    <div class="action-card" onclick="dashboardSystem.showJournalEntry()">
                        <div class="action-icon">📝</div>
                        <h4>Journal Entry</h4>
                        <p>Write about your thoughts and feelings</p>
                    </div>
                    <div class="action-card" onclick="dashboardSystem.showGoalsTracker()">
                        <div class="action-icon">🎯</div>
                        <h4>Wellness Goals</h4>
                        <p>Set and track your mental health goals</p>
                    </div>
                    <div class="action-card" onclick="dashboardSystem.showResourcesModal()">
                        <div class="action-icon">📚</div>
                        <h4>Resources</h4>
                        <p>Access mental health resources and tools</p>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="recent-activity">
                <h3>Recent Activity</h3>
                <div id="recentEntries" class="activity-list">
                    <!-- Will be populated by JavaScript -->
                </div>
            </div>

            <!-- Modals -->
            ${this.getModalsHTML()}
        `;
    }

    getModalsHTML() {
        return `
            <!-- Quick Mood Entry Modal -->
            <div id="quickMoodModal" class="modal" style="display: none;">
                <div class="modal-content quick-mood-modal">
                    <span class="close" onclick="dashboardSystem.closeModal('quickMoodModal')">&times;</span>
                    <h3>How are you feeling right now?</h3>
                    <div class="mood-options quick-mood">
                        <button class="mood-btn" data-mood="5" onclick="dashboardSystem.quickMoodSelect(5)">
                            <span class="mood-emoji">😊</span>
                            <span class="mood-label">Great</span>
                        </button>
                        <button class="mood-btn" data-mood="4" onclick="dashboardSystem.quickMoodSelect(4)">
                            <span class="mood-emoji">🙂</span>
                            <span class="mood-label">Good</span>
                        </button>
                        <button class="mood-btn" data-mood="3" onclick="dashboardSystem.quickMoodSelect(3)">
                            <span class="mood-emoji">😐</span>
                            <span class="mood-label">Okay</span>
                        </button>
                        <button class="mood-btn" data-mood="2" onclick="dashboardSystem.quickMoodSelect(2)">
                            <span class="mood-emoji">😔</span>
                            <span class="mood-label">Not Great</span>
                        </button>
                        <button class="mood-btn" data-mood="1" onclick="dashboardSystem.quickMoodSelect(1)">
                            <span class="mood-emoji">😢</span>
                            <span class="mood-label">Poor</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Detailed Mood Tracker Modal -->
            <div id="moodModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <span class="close" onclick="dashboardSystem.closeModal('moodModal')">&times;</span>
                    <h3>Detailed Mood Entry</h3>
                    
                    <div class="mood-entry-form">
                        <div class="form-section">
                            <label>How are you feeling?</label>
                            <div class="mood-options">
                                <button class="mood-btn" data-mood="5" onclick="dashboardSystem.selectMood(5)">😊 Great</button>
                                <button class="mood-btn" data-mood="4" onclick="dashboardSystem.selectMood(4)">🙂 Good</button>
                                <button class="mood-btn" data-mood="3" onclick="dashboardSystem.selectMood(3)">😐 Okay</button>
                                <button class="mood-btn" data-mood="2" onclick="dashboardSystem.selectMood(2)">😔 Not Great</button>
                                <button class="mood-btn" data-mood="1" onclick="dashboardSystem.selectMood(1)">😢 Poor</button>
                            </div>
                        </div>

                        <div class="form-section">
                            <label>Energy Level (1-10)</label>
                            <input type="range" id="energyLevel" min="1" max="10" value="5" class="slider">
                            <span id="energyValue">5</span>
                        </div>

                        <div class="form-section">
                            <label>Sleep Quality (1-10)</label>
                            <input type="range" id="sleepQuality" min="1" max="10" value="5" class="slider">
                            <span id="sleepValue">5</span>
                        </div>

                        <div class="form-section">
                            <label>Activities Today</label>
                            <div class="activity-tags">
                                <button type="button" class="tag-btn" data-activity="exercise">Exercise</button>
                                <button type="button" class="tag-btn" data-activity="social">Social</button>
                                <button type="button" class="tag-btn" data-activity="work">Work</button>
                                <button type="button" class="tag-btn" data-activity="relaxation">Relaxation</button>
                                <button type="button" class="tag-btn" data-activity="outdoor">Outdoor</button>
                                <button type="button" class="tag-btn" data-activity="creative">Creative</button>
                            </div>
                        </div>

                        <div class="form-section">
                            <label for="moodNotes">Notes (Optional)</label>
                            <textarea id="moodNotes" placeholder="What's on your mind? Any thoughts or events that influenced your mood today?"></textarea>
                        </div>

                        <button onclick="dashboardSystem.saveMoodEntry()" class="submit-btn">Save Entry</button>
                    </div>
                </div>
            </div>

            <!-- Journal Entry Modal -->
            <div id="journalModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <span class="close" onclick="dashboardSystem.closeModal('journalModal')">&times;</span>
                    <h3>Journal Entry</h3>
                    
                    <div class="journal-form">
                        <div class="form-section">
                            <label for="journalTitle">Title (Optional)</label>
                            <input type="text" id="journalTitle" placeholder="Give your entry a title...">
                        </div>
                        
                        <div class="form-section">
                            <label for="journalContent">What's on your mind?</label>
                            <textarea id="journalContent" rows="8" placeholder="Write about your thoughts, feelings, experiences, or anything else you'd like to reflect on..."></textarea>
                        </div>
                        
                        <div class="form-section">
                            <label>Mood while writing</label>
                            <div class="mood-options small">
                                <button class="mood-btn small" data-journal-mood="5">😊</button>
                                <button class="mood-btn small" data-journal-mood="4">🙂</button>
                                <button class="mood-btn small" data-journal-mood="3">😐</button>
                                <button class="mood-btn small" data-journal-mood="2">😔</button>
                                <button class="mood-btn small" data-journal-mood="1">😢</button>
                            </div>
                        </div>
                        
                        <button onclick="dashboardSystem.saveJournalEntry()" class="submit-btn">Save Journal Entry</button>
                    </div>
                </div>
            </div>

            <!-- Goals Tracker Modal -->
            <div id="goalsModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <span class="close" onclick="dashboardSystem.closeModal('goalsModal')">&times;</span>
                    <h3>Wellness Goals</h3>
                    
                    <div class="goals-container">
                        <div class="add-goal-section">
                            <h4>Add New Goal</h4>
                            <input type="text" id="newGoalText" placeholder="Enter your wellness goal...">
                            <select id="goalCategory">
                                <option value="mood">Mood</option>
                                <option value="exercise">Exercise</option>
                                <option value="sleep">Sleep</option>
                                <option value="social">Social</option>
                                <option value="mindfulness">Mindfulness</option>
                                <option value="other">Other</option>
                            </select>
                            <button onclick="dashboardSystem.addGoal()" class="add-btn">Add Goal</button>
                        </div>
                        
                        <div class="goals-list" id="goalsList">
                            <!-- Goals will be populated here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resources Modal -->
            <div id="resourcesModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <span class="close" onclick="dashboardSystem.closeModal('resourcesModal')">&times;</span>
                    <h3>Mental Health Resources</h3>
                    
                    <div class="resources-grid">
                        <div class="resource-card">
                            <h4>🆘 Crisis Support</h4>
                            <p>Mental Health Crisis Line: <strong>14416</strong></p>
                            <p>National Suicide Prevention: <strong>988</strong></p>
                            <button onclick="dashboardSystem.showCrisisSupport()" class="resource-btn emergency">Get Help Now</button>
                        </div>
                        
                        <div class="resource-card">
                            <h4>🧘 Mindfulness</h4>
                            <p>Guided meditation and breathing exercises</p>
                            <button onclick="dashboardSystem.startMindfulness()" class="resource-btn">Start Session</button>
                        </div>
                        
                        <div class="resource-card">
                            <h4>💡 Daily Tips</h4>
                            <p>Mental health tips and coping strategies</p>
                            <button onclick="dashboardSystem.getDailyTip()" class="resource-btn">Get Tip</button>
                        </div>
                        
                        <div class="resource-card">
                            <h4>📞 Professional Help</h4>
                            <p>Find therapists and counselors in your area</p>
                            <button onclick="dashboardSystem.findProfessionals()" class="resource-btn">Find Help</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Mood tracking methods
    showQuickMoodEntry() {
        document.getElementById('quickMoodModal').style.display = 'block';
    }

    quickMoodSelect(mood) {
        const moodEntry = {
            mood: mood,
            energy: 5,
            sleep: 5,
            activities: [],
            notes: '',
            date: new Date().toISOString(),
            type: 'quick'
        };

        this.saveMoodData(moodEntry);
        this.closeModal('quickMoodModal');
        this.showSuccessMessage(`Mood logged: ${this.getMoodText(mood)}`);
        this.loadDashboard();
    }

    showMoodTracker() {
        document.getElementById('moodModal').style.display = 'block';
        this.setupSliders();
        this.setupActivityTags();
    }

    selectMood(mood) {
        this.selectedMood = mood;
        document.querySelectorAll('#moodModal .mood-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`#moodModal [data-mood="${mood}"]`).classList.add('selected');
    }

    setupSliders() {
        const energySlider = document.getElementById('energyLevel');
        const sleepSlider = document.getElementById('sleepQuality');
        const energyValue = document.getElementById('energyValue');
        const sleepValue = document.getElementById('sleepValue');

        energySlider.addEventListener('input', () => {
            energyValue.textContent = energySlider.value;
        });

        sleepSlider.addEventListener('input', () => {
            sleepValue.textContent = sleepSlider.value;
        });
    }

    setupActivityTags() {
        document.querySelectorAll('.tag-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('selected');
            });
        });
    }

    saveMoodEntry() {
        if (!this.selectedMood) {
            alert('Please select a mood level');
            return;
        }

        const selectedActivities = Array.from(document.querySelectorAll('.tag-btn.selected'))
            .map(btn => btn.dataset.activity);

        const moodEntry = {
            mood: this.selectedMood,
            energy: parseInt(document.getElementById('energyLevel').value),
            sleep: parseInt(document.getElementById('sleepQuality').value),
            activities: selectedActivities,
            notes: document.getElementById('moodNotes').value,
            date: new Date().toISOString(),
            type: 'detailed'
        };

        this.saveMoodData(moodEntry);
        this.closeModal('moodModal');
        this.showSuccessMessage('Detailed mood entry saved!');
        this.loadDashboard();
    }

    saveMoodData(moodEntry) {
        const users = JSON.parse(localStorage.getItem('mindbridge_users') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex !== -1) {
            if (!users[userIndex].moodEntries) {
                users[userIndex].moodEntries = [];
            }
            
            // Remove any existing entry for today if this is an update
            const today = new Date().toDateString();
            users[userIndex].moodEntries = users[userIndex].moodEntries.filter(entry => 
                new Date(entry.date).toDateString() !== today
            );
            
            users[userIndex].moodEntries.push(moodEntry);
            localStorage.setItem('mindbridge_users', JSON.stringify(users));
            
            // Update current user
            this.currentUser = users[userIndex];
            localStorage.setItem('mindbridge_current_user', JSON.stringify(this.currentUser));
        }
    }

    // Journal methods
    showJournalEntry() {
        document.getElementById('journalModal').style.display = 'block';
        this.setupJournalMoodButtons();
    }

    setupJournalMoodButtons() {
        document.querySelectorAll('[data-journal-mood]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-journal-mood]').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
    }

    saveJournalEntry() {
        const title = document.getElementById('journalTitle').value;
        const content = document.getElementById('journalContent').value;
        const selectedMoodBtn = document.querySelector('[data-journal-mood].selected');
        const mood = selectedMoodBtn ? parseInt(selectedMoodBtn.dataset.journalMood) : null;

        if (!content.trim()) {
            alert('Please write something in your journal entry');
            return;
        }

        const journalEntry = {
            title: title || `Journal Entry - ${new Date().toLocaleDateString()}`,
            content: content,
            mood: mood,
            date: new Date().toISOString()
        };

        this.saveJournalData(journalEntry);
        this.closeModal('journalModal');
        this.showSuccessMessage('Journal entry saved!');
        this.loadDashboard();
    }

    saveJournalData(journalEntry) {
        const users = JSON.parse(localStorage.getItem('mindbridge_users') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex !== -1) {
            if (!users[userIndex].journalEntries) {
                users[userIndex].journalEntries = [];
            }
            
            users[userIndex].journalEntries.push(journalEntry);
            localStorage.setItem('mindbridge_users', JSON.stringify(users));
            
            // Update current user
            this.currentUser = users[userIndex];
            localStorage.setItem('mindbridge_current_user', JSON.stringify(this.currentUser));
        }
    }

    // Goals methods
    showGoalsTracker() {
        document.getElementById('goalsModal').style.display = 'block';
        this.loadGoals();
    }

    loadGoals() {
        const goalsList = document.getElementById('goalsList');
        const goals = this.currentUser.goals || [];
        
        goalsList.innerHTML = goals.map(goal => `
            <div class="goal-item ${goal.completed ? 'completed' : ''}">
                <div class="goal-content">
                    <span class="goal-category">${goal.category}</span>
                    <span class="goal-text">${goal.text}</span>
                    <span class="goal-date">${new Date(goal.date).toLocaleDateString()}</span>
                </div>
                <div class="goal-actions">
                    <button onclick="dashboardSystem.toggleGoal('${goal.id}')" class="toggle-btn">
                        ${goal.completed ? '✓' : '○'}
                    </button>
                    <button onclick="dashboardSystem.deleteGoal('${goal.id}')" class="delete-btn">×</button>
                </div>
            </div>
        `).join('');
    }

    addGoal() {
        const goalText = document.getElementById('newGoalText').value;
        const category = document.getElementById('goalCategory').value;
        
        if (!goalText.trim()) {
            alert('Please enter a goal');
            return;
        }

        const goal = {
            id: Date.now().toString(),
            text: goalText,
            category: category,
            completed: false,
            date: new Date().toISOString()
        };

        this.saveGoalData(goal);
        document.getElementById('newGoalText').value = '';
        this.loadGoals();
    }

    toggleGoal(goalId) {
        const users = JSON.parse(localStorage.getItem('mindbridge_users') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex !== -1) {
            const goals = users[userIndex].goals || [];
            const goalIndex = goals.findIndex(g => g.id === goalId);
            
            if (goalIndex !== -1) {
                goals[goalIndex].completed = !goals[goalIndex].completed;
                goals[goalIndex].completedDate = goals[goalIndex].completed ? new Date().toISOString() : null;
                
                users[userIndex].goals = goals;
                localStorage.setItem('mindbridge_users', JSON.stringify(users));
                this.currentUser = users[userIndex];
                localStorage.setItem('mindbridge_current_user', JSON.stringify(this.currentUser));
                
                this.loadGoals();
            }
        }
    }

    deleteGoal(goalId) {
        if (confirm('Are you sure you want to delete this goal?')) {
            const users = JSON.parse(localStorage.getItem('mindbridge_users') || '[]');
            const userIndex = users.findIndex(u => u.id === this.currentUser.id);
            
            if (userIndex !== -1) {
                users[userIndex].goals = (users[userIndex].goals || []).filter(g => g.id !== goalId);
                localStorage.setItem('mindbridge_users', JSON.stringify(users));
                this.currentUser = users[userIndex];
                localStorage.setItem('mindbridge_current_user', JSON.stringify(this.currentUser));
                
                this.loadGoals();
            }
        }
    }

    saveGoalData(goal) {
        const users = JSON.parse(localStorage.getItem('mindbridge_users') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex !== -1) {
            if (!users[userIndex].goals) {
                users[userIndex].goals = [];
            }
            
            users[userIndex].goals.push(goal);
            localStorage.setItem('mindbridge_users', JSON.stringify(users));
            
            this.currentUser = users[userIndex];
            localStorage.setItem('mindbridge_current_user', JSON.stringify(this.currentUser));
        }
    }

    // Chart initialization
    initializeCharts() {
        this.createMoodChart();
    }

    createMoodChart() {
        const canvas = document.getElementById('moodChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const moodData = this.getMoodChartData();

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Simple line chart implementation
        this.drawMoodChart(ctx, moodData, canvas.width, canvas.height);
    }

    getMoodChartData() {
        const moodEntries = this.currentUser.moodEntries || [];
        const last30Days = [];
        const today = new Date();

        // Generate last 30 days
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            
            const entry = moodEntries.find(e => new Date(e.date).toDateString() === dateStr);
            last30Days.push({
                date: date,
                mood: entry ? entry.mood : null
            });
        }

        return last30Days;
    }

    drawMoodChart(ctx, data, width, height) {
        const padding = 40;
        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);

        // Draw axes
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Draw mood line
        ctx.strokeStyle = '#c61919';
        ctx.lineWidth = 2;
        ctx.beginPath();

        let firstPoint = true;
        data.forEach((point, index) => {
            if (point.mood !== null) {
                const x = padding + (index / (data.length - 1)) * chartWidth;
                const y = height - padding - ((point.mood - 1) / 4) * chartHeight;

                if (firstPoint) {
                    ctx.moveTo(x, y);
                    firstPoint = false;
                } else {
                    ctx.lineTo(x, y);
                }

                // Draw point
                ctx.fillStyle = '#c61919';
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fill();
            }
        });

        ctx.stroke();

        // Draw labels
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';

        // Y-axis labels
        for (let i = 1; i <= 5; i++) {
            const y = height - padding - ((i - 1) / 4) * chartHeight;
            ctx.fillText(this.getMoodText(i), padding - 20, y + 3);
        }
    }

    // Utility methods
    getTodaysMood() {
        const moodEntries = this.currentUser.moodEntries || [];
        const today = new Date().toDateString();
        return moodEntries.find(entry => new Date(entry.date).toDateString() === today);
    }

    getWeeklyMoodAverage() {
        const moodEntries = this.currentUser.moodEntries || [];
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const weekEntries = moodEntries.filter(entry => new Date(entry.date) >= weekAgo);
        if (weekEntries.length === 0) return null;

        const sum = weekEntries.reduce((acc, entry) => acc + entry.mood, 0);
        return sum / weekEntries.length;
    }

    getMonthlyMoodAverage() {
        const moodEntries = this.currentUser.moodEntries || [];
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);

        const monthEntries = moodEntries.filter(entry => new Date(entry.date) >= monthAgo);
        if (monthEntries.length === 0) return null;

        const sum = monthEntries.reduce((acc, entry) => acc + entry.mood, 0);
        return sum / monthEntries.length;
    }

    getTrackingStreak() {
        const moodEntries = this.currentUser.moodEntries || [];
        if (moodEntries.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toDateString();
            
            const hasEntry = moodEntries.some(entry => 
                new Date(entry.date).toDateString() === dateStr
            );
            
            if (hasEntry) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    getMoodText(mood) {
        const moodTexts = {
            1: 'Poor',
            2: 'Not Great',
            3: 'Okay',
            4: 'Good',
            5: 'Great'
        };
        return moodTexts[mood] || 'Unknown';
    }

    getMoodEmoji(mood) {
        const moodEmojis = {
            1: '😢',
            2: '😔',
            3: '😐',
            4: '🙂',
            5: '😊'
        };
        return moodEmojis[mood] || '😐';
    }

    loadRecentEntries() {
        const recentEntries = document.getElementById('recentEntries');
        const allEntries = [
            ...(this.currentUser.moodEntries || []).map(entry => ({...entry, type: 'mood'})),
            ...(this.currentUser.journalEntries || []).map(entry => ({...entry, type: 'journal'})),
            ...(this.currentUser.goals || []).filter(g => g.completed && g.completedDate).map(goal => ({...goal, type: 'goal', date: goal.completedDate}))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

        recentEntries.innerHTML = allEntries.map(entry => {
            switch (entry.type) {
                case 'mood':
                    return `
                        <div class="activity-item">
                            <span class="activity-icon">${this.getMoodEmoji(entry.mood)}</span>
                            <div class="activity-content">
                                <span class="activity-title">Mood: ${this.getMoodText(entry.mood)}</span>
                                <span class="activity-date">${new Date(entry.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    `;
                case 'journal':
                    return `
                        <div class="activity-item">
                            <span class="activity-icon">📝</span>
                            <div class="activity-content">
                                <span class="activity-title">Journal: ${entry.title}</span>
                                <span class="activity-date">${new Date(entry.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    `;
                case 'goal':
                    return `
                        <div class="activity-item">
                            <span class="activity-icon">✅</span>
                            <div class="activity-content">
                                <span class="activity-title">Completed: ${entry.text}</span>
                                <span class="activity-date">${new Date(entry.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    `;
                default:
                    return '';
            }
        }).join('') || '<div class="activity-item"><span class="activity-content">No recent activity</span></div>';
    }

    // Resource methods
    showResourcesModal() {
        document.getElementById('resourcesModal').style.display = 'block';
    }

    showCrisisSupport() {
        alert('Crisis Support Resources:\n\n' +
              'Mental Health Crisis Line: 14416\n' +
              'National Suicide Prevention Lifeline: 988\n' +
              'Crisis Text Line: Text HOME to 741741\n\n' +
              'If you are in immediate danger, please call 100.\n\n' +
              'Remember: You are not alone, and help is available 24/7.');
    }

    startMindfulness() {
        alert('Starting guided mindfulness session...\n\n' +
              'Find a comfortable position and close your eyes.\n' +
              'Take a deep breath in for 4 counts...\n' +
              'Hold for 4 counts...\n' +
              'Exhale for 4 counts...\n\n' +
              'Repeat this cycle and focus on your breathing.');
    }

    getDailyTip() {
        const tips = [
            "Take 5 deep breaths when feeling overwhelmed",
            "Practice gratitude by listing 3 things you're thankful for",
            "Take a 10-minute walk to boost your mood",
            "Connect with a friend or family member today",
            "Try a short meditation or mindfulness exercise",
            "Write down your thoughts and feelings",
            "Listen to music that makes you feel good",
            "Do something creative, even for just 5 minutes",
            "Drink water and eat nutritious foods",
            "Get some sunlight and fresh air"
        ];
        
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        alert(`💡 Daily Mental Health Tip:\n\n${randomTip}`);
    }

    findProfessionals() {
        alert('Professional Help Resources:\n\n' +
              '• Psychology Today: Find therapists in your area\n' +
              '• SAMHSA Treatment Locator: samhsa.gov\n' +
              '• Your insurance provider\'s website\n' +
              '• Ask your primary care doctor for referrals\n' +
              '• Employee Assistance Programs (EAP) if available\n\n' +
              'Remember: Seeking professional help is a sign of strength.');
    }

    // Modal management
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        this.selectedMood = null;
        
        // Reset forms
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelectorAll('input, textarea').forEach(input => {
            if (input.type !== 'range') input.value = '';
        });
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        this.selectedMood = null;
    }

    // Authentication methods
    isLoggedIn() {
        const session = localStorage.getItem('mindbridge_session') || 
                       sessionStorage.getItem('mindbridge_session') ||
                       localStorage.getItem('mindbridge_current_user');
        return !!session;
    }

    getCurrentUser() {
        let userStr = localStorage.getItem('mindbridge_session') || 
                      sessionStorage.getItem('mindbridge_session');
        
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                console.error('Error parsing session data');
            }
        }
        
        userStr = localStorage.getItem('mindbridge_current_user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                console.error('Error parsing user data');
            }
        }
        
        return null;
    }

    logout() {
        localStorage.removeItem('mindbridge_session');
        sessionStorage.removeItem('mindbridge_session');
        localStorage.removeItem('mindbridge_current_user');
        window.location.href = '../index.html';
    }

    showSuccessMessage(message) {
        // Create and show success message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            z-index: 10001;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// Initialize dashboard system
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardSystem = new DashboardSystem();
});
