/**
 * Personality Quiz - Enhanced Version
 * Modern, accessible, and maintainable quiz system with contemporary button designs
 */

class PersonalityQuiz {
    constructor() {
        this.currentQuestionIndex = 0;
        this.results = '';
        this.isQuizActive = false;
        this.questions = [];
        this.answers = [];
        this.backgroundImages = [];
        this.quizElement = null;
        this.modalElement = null;
        this.closeButton = null;
        
        this.init();
    }

    init() {
        // Initialize elements
        this.quizElement = document.getElementById('quiz');
        this.modalElement = document.getElementById('quiz-modal');
        this.closeButton = document.getElementById('close-quiz');
        
        if (!this.quizElement || !this.modalElement) {
            console.error('Quiz elements not found');
            return;
        }

        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize quiz data
        this.initializeQuizData();
    }

    initializeQuizData() {
        // Get data from WordPress localization
        if (window.quiz_data) {
            this.questions = window.quiz_data.questions || [];
            this.answers = window.quiz_data.answers || [];
            
            // Debug: Log the loaded questions to verify order
            console.log('Quiz questions loaded:', this.questions);
            console.log('Quiz answers loaded:', this.answers);
        } else {
            // Fallback data if WordPress data not available
            this.questions = [
                "1. You go for a picnic. Is it:<br>alone with the sound of birds,<br>or with pets and friends?",
                "2. You start a summer job. Is it:<br>counting the stars,<br>or drawing new stars?",
                "3. You find a magic lamp. Does it: <br>increase happiness,<br>or decrease suffering?",
                "4. You move to a desert island. You befriend:<br>a spirited lizard,<br>or a sweet teddy bear?",
                "Reading your strengths in the stars"
            ];
            
            this.answers = [
                ["Alone with birds", "With pets and friends"],
                ["Counting the stars", "Drawing new stars"],
                ["Increase happiness", "Decrease suffering"],
                ["A spirited lizard", "A sweet teddy bear"],
                ["1001 stars counted - See my results"]
            ];
        }

        // Background images for each question
        this.backgroundImages = [
            "/wp-content/uploads/Lullberry-growth.jpg",
            "/wp-content/uploads/awe.jpg",
            "/wp-content/uploads/spirituality.jpg",
            "/wp-content/uploads/prudence.jpg",
            "/wp-content/uploads/leadership.jpg"
        ];
    }

    setupEventListeners() {
        // Start quiz buttons
        document.querySelectorAll('.start-quiz').forEach(button => {
            button.addEventListener('click', () => this.startQuiz());
        });

        // Close quiz button
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.closeQuiz());
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isQuizActive) {
                this.closeQuiz();
            }
        });

        // Close on outside click
        this.modalElement.addEventListener('click', (e) => {
            if (e.target === this.modalElement) {
                this.closeQuiz();
            }
        });
    }

    startQuiz() {
        console.log('Quiz starting...');
        this.currentQuestionIndex = 0;
        this.results = '';
        this.isQuizActive = true;
        
        this.showModal();
        this.displayQuestion();
        
        // Announce quiz start for screen readers
        this.announceToScreenReader('Personality quiz started. Question 1 of ' + this.questions.length);
    }

    showModal() {
        // Show modal with modern full-screen styles
        this.modalElement.classList.add('show');
        document.body.classList.add('quiz-active');
        
        // Show close button
        if (this.closeButton) {
            this.closeButton.style.display = 'flex';
        }
        
        // Focus management for accessibility
        this.modalElement.setAttribute('aria-hidden', 'false');
        this.quizElement.focus();
        
        // Add entrance animations
        this.quizElement.classList.add('quiz-fade-in');
        
        // Ensure proper viewport handling
        this.ensureFullScreen();
    }
    
    ensureFullScreen() {
        // Force viewport to be truly full screen
        const viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            const meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
            document.head.appendChild(meta);
        } else {
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        }
        
        // Handle mobile browsers that might have address bars
        if ('visualViewport' in window) {
            const updateViewport = () => {
                const vh = window.visualViewport.height * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            };
            
            window.visualViewport.addEventListener('resize', updateViewport);
            updateViewport();
        }
    }

    closeQuiz() {
        this.isQuizActive = false;
        this.modalElement.classList.remove('show');
        document.body.classList.remove('quiz-active');
        
        // Hide close button
        if (this.closeButton) {
            this.closeButton.style.display = 'none';
        }
        
        // Remove animation classes
        this.quizElement.classList.remove('quiz-fade-in');
        
        // Accessibility
        this.modalElement.setAttribute('aria-hidden', 'true');
        
        // Return focus to the element that opened the quiz
        const startButton = document.querySelector('.start-quiz:focus');
        if (startButton) {
            startButton.focus();
        }
        
        // Reset viewport if needed
        this.resetViewport();
    }
    
    resetViewport() {
        // Reset viewport to normal if we modified it
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport && viewport.content.includes('user-scalable=no')) {
            viewport.content = 'width=device-width, initial-scale=1.0';
        }
    }

    async displayQuestion() {
        console.log(`displayQuestion called with currentQuestionIndex: ${this.currentQuestionIndex}, questions.length: ${this.questions.length}`);
        
        if (this.currentQuestionIndex >= this.questions.length) {
            console.log('Question index out of bounds, calling completeQuiz()');
            this.completeQuiz();
            return;
        }

        // Debug: Log current question
        console.log(`Displaying question ${this.currentQuestionIndex + 1}:`, this.questions[this.currentQuestionIndex]);

        // Preload background image
        await this.preloadBackgroundImage();
        
        // Update background
        this.updateBackground();
        
        // Clear previous content
        this.quizElement.innerHTML = '';
        
        // Create question element
        const questionElement = this.createQuestionElement();
        this.quizElement.appendChild(questionElement);
        
        // Create answer buttons
        this.createAnswerButtons();
        
        // Update progress indicator
        this.updateProgressIndicator();
        
        // Ensure smooth fade-in for new content
        requestAnimationFrame(() => {
            const newContent = this.quizElement.querySelectorAll('.quiz-question, .quiz-answer');
            newContent.forEach(element => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            });
        });
        

        
        // Announce question for screen readers
        this.announceToScreenReader(`Question ${this.currentQuestionIndex + 1}: ${this.questions[this.currentQuestionIndex].replace(/<br>/g, ' ')}`);
    }

    createQuestionElement() {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-question quiz-fade-in';
        questionDiv.innerHTML = this.questions[this.currentQuestionIndex];
        questionDiv.setAttribute('role', 'heading');
        questionDiv.setAttribute('aria-level', '2');
        
        return questionDiv;
    }

    createAnswerButtons() {
        const currentAnswers = this.answers[this.currentQuestionIndex];
        
        currentAnswers.forEach((answer, index) => {
            const answerButton = document.createElement('button');
            answerButton.className = 'quiz-answer quiz-fade-in';
            answerButton.innerHTML = answer;
            answerButton.setAttribute('type', 'button');
            answerButton.setAttribute('aria-describedby', 'quiz-question');
            
            // Add click handler
            answerButton.addEventListener('click', () => this.handleAnswer(index));
            
            // Add keyboard support
            answerButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleAnswer(index);
                }
            });
            
            this.quizElement.appendChild(answerButton);
        });
    }

    handleAnswer(answerIndex) {
        console.log(`Answer selected: ${answerIndex + 1}, current question: ${this.currentQuestionIndex + 1}`);
        
        // Add answer to results
        this.results += (answerIndex + 1).toString();
        console.log('Current results:', this.results);
        
        // Move to next question
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex < this.questions.length) {
            console.log(`Moving to question ${this.currentQuestionIndex + 1}`);
            // Show next question with smooth transition
            this.showTransition(() => this.displayQuestion());
        } else {
            console.log('Quiz completed, calling completeQuiz()');
            // Quiz completed
            this.completeQuiz();
        }
    }

    showTransition(callback) {
        // Smooth crossfade transition - all content disappears simultaneously
        const allContent = this.quizElement.querySelectorAll('.quiz-question, .quiz-answer');
        if (allContent.length > 0) {
            allContent.forEach(element => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(10px)';
                element.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            });
        }
        
        setTimeout(() => {
            callback();
        }, 200);
    }

    async preloadBackgroundImage() {
        if (this.backgroundImages[this.currentQuestionIndex]) {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve();
                img.onerror = () => {
                    console.warn('Failed to load background image:', this.backgroundImages[this.currentQuestionIndex]);
                    resolve();
                };
                img.src = this.getFullImageUrl(this.backgroundImages[this.currentQuestionIndex]);
            });
        }
    }

    updateBackground() {
        if (this.backgroundImages[this.currentQuestionIndex]) {
            const imageUrl = this.getFullImageUrl(this.backgroundImages[this.currentQuestionIndex]);
            this.quizElement.style.backgroundImage = `url(${imageUrl})`;
        }
    }

    getFullImageUrl(relativePath) {
        // Handle both relative and absolute URLs
        if (relativePath.startsWith('http')) {
            return relativePath;
        }
        return window.location.origin + relativePath;
    }

    updateProgressIndicator() {
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        
        // Create or update progress bar
        let progressBar = this.quizElement.querySelector('.quiz-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'quiz-progress';
            progressBar.setAttribute('role', 'progressbar');
            progressBar.setAttribute('aria-valuenow', this.currentQuestionIndex + 1);
            progressBar.setAttribute('aria-valuemin', '1');
            progressBar.setAttribute('aria-valuemax', this.questions.length);
            progressBar.setAttribute('aria-label', `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`);
            this.quizElement.appendChild(progressBar);
        }
        
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', this.currentQuestionIndex + 1);
        
        // Add smooth animation
        progressBar.style.transition = 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    completeQuiz() {
        console.log('Quiz completed, creating completion screen...');
        
        // Clear previous content
        this.quizElement.innerHTML = '';
        
        // Create the "count stars" completion screen
        const completionScreen = this.createCompletionScreen();
        console.log('Completion screen created:', completionScreen);
        
        this.quizElement.appendChild(completionScreen);
        console.log('Completion screen appended to quiz element');
        
        // Announce completion for screen readers
        this.announceToScreenReader('Quiz completed! Counting your stars...');
        
        // Start the star counting animation
        this.startStarCounting();
    }
    
    createCompletionScreen() {
        console.log('Creating completion screen...');
        
        const completionDiv = document.createElement('div');
        completionDiv.className = 'quiz-completion quiz-fade-in';
        completionDiv.innerHTML = `
            <div class="completion-content">
                <h2 class="completion-title">Reading your strengths in the stars</h2>
                <div class="star-counter">
                    <div class="zen-stars-container">
                        <!-- Stars will be added here dynamically -->
                    </div>
                    <div class="star-count">0</div>
                    <div class="star-text">stars counted</div>
                </div>
                <div class="completion-message">Analyzing your answers...</div>
            </div>
        `;
        
        console.log('Completion screen HTML created:', completionDiv.innerHTML);
        console.log('Completion screen element:', completionDiv);
        
        return completionDiv;
    }
    
    startStarCounting() {
        console.log('Starting star counting animation...');
        
        const starCount = this.quizElement.querySelector('.star-count');
        const completionMessage = this.quizElement.querySelector('.completion-message');
        const zenStarsContainer = this.quizElement.querySelector('.zen-stars-container');
        
        console.log('Star count element:', starCount);
        console.log('Completion message element:', completionMessage);
        console.log('Zen stars container:', zenStarsContainer);
        
        if (!starCount || !completionMessage || !zenStarsContainer) {
            console.error('Required elements not found for star counting');
            return;
        }
        
        // Create semi-circle of zen stars
        this.createZenStars(zenStarsContainer);
        
        // Wait a moment for stars to be created, then start counting
        setTimeout(() => {
            let currentCount = 0;
            const targetCount = 1001;
            const duration = 2000; // 2 seconds total
            
            console.log('Star counting parameters:', { targetCount, duration });
            
                        const countUp = () => {
                console.log(`countUp called with currentCount: ${currentCount}`);
                
                if (currentCount < 1000) {
                    // Count in increments of ~83 up to 1000 (1000/12 ≈ 83.33)
                    currentCount += Math.ceil(1000 / 12);
                    if (currentCount > 1000) currentCount = 1000;
                    starCount.textContent = currentCount;
                    
                                    // Show stars in succession (11 stars total)
                const starIndex = Math.floor((currentCount / 1000) * 11);
                console.log(`Showing star ${starIndex} at count ${currentCount}`);
                this.showNextStar(starIndex);
                
                // Continue counting
                setTimeout(countUp, duration / 11);
                } else if (currentCount >= 1000) {
                    // Final count to 1001
                    currentCount = 1001;
                    starCount.textContent = currentCount;
                    completionMessage.textContent = 'Your results are ready!';
                    console.log('Star counting completed');
                    
                    // Show the "See my results" button instead of auto-redirecting
                    this.showResultsButton();
                }
            };
            
            // Start the counting
            countUp();
        }, 100);
    }
    
    createZenStars(container) {
        console.log('Creating zen stars...');
        const totalStars = 11; // 11 stars for perfect symmetry
        const radius = 80; // Radius of the arc
        const centerX = 0;
        const centerY = 0;
        
        for (let i = 0; i < totalStars; i++) {
            const star = document.createElement('div');
            star.className = 'zen-star';
            star.textContent = '★';
            star.style.position = 'absolute';
            star.style.left = '50%';
            star.style.top = '50%';
            star.style.transform = 'translate(-50%, -50%)';
            star.style.opacity = '0';
            star.style.transition = 'opacity 0.3s ease';
            
            // Calculate position in perfectly symmetric inverted U shape (like a rainbow)
            // This creates an arc from π to 0 radians (left → top → right)
            const angle = Math.PI - (Math.PI * i) / (totalStars - 1);
            const x = centerX + radius * Math.cos(angle);
            const y = centerY - radius * Math.sin(angle); // Negative Y to flip upside down
            
            star.style.setProperty('--star-x', `${x}px`);
            star.style.setProperty('--star-y', `${y}px`);
            
            console.log(`Star ${i}: angle=${angle.toFixed(2)}, x=${x.toFixed(2)}, y=${y.toFixed(2)}`);
            
            container.appendChild(star);
        }
        console.log(`Created ${totalStars} zen stars`);
    }
    
    showNextStar(starIndex) {
        const stars = this.quizElement.querySelectorAll('.zen-star');
        if (starIndex < stars.length) {
            const star = stars[starIndex];
            star.style.opacity = '1';
            
            // Get the calculated positions
            const x = star.style.getPropertyValue('--star-x');
            const y = star.style.getPropertyValue('--star-y');
            
            // Apply the transform with the calculated positions
            star.style.transform = `translate(calc(-50% + ${x}), calc(-50% + ${y}))`;
            
            console.log(`Star ${starIndex} shown at position: x=${x}, y=${y}`);
        }
    }

    showResultsButton() {
        // Create button container for better layout
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'quiz-buttons-container quiz-fade-in wp-block-button';
        
        // Create the "View my strengths" button
        const viewStrengthsButton = document.createElement('button');
        viewStrengthsButton.className = 'quiz-button quiz-primary-button wp-block-button__link';
        viewStrengthsButton.textContent = 'View my strengths';
        viewStrengthsButton.setAttribute('type', 'button');
        viewStrengthsButton.setAttribute('aria-label', 'View my character strengths');
        
        // Create the "Retake the quiz" button
        // const retakeButton = document.createElement('button');
        // retakeButton.className = 'quiz-button quiz-secondary-button';
        // retakeButton.textContent = 'Retake the quiz';
        // retakeButton.setAttribute('type', 'button');
        // retakeButton.setAttribute('aria-label', 'Take the personality quiz again');
        
        // Add click handlers
        viewStrengthsButton.addEventListener('click', () => {
            console.log('View strengths button clicked, redirecting...');
            this.redirectToResults();
        });
        
        // retakeButton.addEventListener('click', () => {
        //     console.log('Retake quiz button clicked, restarting...');
        //     this.restartQuiz();
        // });
        
        // Add keyboard support
        viewStrengthsButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.redirectToResults();
            }
        });
        
        // retakeButton.addEventListener('keydown', (e) => {
        //     if (e.key === 'Enter' || e.key === ' ') {
        //         e.preventDefault();
        //         this.restartQuiz();
        //     }
        // });
        
        // Append buttons to container
        buttonContainer.appendChild(viewStrengthsButton);
        // buttonContainer.appendChild(retakeButton);
        
        // Append to completion screen
        const completionContent = this.quizElement.querySelector('.completion-content');
        if (completionContent) {
            completionContent.appendChild(buttonContainer);
        }
        
        // Announce for screen readers
        // this.announceToScreenReader('Action buttons available: View all strengths and Retake the quiz.');
    }

    redirectToResults() {
        // Redirect to results page
        const currentPath = window.location.pathname;
        const resultsUrl = `${currentPath}?quiz=${this.results}#quiz-results`;
        
        // Close modal first
        this.closeQuiz();
        
        // Redirect after a short delay
        setTimeout(() => {
            window.location.href = resultsUrl;
        }, 500);
    }

    announceToScreenReader(message) {
        // Create temporary screen reader announcement
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Public method to reset quiz
    reset() {
        this.currentQuestionIndex = 0;
        this.results = '';
        this.isQuizActive = false;
    }
    
    restartQuiz() {
        console.log('Restarting quiz...');
        this.reset();
        this.startQuiz();
    }

    // Public method to get current state
    getState() {
        return {
            currentQuestion: this.currentQuestionIndex + 1,
            totalQuestions: this.questions.length,
            results: this.results,
            isActive: this.isQuizActive
        };
    }
}

// Initialize quiz when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create global quiz instance
    window.personalityQuiz = new PersonalityQuiz();
    
    // Add screen reader only styles
    if (!document.getElementById('sr-only-styles')) {
        const style = document.createElement('style');
        style.id = 'sr-only-styles';
        style.textContent = `
            .sr-only {
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
            }
        `;
        document.head.appendChild(style);
    }
});

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PersonalityQuiz;
}